"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDailyScanner } from "@/lib/api";

type Match = any;

const LEGAL_TEXT = `Bu platform yalnızca istatistiksel analiz ve yapay zekâ destekli tahminler sunar.

Sunulan içerikler kesinlik içermez ve yatırım tavsiyesi değildir.

Kullanıcılar kendi kararlarını kendileri verir. Bu platform üzerinden doğrudan bahis oynanmaz ve herhangi bir bahis hizmeti sunulmaz.

Bahis oynamak risk içerir ve maddi kayıplara yol açabilir.

1. Hizmet Tanımı
Bu platform, spor karşılaşmalarına ilişkin istatistiksel analizler ve yapay zekâ destekli tahminler sunar.

2. Sorumluluk Reddi
Platformda yer alan hiçbir içerik kesin kazanç garantisi vermez. Kullanıcılar, elde ettikleri verileri kendi riskleri doğrultusunda değerlendirir.

3. Bahis Hizmeti Sunulmaması
Bu platform bir bahis sitesi değildir. Kullanıcılara doğrudan bahis oynama imkânı sunulmaz ve herhangi bir bahis kuruluşu ile resmi bir bağlantısı bulunmaz.

4. Kullanıcı Sorumluluğu
Kullanıcılar, platformu kullanırken yürürlükteki yasalara uymakla yükümlüdür.

5. Hizmet Değişikliği
Platform, hizmet içeriğini önceden bildirmeksizin değiştirme hakkını saklı tutar.`;

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
  return Math.max(0, Math.min(100, n));
}

