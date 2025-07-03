import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getKayitliOyunlar, kayitliOyunSil, kayitliOyunuYukle, kayitliOyunKazananKontrol, KayitliOyun } from "@/utils/storage";

const games = [
  { name: "101", slug: "cezali-101" },
  { name: "Normal Okey", slug: "okey" },
  { name: "Pişti", slug: "pisti" },
  { name: "Batak", slug: "batak" },
];

export default function Home() {
  const router = useRouter();
  const [kayitliOyunlar, setKayitliOyunlar] = useState<KayitliOyun[]>([]);

  useEffect(() => {
    setKayitliOyunlar(getKayitliOyunlar());
  }, []);

  const oyunSil = (id: string) => {
    kayitliOyunSil(id);
    setKayitliOyunlar(getKayitliOyunlar());
  };

  const kayitliOyunuAc = (id: string) => {
    const sonuc = kayitliOyunuYukle(id);
    if (sonuc) {
      // Oyun adına göre doğru sayfaya yönlendir
      let slug = "";
      switch (sonuc.oyunAdi.toLowerCase()) {
        case "cezalı 101":
        case "101":
          slug = "cezali-101";
          break;
        case "pişti":
          slug = "pisti";
          break;
        case "normal okey":
        case "okey":
          slug = "okey";
          break;
        case "batak":
          slug = "batak";
          break;
        default:
          slug = sonuc.oyunAdi.toLowerCase().replace(/\s+/g, '-');
      }

      router.push(`/oyun/${slug}/skor`);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5E9DA] p-4 flex flex-col items-center justify-center space-y-6">
      {/* Kıraathane başlığı */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-bold text-[#D4AF37] drop-shadow-lg">
          Yazboz Kıraathanesi
        </h1>
        <p className="text-[#8B2F2F] text-lg italic">
          &ldquo;Gel de bir el atalım...&rdquo;
        </p>
      </div>

      {/* Oyun masaları */}
      <div className="w-full max-w-md space-y-4">
        <div className="bg-[#7B4B28] rounded-lg p-6 shadow-2xl border-2 border-[#D4AF37]">
          <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
            🃏 Oyun Masaları 🃏
          </h2>
          <div className="space-y-3">
            {games.map((game) => (
              <Link
                key={game.slug}
                href={`/oyun/${game.slug}`}
                className="block font-bold bg-[#3B5D3A] text-white text-center py-4 px-6 rounded-lg shadow-lg hover:bg-[#25401F] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] text-xl"
              >
                <span className="text-lg">{game.name}</span>
                <div className="text-xs text-[#D4AF37] mt-1 opacity-75">
                  Masaya otur →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Kayıtlı Oyunlar */}
      {kayitliOyunlar.length > 0 && (
        <div className="w-full max-w-4xl space-y-4">
          <div className="bg-[#7B4B28] rounded-lg p-6 shadow-2xl border-2 border-[#D4AF37]">
            <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
              📚 Kayıtlı Oyunlar 📚
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {kayitliOyunlar.map((oyun) => (
                <div key={oyun.id} className="bg-[#F3E9DD] rounded-lg p-4 border border-[#D4AF37] hover:bg-[#EAD7C1] transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => kayitliOyunuAc(oyun.id)}
                    >
                      <h3 className="font-bold text-[#3E2723] text-lg hover:text-[#D4AF37] transition-colors">{oyun.oyunAdi}</h3>
                      <p className="text-[#8B2F2F] text-sm">
                        {oyun.kayitTarihi} - {oyun.kayitSaati}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        oyunSil(oyun.id);
                      }}
                      className="bg-[#8B2F2F] text-white px-3 py-1 rounded text-sm hover:bg-[#5C1A1B] transition-colors ml-2"
                    >
                      🗑️
                    </button>
                  </div>
                  <div
                    className="text-[#3E2723] text-sm cursor-pointer"
                    onClick={() => kayitliOyunuAc(oyun.id)}
                  >
                    <p><strong>Oyuncular:</strong> {oyun.oyuncular.join(", ")}</p>
                    <p><strong>Toplam Tur:</strong> {oyun.skorlar[0]?.length || 0}</p>

                    {/* Kazanan Kontrolü */}
                    {(() => {
                      const kazananKontrol = kayitliOyunKazananKontrol(oyun);
                      if (kazananKontrol.oyunBitti && kazananKontrol.kazanan) {
                        return (
                          <div className="mt-2 p-2 bg-[#D4AF37] rounded-lg">
                            <p className="text-[#3E2723] font-bold text-center">
                              🏆 {kazananKontrol.kazanan} 🏆
                            </p>
                            <p className="text-[#8B2F2F] text-xs text-center mt-1">
                              Oyun Tamamlandı
                            </p>
                          </div>
                        );
                      } else {
                        // Oyun devam ediyor, ilerleme göster
                        const toplamSkorlar = oyun.skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
                        const enYuksekSkor = Math.max(...toplamSkorlar);

                        if (oyun.oyunAdi === "Pişti" && enYuksekSkor > 0) {
                          const hedefSkor = oyun.hedefSkor || 151;
                          const yuzde = Math.min((enYuksekSkor / hedefSkor) * 100, 100);
                          return (
                            <div className="mt-2">
                              <div className="bg-[#EAD7C1] rounded-full h-2 mb-1">
                                <div
                                  className="bg-[#D4AF37] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${yuzde}%` }}
                                ></div>
                              </div>
                              <p className="text-[#8B2F2F] text-xs text-center">
                                En Yüksek: {enYuksekSkor}/{hedefSkor} ({yuzde.toFixed(0)}%)
                              </p>
                            </div>
                          );
                        } else if (oyun.oyunAdi === "Normal Okey") {
                          const turSayisi = oyun.skorlar[0]?.length || 0;
                          const yuzde = Math.min((turSayisi / 20) * 100, 100);
                          return (
                            <div className="mt-2">
                              <div className="bg-[#EAD7C1] rounded-full h-2 mb-1">
                                <div
                                  className="bg-[#D4AF37] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${yuzde}%` }}
                                ></div>
                              </div>
                              <p className="text-[#8B2F2F] text-xs text-center">
                                Tur: {turSayisi}/20 ({yuzde.toFixed(0)}%)
                              </p>
                            </div>
                          );
                        } else if (oyun.oyunAdi === "Batak") {
                          const turSayisi = oyun.skorlar[0]?.length || 0;
                          const yuzde = Math.min((turSayisi / 13) * 100, 100);
                          return (
                            <div className="mt-2">
                              <div className="bg-[#EAD7C1] rounded-full h-2 mb-1">
                                <div
                                  className="bg-[#D4AF37] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${yuzde}%` }}
                                ></div>
                              </div>
                              <p className="text-[#8B2F2F] text-xs text-center">
                                Tur: {turSayisi}/13 ({yuzde.toFixed(0)}%)
                              </p>
                            </div>
                          );
                        } else if (oyun.oyunAdi === "Cezalı 101" && oyun.cezalar) {
                          const turSayisi = oyun.skorlar[0]?.length || 0;
                          const hedefElSayisi = oyun.elSayisi || 9;
                          const yuzde = Math.min((turSayisi / hedefElSayisi) * 100, 100);
                          return (
                            <div className="mt-2">
                              <div className="bg-[#EAD7C1] rounded-full h-2 mb-1">
                                <div
                                  className="bg-[#8B2F2F] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${yuzde}%` }}
                                ></div>
                              </div>
                              <p className="text-[#8B2F2F] text-xs text-center">
                                El: {turSayisi}/{hedefElSayisi} ({yuzde.toFixed(0)}%)
                              </p>
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}

                    <p className="text-[#D4AF37] text-xs mt-1 italic">👆 Devam etmek için tıklayın</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kıraathane detayları */}
      <div className="text-center text-[#3E2723] text-sm opacity-75 mt-8">
        <p>☕ Çay servisi mevcuttur</p>
        <p>🎯 Dostluk ve eğlence garantili</p>
      </div>
    </main>
  );
}
