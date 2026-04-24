"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Match = any;

const LEGAL_TEXT = `Bu platform yalnızca istatistiksel analiz ve yapay zekâ destekli tahminler sunar.

Sunulan içerikler kesinlik içermez ve yatırım tavsiyesi değildir.

Kullanıcılar kendi kararlarını kendileri verir. Bu platform üzerinden doğrudan bahis oynanmaz ve herhangi bir bahis hizmeti sunulmaz.

Bahis oynamak risk içerir ve maddi kayıplara yol açabilir.`;

const LEAGUES = [
  "🏆 Tüm Ligler",
  "🇹🇷 Süper Lig",
  "🇬🇧 Premier League",
  "🇪🇸 La Liga",
  "🇮🇹 Serie A",
  "🇩🇪 Bundesliga",
  "🇫🇷 Ligue 1",
  "🇳🇱 Eredivisie",
  "🇵🇹 Portekiz Ligi",
  "🇧🇪 Belçika Ligi",
  "🇺🇸 MLS",
  "🇩🇰 Danimarka Ligi",
  "🇸🇦 Suudi Arabistan",
  "🇷🇴 Romanya Ligi",
  "🇦🇪 BAE Ligi",
  "🌍 Avrupa Kupaları",
];

const DATE_OPTIONS = ["Bugün", "Yarın", "2 Gün Sonra", "3 Gün Sonra", "Özel Tarih"];
const SEASONS = ["2324", "2425", "2526"];

function todayText() {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date());
}

