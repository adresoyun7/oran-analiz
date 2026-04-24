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

  const matches: Match[] = scanner?.top_matches || [];

  useEffect(() => {
    if (matches.length && !selected) setSelected(matches[0]);
  }, [matches, selected]);

  async function loadScanner() {
    setLoading(true);
    setError("");

    try {
      const data = await getDailyScanner();
      setScanner(data);
      setSelected(data?.top_matches?.[0] || null);
      localStorage.setItem("vibe_scanner", JSON.stringify(data));
    } catch {
      setError("AI tarama yüklenemedi. Backend açık mı kontrol et.");
    } finally {
      setLoading(false);
    }
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

  function register() {
    if (!acceptedTerms) {
      setError("Üye olmak için kullanım şartlarını ve yasal uyarıları kabul etmelisin.");
      return;
    }
    setUserEmail("demo@vibepro.com");
    setError("");
  }

  const couponOdd = useMemo(() => {
    return coupon.reduce((acc, m) => acc * Number(m.odd || 1), 1).toFixed(2);
  }, [coupon]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className={`grid min-h-screen transition-all ${sidebarOpen ? "grid-cols-[270px_1fr]" : "grid-cols-[78px_1fr]"}`}>
        <aside className="sticky top-0 h-screen overflow-y-auto border-r border-[#d7deea] bg-[#0b111c] p-4 text-white">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-5 w-full rounded-xl border border-[#263247] bg-[#111827] px-3 py-2 text-sm font-black text-slate-200 hover:bg-[#182235]"
          >
            {sidebarOpen ? "← Kapat" : "☰"}
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="text-3xl font-black text-emerald-400">V</div>
            {sidebarOpen && (
              <div className="text-xl font-black leading-5">
                VIBE PRO
                <br />
                <span className="text-emerald-400">EXPERT</span>
                <span className="ml-1 text-xs text-slate-500">v6.3</span>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <>
              <div className="mb-4 rounded-xl border border-[#263247] bg-[#111827] p-3">
                <div className="mb-3 flex gap-2">
                  <button
                    onClick={() => setAuthMode("login")}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-black ${authMode === "login" ? "bg-emerald-600" : "bg-[#0b111c]"}`}
                  >
                    Giriş
                  </button>
                  <button
                    onClick={() => setAuthMode("register")}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-black ${authMode === "register" ? "bg-emerald-600" : "bg-[#0b111c]"}`}
                  >
                    Üye Ol
                  </button>
                </div>

                <input
                  placeholder="Email"
                  className="mb-2 w-full rounded-lg border border-[#263247] bg-[#0b111c] px-3 py-2 text-sm outline-none"
                />
                <input
                  placeholder="Şifre"
                  type="password"
                  className="mb-3 w-full rounded-lg border border-[#263247] bg-[#0b111c] px-3 py-2 text-sm outline-none"
                />

                {authMode === "register" && (
                  <>
                    <label className="mb-3 flex gap-2 text-xs leading-5 text-slate-300">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 accent-emerald-500"
                      />
                      <span>
                        Kullanım şartlarını, sorumluluk reddini ve bahis risk uyarısını okudum, kabul ediyorum.
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
                  onClick={authMode === "register" ? register : () => setUserEmail("demo@vibepro.com")}
                  className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-black"
                >
                  {authMode === "register" ? "Üyeliği Oluştur" : "Giriş Yap"}
                </button>

                {userEmail && (
                  <div className="mt-3 rounded-lg bg-emerald-950 p-2 text-xs text-emerald-200">
                    Aktif kullanıcı: {userEmail}
                  </div>
                )}
              </div>

              <div className="mb-5 text-xs font-black uppercase tracking-wider text-slate-400">
                Kontrol Merkezi
              </div>

              <label className="mb-2 block text-xs text-slate-400">The Odds API Key</label>
              <div className="mb-5 rounded-lg border border-[#263247] bg-[#111827] px-3 py-2 text-sm text-slate-500">
                ***************
              </div>

              <label className="mb-2 block text-xs text-slate-400">Analiz Tarihi</label>
              <div className="mb-5 rounded-lg border border-[#263247] bg-[#111827] px-3 py-2 text-sm">
                29/05/2025
              </div>

              <div className="mb-3 text-xs font-bold text-slate-400">Sezonlar</div>
              {["2324", "2425", "2526"].map((s) => (
                <label key={s} className="mb-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="accent-emerald-500" />
                  {s}
                </label>
              ))}

              <div className="mt-5 mb-2 text-xs font-bold text-slate-400">Oran Hassasiyeti</div>
              <input type="range" defaultValue={8} className="w-full accent-emerald-500" />
              <div className="mb-5 text-right text-xs text-slate-500">8%</div>

              <div className="mb-3 text-xs font-bold text-slate-400">Ligler</div>
              {["🏆 Avrupa Kupaları", "🇹🇷 Türkiye", "🌍 Avrupa Majör", "⚙️ Avrupa Diğer"].map((x) => (
                <div key={x} className="mb-2 rounded-lg border border-[#263247] bg-[#111827] px-3 py-2 text-sm">
                  {x}
                </div>
              ))}

              <button
                onClick={loadScanner}
                className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 font-black text-white hover:bg-emerald-500"
              >
                {loading ? "Analiz Ediliyor..." : "🚀 Analizi Başlat"}
              </button>

              <div className="mt-5 rounded-lg border border-[#263247] bg-[#111827] p-3 text-xs text-slate-400">
                Son analiz: şimdi
                <br />
                Toplam maç: {scanner?.total_matches || 0}
              </div>
            </>
          )}
        </aside>

        <section className="p-5">
          <div className="mb-5 rounded-2xl border border-[#d7deea] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-black text-[#0b1f3a]">ANA MAÇ EKRANI</h1>
                <p className="text-sm text-slate-500">29 Mayıs 2025 Perşembe</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#f8fafc] px-5 py-3 text-center shadow-sm">
                <div className="text-2xl font-black text-emerald-600">
                  {scanner?.total_matches || 0}
                </div>
                <div className="text-[10px] font-bold text-slate-500">MAÇ BULUNDU</div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-4 flex gap-8 text-sm font-bold text-slate-600">
              <span className="border-b-2 border-emerald-500 pb-2 text-emerald-600">Tümü</span>
              <span>🔥 Yüksek Güven</span>
              <span>🟡 Orta Güven</span>
              <span>⭐ Sürpriz Maçlar</span>
            </div>

            <div className="grid gap-2">
              {matches.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-8 text-center text-slate-500">
                  Başlamak için soldaki “Analizi Başlat” butonuna bas.
                </div>
              )}

              {matches.map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[90px_1.25fr_150px_150px_180px_130px] items-center rounded-xl border border-[#1b2638] bg-[#111827] p-3 text-white shadow-sm"
                >
                  <div className="text-center">
                    <div className="text-slate-500">☆</div>
                    <div className="text-lg font-black">20:00</div>
                    <div className="text-[10px] text-slate-400">Süper Lig</div>
                    <div className="mt-1 text-xs">🇹🇷</div>
                  </div>

                  <div>
                    <div className="text-lg font-black">{m.home_team}</div>
                    <div className="text-slate-300">{m.away_team}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-400">ANA TAHMİN</div>
                    <div className="mx-auto mt-1 w-fit rounded-md bg-emerald-600 px-4 py-1 font-black">
                      {m.main_pick}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">GÜVEN</div>
                    <div className="font-black">{m.pro_score}%</div>
                    <div className="mx-auto mt-1 h-2 w-20 rounded bg-[#243047]">
                      <div className="h-2 rounded bg-emerald-500" style={{ width: `${Math.min(m.pro_score, 100)}%` }} />
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-400">ALTERNATİF</div>
                    <div className="mt-1 rounded-md bg-emerald-700 px-3 py-1 font-black">{m.selection}</div>
                    <div className="mt-2 text-[10px] text-slate-400">MARKET</div>
                    <div className="mx-auto w-fit rounded-md bg-yellow-600 px-3 py-1 text-sm font-black">{m.market}</div>
                  </div>

                  <div className="text-center">
                    <div className="mb-2 text-[10px] font-bold text-slate-400">ORANLAR</div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>1<br /><b>{m.odd || "-"}</b></div>
                      <div>X<br /><b>-</b></div>
                      <div>2<br /><b>-</b></div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Link
                      href={`/match/${i}`}
                      onClick={() => openDetail(m, i)}
                      className="rounded-lg border border-[#2c3a52] px-3 py-2 text-center text-sm font-bold hover:bg-[#172238]"
                    >
                      Detay →
                    </Link>
                    <button
                      onClick={() => addCoupon(m)}
                      className="rounded-lg border border-[#2c3a52] px-3 py-2 text-sm font-bold hover:bg-[#172238]"
                    >
                      + Kupona Ekle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <footer className="mt-8 rounded-xl border border-orange-300 bg-orange-50 p-4 text-xs leading-6 text-orange-900">
            <b>⚠️ Yasal Uyarı:</b> Bu platform yalnızca istatistiksel analizler,
            geçmiş veri karşılaştırmaları ve yapay zekâ destekli tahminler sunar.
            Kesin kazanç garantisi verilmez. Bahis oynamak risk içerir ve bağımlılık oluşturabilir.
          </footer>
        </section>
      </div>

      {coupon.length > 0 && (
        <div className="fixed bottom-5 right-5 w-80 rounded-2xl border border-[#284977] bg-[#07111f] p-4 text-white shadow-2xl">
          <div className="mb-2 text-lg font-black">Kuponum</div>
          {coupon.map((m, i) => (
            <div key={i} className="mb-2 rounded-lg bg-[#0b1628] p-2 text-sm">
              {m.home_team} - {m.away_team}
              <div className="text-yellow-400">{m.selection} • {m.odd}</div>
            </div>
          ))}
          <div className="mt-3 font-black">Toplam Oran: {couponOdd}</div>
        </div>
      )}

      {termsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#284977] bg-[#0b111c] p-6 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Kullanım Şartları ve Yasal Uyarılar</h2>
              <button
                onClick={() => setTermsOpen(false)}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-black"
              >
                Kapat
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{LEGAL_TEXT}</pre>
          </div>
        </div>
      )}
    </main>
  );
}
