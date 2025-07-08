import { useState } from "react";
import { useRouter } from "next/router";
import { kayitliOyunKaydet } from "@/utils/storage";
import { isimDuzenle, oyunuSifirla } from "@/utils/gameHelpers";
import { useOyunYonetimi } from "@/hooks/useOyunYonetimi";
import Link from "next/link";
import DuzenlemeModu from "@/components/DuzenlemeModu";
import SkorTablosu from "@/components/SkorTablosu";
import YeniSkorGirisi from "@/components/YeniSkorGirisi";
import MesrubatTakip from "@/components/MesrubatTakip";
import KontrolButonlari from "@/components/KontrolButonlari";

export default function PistiSkor() {
    const router = useRouter();

    const {
        oyunVerisi,
        setOyunVerisi,
        yeniSkorlar,
        setYeniSkorlar,
        storageKey,
        duzenlemeModu,
        duzenlenecekOyuncu,
        duzenlenecekTur,
        duzenlemeDegeri,
        setDuzenlemeDegeri,
        duzenlemeModunuKapat,
        skorDuzenlemeBaslat,
        isimDuzenlemeBaslat,
    } = useOyunYonetimi("pisti");

    const [hedefSkor, setHedefSkor] = useState<number>(151);

    // Pişti için özel skor ekleme - hedef skoru da kaydet
    const handleSkorEkle = () => {
        if (!oyunVerisi) return;

        const bosSkorlar = yeniSkorlar.filter(skor => skor.trim() === "");
        if (bosSkorlar.length > 0) {
            alert("⚠️ Lütfen tüm oyuncuların skorlarını girin!");
            return;
        }

        const sayilar = yeniSkorlar.map((s) => parseInt(s) || 0);
        const guncellenmisSkorlar = oyunVerisi.skorlar.map((skorlar, i) => [
            ...skorlar,
            sayilar[i],
        ]);

        const guncelVeri = {
            ...oyunVerisi,
            skorlar: guncellenmisSkorlar,
            hedefSkor: hedefSkor,
        };

        localStorage.setItem(storageKey, JSON.stringify(guncelVeri));
        setOyunVerisi(guncelVeri);
        setYeniSkorlar(Array(guncelVeri.oyuncular.length).fill(""));
    };

    // Düzenleme kaydetme fonksiyonları
    const handleSkorDuzenle = () => {
        if (!oyunVerisi || duzenlenecekOyuncu === -1 || duzenlenecekTur === -1 || !duzenlemeDegeri) return;

        const yeniDeger = parseInt(duzenlemeDegeri);
        if (isNaN(yeniDeger)) return;

        const guncellenmisSkorlar = [...oyunVerisi.skorlar];
        guncellenmisSkorlar[duzenlenecekOyuncu] = [...guncellenmisSkorlar[duzenlenecekOyuncu]];
        guncellenmisSkorlar[duzenlenecekOyuncu][duzenlenecekTur] = yeniDeger;

        const guncelVeri = {
            ...oyunVerisi,
            skorlar: guncellenmisSkorlar,
            hedefSkor: hedefSkor,
        };

        localStorage.setItem(storageKey, JSON.stringify(guncelVeri));
        setOyunVerisi(guncelVeri);
        duzenlemeModunuKapat();
    };

    const handleIsimDuzenle = () => {
        if (!oyunVerisi) return;
        isimDuzenle(oyunVerisi, storageKey, setOyunVerisi, duzenlenecekOyuncu, duzenlemeDegeri, duzenlemeModunuKapat);
    };

    const handleOyunuSifirla = () => {
        if (!oyunVerisi) return;
        oyunuSifirla(oyunVerisi, storageKey, setOyunVerisi, "pisti", hedefSkor);
    };

    const handleYeniOyunaBasla = () => {
        localStorage.removeItem(storageKey);
        router.push("/");
    };

    const handleOyunuKaydet = () => {
        if (!oyunVerisi) return;

        try {
            const kayitVerisi = {
                ...oyunVerisi,
                hedefSkor: hedefSkor,
            };
            kayitliOyunKaydet(kayitVerisi, "Pişti");
            alert("Oyun başarıyla kaydedildi! 📚");
        } catch (error) {
            console.error("Oyun kaydetme hatası:", error);
            alert("Oyun kaydedilirken bir hata oluştu!");
        }
    };

    // Kazanan kontrolü
    const kazananKontrol = () => {
        if (!oyunVerisi) return null;

        const toplamSkorlar = oyunVerisi.skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
        const kazananIndex = toplamSkorlar.findIndex(skor => skor >= hedefSkor);

        if (kazananIndex !== -1) {
            return {
                oyunBitti: true,
                kazanan: oyunVerisi.oyuncular[kazananIndex],
                kazananIndex,
                kazananSkor: toplamSkorlar[kazananIndex]
            };
        }

        return { oyunBitti: false };
    };

    const kazanan = kazananKontrol();

    if (!oyunVerisi) return null;

    return (
        <div className="min-h-screen bg-[#F5E9DA] p-4">
            {/* Kıraathane başlığı */}
            <div className="text-center space-y-2 mb-6">
                <Link href="/" className="text-3xl font-serif font-bold text-[#D4AF37] drop-shadow-lg">
                    🃏 PİŞTİ Skor Tablosu 🃏
                </Link>
                <p className="text-[#8B2F2F] text-lg italic">
                    &ldquo;Pişti! Pişti! Pişti!&rdquo;
                </p>
            </div>

            {/* Düzenleme Modu */}
            <DuzenlemeModu
                duzenlemeModu={duzenlemeModu}
                duzenlenecekOyuncu={duzenlenecekOyuncu}
                duzenlenecekTur={duzenlenecekTur}
                duzenlenecekCezaIndex={-1}
                duzenlemeDegeri={duzenlemeDegeri}
                setDuzenlemeDegeri={setDuzenlemeDegeri}
                onKaydet={duzenlemeModu === "skor" ? handleSkorDuzenle : handleIsimDuzenle}
                onIptal={duzenlemeModunuKapat}
                oyuncuIsimleri={oyunVerisi.oyuncular}
            />

            {/* Kazanan Bildirimi */}
            {kazanan?.oyunBitti && (
                <div className="max-w-4xl mx-auto mb-6">
                    <div className="bg-[#D4AF37] rounded-lg p-6 shadow-2xl border-2 border-[#3E2723] text-center">
                        <h2 className="text-2xl font-serif font-bold text-[#3E2723] mb-2">
                            🏆 OYUN BİTTİ! 🏆
                        </h2>
                        <p className="text-xl text-[#8B2F2F] font-semibold">
                            Kazanan: <span className="text-[#3E2723] font-bold">{kazanan.kazanan}</span>
                        </p>
                        <p className="text-lg text-[#8B2F2F]">
                            Toplam Skor: <span className="font-bold">{kazanan.kazananSkor}</span>
                        </p>
                        <p className="text-sm text-[#3E2723] mt-2">
                            Hedef Skor: {hedefSkor} | Tüm oyuncuların skorları eklendi!
                        </p>
                    </div>
                </div>
            )}

            {/* Hedef Skor Ayarlama */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-white rounded-lg p-4 shadow-lg border border-[#D4AF37]">
                    <div className="flex items-center justify-between">
                        <label className="text-[#3E2723] font-semibold">
                            🎯 Hedef Skor: {hedefSkor}
                        </label>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setHedefSkor(Math.max(51, hedefSkor - 10))}
                                className="bg-[#8B2F2F] text-white px-3 py-1 rounded hover:bg-[#6B1F1F] transition-colors"
                            >
                                -10
                            </button>
                            <button
                                onClick={() => setHedefSkor(Math.max(51, hedefSkor - 1))}
                                className="bg-[#8B2F2F] text-white px-3 py-1 rounded hover:bg-[#6B1F1F] transition-colors"
                            >
                                -1
                            </button>
                            <button
                                onClick={() => setHedefSkor(hedefSkor + 1)}
                                className="bg-[#8B2F2F] text-white px-3 py-1 rounded hover:bg-[#6B1F1F] transition-colors"
                            >
                                +1
                            </button>
                            <button
                                onClick={() => setHedefSkor(hedefSkor + 10)}
                                className="bg-[#8B2F2F] text-white px-3 py-1 rounded hover:bg-[#6B1F1F] transition-colors"
                            >
                                +10
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skor Tablosu */}
            <SkorTablosu
                oyunVerisi={oyunVerisi}
                onSkorDuzenlemeBaslat={skorDuzenlemeBaslat}
                onIsimDuzenlemeBaslat={isimDuzenlemeBaslat}
                oyunBitti={true}
            />

            {/* Yeni Skor Girişi */}
            <YeniSkorGirisi
                oyunVerisi={oyunVerisi}
                yeniSkorlar={yeniSkorlar}
                setYeniSkorlar={setYeniSkorlar}
                onSkorEkle={handleSkorEkle}
            />

            {/* Meşrubat Takip */}
            <MesrubatTakip
                oyunVerisi={oyunVerisi}
                storageKey={storageKey}
                setOyunVerisi={setOyunVerisi}
            />

            {/* Kontrol Butonları */}
            <KontrolButonlari
                onOyunuKaydet={handleOyunuKaydet}
                onSifirla={handleOyunuSifirla}
                onYeniOyunaBasla={handleYeniOyunaBasla}
            />

            {/* Kıraathane detayları */}
            <div className="text-center text-[#3E2723] text-sm opacity-75 mt-8">
                <p>☕ Çay servisi mevcuttur</p>
                <p>🎯 Dostluk ve eğlence garantili</p>
                <p className="mt-2 text-xs">💡 İpucu: Skorları düzenlemek için tablodaki değerlere, isimleri düzenlemek için oyuncu isimlerine tıklayın!</p>
                <p className="mt-1 text-xs">☕ Meşrubat Takibi: Büyük butonlara tıklayarak ekleyin, sağ üstteki - butonlarıyla çıkarın!</p>
                <p className="mt-1 text-xs">🎯 Pişti Özelliği: Hedef skora ulaşan oyuncu oyunu kazanır!</p>
            </div>
        </div>
    );
}
