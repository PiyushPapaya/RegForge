"use client";
export function Cockpit({ source, work }: { source: React.ReactNode; work: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="min-w-0">{source}</section>
      <section className="min-w-0">{work}</section>
    </div>
  );
}