export default function HomePage() {
  const [scanner, setScanner] = useState<any>(null);
  const [selected, setSelected] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [coupon, setCoupon] = useState<Match[]>([]);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [termsOpen, setTermsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateOption, setDateOption] = useState("Bugün");
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(["🏆 Tüm Ligler"]);
  const [query, setQuery] = useState("");

  const matches: Match[] = scanner?.top_matches || [];

  useEffect(() => {
    const raw = localStorage.getItem("vibe_scanner");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setScanner(parsed);
        setSelected(parsed?.top_matches?.[0] || null);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (matches.length && !selected) setSelected(matches[0]);
  }, [matches, selected]);

  async function loadScanner() {
  setLoading(true);
  setError("");

  const fakeData = {
    total_matches: 6,
    top_matches: [
      {
        home_team: "Galatasaray",
        away_team: "Fenerbahçe",
        league: "Süper Lig",
        time: "20:00",
        main_pick: "MS 1",
        selection: "2.5 Üst",
        market: "ALT/ÜST",
        pro_score: 78,
        odd: 1.85,
        match_type: "Favori",
        goal_profile: "Yüksek Tempo",
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
        odd: 1.70,
        match_type: "Yüksek Kalite",
        goal_profile: "Bol Gol",
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
        odd: 1.60,
        match_type: "Favori",
        goal_profile: "Orta-Yüksek",
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
        odd: 1.90,
        match_type: "Riskli Derbi",
        goal_profile: "Gollü",
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
        odd: 2.10,
        match_type: "Dengeli",
        goal_profile: "Düşük Tempo",
      },
    ],
  };

  setTimeout(() => {
    setScanner(fakeData);
    setSelected(fakeData.top_matches[0]);
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

  const filteredLeagues = LEAGUES.filter((x) =>
    x.toLowerCase().includes(query.toLowerCase())
  );

  const couponOdd = useMemo(() => {
    return coupon.reduce((acc, m) => acc * Number(m.odd || 1), 1).toFixed(2);
  }, [coupon]);

  const leagueSummary =
    selectedLeagues.includes("🏆 Tüm Ligler")
      ? "Tüm Ligler"
      : `${selectedLeagues.length} lig seçili`;

  return (
    <main className="min-h-screen bg-[#070b12] text-slate-100">
      <div
        className={`grid min-h-screen transition-all duration-300 ${
          sidebarOpen ? "grid-cols-[285px_1fr]" : "grid-cols-[82px_1fr]"
        }`}
      >
        <aside className="sticky top-0 h-screen overflow-y-auto border-r border-yellow-500/10 bg-[#0b111c] p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-5 w-full rounded-2xl border border-white/10 bg-[#121a2a] px-3 py-2 text-sm font-black text-slate-200 hover:border-yellow-400/50 hover:bg-[#182235]"
          >
            {sidebarOpen ? "← Kapat" : "☰"}
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-2xl font-black text-black shadow-[0_0_35px_rgba(250,204,21,0.25)]">
              O
            </div>

            {sidebarOpen && (
              <div>
                <div className="text-xl font-black leading-5 text-white">
                  ORAN ANALİZ
                </div>
                <div className="mt-1 text-xs font-bold text-yellow-400">
                  AI Destekli Maç Analizi
                </div>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <>
              <div className="mb-4 rounded-2xl border border-white/10 bg-[#101827] p-3 shadow-xl">
                <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-[#070b12] p-1">
                  <button
                    onClick={() => setAuthMode("login")}
                    className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                      authMode === "login"
                        ? "bg-yellow-400 text-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Giriş
                  </button>
                  <button
                    onClick={() => setAuthMode("register")}
                    className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                      authMode === "register"
                        ? "bg-yellow-400 text-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Üye Ol
                  </button>
                </div>

                <input
                  placeholder="Email"
                  className="mb-2 w-full rounded-xl border border-white/10 bg-[#070b12] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/70"
                />
                <input
                  placeholder="Şifre"
                  type="password"
                  className="mb-3 w-full rounded-xl border border-white/10 bg-[#070b12] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/70"
                />

                {authMode === "register" && (
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
                  onClick={authMode === "register" ? register : () => setUserEmail("demo@orananaliz.ai")}
                  className="w-full rounded-xl bg-yellow-400 px-3 py-2 text-sm font-black text-black hover:bg-yellow-300"
                >
                  {authMode === "register" ? "Üyeliği Oluştur" : "Giriş Yap"}
                </button>

                {userEmail && (
                  <div className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-xs text-yellow-200">
                    Aktif kullanıcı: {userEmail}
                  </div>
                )}
              </div>

              <button
                onClick={() => setFilterOpen(true)}
                className="mb-4 w-full rounded-2xl border border-yellow-400/25 bg-gradient-to-br from-[#151b28] to-[#0d1320] p-4 text-left shadow-xl hover:border-yellow-400/60"
              >
                <div className="mb-1 text-xs font-black uppercase tracking-widest text-yellow-400">
                  Tarih & Lig Seçimi
                </div>
                <div className="text-sm font-black text-white">
                  🌐 {dateOption} • {leagueSummary}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Açmak için tıkla
                </div>
              </button>

              <div className="mb-5 text-xs font-black uppercase tracking-wider text-slate-500">
                Kontrol Merkezi
              </div>

              <label className="mb-2 block text-xs text-slate-400">
                The Odds API Key
              </label>
              <div className="mb-5 rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-slate-500">
                ***************
              </div>

              <label className="mb-2 block text-xs text-slate-400">
                Analiz Tarihi
              </label>
              <div className="mb-5 rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-yellow-300">
                {todayText()}
              </div>

              <div className="mb-3 text-xs font-bold text-slate-400">Sezonlar</div>
              {["2324", "2425", "2526"].map((s) => (
                <label key={s} className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" defaultChecked className="accent-yellow-400" />
                  {s}
                </label>
              ))}

              <div className="mt-5 mb-2 text-xs font-bold text-slate-400">
                Oran Hassasiyeti
              </div>
              <input type="range" defaultValue={8} className="w-full accent-yellow-400" />
              <div className="mb-5 text-right text-xs text-slate-500">8%</div>

              <button
                onClick={loadScanner}
                className="mt-3 w-full rounded-2xl bg-yellow-400 px-4 py-3 font-black text-black shadow-[0_0_35px_rgba(250,204,21,0.22)] hover:bg-yellow-300"
              >
                {loading ? "Analiz Ediliyor..." : "🚀 Analizi Başlat"}
              </button>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[#111827] p-3 text-xs text-slate-400">
                Son analiz: şimdi
                <br />
                Toplam maç: {scanner?.total_matches || 0}
              </div>
            </>
          )}
        </aside>

        <section className="p-5">
          <div className="mb-5 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#101827] to-[#080d16] p-5 shadow-2xl">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="mb-2 inline-flex rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">
                  Tahmin değil, analiz.
                </div>
                <h1 className="text-3xl font-black text-white">
                  Ana Maç Ekranı
                </h1>
                <p className="mt-1 text-sm text-slate-400">{todayText()}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-[#0b111c] px-5 py-3 text-center">
                  <div className="text-3xl font-black text-yellow-400">
                    {scanner?.total_matches || 0}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    MAÇ BULUNDU
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0b111c] px-5 py-3 text-center">
                  <div className="text-3xl font-black text-red-400">
                    {coupon.length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    KUPONDA
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mb-5 flex flex-wrap gap-3 text-sm font-bold">
              <span className="rounded-full border border-yellow-400/40 bg-yellow-400 px-4 py-2 text-black">
                Tümü
              </span>
              <span className="rounded-full border border-white/10 bg-[#0b111c] px-4 py-2 text-slate-300">
                🔥 Yüksek Güven
              </span>
              <span className="rounded-full border border-white/10 bg-[#0b111c] px-4 py-2 text-slate-300">
                🟡 Orta Güven
              </span>
              <span className="rounded-full border border-white/10 bg-[#0b111c] px-4 py-2 text-slate-300">
                ⭐ Sürpriz Maçlar
              </span>
            </div>

            <div className="grid gap-3">
              {matches.length === 0 && (
                <div className="rounded-3xl border border-dashed border-yellow-400/25 bg-[#0b111c] p-10 text-center">
                  <div className="text-5xl">⚽</div>
                  <div className="mt-3 text-xl font-black text-white">
                    Analiz bekleniyor
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    Başlamak için soldaki “Analizi Başlat” butonuna bas.
                  </div>
                </div>
              )}

              {matches.map((m, i) => {
                const score = safePercent(m.pro_score);
                const risky = score < 55;

                return (
                  <div
                    key={i}
                    className="grid grid-cols-[95px_1.25fr_155px_155px_185px_135px] items-center gap-3 rounded-3xl border border-white/10 bg-[#111827] p-4 text-white shadow-xl transition hover:border-yellow-400/35 hover:bg-[#151f33]"
                  >
                    <div className="text-center">
                      <div className="text-slate-500">☆</div>
                      <div className="text-lg font-black">{m.time || "20:00"}</div>
                      <div className="text-[10px] text-slate-400">{m.league || "Lig"}</div>
                      <div className="mt-1 text-xs">⚽</div>
                    </div>

                    <div>
                      <div className="text-lg font-black">{m.home_team || "-"}</div>
                      <div className="text-slate-300">{m.away_team || "-"}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        {m.match_type || "Favori"} • {m.goal_profile || "Dengeli"}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-400">
                        ANA TAHMİN
                      </div>
                      <div className="mx-auto mt-1 w-fit rounded-xl bg-yellow-400 px-4 py-1 font-black text-black">
                        {m.main_pick || m.selection || "-"}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">GÜVEN</div>
                      <div className={risky ? "font-black text-red-400" : "font-black text-yellow-300"}>
                        %{score}
                      </div>
                      <div className="mx-auto mt-1 h-2 w-24 rounded bg-[#243047]">
                        <div
                          className={`h-2 rounded ${risky ? "bg-red-500" : "bg-yellow-400"}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      {risky && (
                        <div className="mt-1 text-[10px] font-bold text-red-400">
                          ⚠️ Riskli
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-400">
                        ALTERNATİF
                      </div>
                      <div className="mt-1 rounded-xl bg-yellow-600 px-3 py-1 font-black text-black">
                        {m.selection || "-"}
                      </div>
                      <div className="mt-2 text-[10px] text-slate-400">MARKET</div>
                      <div className="mx-auto w-fit rounded-xl border border-red-400/30 bg-red-500/15 px-3 py-1 text-sm font-black text-red-300">
                        {m.market || "-"}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="mb-2 text-[10px] font-bold text-slate-400">
                        ORANLAR
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="rounded-xl bg-[#0b111c] p-2">
                          1<br />
                          <b className="text-yellow-300">{m.odd || "-"}</b>
                        </div>
                        <div className="rounded-xl bg-[#0b111c] p-2">
                          X<br />
                          <b>-</b>
                        </div>
                        <div className="rounded-xl bg-[#0b111c] p-2">
                          2<br />
                          <b>-</b>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Link
                        href={`/match/${i}`}
                        onClick={() => openDetail(m, i)}
                        className="rounded-xl border border-white/10 px-3 py-2 text-center text-sm font-bold hover:border-yellow-400/50 hover:bg-[#172238]"
                      >
                        Detay →
                      </Link>
                      <button
                        onClick={() => addCoupon(m)}
                        className="rounded-xl bg-yellow-400 px-3 py-2 text-sm font-black text-black hover:bg-yellow-300"
                      >
                        + Kupona Ekle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-xs leading-6 text-red-200">
            <b>⚠️ Yasal Uyarı:</b> Bu platform yalnızca istatistiksel analizler,
            geçmiş veri karşılaştırmaları ve yapay zekâ destekli tahminler sunar.
            Kesin kazanç garantisi verilmez. Bahis oynamak risk içerir ve bağımlılık oluşturabilir.
          </footer>
        </section>
      </div>

      {coupon.length > 0 && (
        <div className="fixed bottom-5 right-5 z-40 w-96 rounded-3xl border border-yellow-400/25 bg-[#07111f] p-4 text-white shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-black">Kuponum</div>
              <div className="text-xs text-slate-500">Seçili maçlar</div>
            </div>
            <button
              onClick={() => setCoupon([])}
              className="rounded-xl border border-red-400/30 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-500/10"
            >
              Tümünü Sil
            </button>
          </div>

          {coupon.map((m, i) => (
            <div key={i} className="mb-2 flex items-center justify-between rounded-2xl bg-[#0b1628] p-3 text-sm">
              <div>
                <div className="font-bold">{m.home_team} - {m.away_team}</div>
                <div className="text-yellow-400">{m.selection} • {m.odd || "-"}</div>
              </div>
              <button
                onClick={() => removeCoupon(i)}
                className="rounded-xl bg-red-500/15 px-3 py-2 text-red-300 hover:bg-red-500/25"
              >
                🗑
              </button>
            </div>
          ))}

          <div className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 font-black text-yellow-300">
            Toplam Oran: {couponOdd}
          </div>
        </div>
      )}

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-4xl rounded-3xl border border-yellow-400/20 bg-[#0b111c] p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Tarih ve Lig Seçimi</h2>
                <p className="text-sm text-slate-400">
                  Analiz yapılacak günü ve ligleri seç.
                </p>
              </div>
              <button
                onClick={() => setFilterOpen(false)}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-black text-white"
              >
                Kapat
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
                <div className="mb-3 text-xs font-black uppercase text-yellow-400">
                  Tarih Seçimi
                </div>
                <div className="grid gap-2">
                  {DATE_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDateOption(d)}
                      className={`rounded-xl px-4 py-3 text-left text-sm font-black ${
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

              <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
                <div className="mb-3 text-xs font-black uppercase text-yellow-400">
                  Lig Seçimi
                </div>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Lig ara..."
                  className="mb-3 w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none focus:border-yellow-400/60"
                />

                <div className="max-h-80 overflow-y-auto pr-2">
                  {filteredLeagues.map((league) => (
                    <label
                      key={league}
                      className="mb-2 flex cursor-pointer items-center gap-3 rounded-xl bg-[#0b111c] px-4 py-3 text-sm hover:bg-[#172238]"
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
              className="mt-5 w-full rounded-2xl bg-yellow-400 px-4 py-3 font-black text-black hover:bg-yellow-300"
            >
              Seçimi Uygula
            </button>
          </div>
        </div>
      )}

      {termsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-yellow-400/20 bg-[#0b111c] p-6 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Kullanım Şartları ve Yasal Uyarılar</h2>
              <button
                onClick={() => setTermsOpen(false)}
                className="rounded-xl bg-red-500 px-3 py-2 text-sm font-black"
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