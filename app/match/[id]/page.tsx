"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Match = any;

export default function MatchDetailPage() {
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("vibe_selected_match");
    if (raw) setMatch(JSON.parse(raw));
  }, []);

  if (!match) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] p-6">
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 text-xl font-black">Maç detayı bulunamadı.</div>
          <Link href="/" className="rounded-lg bg-[#0b111c] px-4 py-2 text-white">
            Ana sayfaya dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] p-6 text-slate-900">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#1b2638] bg-[#0b111c] p-4 text-white shadow">
          <Link href="/" className="rounded-lg border border-[#2c3a52] px-4 py-2 text-sm">
            ← Ana Sayfa
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-black">
              {match.home_team} - {match.away_team}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Süper Lig • 29 Mayıs 2025 • 20:00
            </p>
          </div>

          <button className="rounded-lg border border-[#2c3a52] px-4 py-2 text-sm">
            ☆ Takibe Al
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-4">
          <InfoCard title="ANA TAHMİN" value={match.selection} sub={match.market} green />
          <InfoCard title="GÜVEN SKORU" value={`${match.pro_score}%`} sub={match.risk} blue />
          <InfoCard title="TAHMİNİ SKOR" value={match.expected_score} sub="En olası skor" purple />
        </div>

        <div className="mb-4 rounded-xl border border-[#1b2638] bg-[#111827] p-4 text-white shadow">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div>
              Kullanılan tolerans: <b>0.08</b> • Örnekler: <b>10-80</b>
            </div>
            <div>
              Örnek: <b>48</b> • Dinamik min maç: <b>5</b>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-600 px-3 py-1 font-black">Çok Sağlam</span>
            <span>Enerji filtresi ve canlı tempo kontrolü önerilir.</span>
            <span>Maç tipi: {match.match_type || "Favori"}</span>
            <span>Gol profili: {match.goal_profile || "Dengeli"}</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="MAÇ TAHMİNLERİ">
            <PredictionRow name="🏆 Maç Sonucu" left={match.main_pick} leftPct={match.confidence || 60} />
            <PredictionRow name="⚽ 2.5 Üst / Alt" left={match.market === "ALTUST" ? match.selection : "Üst"} leftPct={match.market === "ALTUST" ? match.pro_score : 58} />
            <PredictionRow name="🤝 Karşılıklı Gol" left={match.market === "KG" ? match.selection : "Var"} leftPct={match.market === "KG" ? match.pro_score : 55} />
            <PredictionRow name="🕘 İlk Yarı Sonucu" left="1" leftPct={48} />
            <PredictionRow name="⏱️ İlk Yarı 0.5 Üst/Alt" left="Üst" leftPct={72} />

            <div className="mt-4 flex items-center justify-between rounded-lg bg-[#1a1d26] p-3">
              <span className="text-sm font-black">RİSK SEVİYESİ</span>
              <span className="rounded-lg bg-emerald-600 px-5 py-2 font-black">{match.risk}</span>
            </div>
          </Panel>

          <Panel title="DİĞER ÖNERİLER">
            {match.alternatives?.slice(0, 7).map((a: any, i: number) => (
              <div key={i} className="mb-3 flex items-center justify-between border-b border-[#1b2638] pb-3">
                <div>
                  <div className="font-bold">{a.market}</div>
                  <div className="text-xs text-slate-400">{a.selection}</div>
                </div>
                <div className="rounded-md bg-emerald-700 px-3 py-1 font-black">
                  %{Math.max(38, match.pro_score - i * 7)}
                </div>
              </div>
            ))}

            <div className="mt-3 rounded-lg border border-[#263247] bg-[#0b1628] p-3 text-xs text-slate-300">
              İlk 10-15 dakikada baskı, şut ve korner üstünlüğü hangi tarafa kayarsa sadece o yönde canlı giriş düşün.
            </div>

            <div className="mt-4 rounded-lg bg-[#1a1d26] p-3">
              <div className="mb-1 text-xs text-slate-400">Oranlar</div>
              <div className="grid grid-cols-3 text-center text-sm">
                <div>1<br /><b>{match.odd || "-"}</b></div>
                <div>X<br /><b>-</b></div>
                <div>2<br /><b>-</b></div>
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="NEDEN BU TAHMİN?" full>
          <ul className="space-y-3 text-sm text-slate-200">
            <li>• AI skor: <b>{match.pro_score}</b> ve risk: <b>{match.risk}</b>.</li>
            <li>• Tahmini skor: <b>{match.expected_score}</b>.</li>
            <li>• Maç tipi: <b>{match.match_type || "Favori"}</b>, gol profili: <b>{match.goal_profile || "Dengeli"}</b>.</li>
            <li>• {match.ai_comment}</li>
          </ul>
        </Panel>

        <div className="mt-4 rounded-xl border border-[#1b2638] bg-[#111827] p-4 text-white shadow">
          <h3 className="mb-4 font-black">BENZER ORANLI GEÇMİŞ MAÇLAR (SON 10)</h3>
          <div className="overflow-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-2">Tarih</th>
                  <th>Lig</th>
                  <th>Ev Sahibi</th>
                  <th>Deplasman</th>
                  <th>İY Sonuç</th>
                  <th>MS Sonuç</th>
                  <th>2.5 Gol</th>
                  <th>KG</th>
                  <th>HT/FT</th>
                  <th>Skor</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((x) => (
                  <tr key={x} className="border-t border-[#1b2638]">
                    <td className="py-2">18/05/2024</td>
                    <td>Süper Lig</td>
                    <td>{match.home_team}</td>
                    <td>Rakip {x}</td>
                    <td>1-0</td>
                    <td>{match.main_pick}</td>
                    <td className={x % 2 ? "text-emerald-400" : "text-red-400"}>{x % 2 ? "Üst" : "Alt"}</td>
                    <td className={x % 2 ? "text-emerald-400" : "text-red-400"}>{x % 2 ? "Var" : "Yok"}</td>
                    <td className="text-yellow-400">1/1</td>
                    <td>{match.expected_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-8 rounded-xl border border-orange-300 bg-orange-50 p-4 text-xs leading-6 text-orange-900">
          <b>⚠️ Yasal Uyarı:</b> Bu platform yalnızca istatistiksel analizler,
          geçmiş veri karşılaştırmaları ve yapay zekâ destekli tahminler sunar.
          Kesin kazanç garantisi verilmez. Bahis oynamak risk içerir ve bağımlılık oluşturabilir.
        </footer>
      </div>
    </main>
  );
}

function InfoCard({ title, value, sub, green, blue, purple }: any) {
  return (
    <div className={`rounded-xl border p-5 text-center text-white shadow ${
      green ? "border-emerald-700 bg-[#0b3b22]" : blue ? "border-blue-700 bg-[#112f5d]" : purple ? "border-purple-700 bg-[#1d1c3d]" : "border-[#1b2638] bg-[#111827]"
    }`}>
      <div className="text-xs font-black tracking-widest text-slate-300">{title}</div>
      <div className="mt-2 text-4xl font-black">{value}</div>
      <div className="mt-1 text-sm text-slate-300">{sub}</div>
    </div>
  );
}

function Panel({ title, children, full }: any) {
  return (
    <div className={`${full ? "mt-4" : ""} rounded-xl border border-[#1b2638] bg-[#111827] p-4 text-white shadow`}>
      <h3 className="mb-4 font-black">{title}</h3>
      {children}
    </div>
  );
}

function PredictionRow({ name, left, leftPct }: any) {
  const rightPct = Math.max(0, 100 - Number(leftPct || 0));

  return (
    <div className="mb-4 grid grid-cols-[1fr_1fr] items-center gap-4 border-b border-[#1b2638] pb-3">
      <div>
        <div className="font-bold">{name}</div>
        <div className="text-xs text-slate-400">AI market analizi</div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span>{left}</span>
          <span>%{leftPct}</span>
        </div>
        <div className="h-2 rounded bg-[#263247]">
          <div className="h-2 rounded bg-emerald-500" style={{ width: `${Math.min(Number(leftPct || 0), 100)}%` }} />
        </div>
        <div className="mt-2 text-right text-xs text-slate-500">Karşı ihtimal %{rightPct}</div>
      </div>
    </div>
  );
}
