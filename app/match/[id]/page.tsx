"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Match = any;

function safePercent(v: any, fallback = 55) {
  const n = Number(v ?? fallback);
  if (Number.isNaN(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}

function clamp(n: number) {
  return Math.max(1, Math.min(98, Math.round(n)));
}

function makePercents(base: number) {
  const main = clamp(base);
  const draw = clamp(100 - main - 24);
  const away = clamp(100 - main - draw);
  return { main, draw, away };
}

export default function MatchDetailPage() {
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("vibe_selected_match");
    if (raw) setMatch(JSON.parse(raw));
  }, []);

  const similarMatches = useMemo(() => {
    if (!match) return [];

    const teams = [
      ["Arsenal", "Chelsea", "MS 1", "2-1"],
      ["Roma", "Lazio", "KG Var", "1-1"],
      ["PSV", "Ajax", "2.5 Üst", "3-1"],
      ["Benfica", "Porto", "2.5 Alt", "1-0"],
      ["Leverkusen", "Frankfurt", "MS 1", "2-0"],
      ["Sevilla", "Villarreal", "KG Var", "2-2"],
      ["Lyon", "Nice", "MS X", "1-1"],
      ["Feyenoord", "Twente", "2.5 Üst", "3-0"],
      ["Milan", "Napoli", "2.5 Alt", "1-1"],
      ["Fenerbahçe", "Trabzonspor", "MS 1", "2-1"],
    ];

    return teams.map((t, i) => ({
      home: t[0],
      away: t[1],
      pick: t[2],
      score: t[3],
      odd: (Number(match.odd || 1.75) + (i - 4) * 0.03).toFixed(2),
      result: i % 3 === 0 ? "Kazandı" : i % 3 === 1 ? "Yattı" : "Berabere",
    }));
  }, [match]);

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

  const score = safePercent(match.pro_score, 62);
  const risky = score < 55;

  const ms = makePercents(score);
  const homePct = match.main_pick === "MS 2" ? clamp(100 - ms.main - ms.draw) : ms.main;
  const drawPct = ms.draw;
  const awayPct = match.main_pick === "MS 2" ? ms.main : clamp(100 - homePct - drawPct);

  const over25 = clamp(score + 4);
  const under25 = clamp(100 - over25);
  const bttsYes = clamp(match.main_pick === "KG Var" ? score : score - 6);
  const bttsNo = clamp(100 - bttsYes);
  const firstHalfHome = clamp(homePct - 12);
  const firstHalfDraw = clamp(42);
  const firstHalfAway = clamp(100 - firstHalfHome - firstHalfDraw);
  const iyOver05 = clamp(score + 2);
  const iyUnder05 = clamp(100 - iyOver05);
  const over35 = clamp(over25 - 18);

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

            <div className={`rounded-2xl px-5 py-3 text-center font-black ${risky ? "bg-red-500/15 text-red-300" : "bg-yellow-400 text-black"}`}>
              {risky ? "⚠️ Riskli" : "🔥 Güçlü Aday"}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard title="ANA TAHMİN" value={match.main_pick || match.selection || "-"} sub={match.market || "Market"} />
            <InfoCard title="GÜVEN SKORU" value={`%${score}`} sub={risky ? "Riskli bölge" : "Oynanabilir seviye"} danger={risky} />
            <InfoCard title="TAHMİNİ SKOR" value={match.expected_score || "2-1"} sub="AI skor senaryosu" />
          </div>
        </div>

        <Section title="Maç Tahminleri" desc="Temel marketlerin yüzdesel dağılımı">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Maç Sonucu 1 / X / 2">
              <PredictionRow name="1" pick={match.home_team || "Ev Sahibi"} pct={homePct} />
              <PredictionRow name="X" pick="Beraberlik" pct={drawPct} />
              <PredictionRow name="2" pick={match.away_team || "Deplasman"} pct={awayPct} />
            </Panel>

            <Panel title="2.5 Üst / Alt">
              <PredictionRow name="2.5 Üst" pick="Gol beklentisi yüksek" pct={over25} />
              <PredictionRow name="2.5 Alt" pick="Daha kontrollü senaryo" pct={under25} />
            </Panel>

            <Panel title="Karşılıklı Gol">
              <PredictionRow name="KG Var" pick="İki takım da gol bulabilir" pct={bttsYes} />
              <PredictionRow name="KG Yok" pick="Tek taraflı skor ihtimali" pct={bttsNo} />
            </Panel>

            <Panel title="İlk Yarı Sonucu">
              <PredictionRow name="İY 1" pick={match.home_team || "Ev Sahibi"} pct={firstHalfHome} />
              <PredictionRow name="İY X" pick="İlk yarı beraberlik" pct={firstHalfDraw} />
              <PredictionRow name="İY 2" pick={match.away_team || "Deplasman"} pct={firstHalfAway} />
            </Panel>

            <Panel title="İlk Yarı 0.5 Üst / Alt">
              <PredictionRow name="İY 0.5 Üst" pick="İlk yarıda gol beklenir" pct={iyOver05} />
              <PredictionRow name="İY 0.5 Alt" pick="İlk yarı sakin geçebilir" pct={iyUnder05} />
            </Panel>
          </div>
        </Section>

        <Section title="Diğer Öneriler" desc="Alternatif market ve canlı oyun planı">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="HT/FT">
              <PredictionRow name="İY/MS" pick={homePct > awayPct ? "1/1" : awayPct > homePct ? "2/2" : "X/X"} pct={clamp(score - 8)} />
            </Panel>

            <Panel title="Toplam Gol 3.5">
              <PredictionRow name="3.5 Üst" pick="Bol gollü senaryo" pct={over35} />
              <PredictionRow name="3.5 Alt" pick="Daha güvenli gol sınırı" pct={clamp(100 - over35)} />
            </Panel>

            <Panel title="Kombo">
              <PredictionRow
                name="Önerilen Kombo"
                pick={`${match.main_pick || match.selection || "MS 1"} + ${over25 > 60 ? "1.5 Üst" : "Çifte Şans"}`}
                pct={clamp(score - 5)}
              />
            </Panel>

            <Panel title="Canlı Tercih">
              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm leading-6 text-yellow-100">
                İlk 15 dakikada tempo yüksekse <b>{over25 > 60 ? "gol marketleri" : "ana taraf marketi"}</b> daha değerli olur.
                Baskı düşükse maç önü tahmini yerine canlı izlemek daha mantıklı.
              </div>
            </Panel>
          </div>
        </Section>

        <Section title="Neden Bu Tahmin?" desc="AI analiz özeti">
          <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm leading-7 text-yellow-100">
            <b>AI Analiz:</b> {match.home_team || "Ev sahibi"} - {match.away_team || "deplasman"} maçında oran yapısı,
            güven skoru ve maç profili birlikte değerlendirildiğinde ana senaryo{" "}
            <b>{match.main_pick || match.selection || "-"}</b> tarafını öne çıkarıyor. Maç tipi{" "}
            <b>{match.match_type || "dengeli"}</b>, gol profili ise <b>{match.goal_profile || "orta tempo"}</b> görünüyor.
            Canlıda erken baskı, isabetli şut ve korner temposu gelirse tahmin güçlenir; ilk bölüm düşük tempolu geçerse risk artar.
          </div>
        </Section>

        <Section title="Benzer Oranlı Geçmiş 10 Maç" desc="Seçili orana yakın demo geçmiş maç tablosu">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827]">
            <div className="grid grid-cols-[1.5fr_90px_120px_100px] bg-[#0b111c] px-4 py-3 text-xs font-black uppercase text-slate-400">
              <div>Maç</div>
              <div>Oran</div>
              <div>Tahmin</div>
              <div>Skor</div>
            </div>

            {similarMatches.map((m, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.5fr_90px_120px_100px] border-t border-white/10 px-4 py-3 text-sm hover:bg-[#151f33]"
              >
                <div className="font-bold text-white">
                  {m.home} - {m.away}
                  <div className="text-xs font-normal text-slate-500">{m.result}</div>
                </div>
                <div className="font-black text-yellow-300">{m.odd}</div>
                <div className="font-bold text-slate-200">{m.pick}</div>
                <div className="text-slate-300">{m.score}</div>
              </div>
            ))}
          </div>
        </Section>

        <footer className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-xs leading-6 text-red-200">
          <b>⚠️ Yasal Uyarı:</b> Bu platform yalnızca istatistiksel analizler,
          geçmiş veri karşılaştırmaları ve yapay zekâ destekli tahminler sunar.
          Kesin kazanç garantisi verilmez. Bahis oynamak risk içerir ve bağımlılık oluşturabilir.
        </footer>
      </div>
    </main>
  );
}

function Section({ title, desc, children }: any) {
  return (
    <section className="mb-5 rounded-3xl border border-white/10 bg-[#0b111c] p-5 shadow-xl">
      <div className="mb-4">
        <h2 className="text-xl font-black text-white">{title}</h2>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
      {children}
    </section>
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

function Panel({ title, children }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-5 text-white shadow-xl">
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      {children}
    </div>
  );
}

function PredictionRow({ name, pick, pct }: any) {
  const score = safePercent(pct);
  const risky = score < 50;

  return (
    <div className="mb-4 grid gap-3 border-b border-white/10 pb-4 last:mb-0 last:border-b-0 last:pb-0 md:grid-cols-[0.9fr_1.3fr]">
      <div>
        <div className="font-black text-white">{name}</div>
        <div className="text-xs text-slate-500">{pick}</div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs font-bold">
          <span className={risky ? "text-red-300" : "text-yellow-300"}>%{score}</span>
          <span className="text-slate-500">AI güven</span>
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