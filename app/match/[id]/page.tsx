"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Match = any;

function safePercent(v: any) {
  const n = Number(v || 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export default function MatchDetailPage() {
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("vibe_selected_match");
    if (raw) setMatch(JSON.parse(raw));
  }, []);

  if (!match) {
    return (
      <main className="min-h-screen bg-[#070b12] p-6 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
          <div className="mb-4 text-2xl font-black">Maç detayı bulunamadı.</div>
          <p className="mb-5 text-sm text-slate-400">
            Ana sayfadan bir maç seçerek detay ekranını açabilirsin.
          </p>
          <Link href="/" className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black">
            Ana sayfaya dön
          </Link>
        </div>
      </main>
    );
  }

  const score = safePercent(match.pro_score);
  const risky = score < 55;

  return (
    <main className="min-h-screen bg-[#070b12] p-5 text-slate-100">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#101827] to-[#080d16] p-5 shadow-2xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:border-yellow-400/50 hover:bg-[#172238]"
            >
              ← Ana Sayfa
            </Link>

            <div className="text-center">
              <div className="mb-2 inline-flex rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">
                Maç Detay Analizi
              </div>
              <h1 className="text-3xl font-black text-white">
                {match.home_team || "-"} - {match.away_team || "-"}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {match.league || "Lig"} • {match.time || "20:00"}
              </p>
            </div>

            <button className="rounded-xl border border-yellow-400/25 px-4 py-2 text-sm font-black text-yellow-300 hover:bg-yellow-400/10">
              ☆ Takibe Al
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard title="ANA TAHMİN" value={match.main_pick || match.selection || "-"} sub={match.market || "Market"} />
            <InfoCard title="GÜVEN SKORU" value={`%${score}`} sub={risky ? "Riskli bölge" : "Oynanabilir seviye"} danger={risky} />
            <InfoCard title="TAHMİNİ SKOR" value={match.expected_score || "2-1"} sub="AI skor senaryosu" />
          </div>
        </div>

        <div className="mb-5 rounded-3xl border border-white/10 bg-[#111827] p-5 shadow-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white">Analiz Özeti</h2>
              <p className="text-sm text-slate-400">
                Oran, güven skoru ve maç profiline göre üretilen demo analiz.
              </p>
            </div>

            <div className={`rounded-2xl px-5 py-3 text-center font-black ${risky ? "bg-red-500/15 text-red-300" : "bg-yellow-400 text-black"}`}>
              {risky ? "⚠️ Riskli" : "🔥 Güçlü Aday"}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Panel title="Maç Tahminleri">
              <PredictionRow name="🏆 Ana Seçim" pick={match.main_pick || match.selection || "-"} pct={score} />
              <PredictionRow name="⚽ Alternatif Market" pick={match.selection || "-"} pct={Math.max(45, score - 6)} />
              <PredictionRow name="🤝 Karşılıklı Gol" pick={match.market === "KG" ? match.selection : "Var"} pct={match.market === "KG" ? score : 58} />
              <PredictionRow name="📊 Gol Profili" pick={match.goal_profile || "Dengeli"} pct={Math.max(50, score - 10)} />
              <PredictionRow name="⏱️ Canlı Takip" pick="İlk 15 dk tempo kontrol" pct={62} />
            </Panel>

            <Panel title="Oran ve Risk Kartı">
              <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
                <OddBox label="1" value={match.odd || "-"} />
                <OddBox label="X" value="-" />
                <OddBox label="2" value="-" />
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b111c] p-4">
                <div className="mb-2 flex justify-between text-xs font-bold text-slate-400">
                  <span>Güven Barı</span>
                  <span>%{score}</span>
                </div>
                <div className="h-3 rounded-full bg-[#243047]">
                  <div
                    className={`h-3 rounded-full ${risky ? "bg-red-500" : "bg-yellow-400"}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">
                  {risky
                    ? "Bu maçta güven skoru düşük. Tek başına güçlü aday gibi değerlendirilmemeli."
                    : "Güven skoru iyi seviyede. Yine de canlı tempo ve kadro kontrolü önerilir."}
                </p>
              </div>
            </Panel>
          </div>
        </div>

        <Panel title="Neden Bu Tahmin?" full>
          <div className="grid gap-3 md:grid-cols-3">
            <ReasonCard title="Maç Tipi" value={match.match_type || "Favori"} />
            <ReasonCard title="Gol Profili" value={match.goal_profile || "Dengeli"} />
            <ReasonCard title="AI Yorumu" value={match.ai_comment || "Oran yapısı ve güven skoru bu seçimi öne çıkarıyor."} />
          </div>

          <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm leading-6 text-yellow-100">
            <b>Yorum:</b> {match.home_team || "Ev sahibi"} tarafı analizde öne çıkıyor. Ana senaryo{" "}
            <b>{match.main_pick || match.selection || "-"}</b>. Ancak skor ve tempo verisi canlıda tersine dönerse risk artabilir.
          </div>

          <div className="mt-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm leading-6 text-red-200">
            <b>Risk:</b> Bu platform kesin sonuç vermez. Analiz yalnızca istatistiksel değerlendirme ve demo veri sunumudur.
          </div>
        </Panel>

        <div className="mt-5 rounded-3xl border border-white/10 bg-[#111827] p-5 shadow-xl">
          <h3 className="mb-4 text-lg font-black text-white">
            Benzer Oranlı Geçmiş Maçlar
          </h3>

          <div className="rounded-2xl border border-dashed border-yellow-400/20 bg-[#0b111c] p-8 text-center">
            <div className="text-4xl">📊</div>
            <div className="mt-3 text-lg font-black text-white">
              Geçmiş maç verisi backend bağlanınca gösterilecek
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Şu an demo mod aktif olduğu için sahte tablo yerine temiz bilgilendirme gösteriliyor.
            </p>
          </div>
        </div>

        <footer className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-xs leading-6 text-red-200">
          <b>⚠️ Yasal Uyarı:</b> Bu platform yalnızca istatistiksel analizler,
          geçmiş veri karşılaştırmaları ve yapay zekâ destekli tahminler sunar.
          Kesin kazanç garantisi verilmez. Bahis oynamak risk içerir ve bağımlılık oluşturabilir.
        </footer>
      </div>
    </main>
  );
}

function InfoCard({ title, value, sub, danger }: any) {
  return (
    <div className={`rounded-3xl border p-5 text-center shadow-xl ${
      danger
        ? "border-red-400/30 bg-red-500/10"
        : "border-yellow-400/20 bg-yellow-400/10"
    }`}>
      <div className="text-xs font-black tracking-widest text-slate-400">{title}</div>
      <div className={`mt-2 text-4xl font-black ${danger ? "text-red-300" : "text-yellow-300"}`}>
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-400">{sub}</div>
    </div>
  );
}

function Panel({ title, children, full }: any) {
  return (
    <div className={`${full ? "mt-5" : ""} rounded-3xl border border-white/10 bg-[#111827] p-5 text-white shadow-xl`}>
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      {children}
    </div>
  );
}

function PredictionRow({ name, pick, pct }: any) {
  const score = safePercent(pct);
  const risky = score < 55;

  return (
    <div className="mb-4 grid gap-3 border-b border-white/10 pb-4 md:grid-cols-[1fr_1.2fr]">
      <div>
        <div className="font-bold text-white">{name}</div>
        <div className="text-xs text-slate-500">AI market analizi</div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs font-bold">
          <span className={risky ? "text-red-300" : "text-yellow-300"}>{pick}</span>
          <span className="text-slate-400">%{score}</span>
        </div>
        <div className="h-2 rounded bg-[#263247]">
          <div
            className={`h-2 rounded ${risky ? "bg-red-500" : "bg-yellow-400"}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function OddBox({ label, value }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b111c] p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-black text-yellow-300">{value}</div>
    </div>
  );
}

function ReasonCard({ title, value }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b111c] p-4">
      <div className="mb-2 text-xs font-black uppercase tracking-widest text-yellow-400">
        {title}
      </div>
      <div className="text-sm leading-6 text-slate-300">{value}</div>
    </div>
  );
}