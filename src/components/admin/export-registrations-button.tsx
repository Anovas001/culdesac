"use client";

import { useState } from "react";

export function ExportRegistrationsButton({ tournamentId, status, count }: {
  tournamentId: string;
  status?: string;
  count: number;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setPending(true);
    setError("");
    try {
      const query = status ? `?${new URLSearchParams({ status })}` : "";
      const response = await fetch(`/api/admin/tournaments/${encodeURIComponent(tournamentId)}/registrations/export${query}`, { cache: "no-store" });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "No s’ha pogut descarregar l’Excel.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "inscripcions.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No s’ha pogut descarregar l’Excel.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={download} disabled={pending || count === 0} aria-busy={pending}>
        {pending ? "Generant Excel…" : `Exportar Excel (${count})`}
      </button>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
