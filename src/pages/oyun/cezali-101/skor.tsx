import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getFromStorage, saveToStorage, kayitliOyunKaydet } from "@/utils/storage";
import Link from "next/link";

type OyunVerisi = {
    oyun: string;
    oyuncular: string[];
    skorlar: number[][];
    cezalar: number[][]; // Her oyuncunun ceza listesi
    mesrubatlar?: { [mesrubatTuru: string]: number }; // Genel meşrubat takibi
    mesrubatFiyatlari?: { [mesrubatTuru: string]: number }; // Meşrubat fiyatları (küsüratlı)
    elSayisi?: number; // El sayısı (varsayılan 9)
};

export default function Cezali101Skor() {
    const router = useRouter();
    const storageKey = "oyunVerisi_cezali-101";

    const [oyunVerisi, setOyunVerisi] = useState<OyunVerisi | null>(null);
    const [yeniSkorlar, setYeniSkorlar] = useState<string[]>([]);
    const [cezaAlan, setCezaAlan] = useState<number>(-1);
    const [cezaSayisi, setCezaSayisi] = useState<string>("");

    // Düzenleme modu state'leri
    const [duzenlemeModu, setDuzenlemeModu] = useState<"kapali" | "skor" | "ceza" | "isim" | "elSayisi">("kapali");
    const [duzenlenecekOyuncu, setDuzenlenecekOyuncu] = useState<number>(-1);
    const [duzenlenecekTur, setDuzenlenecekTur] = useState<number>(-1);
    const [duzenlenecekCezaIndex, setDuzenlenecekCezaIndex] = useState<number>(-1);
    const [duzenlemeDegeri, setDuzenlemeDegeri] = useState<string>("");



    useEffect(() => {
        const veri = getFromStorage<OyunVerisi>(storageKey);
        if (veri) {
            // Eğer cezalar yoksa, eski veriyi yeni formata çevir
            if (!veri.cezalar) {
                veri.cezalar = Array(veri.oyuncular.length).fill([]).map(() => []);
            }
            // Eğer meşrubatlar yoksa, yeni formata çevir
            if (!veri.mesrubatlar) {
                veri.mesrubatlar = {};
            }
            // Eğer meşrubat fiyatları yoksa, yeni formata çevir
            if (!veri.mesrubatFiyatlari) {
                veri.mesrubatFiyatlari = {};
            }
            // Eğer el sayısı yoksa, varsayılan 9 olarak ayarla
            if (!veri.elSayisi) {
                veri.elSayisi = 9;
            }
            setOyunVerisi(veri);
            setYeniSkorlar(Array(veri.oyuncular.length).fill(""));
        } else {
            router.push("/");
        }
    }, []);

    const skorEkle = () => {
        if (!oyunVerisi) return;

        // Boş skor kontrolü
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

        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            skorlar: guncellenmisSkorlar,
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
        setYeniSkorlar(Array(guncelVeri.oyuncular.length).fill(""));
    };

    const cezaEkle = () => {
        if (!oyunVerisi || cezaAlan === -1 || !cezaSayisi) return;

        const cezaMiktari = parseInt(cezaSayisi);
        if (isNaN(cezaMiktari) || cezaMiktari <= 0) return;

        const guncellenmisCezalar = [...oyunVerisi.cezalar];
        guncellenmisCezalar[cezaAlan] = [...guncellenmisCezalar[cezaAlan], cezaMiktari];

        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            cezalar: guncellenmisCezalar,
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
        setCezaAlan(-1);
        setCezaSayisi("");
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
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
        duzenlemeModunuKapat();
    };

    // Ceza düzenleme fonksiyonu
    const cezaDuzenle = () => {
        if (!oyunVerisi || duzenlenecekOyuncu === -1 || duzenlenecekCezaIndex === -1 || !duzenlemeDegeri) return;

        const yeniDeger = parseInt(duzenlemeDegeri);
        if (isNaN(yeniDeger) || yeniDeger <= 0) return;

        const guncellenmisCezalar = [...oyunVerisi.cezalar];
        guncellenmisCezalar[duzenlenecekOyuncu] = [...guncellenmisCezalar[duzenlenecekOyuncu]];
        guncellenmisCezalar[duzenlenecekOyuncu][duzenlenecekCezaIndex] = yeniDeger;

        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            cezalar: guncellenmisCezalar,
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
        duzenlemeModunuKapat();
    };

    // Ceza silme fonksiyonu
    const cezaSil = (oyuncuIndex: number, cezaIndex: number) => {
        if (!oyunVerisi) return;

        const guncellenmisCezalar = [...oyunVerisi.cezalar];
        guncellenmisCezalar[oyuncuIndex] = guncellenmisCezalar[oyuncuIndex].filter((_, index) => index !== cezaIndex);

        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            cezalar: guncellenmisCezalar,
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
    };

    // Düzenleme modunu kapatma fonksiyonu
    const duzenlemeModunuKapat = () => {
        setDuzenlemeModu("kapali");
        setDuzenlenecekOyuncu(-1);
        setDuzenlenecekTur(-1);
        setDuzenlenecekCezaIndex(-1);
        setDuzenlemeDegeri("");
    };

    // El sayısı düzenleme fonksiyonu
    const elSayisiDuzenle = () => {
        if (!oyunVerisi || !duzenlemeDegeri) return;

        const yeniElSayisi = parseInt(duzenlemeDegeri);
        if (isNaN(yeniElSayisi) || yeniElSayisi <= 0) return;

        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            elSayisi: yeniElSayisi,
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
        duzenlemeModunuKapat();
    };

    // El sayısı düzenleme modunu açma
    const elSayisiDuzenlemeBaslat = () => {
        setDuzenlemeModu("elSayisi");
        setDuzenlemeDegeri(oyunVerisi?.elSayisi?.toString() || "9");
    };

    // Skor düzenleme modunu açma
    const skorDuzenlemeBaslat = (oyuncuIndex: number, turIndex: number) => {
        setDuzenlemeModu("skor");
        setDuzenlenecekOyuncu(oyuncuIndex);
        setDuzenlenecekTur(turIndex);
        setDuzenlemeDegeri(oyunVerisi?.skorlar[oyuncuIndex]?.[turIndex]?.toString() || "0");
    };

    // Ceza düzenleme modunu açma
    const cezaDuzenlemeBaslat = (oyuncuIndex: number, cezaIndex: number) => {
        setDuzenlemeModu("ceza");
        setDuzenlenecekOyuncu(oyuncuIndex);
        setDuzenlenecekCezaIndex(cezaIndex);
        setDuzenlemeDegeri(oyunVerisi?.cezalar[oyuncuIndex]?.[cezaIndex]?.toString() || "0");
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

    // Meşrubat ekleme fonksiyonu
    const mesrubatEkle = (mesrubatTuru: string, miktar: number = 1) => {
        if (!oyunVerisi) return;

        const guncellenmisMesrubatlar = { ...oyunVerisi.mesrubatlar };

        if (!guncellenmisMesrubatlar[mesrubatTuru]) {
            guncellenmisMesrubatlar[mesrubatTuru] = 0;
        }

        guncellenmisMesrubatlar[mesrubatTuru] += miktar;

        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            mesrubatlar: guncellenmisMesrubatlar,
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
    };



    // Meşrubat çıkarma fonksiyonu
    const mesrubatCikar = (mesrubatTuru: string, miktar: number = 1) => {
        if (!oyunVerisi) return;

        const guncellenmisMesrubatlar = { ...oyunVerisi.mesrubatlar };

        if (!guncellenmisMesrubatlar[mesrubatTuru]) {
            return;
        }

        guncellenmisMesrubatlar[mesrubatTuru] = Math.max(0, guncellenmisMesrubatlar[mesrubatTuru] - miktar);

        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            mesrubatlar: guncellenmisMesrubatlar,
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
    };

    // Meşrubat fiyat güncelleme fonksiyonu
    const mesrubatFiyatGuncelle = (mesrubatTuru: string, fiyat: number) => {
        if (!oyunVerisi) return;

        const guncellenmisFiyatlar = { ...oyunVerisi.mesrubatFiyatlari };
        guncellenmisFiyatlar[mesrubatTuru] = fiyat;

        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            mesrubatFiyatlari: guncellenmisFiyatlar,
        };

        saveToStorage(storageKey, guncelVeri);
        setOyunVerisi(guncelVeri);
    };

    const sifirla = () => {
        if (!oyunVerisi) return;
        const temiz = {
            ...oyunVerisi,
            skorlar: Array(oyunVerisi.oyuncular.length).fill([]).map(() => []),
            cezalar: Array(oyunVerisi.oyuncular.length).fill([]).map(() => []),
            mesrubatlar: {},
            elSayisi: 9, // El sayısını da sıfırla
            // Meşrubat fiyatları korunuyor
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
            kayitliOyunKaydet(oyunVerisi, "Cezalı 101");
            alert("Oyun başarıyla kaydedildi! 📚");
        } catch (error) {
            console.error("Oyun kaydetme hatası:", error);
            alert("Oyun kaydedilirken bir hata oluştu!");
        }
    };

    // Kazanan kontrolü - El sayısı kadar el sonucu en yüksek toplam skorlu kaybeder
    const kazananKontrol = () => {
        if (!oyunVerisi) return null;

        const turSayisi = oyunVerisi.skorlar[0]?.length || 0;
        const hedefElSayisi = oyunVerisi.elSayisi || 9;

        if (turSayisi >= hedefElSayisi) {
            const toplamSkorlar = oyunVerisi.skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
            const toplamCezalar = oyunVerisi.cezalar.map(cezaListesi =>
                cezaListesi.reduce((toplam, ceza) => toplam + ceza, 0)
            );

            // Skor + ceza toplamları
            const finalSkorlar = toplamSkorlar.map((skor, i) => skor + toplamCezalar[i]);
            const enYuksekSkor = Math.max(...finalSkorlar);
            const kaybedenIndex = finalSkorlar.findIndex(skor => skor === enYuksekSkor);

            return {
                oyunBitti: true,
                kaybeden: oyunVerisi.oyuncular[kaybedenIndex],
                kaybedenIndex,
                kaybedenSkor: finalSkorlar[kaybedenIndex],
                finalSkorlar
            };
        }

        return { oyunBitti: false };
    };

    const kazanan = kazananKontrol();

    // Her oyuncunun toplam cezasını hesapla
    const toplamCezalar = oyunVerisi?.cezalar.map(cezaListesi =>
        cezaListesi.reduce((toplam, ceza) => toplam + ceza, 0)
    ) || [];

    if (!oyunVerisi) return null;

    return (
        <div className="min-h-screen bg-[#F5E9DA] p-4">
            {/* Kıraathane başlığı */}
            <div className="text-center space-y-2 mb-6">
                <Link href="/" className="text-3xl font-serif font-bold text-[#D4AF37] drop-shadow-lg">
                    🃏 Cezalı 101 Skor Tablosu 🃏
                </Link>
                <p className="text-[#8B2F2F] text-lg italic">
                    &ldquo;{oyunVerisi?.elSayisi || 9} el sonucu en yüksek toplam skorlu kaybeder!&rdquo;
                </p>
            </div>

            {/* Düzenleme Modu Bildirimi */}
            {duzenlemeModu !== "kapali" && (
                <div className="max-w-2xl mx-auto mb-6">
                    <div className="bg-[#D4AF37] rounded-lg p-4 shadow-2xl border-2 border-[#8B2F2F] text-center">
                        <h3 className="text-lg font-serif font-bold text-[#3E2723] mb-2">
                            ✏️ {duzenlemeModu === "skor" ? "Skor Düzenleme" : duzenlemeModu === "ceza" ? "Ceza Düzenleme" : duzenlemeModu === "isim" ? "İsim Düzenleme" : "El Sayısı Düzenleme"} Modu
                        </h3>
                        <p className="text-[#3E2723] mb-3">
                            {duzenlemeModu === "skor"
                                ? `${oyunVerisi.oyuncular[duzenlenecekOyuncu]} - ${duzenlenecekTur + 1}. Tur`
                                : duzenlemeModu === "ceza"
                                    ? `${oyunVerisi.oyuncular[duzenlenecekOyuncu]} - ${duzenlenecekCezaIndex + 1}. Ceza`
                                    : duzenlemeModu === "isim"
                                        ? `${oyunVerisi.oyuncular[duzenlenecekOyuncu]} - İsim Düzenleme`
                                        : "Hedef El Sayısı Düzenleme"
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
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={duzenlemeDegeri}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Sadece sayı ve boş string kabul et
                                        if (value === '' || /^\d+$/.test(value)) {
                                            setDuzenlemeDegeri(value);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        // Sadece sayı tuşlarına izin ver
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-24 p-2 border border-[#8B2F2F] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center font-medium"
                                    placeholder="0"
                                />
                            )}
                            <button
                                onClick={duzenlemeModu === "skor" ? skorDuzenle : duzenlemeModu === "ceza" ? cezaDuzenle : duzenlemeModu === "isim" ? isimDuzenle : elSayisiDuzenle}
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
                    <div className="bg-[#8B2F2F] rounded-lg p-6 shadow-2xl border-2 border-[#D4AF37] text-center">
                        <h2 className="text-2xl font-serif font-bold text-[#F5E9DA] mb-2">
                            🏁 OYUN BİTTİ! 🏁
                        </h2>
                        <p className="text-xl font-bold text-[#D4AF37]">
                            Kaybeden: {kazanan.kaybeden}
                        </p>
                        <p className="text-lg text-[#F5E9DA] mt-1">
                            Final Skor: {kazanan.kaybedenSkor} (Skor + Ceza)
                        </p>
                    </div>
                </div>
            )}

            {/* El Sayısı Göstergesi */}
            <div className="max-w-md mx-auto mb-6">
                <div
                    className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37] cursor-pointer hover:bg-[#8B5A2B] transition-all duration-200"
                    onClick={elSayisiDuzenlemeBaslat}
                    title="El sayısını düzenlemek için tıklayın"
                >
                    <h2 className="text-lg font-serif font-bold text-[#D4AF37] text-center mb-3">
                        🎯 El Sayısı
                    </h2>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#D4AF37]">
                            {oyunVerisi.skorlar[0]?.length || 0} / {oyunVerisi.elSayisi || 9}
                        </div>
                        <div className="mt-2 bg-[#EAD7C1] rounded-full h-3">
                            <div
                                className="bg-[#8B2F2F] h-3 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(((oyunVerisi.skorlar[0]?.length || 0) / (oyunVerisi.elSayisi || 9)) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cezalar Tablosu */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        ⚠️ Cezalar
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-[#D4AF37] text-sm text-center bg-[#F3E9DD]">
                            <thead className="bg-[#D4AF37] text-[#3E2723]">
                                <tr>
                                    <th className="border border-[#D4AF37] px-2 py-1 font-bold">Oyuncu</th>
                                    <th className="border border-[#D4AF37] px-2 py-1 font-bold">Cezalar</th>
                                    <th className="border border-[#D4AF37] px-2 py-1 font-bold">Toplam</th>
                                </tr>
                            </thead>
                            <tbody>
                                {oyunVerisi.oyuncular.map((oyuncu, i) => {
                                    const cezaListesi = oyunVerisi.cezalar[i] || [];
                                    const cezaGruplari = [];
                                    for (let j = 0; j < cezaListesi.length; j += 10) {
                                        cezaGruplari.push(cezaListesi.slice(j, j + 10));
                                    }
                                    return (
                                        <tr key={i} className={i % 2 === 0 ? "bg-[#F3E9DD]" : "bg-[#EAD7C1] hover:bg-[#F5E9DA]"}>
                                            <td
                                                className="border border-[#D4AF37] px-2 py-1 font-bold text-[#D4AF37] cursor-pointer hover:bg-[#D4AF37] hover:text-[#3E2723] transition-all duration-200"
                                                onClick={() => isimDuzenlemeBaslat(i)}
                                                title="İsmi düzenlemek için tıklayın"
                                            >
                                                {oyuncu}
                                            </td>
                                            <td className="border border-[#D4AF37] px-2 py-1 text-[#8B2F2F] text-left">
                                                {cezaListesi.length > 0 ? (
                                                    cezaGruplari.map((grup, grupIndex) => (
                                                        <div key={grupIndex}>
                                                            {grup.map((ceza, cezaIndex) => {
                                                                const globalCezaIndex = grupIndex * 10 + cezaIndex;
                                                                return (
                                                                    <span key={globalCezaIndex} className="inline-flex items-center gap-1 mr-2 mb-1">
                                                                        <span
                                                                            className="cursor-pointer hover:bg-[#D4AF37] hover:text-[#3E2723] px-1 rounded transition-all duration-200"
                                                                            onClick={() => cezaDuzenlemeBaslat(i, globalCezaIndex)}
                                                                            title="Ceza düzenle"
                                                                        >
                                                                            {ceza}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => cezaSil(i, globalCezaIndex)}
                                                                            className="text-[#8B2F2F] hover:text-[#5C1A1B] text-xs font-bold"
                                                                            title="Ceza sil"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ))
                                                ) : (
                                                    "0"
                                                )}
                                            </td>
                                            <td className="border border-[#D4AF37] px-2 py-1 text-[#8B2F2F] font-bold">
                                                {toplamCezalar[i]}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Skor ve Cezalar Birleşik Tablosu */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        📊 Skorlar ve Cezalar
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-[#D4AF37] text-sm text-center bg-[#F3E9DD]">
                            <thead className="bg-[#D4AF37] text-[#3E2723]">
                                <tr>
                                    <th className="border border-[#D4AF37] px-2 py-1 font-bold">Tur</th>
                                    {oyunVerisi.oyuncular.map((oyuncu, i) => (
                                        <th
                                            key={i}
                                            className="border border-[#D4AF37] px-2 py-1 font-bold cursor-pointer hover:bg-[#8B2F2F] hover:text-[#F5E9DA] transition-all duration-200"
                                            onClick={() => isimDuzenlemeBaslat(i)}
                                            title="İsmi düzenlemek için tıklayın"
                                        >
                                            {oyuncu}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {oyunVerisi.skorlar[0] && oyunVerisi.skorlar[0].length > 0 ? oyunVerisi.skorlar[0].map((_, tur) => (
                                    <tr key={tur} className={tur % 2 === 0 ? "bg-[#F3E9DD]" : "bg-[#EAD7C1] hover:bg-[#F5E9DA]"}>
                                        <td className="border border-[#D4AF37] px-2 py-1 font-bold text-[#D4AF37]">{tur + 1}</td>
                                        {oyunVerisi.oyuncular.map((_, oyuncuIndex) => (
                                            <td
                                                key={oyuncuIndex}
                                                className="border border-[#D4AF37] px-2 py-1 text-[#3E2723] cursor-pointer hover:bg-[#D4AF37] hover:text-[#3E2723] transition-all duration-200"
                                                onClick={() => skorDuzenlemeBaslat(oyuncuIndex, tur)}
                                                title="Skoru düzenlemek için tıklayın"
                                            >
                                                {oyunVerisi.skorlar[oyuncuIndex]?.[tur] || 0}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td className="border border-[#D4AF37] px-2 py-1 text-[#A0A0A0] italic" colSpan={oyunVerisi.oyuncular.length + 1}>
                                            Henüz skor girilmemiş
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-[#EAD7C1] text-[#3E2723] font-bold">
                                {(oyunVerisi.skorlar[0]?.length || 0) >= ((oyunVerisi.elSayisi || 9) - 1) && (
                                    <>
                                        <tr>
                                            <td className="border border-[#D4AF37] px-2 py-1">Toplam Skor</td>
                                            {oyunVerisi.skorlar.map((skor, i) => (
                                                <td key={i} className="border border-[#D4AF37] px-2 py-1 bg-[#F3E9DD] text-[#3E2723]">
                                                    {Array.isArray(skor) ? skor.reduce((a, b) => (a || 0) + (b || 0), 0) : 0}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="bg-[#EAD7C1] text-[#8B2F2F]">
                                            <td className="border border-[#D4AF37] px-2 py-1">Toplam Cezalar</td>
                                            {toplamCezalar.map((ceza, i) => (
                                                <td key={i} className="border border-[#D4AF37] px-2 py-1">
                                                    {ceza}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="bg-[#D4AF37] text-[#3E2723] font-bold">
                                            <td className="border border-[#D4AF37] px-2 py-1">Final Skor</td>
                                            {oyunVerisi.skorlar.map((skor, i) => {
                                                const toplamSkor = Array.isArray(skor) ? skor.reduce((a, b) => (a || 0) + (b || 0), 0) : 0;
                                                const toplamCeza = toplamCezalar[i] || 0;
                                                const finalSkor = Math.floor(toplamSkor + toplamCeza);
                                                const isKaybeden = kazanan?.kaybedenIndex === i;
                                                return (
                                                    <td key={i} className={`border border-[#D4AF37] px-2 py-1 ${isKaybeden ? 'bg-[#8B2F2F] text-[#F5E9DA]' : ''}`}>
                                                        {finalSkor}
                                                        {isKaybeden && <span className="ml-1">💀</span>}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </>
                                )}
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Kontrol Paneli */}
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cezalı 101 Cezası Ekleme */}
                <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        ⚠️ Ceza Ekle
                    </h2>
                    <div className="space-y-3">
                        {/* Oyuncu Seçimi */}
                        <div className="space-y-2">
                            <p className="text-[#D4AF37] font-bold text-center">Cezayı Alan Oyuncu:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {oyunVerisi.oyuncular.map((oyuncu, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCezaAlan(i)}
                                        className={`py-2 px-3 rounded-lg font-bold transition-all duration-200 ${cezaAlan === i
                                            ? 'bg-[#D4AF37] text-[#3E2723] shadow-lg'
                                            : 'bg-[#8B2F2F] text-white hover:bg-[#5C1A1B]'
                                            }`}
                                        title={`${oyuncu} için ceza ekle`}
                                    >
                                        {oyuncu}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Ceza puanı"
                                value={cezaSayisi}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Sadece sayı ve boş string kabul et
                                    if (value === '' || /^\d+$/.test(value)) {
                                        setCezaSayisi(value);
                                    }
                                }}
                                onKeyPress={(e) => {
                                    // Sadece sayı tuşlarına izin ver
                                    if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                className="flex-1 p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium"
                            />
                            <button
                                onClick={() => {
                                    const mevcut = parseInt(cezaSayisi) || 0;
                                    setCezaSayisi((mevcut + 10).toString());
                                }}
                                className="px-3 py-2 bg-[#3B5D3A] text-white rounded-lg hover:bg-[#25401F] transition-all duration-200 font-bold text-sm"
                                title="10 artır"
                            >
                                +10
                            </button>
                            <button
                                onClick={() => {
                                    const mevcut = parseInt(cezaSayisi) || 0;
                                    setCezaSayisi((mevcut - 10).toString());
                                }}
                                className="px-3 py-2 bg-[#3B5D3A] text-white rounded-lg hover:bg-[#25401F] transition-all duration-200 font-bold text-sm"
                                title="10 azalt"
                            >
                                -10
                            </button>
                        </div>

                        {/* Hızlı Ceza Butonu */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => setCezaSayisi("100")}
                                className="py-2 px-6 bg-[#D4AF37] text-[#3E2723] rounded-lg hover:bg-[#B8941F] transition-all duration-200 font-bold text-lg"
                                title="100 puan ceza (en çok kullanılan)"
                            >
                                100 Puan Ceza
                            </button>
                        </div>

                        {cezaSayisi && !isNaN(parseInt(cezaSayisi)) && (
                            <div className="text-sm text-white text-center bg-[#8B2F2F] rounded-lg p-2">
                                Eklenecek ceza: {parseInt(cezaSayisi)} puan
                            </div>
                        )}

                        <button
                            onClick={cezaEkle}
                            disabled={cezaAlan === -1 || !cezaSayisi}
                            className="w-full bg-[#8B2F2F] text-white py-2 rounded-lg shadow-lg hover:bg-[#5C1A1B] transition-all duration-300 transform hover:scale-105 border border-[#8B2F2F] font-bold disabled:bg-[#A0A0A0] disabled:cursor-not-allowed"
                        >
                            ⚠️ {cezaAlan !== -1 ? `${oyunVerisi.oyuncular[cezaAlan]} Ceza Ekle` : 'Cezayı Ekle'}
                        </button>
                    </div>
                </div>

                {/* Yeni Tur Ekleme */}
                <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        ✏️ Yeni Tur
                    </h2>
                    <div className="space-y-3">
                        {oyunVerisi.oyuncular.map((oyuncu, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder={`${oyuncu} puan`}
                                        value={yeniSkorlar[i]}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Sadece sayı ve boş string kabul et
                                            if (value === '' || /^\d+$/.test(value)) {
                                                const yeni = [...yeniSkorlar];
                                                yeni[i] = value;
                                                setYeniSkorlar(yeni);
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            // Sadece sayı tuşlarına izin ver
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="flex-1 p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium disabled:bg-[#A0A0A0] disabled:cursor-not-allowed"
                                        disabled={kazanan?.oyunBitti}
                                    />
                                    <button
                                        onClick={() => {
                                            const yeni = [...yeniSkorlar];
                                            const mevcutDeger = parseInt(yeni[i]) || 0;
                                            yeni[i] = (mevcutDeger * 2).toString();
                                            setYeniSkorlar(yeni);
                                        }}
                                        className="px-3 py-2 bg-[#8B2F2F] text-white rounded-lg hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm"
                                        title="2 katına çıkar"
                                        disabled={kazanan?.oyunBitti}
                                    >
                                        2×
                                    </button>
                                    <button
                                        onClick={() => {
                                            const yeni = [...yeniSkorlar];
                                            const mevcutDeger = parseInt(yeni[i]) || 0;
                                            yeni[i] = (mevcutDeger * 4).toString();
                                            setYeniSkorlar(yeni);
                                        }}
                                        className="px-3 py-2 bg-[#8B2F2F] text-white rounded-lg hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm"
                                        title="4 katına çıkar"
                                        disabled={kazanan?.oyunBitti}
                                    >
                                        4×
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const yeni = [...yeniSkorlar];
                                            const mevcutDeger = parseInt(yeni[i]) || 0;
                                            yeni[i] = (mevcutDeger + 200).toString();
                                            setYeniSkorlar(yeni);
                                        }}
                                        className="flex-1 py-1 bg-[#3B5D3A] text-white rounded-lg hover:bg-[#25401F] transition-all duration-200 font-bold text-xs"
                                        title="Eli açmama cezası (200 puan)"
                                        disabled={kazanan?.oyunBitti}
                                    >
                                        +200
                                    </button>
                                    <button
                                        onClick={() => {
                                            const yeni = [...yeniSkorlar];
                                            const mevcutDeger = parseInt(yeni[i]) || 0;
                                            yeni[i] = (mevcutDeger - 100).toString();
                                            setYeniSkorlar(yeni);
                                        }}
                                        className="flex-1 py-1 bg-[#3B5D3A] text-white rounded-lg hover:bg-[#25401F] transition-all duration-200 font-bold text-xs"
                                        title="Bitti cezası (-100 puan)"
                                        disabled={kazanan?.oyunBitti}
                                    >
                                        -100
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={skorEkle}
                            className="w-full bg-[#3B5D3A] text-white py-2 rounded-lg shadow-lg hover:bg-[#25401F] transition-all duration-300 transform hover:scale-105 border border-[#3B5D3A] font-bold disabled:bg-[#A0A0A0] disabled:cursor-not-allowed"
                            disabled={kazanan?.oyunBitti}
                        >
                            ✅ Skorları Ekle
                        </button>
                    </div>
                </div>
            </div>

            {/* Meşrubat Takip Bölümü */}
            <div className="max-w-4xl mx-auto mt-6">
                <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        ☕ Masada İçilen Meşrubatlar
                    </h2>

                    {/* Meşrubat Butonları */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                        {/* Çay */}
                        <div className="relative">
                            <button
                                onClick={() => mesrubatEkle("çay")}
                                className="w-full bg-[#F3E9DD] hover:bg-[#EAD7C1] rounded-lg p-4 border-2 border-[#D4AF37] transition-all duration-200 transform hover:scale-105 text-center group"
                                title="Çay ekle"
                            >
                                <div className="text-2xl mb-2">☕</div>
                                <div className="text-[#3E2723] font-bold text-lg">Çay</div>
                                <div className="text-[#8B2F2F] font-bold text-xl mt-1">
                                    {oyunVerisi.mesrubatlar?.["çay"] || 0}
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Fiyat"
                                        value={oyunVerisi.mesrubatFiyatlari?.["çay"] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                mesrubatFiyatGuncelle("çay", parseFloat(value) || 0);
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (!/[0-9.]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full p-1 text-center text-sm border border-[#D4AF37] rounded bg-[#F5E9DA] text-[#3E2723] placeholder-[#A0A0A0]"
                                        title="Çay fiyatı (örn: 7.50)"
                                    />
                                </div>
                            </button>
                            <button
                                onClick={() => mesrubatCikar("çay")}
                                disabled={!oyunVerisi.mesrubatlar?.["çay"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Çay çıkar"
                            >
                                🗑️
                            </button>
                        </div>

                        {/* Kahve */}
                        <div className="relative">
                            <button
                                onClick={() => mesrubatEkle("kahve")}
                                className="w-full bg-[#F3E9DD] hover:bg-[#EAD7C1] rounded-lg p-4 border-2 border-[#D4AF37] transition-all duration-200 transform hover:scale-105 text-center group"
                                title="Kahve ekle"
                            >
                                <div className="text-2xl mb-2">☕</div>
                                <div className="text-[#3E2723] font-bold text-lg">Kahve</div>
                                <div className="text-[#8B2F2F] font-bold text-xl mt-1">
                                    {oyunVerisi.mesrubatlar?.["kahve"] || 0}
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Fiyat"
                                        value={oyunVerisi.mesrubatFiyatlari?.["kahve"] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                mesrubatFiyatGuncelle("kahve", parseFloat(value) || 0);
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (!/[0-9.]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full p-1 text-center text-sm border border-[#D4AF37] rounded bg-[#F5E9DA] text-[#3E2723] placeholder-[#A0A0A0]"
                                        title="Kahve fiyatı (örn: 7.50)"
                                    />
                                </div>
                            </button>
                            <button
                                onClick={() => mesrubatCikar("kahve")}
                                disabled={!oyunVerisi.mesrubatlar?.["kahve"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Kahve çıkar"
                            >
                                🗑️
                            </button>
                        </div>

                        {/* Ayran */}
                        <div className="relative">
                            <button
                                onClick={() => mesrubatEkle("ayran")}
                                className="w-full bg-[#F3E9DD] hover:bg-[#EAD7C1] rounded-lg p-4 border-2 border-[#D4AF37] transition-all duration-200 transform hover:scale-105 text-center group"
                                title="Ayran ekle"
                            >
                                <div className="text-2xl mb-2">🥛</div>
                                <div className="text-[#3E2723] font-bold text-lg">Ayran</div>
                                <div className="text-[#8B2F2F] font-bold text-xl mt-1">
                                    {oyunVerisi.mesrubatlar?.["ayran"] || 0}
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Fiyat"
                                        value={oyunVerisi.mesrubatFiyatlari?.["ayran"] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                mesrubatFiyatGuncelle("ayran", parseFloat(value) || 0);
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (!/[0-9.]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full p-1 text-center text-sm border border-[#D4AF37] rounded bg-[#F5E9DA] text-[#3E2723] placeholder-[#A0A0A0]"
                                        title="Ayran fiyatı (örn: 7.50)"
                                    />
                                </div>
                            </button>
                            <button
                                onClick={() => mesrubatCikar("ayran")}
                                disabled={!oyunVerisi.mesrubatlar?.["ayran"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Ayran çıkar"
                            >
                                🗑️
                            </button>
                        </div>

                        {/* Kola */}
                        <div className="relative">
                            <button
                                onClick={() => mesrubatEkle("kola")}
                                className="w-full bg-[#F3E9DD] hover:bg-[#EAD7C1] rounded-lg p-4 border-2 border-[#D4AF37] transition-all duration-200 transform hover:scale-105 text-center group"
                                title="Kola ekle"
                            >
                                <div className="text-2xl mb-2">🥤</div>
                                <div className="text-[#3E2723] font-bold text-lg">Kola</div>
                                <div className="text-[#8B2F2F] font-bold text-xl mt-1">
                                    {oyunVerisi.mesrubatlar?.["kola"] || 0}
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Fiyat"
                                        value={oyunVerisi.mesrubatFiyatlari?.["kola"] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                mesrubatFiyatGuncelle("kola", parseFloat(value) || 0);
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (!/[0-9.]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full p-1 text-center text-sm border border-[#D4AF37] rounded bg-[#F5E9DA] text-[#3E2723] placeholder-[#A0A0A0]"
                                        title="Kola fiyatı (örn: 7.50)"
                                    />
                                </div>
                            </button>
                            <button
                                onClick={() => mesrubatCikar("kola")}
                                disabled={!oyunVerisi.mesrubatlar?.["kola"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Kola çıkar"
                            >
                                🗑️
                            </button>
                        </div>

                        {/* Soda */}
                        <div className="relative">
                            <button
                                onClick={() => mesrubatEkle("soda")}
                                className="w-full bg-[#F3E9DD] hover:bg-[#EAD7C1] rounded-lg p-4 border-2 border-[#D4AF37] transition-all duration-200 transform hover:scale-105 text-center group"
                                title="Soda ekle"
                            >
                                <div className="text-2xl mb-2">🥤</div>
                                <div className="text-[#3E2723] font-bold text-lg">Soda</div>
                                <div className="text-[#8B2F2F] font-bold text-xl mt-1">
                                    {oyunVerisi.mesrubatlar?.["soda"] || 0}
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Fiyat"
                                        value={oyunVerisi.mesrubatFiyatlari?.["soda"] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                mesrubatFiyatGuncelle("soda", parseFloat(value) || 0);
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (!/[0-9.]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full p-1 text-center text-sm border border-[#D4AF37] rounded bg-[#F5E9DA] text-[#3E2723] placeholder-[#A0A0A0]"
                                        title="Soda fiyatı (örn: 7.50)"
                                    />
                                </div>
                            </button>
                            <button
                                onClick={() => mesrubatCikar("soda")}
                                disabled={!oyunVerisi.mesrubatlar?.["soda"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Soda çıkar"
                            >
                                🗑️
                            </button>
                        </div>

                        {/* Meyveli Soda */}
                        <div className="relative">
                            <button
                                onClick={() => mesrubatEkle("meyveli-soda")}
                                className="w-full bg-[#F3E9DD] hover:bg-[#EAD7C1] rounded-lg p-4 border-2 border-[#D4AF37] transition-all duration-200 transform hover:scale-105 text-center group"
                                title="Meyveli Soda ekle"
                            >
                                <div className="text-2xl mb-2">🥤</div>
                                <div className="text-[#3E2723] font-bold text-lg">Meyveli Soda</div>
                                <div className="text-[#8B2F2F] font-bold text-xl mt-1">
                                    {oyunVerisi.mesrubatlar?.["meyveli-soda"] || 0}
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Fiyat"
                                        value={oyunVerisi.mesrubatFiyatlari?.["meyveli-soda"] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                mesrubatFiyatGuncelle("meyveli-soda", parseFloat(value) || 0);
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (!/[0-9.]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full p-1 text-center text-sm border border-[#D4AF37] rounded bg-[#F5E9DA] text-[#3E2723] placeholder-[#A0A0A0]"
                                        title="Meyveli Soda fiyatı (örn: 7.50)"
                                    />
                                </div>
                            </button>
                            <button
                                onClick={() => mesrubatCikar("meyveli-soda")}
                                disabled={!oyunVerisi.mesrubatlar?.["meyveli-soda"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Meyveli Soda çıkar"
                            >
                                🗑️
                            </button>
                        </div>

                        {/* Nescafe */}
                        <div className="relative">
                            <button
                                onClick={() => mesrubatEkle("nescafe")}
                                className="w-full bg-[#F3E9DD] hover:bg-[#EAD7C1] rounded-lg p-4 border-2 border-[#D4AF37] transition-all duration-200 transform hover:scale-105 text-center group"
                                title="Nescafe ekle"
                            >
                                <div className="text-2xl mb-2">☕</div>
                                <div className="text-[#3E2723] font-bold text-lg">Nescafe</div>
                                <div className="text-[#8B2F2F] font-bold text-xl mt-1">
                                    {oyunVerisi.mesrubatlar?.["nescafe"] || 0}
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Fiyat"
                                        value={oyunVerisi.mesrubatFiyatlari?.["nescafe"] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                mesrubatFiyatGuncelle("nescafe", parseFloat(value) || 0);
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (!/[0-9.]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full p-1 text-center text-sm border border-[#D4AF37] rounded bg-[#F5E9DA] text-[#3E2723] placeholder-[#A0A0A0]"
                                        title="Nescafe fiyatı (örn: 7.50)"
                                    />
                                </div>
                            </button>
                            <button
                                onClick={() => mesrubatCikar("nescafe")}
                                disabled={!oyunVerisi.mesrubatlar?.["nescafe"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Nescafe çıkar"
                            >
                                🗑️
                            </button>
                        </div>

                        {/* Su */}
                        <div className="relative">
                            <button
                                onClick={() => mesrubatEkle("su")}
                                className="w-full bg-[#F3E9DD] hover:bg-[#EAD7C1] rounded-lg p-4 border-2 border-[#D4AF37] transition-all duration-200 transform hover:scale-105 text-center group"
                                title="Su ekle"
                            >
                                <div className="text-2xl mb-2">💧</div>
                                <div className="text-[#3E2723] font-bold text-lg">Su</div>
                                <div className="text-[#8B2F2F] font-bold text-xl mt-1">
                                    {oyunVerisi.mesrubatlar?.["su"] || 0}
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Fiyat"
                                        value={oyunVerisi.mesrubatFiyatlari?.["su"] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                mesrubatFiyatGuncelle("su", parseFloat(value) || 0);
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (!/[0-9.]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full p-1 text-center text-sm border border-[#D4AF37] rounded bg-[#F5E9DA] text-[#3E2723] placeholder-[#A0A0A0]"
                                        title="Su fiyatı (örn: 7.50)"
                                    />
                                </div>
                            </button>
                            <button
                                onClick={() => mesrubatCikar("su")}
                                disabled={!oyunVerisi.mesrubatlar?.["su"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Su çıkar"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>

                    {/* Kontrol Butonları */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => {
                                // Tüm meşrubatları ve fiyatları sıfırla
                                const guncelVeri: OyunVerisi = {
                                    ...oyunVerisi,
                                    mesrubatlar: {},
                                    mesrubatFiyatlari: {},
                                };
                                saveToStorage(storageKey, guncelVeri);
                                setOyunVerisi(guncelVeri);
                            }}
                            className="bg-[#3B5D3A] hover:bg-[#25401F] text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105"
                        >
                            🔄 Sıfırla
                        </button>
                    </div>

                    {/* Toplam */}
                    <div className="flex items-center justify-between bg-[#D4AF37] rounded-lg p-3 mt-4 border border-[#8B2F2F]">
                        <span className="text-[#3E2723] font-bold text-lg">💰 Toplam Fiyat</span>
                        <span className="text-[#3E2723] font-bold text-xl">
                            {Object.entries(oyunVerisi.mesrubatlar || {}).reduce((toplam, [mesrubatTuru, miktar]) => {
                                const fiyat = oyunVerisi.mesrubatFiyatlari?.[mesrubatTuru] || 0;
                                return toplam + (miktar * fiyat);
                            }, 0).toFixed(2)} ₺
                        </span>
                    </div>
                </div>
            </div>

            {/* Kontrol Butonları */}
            <div className="max-w-md mx-auto mt-6">
                <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        🎮 Kontroller
                    </h2>
                    <div className="space-y-3">
                        <button
                            onClick={oyunuKaydet}
                            className="w-full bg-[#D4AF37] text-[#3E2723] py-2 rounded-lg shadow-lg hover:bg-[#B8941F] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold"
                        >
                            📚 Oyunu Kaydet
                        </button>
                        <button
                            onClick={sifirla}
                            className="w-full bg-[#3B5D3A] text-white py-2 rounded-lg shadow-lg hover:bg-[#25401F] transition-all duration-300 transform hover:scale-105 border border-[#3B5D3A] font-bold"
                        >
                            🔄 Oyunu Sıfırla
                        </button>
                        <button
                            onClick={geri}
                            className="w-full bg-[#8B2F2F] text-white py-2 rounded-lg shadow-lg hover:bg-[#5C1A1B] transition-all duration-300 transform hover:scale-105 border border-[#8B2F2F] font-bold"
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
                <p className="mt-1 text-xs">🎮 Hızlı Skor: 2×, 4×, +200, -100 butonlarını kullanın!</p>
                <p className="mt-1 text-xs">⚠️ Hızlı Ceza: 100 puan butonu, +10/-10 ile ayarlama yapabilirsiniz!</p>
                <p className="mt-1 text-xs">☕ Meşrubat Takibi: Büyük butonlara tıklayarak ekleyin, sağ üstteki - butonlarıyla çıkarın, fiyatları girebilirsiniz!</p>
            </div>
        </div>
    );
}
