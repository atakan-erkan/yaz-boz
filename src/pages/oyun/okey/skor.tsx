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

export default function OkeySkor() {
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
    } = useOyunYonetimi("okey");

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
            kayitliOyunKaydet(oyunVerisi, "Normal Okey");
            alert("Oyun başarıyla kaydedildi! 📚");
        } catch (error) {
            console.error("Oyun kaydetme hatası:", error);
            alert("Oyun kaydedilirken bir hata oluştu!");
        }
    };

    // Kaybeden kontrolü (en düşük skor kazanır)
    const kaybedenKontrol = () => {
        if (!oyunVerisi) return null;

        const toplamSkorlar = oyunVerisi.skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
        const enDusukSkor = Math.min(...toplamSkorlar);
        const kazananIndex = toplamSkorlar.findIndex(skor => skor === enDusukSkor);

        return {
            kazanan: oyunVerisi.oyuncular[kazananIndex],
            kazananIndex,
            kazananSkor: enDusukSkor,
            toplamSkorlar
        };
    };

    const kazanan = kaybedenKontrol();

    if (!oyunVerisi) return null;

    return (
        <div className="min-h-screen bg-[#F5E9DA] p-4">
            {/* Kıraathane başlığı */}
            <div className="text-center space-y-2 mb-6">
                <Link href="/" className="text-3xl font-serif font-bold text-[#D4AF37] drop-shadow-lg">
                    🃏 Normal Okey Skor Tablosu 🃏
                </Link>
                <p className="text-[#8B2F2F] text-lg italic">
                    &ldquo;Okey! Okey! Okey!&rdquo;
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
            {oyunVerisi.skorlar[0]?.length >= 15 && kazanan && (
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
                            15 tur tamamlandı! En düşük skor alan kazandı!
                        </p>
                    </div>
                </div>
            )}

            {/* Skor Kolaylıkları */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-white rounded-lg p-4 shadow-lg border border-[#D4AF37]">
                    <h3 className="text-lg font-serif font-bold text-[#D4AF37] text-center mb-3">
                        📊 Okey Skor Sistemi
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Per</div>
                            <div className="text-[#8B2F2F]">0 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Çifte Gitti</div>
                            <div className="text-[#8B2F2F]">1 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Üçlü Gitti</div>
                            <div className="text-[#8B2F2F]">2 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Dörtlü Gitti</div>
                            <div className="text-[#8B2F2F]">3 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Serbest</div>
                            <div className="text-[#8B2F2F]">4 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Çifte Bitti</div>
                            <div className="text-[#8B2F2F]">5 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Üçlü Bitti</div>
                            <div className="text-[#8B2F2F]">6 puan</div>
                        </div>
                        <div className="bg-[#F3E9DD] p-2 rounded text-center">
                            <div className="font-bold text-[#3B5D3A]">Dörtlü Bitti</div>
                            <div className="text-[#8B2F2F]">7 puan</div>
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
                disabled={oyunVerisi.skorlar[0]?.length >= 15}
                oyunTuru="okey"
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
                <p className="mt-1 text-xs">🏆 Okey Özelliği: En düşük skor alan oyuncu kazanır!</p>
            </div>
        </div>
    );
} 