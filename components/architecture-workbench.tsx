"use client";

import { useMemo, useState } from "react";
import { Loader2, RefreshCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MermaidDiagram } from "@/components/mermaid-diagram";

const SAMPLE_REQUIREMENTS = `Multi-tenant SaaS analytics platform for retailers with streaming ingestion, AI insights, and governance. Must support regional data residency, role-based access, and pluggable visualization widgets.`;

type ArchitectureResponse = {
  architecture: string;
  components: string[];
  explanation: string;
  diagramDescription: string;
  mermaidDiagram: string;
};

export function ArchitectureWorkbench() {
  const [requirements, setRequirements] = useState("");
  const [result, setResult] = useState<ArchitectureResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explanation = useMemo(() => {
    if (!result?.explanation) {
      return { rationale: "", refinements: "" };
    }

    const marker = "Refinement Suggestions:";
    if (!result.explanation.includes(marker)) {
      return { rationale: result.explanation.trim(), refinements: "" };
    }

    const [rationale, refinements] = result.explanation.split(marker);
    return {
      rationale: rationale.trim(),
      refinements: refinements.trim(),
    };
  }, [result]);

  async function handleGenerate() {
    const prompt = requirements.trim();
    if (!prompt) {
      setError("Please add a short description of the requirements first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: prompt }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to generate architecture.");
      }

      setResult(payload as ArchitectureResponse);
    } catch (apiError) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Unexpected error while calling Gemini."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setRequirements("");
    setResult(null);
    setError(null);
  }

  function applySample() {
    setRequirements(SAMPLE_REQUIREMENTS);
    setError(null);
  }

  return (
    <div className="w-full max-w-6xl space-y-10">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-200/70">
          Software Engineering Workbench
        </p>
        <h1 className="text-3xl font-semibold text-white drop-shadow-sm md:text-5xl">
          Translate intent into resilient architecture
        </h1>
        <p className="text-base text-slate-200/80 md:text-lg">
          Feed high-level requirements and let Gemini craft a north-star solution,
          component topology, and diagram-friendly description.
        </p>
      </div>

      <Card className={cn("glass-panel border-white/15 bg-white/5 text-white")}
      >
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Input requirements</CardTitle>
          <CardDescription className="text-slate-200/70">
            Highlight business outcomes, constraints, compliance, and scale needs. The
            richer the context, the sharper the architecture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Textarea
            rows={6}
            value={requirements}
            onChange={(event) => {
              setRequirements(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            placeholder="e.g. Event-driven loan origination system with explainable AI scoring, zero-downtime releases, and on-prem connectors for core banking"
            className="border-white/20 bg-white/5 text-base text-white placeholder:text-slate-200/50 focus-visible:border-white/50 focus-visible:ring-white/30"
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGenerate} disabled={isLoading} className="min-w-[180px]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Generate Architecture
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={applySample} disabled={isLoading}>
              Use sample brief
            </Button>
            <Button variant="ghost" onClick={handleReset} disabled={isLoading}>
              <RefreshCcw className="mr-2 size-4" />
              Reset
            </Button>
          </div>
          {error && <p className="text-sm text-red-200">{error}</p>}
        </CardContent>
      </Card>

      <Card className="glass-panel border-white/10 bg-slate-950/40 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold">Architectural response</CardTitle>
          <CardDescription className="text-slate-200/70">
            Architecture summary, components, decision rationale, and textual diagram are
            returned in one pass.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 p-8 text-center text-slate-200/70">
              <Sparkles className="size-8 text-indigo-200" />
              <p className="text-lg font-medium">Waiting for your first brief</p>
              <p className="text-sm">
                Describe the problem space above to receive a structured solution architecture with diagram-friendly instructions.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-8">
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-indigo-100">Architecture overview</h2>
                <p className="text-base leading-relaxed text-slate-100/90">
                  {result.architecture}
                </p>
              </section>

              <Separator className="bg-white/10" />

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-indigo-100">
                  Component breakdown
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {result.components.map((component, index) => (
                    <div
                      key={`${component}-${index}`}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100/90 shadow-glass backdrop-blur"
                    >
                      {component}
                    </div>
                  ))}
                </div>
              </section>

              <Separator className="bg-white/10" />

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-indigo-100">Reasons & decisions</h2>
                <p className="text-base leading-relaxed text-slate-100/90 whitespace-pre-line">
                  {explanation.rationale}
                </p>
                {explanation.refinements && (
                  <div className="rounded-xl border border-amber-200/40 bg-amber-400/10 p-4 text-sm text-amber-50">
                    <p className="font-semibold tracking-wide text-amber-100">
                      Refinement suggestions
                    </p>
                    <p className="whitespace-pre-line text-amber-50">
                      {explanation.refinements}
                    </p>
                  </div>
                )}
              </section>

              <Separator className="bg-white/10" />

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-indigo-100">Diagram description</h2>
                <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-indigo-100">
                  {result.diagramDescription}
                </pre>
              </section>

              <Separator className="bg-white/10" />

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-indigo-100">Rendered Mermaid diagram</h2>
                {result.mermaidDiagram ? (
                  <MermaidDiagram diagram={result.mermaidDiagram} />
                ) : (
                  <p className="text-sm text-slate-200/70">
                    Gemini did not provide a Mermaid definition. Refine the prompt or use the textual
                    description above to craft one manually.
                  </p>
                )}
              </section>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
