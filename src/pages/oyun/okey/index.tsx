import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { saveToStorage } from "@/utils/storage";

export default function OkeyOyunu() {
    const router = useRouter();
    const [oyuncuSayisi, setOyuncuSayisi] = useState<number>(4);
    const [oyuncular, setOyuncular] = useState<string[]>(["", "", "", ""]);

    const handleOyuncuSayisiChange = (sayi: number) => {
        setOyuncuSayisi(sayi);
        const yeniOyuncular = Array(sayi).fill("").map((_, i) => oyuncular[i] || "");
        setOyuncular(yeniOyuncular);
    };

    const handleOyuncuChange = (index: number, value: string) => {
        const yeniOyuncular = [...oyuncular];
        yeniOyuncular[index] = value;
        setOyuncular(yeniOyuncular);
    };

    const handleBasla = () => {
        const bosOyuncular = oyuncular.filter(oyuncu => oyuncu.trim() === "");
        if (bosOyuncular.length > 0) {
            alert("⚠️ Lütfen tüm oyuncu isimlerini girin!");
            return;
        }

        const oyunVerisi = {
            oyun: "Normal Okey",
            oyuncular: oyuncular,
            skorlar: Array(oyuncuSayisi).fill([]).map(() => []),
            mesrubatlar: {},
            mesrubatFiyatlari: {},
        };

        saveToStorage("oyunVerisi_okey", oyunVerisi);
        router.push("/oyun/okey/skor");
    };

    return (
        <div className="min-h-screen bg-[#F5E9DA] p-4">
            {/* Kıraathane başlığı */}
            <div className="text-center space-y-2 mb-6">
                <Link href="/" className="text-3xl font-serif font-bold text-[#D4AF37] drop-shadow-lg">
                    🃏 Normal Okey Masası 🃏
                </Link>
                <p className="text-[#8B2F2F] text-lg italic">
                    &ldquo;Okey! Okey! Okey!&rdquo;
                </p>
            </div>

            {/* Oyun Kuralları */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-white rounded-lg p-6 shadow-lg border border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        📋 Okey Kuralları
                    </h2>
                    <div className="text-[#3E2723] space-y-2 text-sm">
                        <p><strong>🎯 Oyun Hedefi:</strong> En düşük skora sahip oyuncu kazanır</p>
                        <p><strong>⏱️ Oyun Süresi:</strong> 15 tur</p>
                        <p><strong>📊 Skor Sistemi:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li><strong>Per:</strong> 0 puan (en iyi)</li>
                            <li><strong>Çifte Gitti:</strong> 1 puan</li>
                            <li><strong>Üçlü Gitti:</strong> 2 puan</li>
                            <li><strong>Dörtlü Gitti:</strong> 3 puan</li>
                            <li><strong>Serbest:</strong> 4 puan</li>
                            <li><strong>Çifte Bitti:</strong> 5 puan</li>
                            <li><strong>Üçlü Bitti:</strong> 6 puan</li>
                            <li><strong>Dörtlü Bitti:</strong> 7 puan</li>
                        </ul>
                        <p><strong>🏆 Kazanan:</strong> 15 tur sonunda en düşük toplam skora sahip oyuncu</p>
                    </div>
                </div>
            </div>

            {/* Oyuncu Sayısı Seçimi */}
            <div className="max-w-md mx-auto mb-6">
                <div className="bg-[#7B4B28] rounded-lg p-6 shadow-2xl border-2 border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        👥 Oyuncu Sayısı
                    </h2>
                    <div className="flex space-x-2">
                        {[2, 3, 4].map((sayi) => (
                            <button
                                key={sayi}
                                onClick={() => handleOyuncuSayisiChange(sayi)}
                                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 ${oyuncuSayisi === sayi
                                    ? "bg-[#D4AF37] text-[#3E2723]"
                                    : "bg-[#F3E9DD] text-[#3E2723] hover:bg-[#EAD7C1]"
                                    }`}
                            >
                                {sayi} Kişi
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Oyuncu İsimleri */}
            <div className="max-w-md mx-auto mb-6">
                <div className="bg-[#7B4B28] rounded-lg p-6 shadow-2xl border-2 border-[#D4AF37]">
                    <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        👤 Oyuncu İsimleri
                    </h2>
                    <div className="space-y-3">
                        {oyuncular.map((oyuncu, i) => (
                            <input
                                key={i}
                                type="text"
                                placeholder={`${i + 1}. Oyuncu`}
                                value={oyuncu}
                                onChange={(e) => handleOyuncuChange(i, e.target.value)}
                                className="w-full p-3 border-2 border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Başla Butonu */}
            <div className="max-w-md mx-auto">
                <button
                    onClick={handleBasla}
                    className="w-full bg-[#3B5D3A] text-white py-4 rounded-lg shadow-lg hover:bg-[#25401F] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold text-xl"
                >
                    🎮 Okey Masasına Otur
                </button>
            </div>

            {/* Kıraathane detayları */}
            <div className="text-center text-[#3E2723] text-sm opacity-75 mt-8">
                <p>☕ Çay servisi mevcuttur</p>
                <p>🎯 Dostluk ve eğlence garantili</p>
                <p className="mt-2 text-xs">💡 İpucu: Okey&apos;de en düşük skor alan kazanır!</p>
            </div>
        </div>
    );
} 