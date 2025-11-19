import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_MODEL = "gemini-2.5-pro"; // or "gemini-1.5-flash"

const PROMPT_TEMPLATE = `Act as a senior software architect. Based on the following high-level requirements, produce strictly valid JSON with the shape:
{
  "architecture": "high level view",
  "components": ["Key component or service descriptions"],
  "explanation": "Reasons and justification. End with a line that starts with 'Refinement Suggestions:'",
  "diagramDescription": "PlantUML-like textual diagram",
  "mermaidDiagram": "A Mermaid v11-compliant diagram (graph TD...)"
}
The response must be concise, practical, and written in plain English.
Requirements: {{REQUIREMENTS}}
`;

type ArchitectureResponse = {
  architecture: string;
  components: string[];
  explanation: string;
  diagramDescription: string;
  mermaidDiagram: string;
};

function ensureComponents(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") {
          return entry.trim();
        }

        if (entry && typeof entry === "object") {
          const record = entry as Record<string, unknown>;
          const name = typeof record.name === "string" ? record.name : undefined;
          const description =
            typeof record.description === "string"
              ? record.description
              : typeof record.summary === "string"
                ? record.summary
                : undefined;

          if (name && description) {
            return `${name.trim()} — ${description.trim()}`;
          }

          if (name) {
            return name.trim();
          }

          if (description) {
            return description.trim();
          }
        }

        return "";
      })
      .filter((entry) => entry.length > 0)
      .slice(0, 12);
  }

  if (typeof value === "string" && value.trim().length) {
    return value
      .split(/\n|,|;/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .slice(0, 12);
  }

  return [];
}

function sanitizeMermaid(value?: string): string {
  if (!value) return "";
  return value
    .replace(/```(mermaid)?/gi, "")
    .replace(/~~~(mermaid)?/gi, "")
    .trim();
}

function normalizePayload(payload: Partial<ArchitectureResponse>): ArchitectureResponse {
  const components = ensureComponents(payload.components);
  const mermaidDiagram = sanitizeMermaid(payload.mermaidDiagram);

  return {
    architecture:
      payload.architecture?.trim() ??
      "Gemini did not produce an architecture summary. Please refine the prompt and try again.",
    components:
      components.length > 0
        ? components
        : [
            "Client experience layer",
            "API gateway",
            "Core services",
            "Data platform",
          ],
    explanation:
      payload.explanation?.trim() ??
      "No explicit rationale was returned. Consider re-running with additional constraints.",
    diagramDescription:
      payload.diagramDescription?.trim() ??
      "@startuml\nactor User\nUser -> UI : Interacts\nUI -> Backend : REST/GraphQL\nBackend -> DataStore : Persist\n@enduml",
    mermaidDiagram:
      mermaidDiagram ||
      "graph TD\n  User[End User] --> UI[UI Layer]\n  UI --> API[API Gateway]\n  API --> Services[Core Services]\n  Services --> DB[(Data Platform)]",
  };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Add it to your .env.local file." },
      { status: 500 }
    );
  }

  let body: { requirements?: string };
  try {
    body = await request.json();
  } catch (parseError) {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const requirements = body?.requirements?.trim();
  if (!requirements) {
    return NextResponse.json(
      { error: "Please provide requirement text." },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = PROMPT_TEMPLATE.replace("{{REQUIREMENTS}}", requirements);

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed: Partial<ArchitectureResponse> = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      parsed = { architecture: cleaned };
    }

    const normalized = normalizePayload(parsed);
    return NextResponse.json(normalized);
  } catch (error) {
    console.error("Gemini API error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gemini API request failed.",
      },
      { status: 500 }
    );
  }
}
