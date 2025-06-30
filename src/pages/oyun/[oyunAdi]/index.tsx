import { useRouter } from "next/router";
import { useState } from "react";
import { saveToStorage } from "@/utils/storage";
import Link from "next/link";

export default function OyunGirisi() {
    const router = useRouter();
    const { oyunAdi } = router.query;

    const [oyuncular, setOyuncular] = useState<string[]>([]);

    const storageKey = `oyunVerisi_${oyunAdi}`;

    const handleOyuncuSayisi = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const count = parseInt(e.target.value);
        setOyuncular(Array(count).fill(""));
    };

    const handleOyuncuIsmi = (index: number, value: string) => {
        const yeniOyuncular = [...oyuncular];
        yeniOyuncular[index] = value;
        setOyuncular(yeniOyuncular);
    };

    const baslat = () => {
        if (oyuncular.some((isim) => !isim.trim())) return alert("Tüm oyuncu isimlerini giriniz");

        saveToStorage(storageKey, {
            oyun: oyunAdi,
            oyuncular,
            skorlar: oyuncular.map(() => []),
        });

        router.push(`/oyun/${oyunAdi}/skor`);
    };

    return (
        <div className="min-h-screen bg-[#F5E9DA] p-4 flex flex-col items-center">
            {/* Kıraathane başlığı */}
            <div className="text-center space-y-2 mb-6">
                <Link href="/" className="text-3xl font-serif font-bold text-[#D4AF37] drop-shadow-lg">
                    🃏 {oyunAdi?.toString().toUpperCase()} Masası 🃏
                </Link>
                <p className="text-[#8B2F2F] text-lg italic">
                    &ldquo;Masaya oturalım, oyun başlasın...&rdquo;
                </p>
            </div>

            {/* Oyun kurulumu */}
            <div className="w-full max-w-md">
                <div className="bg-[#7B4B28] rounded-lg p-6 shadow-2xl border-2 border-[#D4AF37]">
                    <h3 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                        👥 Oyuncu Kurulumu
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[#D4AF37] font-medium mb-2">
                                Oyuncu Sayısı:
                            </label>
                            <select
                                className="w-full p-3 rounded-lg border-2 border-[#D4AF37] bg-[#F3E9DD] text-[#3E2723] font-medium focus:border-[#D4AF37] focus:outline-none"
                                onChange={handleOyuncuSayisi}
                                defaultValue=""
                            >
                                <option value="" disabled>Seçin</option>
                                {[2, 3, 4, 5, 6].map((sayi) => (
                                    <option key={sayi} value={sayi}>{sayi} Oyuncu</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            {oyuncular.map((oyuncu, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    placeholder={`Oyuncu ${index + 1} İsmi`}
                                    className="w-full p-3 border-2 border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium"
                                    value={oyuncu}
                                    onChange={(e) => handleOyuncuIsmi(index, e.target.value)}
                                />
                            ))}
                        </div>

                        {oyuncular.length > 0 && (
                            <button
                                className="w-full mt-6 bg-[#8B2F2F] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#5C1A1B] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold text-lg"
                                onClick={baslat}
                            >
                                🎯 Oyunu Başlat
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Kıraathane detayları */}
            <div className="text-center text-[#3E2723] text-sm opacity-75 mt-8">
                <p>☕ Çay servisi hazır</p>
                <p>🎯 Dostluk ve eğlence garantili</p>
            </div>
        </div>
    );
}
