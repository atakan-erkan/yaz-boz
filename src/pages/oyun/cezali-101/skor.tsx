import { useRouter } from "next/router";
import { kayitliOyunKaydet } from "@/utils/storage";
import { oyunuSifirla, toplamCezalariHesapla } from "@/utils/gameHelpers";
import { useCezali101Yonetimi } from "@/hooks/useCezali101Yonetimi";
import Link from "next/link";
import DuzenlemeModu from "@/components/DuzenlemeModu";
import SkorTablosu from "@/components/SkorTablosu";
import YeniSkorGirisi from "@/components/YeniSkorGirisi";
import MesrubatTakip from "@/components/MesrubatTakip";
import KontrolButonlari from "@/components/KontrolButonlari";
import CezaTablosu from "@/components/CezaTablosu";
import CezaEkleme from "@/components/CezaEkleme";

export default function Cezali101Skor() {
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
        duzenlenecekCezaIndex,
        duzenlemeDegeri,
        setDuzenlemeDegeri,
        cezaAlan,
        setCezaAlan,
        cezaSayisi,
        setCezaSayisi,
        duzenlemeModunuKapat,
        skorDuzenlemeBaslat,
        isimDuzenlemeBaslat,
        cezaDuzenlemeBaslat,
        elSayisiDuzenlemeBaslat,
        handleSkorEkle,
        handleCezaEkle,
        handleCezaDuzenle,
        handleCezaSil,
        handleElSayisiDuzenle,
        handleSkorDuzenle,
        handleIsimDuzenle,
    } = useCezali101Yonetimi();

    const handleOyunuSifirla = () => {
        if (!oyunVerisi) return;
        oyunuSifirla(oyunVerisi, storageKey, setOyunVerisi, "cezali101");
    };

    const handleYeniOyunaBasla = () => {
        localStorage.removeItem(storageKey);
        router.push("/");
    };

    const handleOyunuKaydet = () => {
        if (!oyunVerisi) return;

        try {
            kayitliOyunKaydet(oyunVerisi, "Cezalı 101");
            alert("Oyun başarıyla kaydedildi! 📚");
        } catch (error) {
            console.error("Oyun kaydetme hatası:", error);
            alert("Oyun kaydedilirken bir hata oluştu!");
        }
    };



    // Kaybeden kontrolü
    const kaybedenKontrol = () => {
        if (!oyunVerisi) return null;

        const toplamSkorlar = oyunVerisi.skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
        const toplamCezalar = toplamCezalariHesapla(oyunVerisi.cezalar || []);
        const finalSkorlar = toplamSkorlar.map((skor, index) => skor + toplamCezalar[index]);

        // En yüksek final skora sahip oyuncuyu bul (en çok ceza alan kaybeder)
        const enYuksekSkor = Math.max(...finalSkorlar);
        const kaybedenIndex = finalSkorlar.findIndex(skor => skor === enYuksekSkor);

        return {
            kaybeden: oyunVerisi.oyuncular[kaybedenIndex],
            kaybedenIndex,
            kaybedenSkor: enYuksekSkor,
            toplamSkorlar,
            toplamCezalar,
            finalSkorlar
        };
    };

    const kaybeden = kaybedenKontrol();

    if (!oyunVerisi) return null;

    return (
        <div className="min-h-screen bg-[#F5E9DA] p-4">
            {/* Kıraathane başlığı */}
            <div className="text-center space-y-2 mb-6">
                <Link href="/" className="text-3xl font-serif font-bold text-[#D4AF37] drop-shadow-lg">
                    🃏 CEZALI 101 Skor Tablosu 🃏
                </Link>
                <p className="text-[#8B2F2F] text-lg italic">
                    &ldquo;Ceza alan kaybeder!&rdquo;
                </p>
            </div>

            {/* Düzenleme Modu */}
            <DuzenlemeModu
                duzenlemeModu={duzenlemeModu}
                duzenlenecekOyuncu={duzenlenecekOyuncu}
                duzenlenecekTur={duzenlenecekTur}
                duzenlenecekCezaIndex={duzenlenecekCezaIndex}
                duzenlemeDegeri={duzenlemeDegeri}
                setDuzenlemeDegeri={setDuzenlemeDegeri}
                onKaydet={
                    duzenlemeModu === "skor" ? handleSkorDuzenle :
                        duzenlemeModu === "ceza" ? handleCezaDuzenle :
                            duzenlemeModu === "elSayisi" ? handleElSayisiDuzenle :
                                handleIsimDuzenle
                }
                onIptal={duzenlemeModunuKapat}
                oyuncuIsimleri={oyunVerisi.oyuncular}
            />

            {/* Kaybeden Bildirimi */}
            {oyunVerisi.skorlar[0]?.length >= (oyunVerisi.elSayisi || 9) && kaybeden && (
                <div className="max-w-4xl mx-auto mb-6">
                    <div className="bg-[#8B2F2F] rounded-lg p-6 shadow-2xl border-2 border-[#3E2723] text-center">
                        <h2 className="text-2xl font-serif font-bold text-[#F5E9DA] mb-2">
                            💀 OYUN BİTTİ! 💀
                        </h2>
                        <p className="text-xl text-[#F5E9DA] font-semibold">
                            Kaybeden: <span className="text-[#D4AF37] font-bold">{kaybeden.kaybeden}</span>
                        </p>
                        <p className="text-lg text-[#F5E9DA]">
                            Final Skor: <span className="font-bold">{kaybeden.kaybedenSkor}</span>
                        </p>
                        <p className="text-sm text-[#D4AF37] mt-2">
                            El Sayısı: {oyunVerisi.elSayisi || 9} | Tüm eller tamamlandı!
                        </p>
                    </div>
                </div>
            )}

            {/* El Sayısı Ayarlama */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-white rounded-lg p-4 shadow-lg border border-[#D4AF37]">
                    <div className="flex items-center justify-between">
                        <label className="text-[#3E2723] font-semibold">
                            🎯 El Sayısı: {oyunVerisi.elSayisi || 9}
                        </label>
                        <button
                            onClick={elSayisiDuzenlemeBaslat}
                            className="bg-[#8B2F2F] text-white px-4 py-2 rounded hover:bg-[#6B1F1F] transition-colors"
                        >
                            Düzenle
                        </button>
                    </div>
                </div>
            </div>

            {/* Skor Tablosu */}
            <SkorTablosu
                oyunVerisi={oyunVerisi}
                onSkorDuzenlemeBaslat={skorDuzenlemeBaslat}
                onIsimDuzenlemeBaslat={isimDuzenlemeBaslat}
                showCezalar={true}
                toplamCezalar={toplamCezalariHesapla(oyunVerisi.cezalar || [])}
                oyunBitti={oyunVerisi.skorlar[0]?.length >= (oyunVerisi.elSayisi || 9) - 1}
                kazananIndex={kaybeden?.kaybedenIndex}
            />

            {/* Ceza Tablosu */}
            <CezaTablosu
                oyunVerisi={oyunVerisi}
                onCezaDuzenlemeBaslat={cezaDuzenlemeBaslat}
                onCezaSil={handleCezaSil}
                onIsimDuzenlemeBaslat={isimDuzenlemeBaslat}
            />

            {/* Ceza Ekleme */}
            <CezaEkleme
                oyunVerisi={oyunVerisi}
                cezaAlan={cezaAlan}
                setCezaAlan={setCezaAlan}
                cezaSayisi={cezaSayisi}
                setCezaSayisi={setCezaSayisi}
                onCezaEkle={handleCezaEkle}
            />

            {/* Yeni Skor Girişi */}
            <YeniSkorGirisi
                oyunVerisi={oyunVerisi}
                yeniSkorlar={yeniSkorlar}
                setYeniSkorlar={setYeniSkorlar}
                onSkorEkle={handleSkorEkle}
                showHizliButonlar={true}
                disabled={oyunVerisi.skorlar[0]?.length >= (oyunVerisi.elSayisi || 9)}
                oyunTuru="cezali-101"
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
                <p className="mt-1 text-xs">⚡ Cezalı 101 Özelliği: Ceza alan oyuncular net skorlarından düşürülür!</p>
            </div>
        </div>
    );
}
