import { useRouter } from "next/router";
import { kayitliOyunKaydet } from "@/utils/storage";
import { skorEkle, skorDuzenle, isimDuzenle, oyunuSifirla } from "@/utils/gameHelpers";
import { useOyunYonetimi } from "@/hooks/useOyunYonetimi";
import Link from "next/link";
import DuzenlemeModu from "@/components/DuzenlemeModu";
import SkorTablosu from "@/components/SkorTablosu";
import YeniSkorGirisi from "@/components/YeniSkorGirisi";
import MesrubatTakip from "@/components/MesrubatTakip";
import KontrolButonlari from "@/components/KontrolButonlari";

export default function BatakSkor() {
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
    } = useOyunYonetimi("batak");

    const handleSkorEkle = () => {
        if (!oyunVerisi) return;
        skorEkle(oyunVerisi, storageKey, setOyunVerisi, yeniSkorlar, setYeniSkorlar);
    };

    // Düzenleme kaydetme fonksiyonları
    const handleSkorDuzenle = () => {
        if (!oyunVerisi) return;
        skorDuzenle(oyunVerisi, storageKey, setOyunVerisi, duzenlenecekOyuncu, duzenlenecekTur, duzenlemeDegeri, duzenlemeModunuKapat);
    };

    const handleIsimDuzenle = () => {
        if (!oyunVerisi) return;
        isimDuzenle(oyunVerisi, storageKey, setOyunVerisi, duzenlenecekOyuncu, duzenlemeDegeri, duzenlemeModunuKapat);
    };

    const handleOyunuSifirla = () => {
        if (!oyunVerisi) return;
        oyunuSifirla(oyunVerisi, storageKey, setOyunVerisi, "normal");
    };

    const handleYeniOyunaBasla = () => {
        localStorage.removeItem(storageKey);
        router.push("/");
    };

    const handleOyunuKaydet = () => {
        if (!oyunVerisi) return;

        try {
            kayitliOyunKaydet(oyunVerisi, "Batak");
            alert("Oyun başarıyla kaydedildi! 📚");
        } catch (error) {
            console.error("Oyun kaydetme hatası:", error);
            alert("Oyun kaydedilirken bir hata oluştu!");
        }
    };

    // Kazanan kontrolü (en yüksek skor kazanır)
    const kazananKontrol = () => {
        if (!oyunVerisi) return null;

        const toplamSkorlar = oyunVerisi.skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
        const enYuksekSkor = Math.max(...toplamSkorlar);
        const kazananIndex = toplamSkorlar.findIndex(skor => skor === enYuksekSkor);

        return {
            kazanan: oyunVerisi.oyuncular[kazananIndex],
            kazananIndex,
            kazananSkor: enYuksekSkor,
            toplamSkorlar
        };
    };

    const kazanan = kazananKontrol();

    if (!oyunVerisi) return null;

    return (
        <div className="min-h-screen bg-[#F5E9DA] p-4">
            {/* Kıraathane başlığı */}
            <div className="text-center space-y-2 mb-6">
                <Link href="/" className="text-3xl font-serif font-bold text-[#D4AF37] drop-shadow-lg">
                    🃏 Batak Skor Tablosu 🃏
                </Link>
                <p className="text-[#8B2F2F] text-lg italic">
                    &ldquo;Batak! Batak! Batak!&rdquo;
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

            {/* Oyun Bitti Bildirimi */}
            {oyunVerisi.skorlar[0]?.length >= 13 && kazanan && (
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
                            13 el tamamlandı! En yüksek skor alan kazandı!
                        </p>
                    </div>
                </div>
            )}

            {/* Skor Kolaylıkları */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-white rounded-lg p-4 shadow-lg border border-[#D4AF37]">
                    <h3 className="text-lg font-serif font-bold text-[#D4AF37] text-center mb-3">
                        📊 Batak Skor Sistemi
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Her El</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa Ası</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa 10&apos;u</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa 2&apos;si</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa 3&apos;ü</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa 4&apos;ü</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa 5&apos;i</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa 6&apos;sı</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa 7&apos;si</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa 8&apos;i</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa 9&apos;u</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa J&apos;si</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa Q&apos;su</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Kupa K&apos;sı</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skor Tablosu */}
            <SkorTablosu
                oyunVerisi={oyunVerisi}
                onSkorDuzenlemeBaslat={skorDuzenlemeBaslat}
                onIsimDuzenlemeBaslat={isimDuzenlemeBaslat}
                kazananIndex={kazanan?.kazananIndex}
            />

            {/* Yeni Skor Girişi */}
            <YeniSkorGirisi
                oyunVerisi={oyunVerisi}
                yeniSkorlar={yeniSkorlar}
                setYeniSkorlar={setYeniSkorlar}
                onSkorEkle={handleSkorEkle}
                disabled={oyunVerisi.skorlar[0]?.length >= 13}
                oyunTuru="batak"
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
                <p className="mt-1 text-xs">🏆 Batak Özelliği: En yüksek skor alan oyuncu kazanır!</p>
            </div>
        </div>
    );
} 