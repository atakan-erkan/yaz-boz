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

export default function SkorEkrani() {
    const router = useRouter();
    const { oyunAdi } = router.query;

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
    } = useOyunYonetimi(oyunAdi as string);

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
            kayitliOyunKaydet(oyunVerisi, oyunVerisi.oyun);
            alert("Oyun başarıyla kaydedildi! 📚");
        } catch (error) {
            console.error("Oyun kaydetme hatası:", error);
            alert("Oyun kaydedilirken bir hata oluştu!");
        }
    };

    if (!oyunVerisi) return null;

    return (
        <div className="min-h-screen bg-[#F5E9DA] p-4">
            {/* Kıraathane başlığı */}
            <div className="text-center space-y-2 mb-6">
                <Link href="/" className="text-3xl font-serif font-bold text-[#D4AF37] drop-shadow-lg">
                    🃏 {oyunVerisi.oyun.toUpperCase()} Skor Tablosu 🃏
                </Link>
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
            </div>
        </div>
    );
}
