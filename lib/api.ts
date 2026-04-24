const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function analyzeMatch(match: any) {
  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(match),
  });

  if (!res.ok) {
    throw new Error("Analiz yapılamadı.");
  }

  return res.json();
}

export async function getMatches() {
  const res = await fetch(`${API_URL}/matches`);

  if (!res.ok) {
    throw new Error("Maçlar alınamadı.");
  }

  return res.json();
}

export async function getDailyScanner() {
  const res = await fetch(`${API_URL}/scanner/daily`);

  if (!res.ok) {
    throw new Error("Scanner alınamadı.");
  }

  return res.json();
}