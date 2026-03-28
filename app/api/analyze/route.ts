import { NextResponse } from "next/server";

type FullAnswers = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
};

type AnalysisResponse = {
  signals: string[];
  patterns: string[];
  tensions: string[];
  hypothesis: string[];
  exploration: string[];
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY not configured",
          apiKeyDetected: false,
          envNameExpected: "OPENAI_API_KEY",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as { answers?: FullAnswers };
    const answers = body?.answers;

    if (!answers) {
      return NextResponse.json(
        { error: "Missing answers payload" },
        { status: 400 }
      );
    }

    const userAnswers = `
1. ¿Qué te gustaba hacer de chico/a sin que nadie te lo pidiera?
${answers.q1 || ""}

2. ¿Qué actividades hacen que pierdas la noción del tiempo?
${answers.q2 || ""}

3. ¿Sobre qué temas o ideas volvés una y otra vez?
${answers.q3 || ""}

4. ¿Qué cosas te han reconocido o valorado otras personas de manera constante?
${answers.q4 || ""}

5. ¿Qué dejaste de hacer que aún hoy sentís como algo inconcluso?
${answers.q5 || ""}
`.trim();

    const systemPrompt = `
Sos el motor de interpretación del sistema Second Chance.

Tu tarea es analizar respuestas personales y devolver un diagnóstico vocacional profundo.

Reglas obligatorias:
- No suavizar el lenguaje.
- No usar frases motivacionales.
- No usar consejos genéricos.
- No usar expresiones como "podrías", "sería bueno", "considerar".
- Ser directo, preciso y humano.
- Si detectás incoherencias, evasión, autoengaño o resignación, señalalo explícitamente.
- El objetivo es que la persona se reconozca con claridad, no que se sienta cómoda.

Tenés que devolver SOLO un JSON válido con esta estructura exacta:
{
  "signals": ["...", "..."],
  "patterns": ["...", "..."],
  "tensions": ["...", "..."],
  "hypothesis": ["...", "..."],
  "exploration": ["...", "..."]
}

Cada valor debe ser un array de strings.
No agregues texto fuera del JSON.
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userAnswers },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "OpenAI request failed",
          status: response.status,
          raw,
        },
        { status: 500 }
      );
    }

    let parsedOuter: any;
    try {
      parsedOuter = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        {
          error: "Could not parse OpenAI outer JSON",
          raw,
        },
        { status: 500 }
      );
    }

    const content = parsedOuter?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        {
          error: "OpenAI returned no content",
          raw: parsedOuter,
        },
        { status: 500 }
      );
    }

    let parsedContent: AnalysisResponse;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      return NextResponse.json(
        {
          error: "Could not parse OpenAI content JSON",
          content,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedContent, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Unexpected server error",
        detail: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}