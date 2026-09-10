// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") || "https://gkaouygxlspirlsjorrm.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const VISION_PROMPT = `You are analyzing a photograph for a memory game for elderly dementia patients in North East India.

Analyze this image and return ONLY valid JSON (no markdown, no explanations) with this exact structure:

{
  "scene_description": "A brief description of the overall scene",
  "environment": {
    "type": "market/village/temple/garden/house/festival",
    "region": "Likely North East India region",
    "time_of_day": "morning/afternoon/evening/night"
  },
  "people": [
    {
      "id": "person_1",
      "clothing_color": "color",
      "activity": "what they are doing",
      "position": "left/center/right/foreground/background"
    }
  ],
  "objects": [
    {
      "name": "object name",
      "color": "color",
      "count": 1,
      "position": "left/center/right/foreground/background"
    }
  ],
  "notable_details": [
    "any other observable details worth remembering"
  ]
}

Be precise about colors, counts, and positions. Only include what is clearly visible.`;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const scene_id = body.scene_id || body.sceneId;

    if (!scene_id) {
      return new Response(JSON.stringify({ error: "Missing scene_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch scene
    const { data: scene, error: sceneError } = await supabase
      .from("memory_scenes")
      .select("*")
      .eq("scene_id", scene_id)
      .single();

    if (sceneError || !scene) {
      return new Response(
        JSON.stringify({ error: `Scene not found for id: ${scene_id}` }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Get public URL for image
    const { data: urlData } = supabase.storage
      .from("memory-photos")
      .getPublicUrl(scene.image_path);

    const imageUrl = urlData.publicUrl;

    // 3. Fetch image as base64
    const { base64, mimeType } = await fetchImageAsBase64(imageUrl);

    // 4. Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: VISION_PROMPT },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      await supabase
        .from("memory_scenes")
        .update({ ai_status: "failed" })
        .eq("scene_id", scene_id);
      return new Response(
        JSON.stringify({
          error: `Gemini API error (${geminiResponse.status})`,
          details: errText,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      await supabase
        .from("memory_scenes")
        .update({ ai_status: "failed" })
        .eq("scene_id", scene_id);
      return new Response(
        JSON.stringify({
          error: "Empty or invalid response from Gemini",
          raw: geminiData,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 5. Parse JSON from AI response
    let aiMetadata: any;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiText.trim();
      aiMetadata = JSON.parse(jsonString);
    } catch (_e) {
      await supabase
        .from("memory_scenes")
        .update({ ai_status: "failed" })
        .eq("scene_id", scene_id);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: aiText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Save AI metadata
    await supabase
      .from("memory_scenes")
      .update({
        ai_metadata: aiMetadata,
        ai_status: "completed",
      })
      .eq("scene_id", scene_id);

    // 7. Generate questions
    const questions = generateQuestions(aiMetadata, scene_id);

    // 8. Delete duplicate existing questions before inserting new ones
    await supabase
      .from("memory_questions")
      .delete()
      .eq("scene_id", scene_id);

    // 9. Insert questions
    if (questions.length > 0) {
      const { error: insertError } = await supabase
        .from("memory_questions")
        .insert(questions);
      if (insertError) {
        console.error("Error inserting questions:", insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        scene_id,
        questions_generated: questions.length,
        metadata: aiMetadata,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return {
    base64: btoa(binary),
    mimeType: contentType,
  };
}

function generateQuestions(metadata: any, sceneId: string) {
  const questions: Array<{
    question_id: string;
    scene_id: string;
    question: string;
    answer: string;
    options: string[];
    difficulty: string;
    question_type: string;
  }> = [];
  let counter = 1;

  // Questions about objects
  metadata.objects?.forEach((obj: any) => {
    if (obj.count !== undefined && obj.count !== null) {
      const count = Number(obj.count) || 1;
      const opt1 = String(count);
      const opt2 = String(count + 1);
      const opt3 = String(Math.max(0, count - 1));
      const opt4 = String(count + 2);
      const uniqueOpts = Array.from(new Set([opt1, opt2, opt3, opt4]));
      const plural = obj.name.endsWith("s") ? "" : "s";

      questions.push({
        question_id: `${sceneId}_q${counter++}`,
        scene_id: sceneId,
        question: `How many ${obj.name}${plural} were visible?`,
        answer: opt1,
        options: shuffleOptions(uniqueOpts),
        difficulty: count > 3 ? "Medium" : "Easy",
        question_type: "count",
      });
    }

    if (obj.color) {
      const color = capitalize(obj.color);
      const opts = Array.from(
        new Set([color, "Red", "Blue", "Green", "Yellow", "White"])
      ).slice(0, 4);

      questions.push({
        question_id: `${sceneId}_q${counter++}`,
        scene_id: sceneId,
        question: `What color was the ${obj.name}?`,
        answer: color,
        options: shuffleOptions(opts),
        difficulty: "Medium",
        question_type: "color",
      });
    }

    if (obj.position) {
      const pos = capitalize(obj.position);
      const opts = Array.from(
        new Set([pos, "Left", "Right", "Center", "Foreground", "Background"])
      ).slice(0, 4);

      questions.push({
        question_id: `${sceneId}_q${counter++}`,
        scene_id: sceneId,
        question: `Where was the ${obj.name} positioned?`,
        answer: pos,
        options: shuffleOptions(opts),
        difficulty: "Medium",
        question_type: "position",
      });
    }
  });

  // Questions about people
  metadata.people?.forEach((person: any) => {
    if (person.clothing_color) {
      const color = capitalize(person.clothing_color);
      const pos = person.position ? ` on the ${person.position}` : "";
      const opts = Array.from(
        new Set([color, "White", "Blue", "Red", "Yellow", "Black"])
      ).slice(0, 4);

      questions.push({
        question_id: `${sceneId}_q${counter++}`,
        scene_id: sceneId,
        question: `What color was the clothing of the person${pos}?`,
        answer: color,
        options: shuffleOptions(opts),
        difficulty: "Medium",
        question_type: "color",
      });
    }

    if (person.activity) {
      const act = capitalize(person.activity);
      const opts = Array.from(
        new Set([
          act,
          "Sitting quietly",
          "Walking by",
          "Looking at the camera",
          "Talking to others",
        ])
      ).slice(0, 4);

      questions.push({
        question_id: `${sceneId}_q${counter++}`,
        scene_id: sceneId,
        question: "What was the person doing in the photo?",
        answer: act,
        options: shuffleOptions(opts),
        difficulty: "Hard",
        question_type: "activity",
      });
    }
  });

  // Questions about environment
  if (metadata.environment?.time_of_day) {
    const time = capitalize(metadata.environment.time_of_day);
    const opts = Array.from(
      new Set([time, "Morning", "Afternoon", "Evening", "Night"])
    ).slice(0, 4);

    questions.push({
      question_id: `${sceneId}_q${counter++}`,
      scene_id: sceneId,
      question: "What time of day does the scene appear to be?",
      answer: time,
      options: shuffleOptions(opts),
      difficulty: "Easy",
      question_type: "environment",
    });
  }

  if (metadata.environment?.type) {
    const envType = capitalize(metadata.environment.type);
    const opts = Array.from(
      new Set([envType, "Market", "Village", "Temple", "Garden", "House"])
    ).slice(0, 4);

    questions.push({
      question_id: `${sceneId}_q${counter++}`,
      scene_id: sceneId,
      question: "What type of location is shown in the picture?",
      answer: envType,
      options: shuffleOptions(opts),
      difficulty: "Easy",
      question_type: "environment",
    });
  }

  return questions;
}

function shuffleOptions<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}