function safePercent(v: any) {
  const n = Number(v || 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function HomePage() {
  const [scanner, setScanner] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState<Match[]>([]);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [termsOpen, setTermsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateOption, setDateOption] = useState("Bugün");
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(["🏆 Tüm Ligler"]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(["2324", "2425", "2526"]);
  const [query, setQuery] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<"all" | "high" | "mid" | "risk">("all");

  const matches: Match[] = scanner?.top_matches || [];

  useEffect(() => {
    const raw = localStorage.getItem("vibe_scanner");
    if (raw) {
      try {
        setScanner(JSON.parse(raw));
      } catch {}
    }
  }, []);

  async function loadScanner() {
    setLoading(true);
    setError("");

    const fakeData = {
      total_matches: 8,
      top_matches: [
        {
          home_team: "Galatasaray",
          away_team: "Fenerbahçe",
          league: "Süper Lig",
          time: "20:00",
          main_pick: "2.5 Alt",
          selection: "2.5 Alt",
          market: "ALT/ÜST",
          pro_score: 76,
          odd: 1.85,
          match_type: "Sürpriz Açık",
          goal_profile: "Düşük Gollü",
          expected_score: "1 - 0",
        },
        {
          home_team: "Real Madrid",
          away_team: "Barcelona",
          league: "La Liga",
          time: "22:00",
          main_pick: "KG Var",
          selection: "KG Var",
          market: "KG",
          pro_score: 72,
          odd: 1.95,
          match_type: "Dengeli Derbi",
          goal_profile: "Açık Oyun",
          expected_score: "2 - 2",
        },
        {
          home_team: "Manchester City",
          away_team: "Liverpool",
          league: "Premier League",
          time: "18:30",
          main_pick: "2.5 Üst",
          selection: "3.5 Üst",
          market: "ALT/ÜST",
          pro_score: 81,
          odd: 1.7,
          match_type: "Yüksek Kalite",
          goal_profile: "Bol Gol",
          expected_score: "3 - 1",
        },
        {
          home_team: "PSG",
          away_team: "Marseille",
          league: "Ligue 1",
          time: "21:45",
          main_pick: "MS 1",
          selection: "2.5 Üst",
          market: "ALT/ÜST",
          pro_score: 65,
          odd: 1.6,
          match_type: "Favori",
          goal_profile: "Orta-Yüksek",
          expected_score: "2 - 0",
        },
        {
          home_team: "Bayern Münih",
          away_team: "Dortmund",
          league: "Bundesliga",
          time: "19:30",
          main_pick: "KG Var",
          selection: "KG Var",
          market: "KG",
          pro_score: 54,
          odd: 1.9,
          match_type: "Riskli Derbi",
          goal_profile: "Gollü",
          expected_score: "2 - 1",
        },
        {
          home_team: "Roma",
          away_team: "Milan",
          league: "Serie A",
          time: "21:45",
          main_pick: "2.5 Alt",
          selection: "2.5 Alt",
          market: "ALT/ÜST",
          pro_score: 49,
          odd: 2.1,
          match_type: "Dengeli",
          goal_profile: "Düşük Tempo",
          expected_score: "1 - 1",
        },
        {
          home_team: "Benfica",
          away_team: "Porto",
          league: "Portekiz Ligi",
          time: "23:00",
          main_pick: "1X",
          selection: "1X",
          market: "Çifte Şans",
          pro_score: 69,
          odd: 1.42,
          match_type: "Ev Sahibi Avantaj",
          goal_profile: "Kontrollü",
          expected_score: "1 - 0",
        },
        {
          home_team: "Ajax",
          away_team: "PSV",
          league: "Eredivisie",
          time: "17:30",
          main_pick: "2.5 Üst",
          selection: "KG Var",
          market: "Gol",
          pro_score: 74,
          odd: 1.78,
          match_type: "Açık Oyun",
          goal_profile: "Yüksek Tempo",
          expected_score: "2 - 2",
        },
      ],
    };

    setTimeout(() => {
      setScanner(fakeData);
      localStorage.setItem("vibe_scanner", JSON.stringify(fakeData));
      setLoading(false);
    }, 700);
  }

  function openDetail(m: Match, index: number) {
    localStorage.setItem("vibe_selected_match", JSON.stringify(m));
    localStorage.setItem("vibe_selected_index", String(index));
  }

  function addCoupon(m: Match) {
    setCoupon((prev) => {
      const exists = prev.some(
        (x) => x.home_team === m.home_team && x.away_team === m.away_team
      );
      if (exists) return prev;
      return [...prev, m];
    });
  }

  function removeCoupon(index: number) {
    setCoupon((prev) => prev.filter((_, i) => i !== index));
  }

  function register() {
    if (!acceptedTerms) {
      setError("Üye olmak için kullanım şartlarını ve yasal uyarıları kabul etmelisin.");
      return;
    }
    setUserEmail("demo@orananaliz.ai");
    setError("");
  }

  function toggleLeague(league: string) {
    if (league === "🏆 Tüm Ligler") {
      setSelectedLeagues(["🏆 Tüm Ligler"]);
      return;
    }

    setSelectedLeagues((prev) => {
      const clean = prev.filter((x) => x !== "🏆 Tüm Ligler");
      if (clean.includes(league)) {
        const next = clean.filter((x) => x !== league);
        return next.length ? next : ["🏆 Tüm Ligler"];
      }
      return [...clean, league];
    });
  }

  function toggleSeason(season: string) {
    setSelectedSeasons((prev) => {
      if (prev.includes(season)) {
        const next = prev.filter((x) => x !== season);
        return next.length ? next : prev;
      }
      return [...prev, season];
    });
  }

  const filteredLeagues = LEAGUES.filter((x) =>
    x.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const s = safePercent(m.pro_score);
      if (confidenceFilter === "high") return s >= 70;
      if (confidenceFilter === "mid") return s >= 55 && s < 70;
      if (confidenceFilter === "risk") return s < 55;
      return true;
    });
  }, [matches, confidenceFilter]);

  const couponOdd = useMemo(() => {
    return coupon.reduce((acc, m) => acc * Number(m.odd || 1), 1).toFixed(2);
  }, [coupon]);

  const averageScore = useMemo(() => {
    if (!matches.length) return 0;
    const total = matches.reduce((acc, m) => acc + safePercent(m.pro_score), 0);
    return Math.round(total / matches.length);
  }, [matches]);

  const leagueSummary =
    selectedLeagues.includes("🏆 Tüm Ligler")
      ? "Tüm Ligler"
      : `${selectedLeagues.length} lig`;

  const seasonSummary = `${selectedSeasons.length} sezon`;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-100">
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        <aside className="sticky top-0 flex h-screen flex-col justify-between border-r border-white/10 bg-[#0b111c] text-white shadow-xl">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-xl font-black text-black shadow-[0_0_25px_rgba(250,204,21,0.25)]">
                O
              </div>
              <div>
                <div className="text-sm font-black tracking-[0.22em] text-yellow-400">
                  ORAN ANALİZ
                </div>
                <div className="text-xs font-bold text-slate-400">
                  AI Match Engine
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <SidebarItem icon="🏠" label="Ana Sayfa" active />
              <SidebarItem icon="⭐" label="Favoriler" />
              <SidebarItem icon="🎫" label="Kuponlarım" />
              <SidebarItem icon="📊" label="Analiz Geçmişi" />
            </div>

            <div className="mt-6 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3">
              <div className="text-xs font-black text-yellow-300">Bugünkü Özet</div>
              <div className="mt-2 text-xs leading-5 text-slate-300">
                {scanner?.total_matches || 0} maç analiz edildi.
                <br />
                Ortalama güven: %{averageScore}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            {userEmail ? (
              <div className="mb-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs text-yellow-200">
                Aktif kullanıcı:
                <br />
                <b>{userEmail}</b>
              </div>
            ) : (
              <div className="mb-3 text-xs leading-5 text-slate-400">
                Giriş yaparak kuponlarını ve analiz geçmişini kaydedebilirsin.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAuthMode("login")}
                className="rounded-lg border border-white/10 bg-[#111827] py-2 text-sm font-bold hover:bg-[#172238]"
              >
                Giriş Yap
              </button>

              <button
                onClick={() => setAuthMode("register")}
                className="rounded-lg bg-yellow-400 py-2 text-sm font-black text-black hover:bg-yellow-300"
              >
                Üye Ol
              </button>
            </div>

            <button
              onClick={() => setTermsOpen(true)}
              className="mt-3 w-full text-left text-xs font-bold text-yellow-300 underline"
            >
              Kullanım şartları
            </button>
          </div>
        </aside>

        <section className="min-w-0 p-4">
          <div className="w-full">
            <header className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0b111c] px-4 py-3 shadow-xl">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
                  ORAN ANALİZ
                </div>
                <h1 className="text-2xl font-black text-white">Ana Maç Ekranı</h1>
                <p className="text-xs text-slate-400">{todayText()}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterOpen(true)}
                  className="rounded-lg border border-white/10 bg-[#121a2a] px-4 py-2 text-xs font-black text-white hover:border-yellow-400/50"
                >
                  ⚙️ Filtreler
                </button>

                <button
                  onClick={loadScanner}
                  className="rounded-lg bg-yellow-400 px-5 py-2 text-xs font-black text-black hover:bg-yellow-300"
                >
                  {loading ? "Analiz Ediliyor..." : "🚀 Analizi Başlat"}
                </button>
              </div>
            </header>

            {error && (
              <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-3 grid gap-3 lg:grid-cols-3">
              <TopCard title="TOPLAM MAÇ" value={scanner?.total_matches || 0} sub="Analiz edilen maç" color="green" />
              <TopCard title="KUPONDA" value={coupon.length} sub="Seçili maç" color="blue" />
              <TopCard title="ORTALAMA GÜVEN" value={`%${averageScore}`} sub="AI güven ortalaması" color="dark" />
            </div>

            <section className="mb-3 rounded-xl border border-white/10 bg-[#0b111c] p-4 shadow-xl">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">
                    Kontrol Paneli
                  </h2>
                  <p className="text-xs text-slate-400">
                    {dateOption} • {leagueSummary} • {seasonSummary} • Oran hassasiyeti 8%
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <FilterButton active={confidenceFilter === "all"} onClick={() => setConfidenceFilter("all")}>
                    Tümü
                  </FilterButton>
                  <FilterButton active={confidenceFilter === "high"} onClick={() => setConfidenceFilter("high")}>
                    🔥 Yüksek Güven
                  </FilterButton>
                  <FilterButton active={confidenceFilter === "mid"} onClick={() => setConfidenceFilter("mid")}>
                    🟡 Orta Güven
                  </FilterButton>
                  <FilterButton active={confidenceFilter === "risk"} onClick={() => setConfidenceFilter("risk")}>
                    🔴 Riskli
                  </FilterButton>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                <MiniInfo label="Tarih" value={dateOption} />
                <MiniInfo label="Lig" value={leagueSummary} />
                <MiniInfo label="Sezon" value={seasonSummary} />
                <button
                  onClick={() => setFilterOpen(true)}
                  className="rounded-lg bg-yellow-400 px-4 py-3 text-xs font-black text-black hover:bg-yellow-300"
                >
                  Düzenle
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-[#0b111c] p-4 shadow-xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">
                    Maç Listesi
                  </h2>
                  <p className="text-xs text-slate-400">
                    Kompakt analiz görünümü • {filteredMatches.length} maç gösteriliyor
                  </p>
                </div>

                <div className="rounded-lg bg-yellow-400/15 px-3 py-2 text-xs font-black text-yellow-300">
                  Tahmin değil, analiz.
                </div>
              </div>

              {matches.length === 0 && (
                <div className="rounded-xl border border-dashed border-yellow-400/30 bg-[#111827] p-10 text-center">
                  <div className="text-5xl">⚽</div>
                  <div className="mt-3 text-xl font-black text-white">Analiz bekleniyor</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Başlamak için “Analizi Başlat” butonuna bas.
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                {filteredMatches.map((m, i) => {
                  const score = safePercent(m.pro_score);
                  const risky = score < 55;
                  const realIndex = matches.findIndex(
                    (x) => x.home_team === m.home_team && x.away_team === m.away_team
                  );

                  return (
                    <div
                      key={`${m.home_team}-${m.away_team}-${i}`}
                      className="grid grid-cols-[80px_2fr_150px_110px_100px_130px_150px] items-center gap-3 rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm shadow hover:bg-[#151f33]"
                    >
                      <div className="text-center">
                        <div className="font-black text-white">{m.time || "20:00"}</div>
                        <div className="text-[10px] text-slate-500">Saat</div>
                      </div>

                      <div>
                        <div className="font-black text-white">
                          {m.home_team || "-"} - {m.away_team || "-"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {m.league || "Lig"} • {m.match_type || "Maç tipi"} • {m.goal_profile || "Gol profili"}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black">
                          {m.main_pick || m.selection || "-"}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className={risky ? "text-lg font-black text-red-400" : "text-lg font-black text-yellow-300"}>
                          %{score}
                        </div>
                        <div className="mx-auto mt-1 h-1.5 w-16 rounded bg-[#263247]">
                          <div
                            className={risky ? "h-1.5 rounded bg-red-500" : "h-1.5 rounded bg-yellow-400"}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="font-black text-white">{m.odd || "-"}</div>
                        <div className="text-[10px] text-slate-500">Oran</div>
                      </div>

                      <div className="text-center">
                        <div className="font-black text-white">{m.expected_score || "1 - 0"}</div>
                        <div className="text-[10px] text-slate-500">Tahmini skor</div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/match/${realIndex >= 0 ? realIndex : i}`}
                          onClick={() => openDetail(m, realIndex >= 0 ? realIndex : i)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-white hover:border-yellow-400/50"
                        >
                          Detay
                        </Link>

                        <button
                          onClick={() => addCoupon(m)}
                          className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black hover:bg-yellow-300"
                        >
                          + Kupon
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <footer className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-xs leading-6 text-red-700">
              <b>⚠️ Yasal Uyarı:</b> Bu platform yalnızca istatistiksel analizler,
              geçmiş veri karşılaştırmaları ve yapay zekâ destekli tahminler sunar.
              Kesin kazanç garantisi verilmez. Bahis oynamak risk içerir.
            </footer>
          </div>
        </section>
      </div>

      {coupon.length > 0 && (
        <div className="fixed bottom-5 right-5 z-40 w-[380px] rounded-2xl border border-yellow-400/25 bg-[#07111f] p-4 text-white shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-black">Kuponum</div>
              <div className="text-xs text-slate-500">{coupon.length} maç seçili</div>
            </div>

            <button
              onClick={() => setCoupon([])}
              className="rounded-lg border border-red-400/30 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-500/10"
            >
              Temizle
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1">
            {coupon.map((m, i) => (
              <div
                key={i}
                className="mb-2 flex items-center justify-between rounded-xl bg-[#0b1628] p-3 text-sm"
              >
                <div>
                  <div className="font-bold">{m.home_team} - {m.away_team}</div>
                  <div className="text-xs text-yellow-400">
                    {m.selection || m.main_pick} • {m.odd || "-"}
                  </div>
                </div>

                <button
                  onClick={() => removeCoupon(i)}
                  className="rounded-lg bg-red-500/15 px-3 py-2 text-red-300 hover:bg-red-500/25"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3">
            <div className="text-xs text-yellow-200">Toplam Oran</div>
            <div className="text-3xl font-black text-yellow-300">{couponOdd}</div>
          </div>
        </div>
      )}

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-5xl rounded-2xl border border-yellow-400/20 bg-[#0b111c] p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Tarih, Lig ve Sezon Seçimi</h2>
                <p className="text-sm text-slate-400">
                  Analiz yapılacak günü, sezonu ve ligleri seç.
                </p>
              </div>
              <button
                onClick={() => setFilterOpen(false)}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-black text-white"
              >
                Kapat
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.75fr_0.75fr_1.2fr]">
              <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
                <div className="mb-3 text-xs font-black uppercase text-yellow-400">
                  Tarih Seçimi
                </div>

                <div className="grid gap-2">
                  {DATE_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDateOption(d)}
                      className={`rounded-lg px-4 py-3 text-left text-sm font-black ${
                        dateOption === d
                          ? "bg-yellow-400 text-black"
                          : "bg-[#0b111c] text-slate-300 hover:bg-[#172238]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
                <div className="mb-3 text-xs font-black uppercase text-yellow-400">
                  Sezon Seçimi
                </div>

                <div className="grid gap-2">
                  {SEASONS.map((season) => (
                    <label
                      key={season}
                      className="flex cursor-pointer items-center gap-3 rounded-lg bg-[#0b111c] px-4 py-3 text-sm hover:bg-[#172238]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSeasons.includes(season)}
                        onChange={() => toggleSeason(season)}
                        className="accent-yellow-400"
                      />
                      <span>{season}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
                <div className="mb-3 text-xs font-black uppercase text-yellow-400">
                  Lig Seçimi
                </div>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Lig ara..."
                  className="mb-3 w-full rounded-lg border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none focus:border-yellow-400/60"
                />

                <div className="max-h-80 overflow-y-auto pr-2">
                  {filteredLeagues.map((league) => (
                    <label
                      key={league}
                      className="mb-2 flex cursor-pointer items-center gap-3 rounded-lg bg-[#0b111c] px-4 py-3 text-sm hover:bg-[#172238]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeagues.includes(league)}
                        onChange={() => toggleLeague(league)}
                        className="accent-yellow-400"
                      />
                      <span>{league}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setFilterOpen(false)}
              className="mt-5 w-full rounded-xl bg-yellow-400 px-4 py-3 font-black text-black hover:bg-yellow-300"
            >
              Seçimi Uygula
            </button>
          </div>
        </div>
      )}

      {authMode === "login" && !userEmail && (
        <AuthModal
          title="Giriş Yap"
          button="Giriş Yap"
          onClose={() => setAuthMode("login")}
          onSubmit={() => setUserEmail("demo@orananaliz.ai")}
          showTerms={false}
          acceptedTerms={acceptedTerms}
          setAcceptedTerms={setAcceptedTerms}
          setTermsOpen={setTermsOpen}
        />
      )}

      {authMode === "register" && !userEmail && (
        <AuthModal
          title="Üye Ol"
          button="Üyeliği Oluştur"
          onClose={() => setAuthMode("login")}
          onSubmit={register}
          showTerms
          acceptedTerms={acceptedTerms}
          setAcceptedTerms={setAcceptedTerms}
          setTermsOpen={setTermsOpen}
        />
      )}

      {termsOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-yellow-400/20 bg-[#0b111c] p-6 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Kullanım Şartları ve Yasal Uyarılar</h2>
              <button
                onClick={() => setTermsOpen(false)}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-black"
              >
                Kapat
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
              {LEGAL_TEXT}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}

function SidebarItem({ icon, label, active }: any) {
  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold ${
        active
          ? "bg-yellow-400 text-black"
          : "text-slate-300 hover:bg-[#172238] hover:text-white"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function TopCard({ title, value, sub, color }: any) {
  const cls =
    color === "green"
      ? "bg-[#14532d]"
      : color === "blue"
      ? "bg-[#12325f]"
      : "bg-[#1b2136]";

  return (
    <div className={`rounded-xl border border-white/10 ${cls} p-5 text-center shadow-xl`}>
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
        {title}
      </div>
      <div className="mt-2 text-4xl font-black text-white">{value}</div>
      <div className="mt-2 text-xs font-bold text-slate-300">{sub}</div>
    </div>
  );
}

function MiniInfo({ label, value }: any) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#111827] px-4 py-3">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black"
          : "rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-xs font-black text-slate-300 hover:border-yellow-400/50"
      }
    >
      {children}
    </button>
  );
}

function AuthModal({
  title,
  button,
  onClose,
  onSubmit,
  showTerms,
  acceptedTerms,
  setAcceptedTerms,
  setTermsOpen,
}: any) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-yellow-400/20 bg-[#0b111c] p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-slate-300 hover:bg-[#172238]"
          >
            Kapat
          </button>
        </div>

        <input
          placeholder="Email"
          className="mb-3 w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/60"
        />

        <input
          placeholder="Şifre"
          type="password"
          className="mb-3 w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/60"
        />

        {showTerms && (
          <>
            <label className="mb-3 flex gap-2 text-xs leading-5 text-slate-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 accent-yellow-400"
              />
              <span>
                Kullanım şartlarını, sorumluluk reddini ve risk uyarısını kabul ediyorum.
              </span>
            </label>

            <button
              onClick={() => setTermsOpen(true)}
              className="mb-3 text-left text-xs font-bold text-yellow-300 underline"
            >
              Kullanım şartlarını oku
            </button>
          </>
        )}

        <button
          onClick={onSubmit}
          className="w-full rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-black hover:bg-yellow-300"
        >
          {button}
        </button>
      </div>
    </div>
  );
}