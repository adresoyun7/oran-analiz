"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Match = any;

const LEAGUE_MAP: Record<string, string> = {
  "Süper Lig": "🇹🇷",
  "Premier League": "🏴",
  "La Liga": "🇪🇸",
  "Bundesliga": "🇩🇪",
  "Serie A": "🇮🇹",
  "Ligue 1": "🇫🇷",
  "MLS": "🇺🇸",
};

const LEAGUES = [
  "🏆 Tüm Ligler",
  ...Object.entries(LEAGUE_MAP).map(([name, icon]) => `${icon} ${name}`),
];

function todayText() {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    weekday: "long",
  }).format(new Date());
}

export default function HomePage() {
  const [scanner, setScanner] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(["🏆 Tüm Ligler"]);
  const [apiKey, setApiKey] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedKey = localStorage.getItem("odds_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  function cleanLeagueName(value: string) {
    return value.replace(/^(\S)\s/, "").trim();
  }

  async function loadScanner() {
    setLoading(true);
    setError("");

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://oran-analiz.onrender.com";

      const cleanLeagues =
        selectedLeagues.includes("🏆 Tüm Ligler")
          ? Object.keys(LEAGUE_MAP)
          : selectedLeagues.map(cleanLeagueName);

      const params = new URLSearchParams({
        date: "today",
        leagues: cleanLeagues.join(","),
        tolerans: "0.08",
      });

      const res = await fetch(
        `${API_URL}/scanner/daily?${params.toString()}`,
        {
          headers: {
            "x-api-key": apiKey,
          },
        }
      );

      const data = await res.json();

      if (data.error || data.errors?.length) {
        setError(JSON.stringify(data));
        return;
      }

      setScanner(data);
    } catch (err) {
      setError("API bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  function toggleLeague(league: string) {
    if (league === "🏆 Tüm Ligler") {
      if (selectedLeagues.includes("🏆 Tüm Ligler")) {
        setSelectedLeagues([]);
      } else {
        setSelectedLeagues(LEAGUES);
      }
      return;
    }

    let next = selectedLeagues.filter((x) => x !== "🏆 Tüm Ligler");

    if (next.includes(league)) {
      next = next.filter((x) => x !== league);
    } else {
      next.push(league);
    }

    if (next.length === LEAGUES.length - 1) {
      setSelectedLeagues(LEAGUES);
    } else {
      setSelectedLeagues(next);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-2">Oran Analiz</h1>

      <p className="text-sm text-gray-400 mb-4">
        {mounted ? todayText() : ""}
      </p>

      <div className="flex gap-2 mb-4">
        <input
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            localStorage.setItem("odds_api_key", e.target.value);
          }}
          placeholder="API Key gir..."
          className="bg-gray-800 px-3 py-2 rounded"
        />

        <button
          onClick={loadScanner}
          className="bg-yellow-400 text-black px-4 py-2 rounded font-bold"
        >
          {loading ? "..." : "Analizi Başlat"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {LEAGUES.map((l) => (
          <button
            key={l}
            onClick={() => toggleLeague(l)}
            className={`px-3 py-1 rounded text-sm ${
              selectedLeagues.includes(l)
                ? "bg-yellow-400 text-black"
                : "bg-gray-800"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/20 p-3 mb-4 rounded text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {scanner?.top_matches?.map((m: any, i: number) => (
          <div key={i} className="bg-gray-900 p-3 rounded">
            <div className="font-bold">
              {m.home_team} - {m.away_team}
            </div>
            <div className="text-sm text-yellow-300">
              {m.main_pick} • {m.odd}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}