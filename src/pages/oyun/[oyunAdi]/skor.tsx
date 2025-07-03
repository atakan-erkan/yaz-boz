import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getFromStorage, saveToStorage, kayitliOyunKaydet } from "@/utils/storage";
import Link from "next/link";

type OyunVerisi = {
    oyun: string;
    oyuncular: string[];
    skorlar: number[][];
    mesrubatlar?: { [mesrubatTuru: string]: number }; // Genel meşrubat takibi
    mesrubatFiyatlari?: { [mesrubatTuru: string]: number }; // Meşrubat fiyatları
};

export default function SkorEkrani() {
    const router = useRouter();
    const { oyunAdi } = router.query;
    const [oyunVerisi, setOyunVerisi] = useState<OyunVerisi | null>(null);
    const [yeniSkorlar, setYeniSkorlar] = useState<string[]>([]);

    // Düzenleme modu state'leri
    const [duzenlemeModu, setDuzenlemeModu] = useState<"kapali" | "skor" | "isim">("kapali");
    const [duzenlenecekOyuncu, setDuzenlenecekOyuncu] = useState<number>(-1);
    const [duzenlenecekTur, setDuzenlenecekTur] = useState<number>(-1);
    const [duzenlemeDegeri, setDuzenlemeDegeri] = useState<string>("");

    const storageKey = `oyunVerisi_${oyunAdi}`;

    useEffect(() => {
        const veri = getFromStorage<OyunVerisi>(storageKey);
        if (veri) {
            // Eğer meşrubatlar yoksa, yeni formata çevir
            if (!veri.mesrubatlar) {
                veri.mesrubatlar = {};
            }
            // Eğer meşrubat fiyatları yoksa, yeni formata çevir
            if (!veri.mesrubatFiyatlari) {
                veri.mesrubatFiyatlari = {};
            }
            setOyunVerisi(veri);
            setYeniSkorlar(Array(veri.oyuncular.length).fill(""));
        } else {
            router.push("/"); // veri yoksa ana sayfaya yönlendir
        }
    }, [storageKey]);

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

    const skorlariSifirla = () => {
        if (!oyunVerisi) return;
        const sifirlanmis = {
            ...oyunVerisi,
            skorlar: Array(oyunVerisi.oyuncular.length).fill([]),
            mesrubatlar: {},
            mesrubatFiyatlari: {},
        };
        saveToStorage(storageKey, sifirlanmis);
        setOyunVerisi(sifirlanmis);
    };

    const yeniOyunaBasla = () => {
        localStorage.removeItem(storageKey);
        router.push("/");
    };

    const oyunuKaydet = () => {
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

            {/* Skor tablosu */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-[#7B4B28] rounded-lg p-6 shadow-2xl border-2 border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        📊 Skor Tablosu
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
                                    {oyunVerisi.skorlar.map((oyuncuSkor, i) => (
                                        <td key={i} className="border border-[#D4AF37] px-3 py-2 bg-[#F3E9DD] text-[#3E2723]">
                                            {oyuncuSkor.reduce((a, b) => a + b, 0)}
                                        </td>
                                    ))}
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
                        ✏️ Yeni Tur Skorları
                    </h2>
                    <div className="space-y-3">
                        {oyunVerisi.oyuncular.map((oyuncu, i) => (
                            <input
                                key={i}
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-full p-3 border-2 border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium"
                                placeholder={`${oyuncu} skoru`}
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
                            />
                        ))}
                    </div>

                    <div className="space-y-3 mt-6">
                        <button
                            onClick={skorEkle}
                            className="w-full bg-[#3B5D3A] text-white py-3 rounded-lg shadow-lg hover:bg-[#25401F] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold"
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
                            onClick={skorlariSifirla}
                            className="w-full bg-[#3B5D3A] text-white py-3 rounded-lg shadow-lg hover:bg-[#25401F] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold"
                        >
                            🔄 Skorları Sıfırla
                        </button>

                        <button
                            onClick={yeniOyunaBasla}
                            className="w-full bg-[#8B2F2F] text-white py-3 rounded-lg shadow-lg hover:bg-[#5C1A1B] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold"
                        >
                            🏠 Yeni Oyuna Başla
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
                            </button>
                            <button
                                onClick={() => mesrubatCikar("çay")}
                                disabled={!oyunVerisi.mesrubatlar?.["çay"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Çay çıkar"
                            >
                                🗑️
                            </button>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Fiyat"
                                    value={oyunVerisi.mesrubatFiyatlari?.["çay"] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d+$/.test(value)) {
                                            mesrubatFiyatGuncelle("çay", parseInt(value) || 0);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center text-sm placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>
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
                            </button>
                            <button
                                onClick={() => mesrubatCikar("kahve")}
                                disabled={!oyunVerisi.mesrubatlar?.["kahve"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Kahve çıkar"
                            >
                                🗑️
                            </button>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Fiyat"
                                    value={oyunVerisi.mesrubatFiyatlari?.["kahve"] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d+$/.test(value)) {
                                            mesrubatFiyatGuncelle("kahve", parseInt(value) || 0);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center text-sm placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>
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
                            </button>
                            <button
                                onClick={() => mesrubatCikar("ayran")}
                                disabled={!oyunVerisi.mesrubatlar?.["ayran"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Ayran çıkar"
                            >
                                🗑️
                            </button>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Fiyat"
                                    value={oyunVerisi.mesrubatFiyatlari?.["ayran"] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d+$/.test(value)) {
                                            mesrubatFiyatGuncelle("ayran", parseInt(value) || 0);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center text-sm placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>
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
                            </button>
                            <button
                                onClick={() => mesrubatCikar("kola")}
                                disabled={!oyunVerisi.mesrubatlar?.["kola"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Kola çıkar"
                            >
                                🗑️
                            </button>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Fiyat"
                                    value={oyunVerisi.mesrubatFiyatlari?.["kola"] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d+$/.test(value)) {
                                            mesrubatFiyatGuncelle("kola", parseInt(value) || 0);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center text-sm placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>
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
                            </button>
                            <button
                                onClick={() => mesrubatCikar("soda")}
                                disabled={!oyunVerisi.mesrubatlar?.["soda"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Soda çıkar"
                            >
                                🗑️
                            </button>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Fiyat"
                                    value={oyunVerisi.mesrubatFiyatlari?.["soda"] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d+$/.test(value)) {
                                            mesrubatFiyatGuncelle("soda", parseInt(value) || 0);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center text-sm placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>
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
                            </button>
                            <button
                                onClick={() => mesrubatCikar("meyveli-soda")}
                                disabled={!oyunVerisi.mesrubatlar?.["meyveli-soda"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Meyveli Soda çıkar"
                            >
                                🗑️
                            </button>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Fiyat"
                                    value={oyunVerisi.mesrubatFiyatlari?.["meyveli-soda"] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d+$/.test(value)) {
                                            mesrubatFiyatGuncelle("meyveli-soda", parseInt(value) || 0);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center text-sm placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>
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
                            </button>
                            <button
                                onClick={() => mesrubatCikar("nescafe")}
                                disabled={!oyunVerisi.mesrubatlar?.["nescafe"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Nescafe çıkar"
                            >
                                🗑️
                            </button>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Fiyat"
                                    value={oyunVerisi.mesrubatFiyatlari?.["nescafe"] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d+$/.test(value)) {
                                            mesrubatFiyatGuncelle("nescafe", parseInt(value) || 0);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center text-sm placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>
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
                            </button>
                            <button
                                onClick={() => mesrubatCikar("su")}
                                disabled={!oyunVerisi.mesrubatlar?.["su"]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title="Su çıkar"
                            >
                                🗑️
                            </button>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Fiyat"
                                    value={oyunVerisi.mesrubatFiyatlari?.["su"] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d+$/.test(value)) {
                                            mesrubatFiyatGuncelle("su", parseInt(value) || 0);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] text-center text-sm placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kontrol Butonları */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => {
                                // Tüm meşrubatları sıfırla
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

                    {/* Toplam Fiyat */}
                    <div className="flex items-center justify-between bg-[#D4AF37] rounded-lg p-3 mt-4 border border-[#8B2F2F]">
                        <span className="text-[#3E2723] font-bold text-lg">💰 Toplam Fiyat</span>
                        <span className="text-[#3E2723] font-bold text-xl">
                            {Object.entries(oyunVerisi.mesrubatlar || {}).reduce((toplam, [mesrubatTuru, miktar]) => {
                                const fiyat = oyunVerisi.mesrubatFiyatlari?.[mesrubatTuru] || 0;
                                return toplam + (miktar * fiyat);
                            }, 0)} ₺
                        </span>
                    </div>
                </div>
            </div>

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
