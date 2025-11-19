import { ArchitectureWorkbench } from "@/components/architecture-workbench";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-y-0 left-1/2 w-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/30 via-sky-400/20 to-purple-500/30 blur-3xl" />
        <div className="absolute -left-10 top-32 size-48 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -right-10 bottom-10 size-56 rounded-full bg-purple-500/20 blur-3xl" />
      </div>
      <ArchitectureWorkbench />
    </main>
  );
}
