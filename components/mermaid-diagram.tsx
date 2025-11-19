"use client";

import { useEffect, useId, useState } from "react";
import mermaid, { type MermaidConfig } from "mermaid";

const baseConfig: MermaidConfig = {
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
};

type MermaidDiagramProps = {
  diagram: string;
  onRenderError?: (message: string) => void;
  onRenderSuccess?: () => void;
};

export function MermaidDiagram({ diagram, onRenderError, onRenderSuccess }: MermaidDiagramProps) {
  const elementId = useId().replace(/:/g, "-");
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!diagram.trim()) {
      setSvg("");
      setError(null);
      return;
    }

    let isSubscribed = true;
    mermaid.initialize(baseConfig);

    mermaid
      .render(elementId, diagram)
      .then(({ svg: renderedSvg }) => {
        if (isSubscribed) {
          setSvg(renderedSvg);
          setError(null);
          onRenderSuccess?.();
        }
      })
      .catch((err: unknown) => {
        if (isSubscribed) {
          const message = err instanceof Error ? err.message : "Failed to render diagram";
          setError(message);
          setSvg("");
          onRenderError?.(message);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [diagram, elementId, onRenderError, onRenderSuccess]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
        Mermaid render error: {error}
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-2xl border border-white/15 bg-slate-950/60 p-4"
      dangerouslySetInnerHTML={{ __html: svg || "<em class='text-slate-400'>Waiting for diagram...</em>" }}
    />
  );
}
