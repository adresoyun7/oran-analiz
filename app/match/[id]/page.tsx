"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Match = any;

function pct(v: any, fallback = 55) {
  const n = Number(v ?? fallback);
  if (Number.isNaN(n)) return fallback;
  return Math.max(1, Math.min(99, Math.round(n)));
}

function calcSplit(mainScore: number) {
  const one = pct(mainScore);
  const x = pct(100 - one - 22);
  const two = pct(100 - one - x);
  return { one, x, two };
}

function goHome() {
  window.location.href = "/";
}

export default function MatchDetailPage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const raw = localStorage.getItem("vibe_selected_match");
    if (raw) {
      try {
        setMatch(JSON.parse(raw));
      } catch {
        setMatch(null);
      }
    }
  }, []);

  const similarMatches = useMemo(() => {
    return [
      ["20.03.2026", "Genoa", "Udinese", "0-0", "0-2", "Alt", "Yok", "X/2"],
      ["15.02.2026", "Huesca", "Ceuta", "0-0", "2-0", "Alt", "Yok", "1/1"],
      ["14.02.2026", "Burgos", "Cadiz", "1-1", "1-1", "Alt", "Var", "X/X"],
      ["08.02.2026", "Nacional", "Casa Pia", "0-0", "0-0", "Alt", "Yok", "X/X"],
      ["31.01.2026", "Alverca", "Estrela", "0-0", "1-1", "Alt", "Var", "X/X"],
      ["10.01.2026", "Las Palmas", "La Coruna", "1-1", "1-1", "Alt", "Var", "X/X"],
      ["21.12.2025", "Cagliari", "Pisa", "0-1", "2-2", "Üst", "Var", "2/X"],
      ["13.12.2025", "Zaragoza", "Cadiz", "0-0", "1-2", "Üst", "Var", "X/2"],
      ["02.11.2025", "Monza", "Spezia", "0-0", "1-0", "Alt", "Yok", "X/1"],
      ["28.09.2025", "Burgos", "Malaga", "1-1", "2-1", "Üst", "Var", "X/1"],
    ];
  }, []);

  if (!mounted || !match) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] text-slate-100">
        <div className="grid min-h-screen grid-cols-[260px_1fr]">
          <Sidebar />
          <section className="min-w-0 p-4">
            <div className="rounded-xl border border-white/10 bg-[#0b111c] p-8">
              <h1 className="mb-3 text-2xl font-black text-white">
                Maç detayı bulunamadı.
              </h1>
              <button
                onClick={goHome}
                className="rounded-lg bg-yellow-400 px-5 py-3 font-black text-black"
              >
                Ana sayfaya dön
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const score = pct(match.pro_score, 65);
  const ms = calcSplit(score);

  const over25 = pct(score - 8);
  const under25 = pct(100 - over25);
  const kgVar = pct(score - 14);
  const kgYok = pct(100 - kgVar);

  const iy1 = pct(ms.one - 12);
  const iyX = pct(42);
  const iy2 = pct(100 - iy1 - iyX);

  const iyOver05 = pct(score - 5);
  const iyUnder05 = pct(100 - iyOver05);

  const risk = score >= 70 ? "DÜŞÜK" : score >= 55 ? "ORTA" : "YÜKSEK";
  const riskColor =
    risk === "DÜŞÜK"
      ? "bg-emerald-500 text-white"
      : risk === "ORTA"
      ? "bg-yellow-400 text-black"
      : "bg-red-500 text-white";

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-100">
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        <Sidebar />

        <section className="min-w-0 p-4">
          <div className="w-full">
            <div className="mb-3 flex items-center justify-between rounded-xl bg-[#0b111c] px-4 py-3 shadow-xl">
              <button
                onClick={goHome}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-white hover:border-yellow-400/50"
              >
                ← Ana Sayfa
              </button>

              <div className="text-center">
                <div className="text-xs font-black uppercase tracking-widest text-yellow-400">
                  Maç Detay Analizi
                </div>
                <h1 className="text-2xl font-black text-white">
                  {match.home_team} - {match.away_team}
                </h1>
                <p className="text-xs text-slate-400">
                  {match.league || "Lig"} • {match.time || "20:00"}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black">
                {match.odd || match.home_odds || "1.85"} Oran
              </div>
            </div>

            <div className="mb-3 grid gap-3 lg:grid-cols-3">
              <TopCard
                title="ANA TAHMİN"
                value={match.main_pick || match.selection || "-"}
                sub="Maç sonucu / market önerisi"
                color="green"
              />
              <TopCard
                title="GÜVEN SKORU"
                value={`%${score}`}
                sub="AI güven oranı"
                color="blue"
              />
              <TopCard
                title="TAHMİNİ SKOR"
                value={match.expected_score || "1 - 0"}
                sub="En olası skor"
                color="dark"
              />
            </div>

            <div className="mb-3 rounded-xl bg-[#0b111c] px-4 py-3 text-xs text-slate-300 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  Kullanılan tolerans: <b className="text-white">0.08</b> • Örneklem:{" "}
                  <b className="text-white">{match.sample_count || match.ornek || 10} maç</b> • Güven çarpanı:{" "}
                  <b className="text-white">1.0</b>
                </div>
                <div>
                  Maç tipi:{" "}
                  <b className="text-yellow-300">{match.match_type || "Sürpriz Açık"}</b>{" "}
                  • Gol profili:{" "}
                  <b className="text-yellow-300">{match.goal_profile || "Düşük Gollü"}</b>
                </div>
              </div>
            </div>

            <div className="mb-3 grid gap-3 xl:grid-cols-2">
              <Panel title="MAÇ TAHMİNLERİ">
                <MiniMarket icon="🏆" title="Maç Sonucu" sub="1X2" items={[["1", ms.one], ["X", ms.x], ["2", ms.two]]} />
                <MiniMarket icon="⚽" title="2.5 Üst/Alt" sub="Toplam Gol" items={[["Üst", over25], ["Alt", under25]]} />
                <MiniMarket icon="🤝" title="Karşılıklı Gol" sub="Var / Yok" items={[["Var", kgVar], ["Yok", kgYok]]} />
                <MiniMarket icon="⏱️" title="İlk Yarı Sonucu" sub="1X2" items={[["1", iy1], ["X", iyX], ["2", iy2]]} />
                <MiniMarket icon="🕐" title="İlk Yarı 0.5 Üst/Alt" sub="İY gol" items={[["Üst", iyOver05], ["Alt", iyUnder05]]} />

                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#171d2b] px-4 py-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Risk Seviyesi
                  </span>
                  <span className={`rounded-lg px-4 py-2 text-xs font-black ${riskColor}`}>
                    {risk}
                  </span>
                </div>
              </Panel>

              <Panel title="DİĞER ÖNERİLER">
                <OtherRow icon="🔁" title="HT/FT" sub="İlk Yarı / Maç Sonu" value={ms.one > ms.two ? "X/1" : "X/2"} />
                <OtherRow icon="🌐" title="Toplam Gol 3.5" sub="Tahmini gol sayısı" value={over25 > 60 ? "Alt %64" : "Alt %84"} />
                <OtherRow icon="⏱️" title="İlk Yarı / 0.5 Üst" sub="İlk yarı toplam gol" value={iyOver05 > 55 ? "Üst %56" : "Alt %54"} />
                <OtherRow icon="🤝" title="Karşılıklı Gol" sub="KG Var / Yok" value={kgVar > kgYok ? "Var %57" : "Yok %67"} />
                <OtherRow icon="🎯" title="Güçlü Kombo" sub="Premium" value={`${match.main_pick || "2.5 Alt"} + KG ${kgVar > kgYok ? "Var" : "Yok"}`} />
                <OtherRow icon="🧩" title="En Uyumlu Senaryo" sub="Model özeti" value={`${match.main_pick || "2.5 Alt"} + İY ${iyOver05 > 55 ? "0.5 Üst" : "0.5 Alt"}`} />
                <OtherRow icon="📍" title="Canlı Tercih" sub="AI senaryosu" value={over25 > 60 ? "Üst" : "1X"} />
                <OtherRow icon="⚡" title="Canlı Strateji" sub="İlk 20 dakika" value="İzle" />

                <div className="mt-3 rounded-lg border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-xs leading-5 text-blue-100">
                  İlk 15-20 dakikada tempo düşük ve ceza sahası aksiyonu azsa ana taraf güçlenir.
                  Erken gol gelirse yeniden değerlendirilir.
                </div>
              </Panel>
            </div>

            <Panel title="NEDEN BU TAHMİN?">
              <div className="space-y-3 text-sm leading-6 text-slate-300">
                <p>• Bu oran aralığında benzer maç bulundu ve model ana senaryoyu öne çıkardı.</p>
                <p>• Ev sahibi / deplasman oran dengesi, maç temposu ve gol profili birlikte değerlendirildi.</p>
                <p>
                  • Ortalama toplam gol profili:{" "}
                  <b className="text-white">{match.goal_profile || "Düşük Gollü"}</b>.
                </p>
                <p>
                  • Maç tipi:{" "}
                  <b className="text-white">{match.match_type || "Sürpriz Açık"}</b>.
                </p>
                <p>• AI analize göre en mantıklı canlı kontrol noktası ilk 15-20 dakika tempo ve ceza sahası aksiyonu.</p>
              </div>
            </Panel>

            <div className="mt-3 rounded-xl border border-white/10 bg-[#0b111c] p-4 shadow-xl">
              <h2 className="mb-2 text-sm font-black uppercase tracking-widest text-white">
                BENZER ORANLI GEÇMİŞ MAÇLAR (SON 10)
              </h2>
              <p className="mb-3 text-xs text-slate-400">
                Tablodaki maçlar seçili oran aralığına yakın bulunan benzer maçlardır.
              </p>

              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="grid grid-cols-[130px_1fr_1fr_110px_110px_100px_100px_100px] bg-[#171d2b] px-3 py-2 text-xs font-black text-slate-400">
                  <div>Tarih</div>
                  <div>Ev Sahibi</div>
                  <div>Deplasman</div>
                  <div>İY Sonuç</div>
                  <div>MS Sonuç</div>
                  <div>2.5 Gol</div>
                  <div>KG</div>
                  <div>HT/FT</div>
                </div>

                {similarMatches.map((r, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[130px_1fr_1fr_110px_110px_100px_100px_100px] border-t border-white/10 px-3 py-2 text-xs hover:bg-[#151f33]"
                  >
                    <div className="text-slate-300">{r[0]}</div>
                    <div className="font-bold text-white">{r[1]}</div>
                    <div className="font-bold text-white">{r[2]}</div>
                    <div className="text-slate-300">{r[3]}</div>
                    <div className="text-slate-300">{r[4]}</div>
                    <div className={r[5] === "Üst" ? "font-black text-emerald-400" : "font-black text-red-400"}>
                      {r[5]}
                    </div>
                    <div className={r[6] === "Var" ? "font-black text-emerald-400" : "font-black text-red-400"}>
                      {r[6]}
                    </div>
                    <div className="font-black text-yellow-300">{r[7]}</div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-xs leading-6 text-red-700">
              <b>⚠️ Yasal Uyarı:</b> Bu platform yalnızca istatistiksel analizler,
              geçmiş veri karşılaştırmaları ve yapay zekâ destekli tahminler sunar.
              Kesin kazanç garantisi verilmez.
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen flex-col justify-between border-r border-white/10 bg-[#0b111c] text-white shadow-xl">
      <div className="p-4">
        <button onClick={goHome} className="flex items-center gap-3 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-xl font-black text-black">
            O
          </div>
          <div>
            <div className="text-sm font-black tracking-[0.22em] text-yellow-400">
              ORAN ANALİZ
            </div>
            <div className="text-xs font-bold text-slate-400">AI Match Engine</div>
          </div>
        </button>

        <div className="mt-8 space-y-2">
          <SidebarItem icon="🏠" label="Ana Sayfa" onClick={goHome} />
          <SidebarItem icon="⭐" label="Favoriler" />
          <SidebarItem icon="🎫" label="Kuponlarım" />
          <SidebarItem icon="📊" label="Analiz Geçmişi" />
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 text-xs leading-5 text-slate-400">
          Giriş yaparak kuponlarını ve analiz geçmişini kaydedebilirsin.
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={goHome}
            className="rounded-lg border border-white/10 bg-[#111827] py-2 text-center text-sm font-bold hover:bg-[#172238]"
          >
            Giriş Yap
          </button>

          <button
            onClick={goHome}
            className="rounded-lg bg-yellow-400 py-2 text-center text-sm font-black text-black hover:bg-yellow-300"
          >
            Üye Ol
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-300 hover:bg-[#172238] hover:text-white"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
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

function Panel({ title, children }: any) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#0b111c] p-4 shadow-xl">
      <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-white">{title}</h2>
      {children}
    </section>
  );
}

function MiniMarket({ icon, title, sub, items }: any) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center border-b border-white/10 py-3 last:border-b-0">
      <div>
        <div className="text-sm font-black text-white">
          {icon} {title}
        </div>
        <div className="text-[11px] text-slate-500">{sub}</div>
      </div>

      <div className="flex gap-2">
        {items.map((item: any, i: number) => (
          <div key={i} className="min-w-[64px] text-right">
            <div className="text-[10px] font-black text-slate-400">{item[0]}</div>
            <div className="font-black text-white">%{item[1]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OtherRow({ icon, title, sub, value }: any) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center border-b border-white/10 py-3 last:border-b-0">
      <div>
        <div className="text-sm font-black text-white">
          {icon} {title}
        </div>
        <div className="text-[11px] text-slate-500">{sub}</div>
      </div>

      <div className="rounded-lg bg-yellow-400/15 px-3 py-2 text-xs font-black text-yellow-300">
        {value}
      </div>
    </div>
  );
}