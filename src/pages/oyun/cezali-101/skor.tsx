import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getFromStorage, saveToStorage, kayitliOyunKaydet } from "@/utils/storage";
import Link from "next/link";

type OyunVerisi = {
    oyun: string;
    oyuncular: string[];
    skorlar: number[][];
    cezalar: number[][]; // Her oyuncunun ceza listesi
};

export default function Cezali101Skor() {
    const router = useRouter();
    const storageKey = "oyunVerisi_cezali-101";

    const [oyunVerisi, setOyunVerisi] = useState<OyunVerisi | null>(null);
    const [yeniSkorlar, setYeniSkorlar] = useState<string[]>([]);
    const [cezaAlan, setCezaAlan] = useState<number>(-1);
    const [cezaSayisi, setCezaSayisi] = useState<string>("");

    useEffect(() => {
        const veri = getFromStorage<OyunVerisi>(storageKey);
        if (veri) {
            // Eğer cezalar yoksa, eski veriyi yeni formata çevir
            if (!veri.cezalar) {
                veri.cezalar = Array(veri.oyuncular.length).fill([]).map(() => []);
            }
            setOyunVerisi(veri);
            setYeniSkorlar(Array(veri.oyuncular.length).fill(""));
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

    const sifirla = () => {
        if (!oyunVerisi) return;
        const temiz = {
            ...oyunVerisi,
            skorlar: Array(oyunVerisi.oyuncular.length).fill([]).map(() => []),
            cezalar: Array(oyunVerisi.oyuncular.length).fill([]).map(() => []),
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

    // Kazanan kontrolü - 11 el sonucu en yüksek toplam skorlu kaybeder
    const kazananKontrol = () => {
        if (!oyunVerisi) return null;

        const turSayisi = oyunVerisi.skorlar[0]?.length || 0;

        if (turSayisi >= 11) {
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
                    &ldquo;11 el sonucu en yüksek toplam skorlu kaybeder!&rdquo;
                </p>
            </div>

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
                <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                    <h2 className="text-lg font-serif font-bold text-[#D4AF37] text-center mb-3">
                        🎯 El Sayısı
                    </h2>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#D4AF37]">
                            {oyunVerisi.skorlar[0]?.length || 0} / 11
                        </div>
                        <div className="mt-2 bg-[#EAD7C1] rounded-full h-3">
                            <div
                                className="bg-[#8B2F2F] h-3 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(((oyunVerisi.skorlar[0]?.length || 0) / 11) * 100, 100)}%` }}
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
                                            <td className="border border-[#D4AF37] px-2 py-1 font-bold text-[#D4AF37]">{oyuncu}</td>
                                            <td className="border border-[#D4AF37] px-2 py-1 text-[#8B2F2F] text-left">
                                                {cezaListesi.length > 0 ? (
                                                    cezaGruplari.map((grup, grupIndex) => (
                                                        <div key={grupIndex}>
                                                            {grup.join(", ")}
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
                                        <th key={i} className="border border-[#D4AF37] px-2 py-1 font-bold">{oyuncu}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {oyunVerisi.skorlar[0] && oyunVerisi.skorlar[0].length > 0 ? oyunVerisi.skorlar[0].map((_, tur) => (
                                    <tr key={tur} className={tur % 2 === 0 ? "bg-[#F3E9DD]" : "bg-[#EAD7C1] hover:bg-[#F5E9DA]"}>
                                        <td className="border border-[#D4AF37] px-2 py-1 font-bold text-[#D4AF37]">{tur + 1}</td>
                                        {oyunVerisi.oyuncular.map((_, oyuncuIndex) => (
                                            <td key={oyuncuIndex} className="border border-[#D4AF37] px-2 py-1 text-[#3E2723]">
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
                        ⚠️ Cezalı 101 Cezası Ekle
                    </h2>
                    <div className="space-y-3">
                        <select
                            value={cezaAlan}
                            onChange={(e) => setCezaAlan(parseInt(e.target.value))}
                            className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] font-medium focus:border-[#D4AF37] focus:outline-none"
                        >
                            <option value={-1}>Cezayı Alan Oyuncu Seçin</option>
                            {oyunVerisi.oyuncular.map((oyuncu, i) => (
                                <option key={i} value={i}>{oyuncu}</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Ceza puanı"
                            value={cezaSayisi}
                            onChange={(e) => setCezaSayisi(e.target.value)}
                            className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium"
                        />

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
                            ⚠️ Cezayı Ekle
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
                            <input
                                key={i}
                                type="number"
                                placeholder={`${oyuncu} puan`}
                                value={yeniSkorlar[i]}
                                onChange={(e) => {
                                    const yeni = [...yeniSkorlar];
                                    yeni[i] = e.target.value;
                                    setYeniSkorlar(yeni);
                                }}
                                className="w-full p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium disabled:bg-[#A0A0A0] disabled:cursor-not-allowed"
                                disabled={kazanan?.oyunBitti}
                            />
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
                            🔄 Skorları Sıfırla
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
            </div>
        </div>
    );
}
