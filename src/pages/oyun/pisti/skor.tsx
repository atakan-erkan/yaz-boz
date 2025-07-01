import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getFromStorage, saveToStorage, kayitliOyunKaydet } from "@/utils/storage";
import Link from "next/link";

type OyunVerisi = {
    oyun: string;
    oyuncular: string[];
    skorlar: number[][];
    hedefSkor?: number; // Pişti için hedef skor
};

export default function PistiSkor() {
    const router = useRouter();
    const storageKey = `oyunVerisi_pisti`;

    const [oyunVerisi, setOyunVerisi] = useState<OyunVerisi | null>(null);
    const [yeniSkorlar, setYeniSkorlar] = useState<string[]>([]);
    const [hedefSkor, setHedefSkor] = useState<number>(151);

    // Düzenleme modu state'leri
    const [duzenlemeModu, setDuzenlemeModu] = useState<"kapali" | "skor" | "isim">("kapali");
    const [duzenlenecekOyuncu, setDuzenlenecekOyuncu] = useState<number>(-1);
    const [duzenlenecekTur, setDuzenlenecekTur] = useState<number>(-1);
    const [duzenlemeDegeri, setDuzenlemeDegeri] = useState<string>("");

    useEffect(() => {
        const veri = getFromStorage<OyunVerisi>(storageKey);
        if (veri) {
            setOyunVerisi(veri);
            setYeniSkorlar(Array(veri.oyuncular.length).fill(""));
            setHedefSkor(veri.hedefSkor || 151);
        } else {
            router.push("/");
        }
    }, []);

    const skorEkle = () => {
        if (!oyunVerisi) return;
        const sayilar = yeniSkorlar.map((s) => parseInt(s) || 0);
        const guncellenmisSkorlar = oyunVerisi.skorlar.map((skorlar, i) => [
            ...skorlar,
            sayilar[i],
        ]);
        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            skorlar: guncellenmisSkorlar,
            hedefSkor: hedefSkor,
        };
        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
        setYeniSkorlar(Array(guncelVeri.oyuncular.length).fill(""));
    };

    // Skor düzenleme fonksiyonu
    const skorDuzenle = () => {
        if (!oyunVerisi || duzenlenecekOyuncu === -1 || duzenlenecekTur === -1 || !duzenlemeDegeri) return;

        const yeniDeger = parseInt(duzenlemeDegeri);
        if (isNaN(yeniDeger)) return;

        const guncellenmisSkorlar = [...oyunVerisi.skorlar];
        guncellenmisSkorlar[duzenlenecekOyuncu] = [...guncellenmisSkorlar[duzenlenecekOyuncu]];
        guncellenmisSkorlar[duzenlenecekOyuncu][duzenlenecekTur] = yeniDeger;

        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            skorlar: guncellenmisSkorlar,
            hedefSkor: hedefSkor,
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
        duzenlemeModunuKapat();
    };

    // Düzenleme modunu kapatma fonksiyonu
    const duzenlemeModunuKapat = () => {
        setDuzenlemeModu("kapali");
        setDuzenlenecekOyuncu(-1);
        setDuzenlenecekTur(-1);
        setDuzenlemeDegeri("");
    };

    // Skor düzenleme modunu açma
    const skorDuzenlemeBaslat = (oyuncuIndex: number, turIndex: number) => {
        setDuzenlemeModu("skor");
        setDuzenlenecekOyuncu(oyuncuIndex);
        setDuzenlenecekTur(turIndex);
        setDuzenlemeDegeri(oyunVerisi?.skorlar[oyuncuIndex]?.[turIndex]?.toString() || "0");
    };

    // İsim düzenleme fonksiyonu
    const isimDuzenle = () => {
        if (!oyunVerisi || duzenlenecekOyuncu === -1 || !duzenlemeDegeri.trim()) return;

        const yeniIsim = duzenlemeDegeri.trim();
        if (yeniIsim.length === 0) return;

        const guncellenmisOyuncular = [...oyunVerisi.oyuncular];
        guncellenmisOyuncular[duzenlenecekOyuncu] = yeniIsim;

        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            oyuncular: guncellenmisOyuncular,
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
        duzenlemeModunuKapat();
    };

    // İsim düzenleme modunu açma
    const isimDuzenlemeBaslat = (oyuncuIndex: number) => {
        setDuzenlemeModu("isim");
        setDuzenlenecekOyuncu(oyuncuIndex);
        setDuzenlemeDegeri(oyunVerisi?.oyuncular[oyuncuIndex] || "");
    };

    const sifirla = () => {
        if (!oyunVerisi) return;
        const temiz = {
            ...oyunVerisi,
            skorlar: Array(oyunVerisi.oyuncular.length).fill([]),
            hedefSkor: hedefSkor,
        };
        saveToStorage(storageKey, temiz);
        setOyunVerisi(temiz);
    };

    const geri = () => {
        localStorage.removeItem(storageKey);
        router.push("/");
    };

    const oyunuKaydet = () => {
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

            {/* Düzenleme Modu Bildirimi */}
            {duzenlemeModu !== "kapali" && (
                <div className="max-w-2xl mx-auto mb-6">
                    <div className="bg-[#D4AF37] rounded-lg p-4 shadow-2xl border-2 border-[#8B2F2F] text-center">
                        <h3 className="text-lg font-serif font-bold text-[#3E2723] mb-2">
                            ✏️ {duzenlemeModu === "skor" ? "Skor Düzenleme" : "İsim Düzenleme"} Modu
                        </h3>
                        <p className="text-[#3E2723] mb-3">
                            {duzenlemeModu === "skor"
                                ? `${oyunVerisi.oyuncular[duzenlenecekOyuncu]} - ${duzenlenecekTur + 1}. Tur`
                                : `${oyunVerisi.oyuncular[duzenlenecekOyuncu]} - İsim Düzenleme`
                            }
                        </p>
                        <div className="flex gap-2 justify-center">
                            {duzenlemeModu === "isim" ? (
                                <input
                                    type="text"
                                    value={duzenlemeDegeri}
                                    onChange={(e) => setDuzenlemeDegeri(e.target.value)}
                                    className="w-48 p-2 border border-[#8B2F2F] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center font-medium"
                                    placeholder="Oyuncu adı"
                                />
                            ) : (
                                <input
                                    type="number"
                                    value={duzenlemeDegeri}
                                    onChange={(e) => setDuzenlemeDegeri(e.target.value)}
                                    className="w-24 p-2 border border-[#8B2F2F] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center font-medium"
                                    placeholder="0"
                                />
                            )}
                            <button
                                onClick={duzenlemeModu === "skor" ? skorDuzenle : isimDuzenle}
                                className="bg-[#3B5D3A] text-white px-4 py-2 rounded-lg hover:bg-[#25401F] transition-all duration-300 font-bold"
                            >
                                ✅ Kaydet
                            </button>
                            <button
                                onClick={duzenlemeModunuKapat}
                                className="bg-[#8B2F2F] text-white px-4 py-2 rounded-lg hover:bg-[#5C1A1B] transition-all duration-300 font-bold"
                            >
                                ❌ İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Kazanan Bildirimi */}
            {kazanan?.oyunBitti && (
                <div className="max-w-4xl mx-auto mb-6">
                    <div className="bg-[#D4AF37] rounded-lg p-6 shadow-2xl border-2 border-[#3E2723] text-center">
                        <h2 className="text-2xl font-serif font-bold text-[#3E2723] mb-2">
                            🏆 OYUN BİTTİ! 🏆
                        </h2>
                        <p className="text-xl font-bold text-[#8B2F2F]">
                            Kazanan: {kazanan.kazanan}
                        </p>
                        <p className="text-lg text-[#3E2723] mt-1">
                            Toplam Skor: {kazanan.kazananSkor} (Hedef: {hedefSkor})
                        </p>
                    </div>
                </div>
            )}

            {/* Hedef Skor Seçimi */}
            <div className="max-w-md mx-auto mb-6">
                <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                    <h2 className="text-lg font-serif font-bold text-[#D4AF37] text-center mb-3">
                        🎯 Hedef Skor
                    </h2>
                    <div className="flex space-x-2">
                        {[151, 251, 351, 501].map((skor) => (
                            <button
                                key={skor}
                                onClick={() => setHedefSkor(skor)}
                                className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all duration-300 ${hedefSkor === skor
                                    ? "bg-[#D4AF37] text-[#3E2723]"
                                    : "bg-[#F3E9DD] text-[#3E2723] hover:bg-[#EAD7C1]"
                                    }`}
                            >
                                {skor}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Skor tablosu */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-[#7B4B28] rounded-lg p-6 shadow-2xl border-2 border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        📊 Pişti Skorları
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-2 border-[#D4AF37] text-sm text-center bg-[#F3E9DD]">
                            <thead className="bg-[#D4AF37] text-[#3E2723]">
                                <tr>
                                    <th className="border border-[#D4AF37] px-3 py-2 font-bold">Tur</th>
                                    {oyunVerisi.oyuncular.map((oyuncu, i) => (
                                        <th
                                            key={i}
                                            className="border border-[#D4AF37] px-3 py-2 font-bold cursor-pointer hover:bg-[#8B2F2F] hover:text-[#F5E9DA] transition-all duration-200"
                                            onClick={() => isimDuzenlemeBaslat(i)}
                                            title="İsmi düzenlemek için tıklayın"
                                        >
                                            {oyuncu}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {oyunVerisi.skorlar[0].map((_, tur) => (
                                    <tr key={tur} className={tur % 2 === 0 ? "bg-[#F3E9DD]" : "bg-[#EAD7C1] hover:bg-[#F5E9DA]"}>
                                        <td className="border border-[#D4AF37] px-3 py-2 font-bold text-[#D4AF37]">{tur + 1}</td>
                                        {oyunVerisi.oyuncular.map((_, oyuncuIndex) => (
                                            <td
                                                key={oyuncuIndex}
                                                className="border border-[#D4AF37] px-3 py-2 text-[#3E2723] cursor-pointer hover:bg-[#D4AF37] hover:text-[#3E2723] transition-all duration-200"
                                                onClick={() => skorDuzenlemeBaslat(oyuncuIndex, tur)}
                                                title="Skoru düzenlemek için tıklayın"
                                            >
                                                {oyunVerisi.skorlar[oyuncuIndex][tur]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[#EAD7C1] text-[#3E2723] font-bold">
                                <tr>
                                    <td className="border border-[#D4AF37] px-3 py-2">Toplam</td>
                                    {oyunVerisi.skorlar.map((skor, i) => {
                                        const toplamSkor = skor.reduce((a, b) => a + b, 0);
                                        const isKazanan = kazanan?.kazananIndex === i;
                                        return (
                                            <td key={i} className={`border border-[#D4AF37] px-3 py-2 ${isKazanan ? 'bg-[#D4AF37] text-[#3E2723]' : 'bg-[#F3E9DD] text-[#3E2723]'}`}>
                                                {toplamSkor}
                                                {isKazanan && <span className="ml-1">🏆</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Yeni skor girişi */}
            <div className="max-w-md mx-auto">
                <div className="bg-[#7B4B28] rounded-lg p-6 shadow-2xl border-2 border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        ✏️ Yeni Tur Puanları
                    </h2>
                    <div className="space-y-3">
                        {oyunVerisi.oyuncular.map((oyuncu, i) => (
                            <input
                                key={i}
                                type="number"
                                className="w-full p-3 border-2 border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium"
                                placeholder={`${oyuncu} puanı`}
                                value={yeniSkorlar[i]}
                                onChange={(e) => {
                                    const yeni = [...yeniSkorlar];
                                    yeni[i] = e.target.value;
                                    setYeniSkorlar(yeni);
                                }}
                                disabled={kazanan?.oyunBitti}
                            />
                        ))}
                    </div>

                    <div className="space-y-3 mt-6">
                        <button
                            onClick={skorEkle}
                            className="w-full bg-[#3B5D3A] text-white py-3 rounded-lg shadow-lg hover:bg-[#25401F] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold disabled:bg-[#A0A0A0] disabled:cursor-not-allowed"
                            disabled={kazanan?.oyunBitti}
                        >
                            ✅ Skorları Ekle
                        </button>
                        <button
                            onClick={oyunuKaydet}
                            className="w-full bg-[#D4AF37] text-[#3E2723] py-3 rounded-lg shadow-lg hover:bg-[#B8941F] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold"
                        >
                            📚 Oyunu Kaydet
                        </button>
                        <button
                            onClick={sifirla}
                            className="w-full bg-[#3B5D3A] text-white py-3 rounded-lg shadow-lg hover:bg-[#25401F] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold"
                        >
                            🔄 Sıfırla
                        </button>
                        <button
                            onClick={geri}
                            className="w-full bg-[#8B2F2F] text-white py-3 rounded-lg shadow-lg hover:bg-[#5C1A1B] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold"
                        >
                            🏠 Yeni Oyuna Başla
                        </button>
                    </div>
                </div>
            </div>

            {/* Kıraathane detayları */}
            <div className="text-center text-[#3E2723] text-sm opacity-75 mt-8">
                <p>☕ Çay servisi mevcuttur</p>
                <p>🎯 Dostluk ve eğlence garantili</p>
                <p className="mt-2 text-xs">💡 İpucu: Skorları düzenlemek için tablodaki değerlere, isimleri düzenlemek için oyuncu isimlerine tıklayın!</p>
            </div>
        </div>
    );
}
