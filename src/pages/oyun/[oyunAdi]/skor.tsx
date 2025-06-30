import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getFromStorage, saveToStorage, kayitliOyunKaydet } from "@/utils/storage";
import Link from "next/link";

type OyunVerisi = {
    oyun: string;
    oyuncular: string[];
    skorlar: number[][];
};

export default function SkorEkrani() {
    const router = useRouter();
    const { oyunAdi } = router.query;
    const [oyunVerisi, setOyunVerisi] = useState<OyunVerisi | null>(null);
    const [yeniSkorlar, setYeniSkorlar] = useState<string[]>([]);

    const storageKey = `oyunVerisi_${oyunAdi}`;

    useEffect(() => {
        const veri = getFromStorage<OyunVerisi>(storageKey);
        if (veri) {
            setOyunVerisi(veri);
            setYeniSkorlar(Array(veri.oyuncular.length).fill(""));
        } else {
            router.push("/"); // veri yoksa ana sayfaya yönlendir
        }
    }, [storageKey]);

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

    const skorlariSifirla = () => {
        if (!oyunVerisi) return;
        const sifirlanmis = {
            ...oyunVerisi,
            skorlar: Array(oyunVerisi.oyuncular.length).fill([]),
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
                                        <th key={i} className="border border-[#D4AF37] px-3 py-2 font-bold">{oyuncu}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {oyunVerisi.skorlar[0].map((_, tur) => (
                                    <tr key={tur} className={tur % 2 === 0 ? "bg-[#F3E9DD]" : "bg-[#EAD7C1] hover:bg-[#F5E9DA]"}>
                                        <td className="border border-[#D4AF37] px-3 py-2 font-bold text-[#D4AF37]">{tur + 1}</td>
                                        {oyunVerisi.oyuncular.map((_, oyuncuIndex) => (
                                            <td key={oyuncuIndex} className="border border-[#D4AF37] px-3 py-2 text-[#3E2723]">
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
                                className="w-full p-3 border-2 border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium"
                                placeholder={`${oyuncu} skoru`}
                                value={yeniSkorlar[i]}
                                onChange={(e) => {
                                    const yeni = [...yeniSkorlar];
                                    yeni[i] = e.target.value;
                                    setYeniSkorlar(yeni);
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

            {/* Kıraathane detayları */}
            <div className="text-center text-[#3E2723] text-sm opacity-75 mt-8">
                <p>☕ Çay servisi mevcuttur</p>
                <p>🎯 Dostluk ve eğlence garantili</p>
            </div>
        </div>
    );
}
