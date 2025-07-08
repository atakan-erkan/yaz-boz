import React from 'react';
import { OyunVerisi } from '@/utils/gameHelpers';

interface CezaEklemeProps {
    oyunVerisi: OyunVerisi;
    cezaAlan: number;
    setCezaAlan: (index: number) => void;
    cezaSayisi: string;
    setCezaSayisi: (sayi: string) => void;
    onCezaEkle: () => void;
}

export default function CezaEkleme({
    oyunVerisi,
    cezaAlan,
    setCezaAlan,
    cezaSayisi,
    setCezaSayisi,
    onCezaEkle
}: CezaEklemeProps) {
    const handleCezaChange = (value: string) => {
        // Sadece sayı ve boş string kabul et
        if (value === '' || /^\d+$/.test(value)) {
            setCezaSayisi(value);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        // Sadece sayı tuşlarına izin ver
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handleHizliButon = (islem: string) => {
        const mevcut = parseInt(cezaSayisi) || 0;

        switch (islem) {
            case "+10":
                setCezaSayisi((mevcut + 10).toString());
                break;
            case "-10":
                setCezaSayisi((mevcut - 10).toString());
                break;
            case "100":
                setCezaSayisi("100");
                break;
        }
    };

    return (
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
                        onChange={(e) => handleCezaChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 p-2 border border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium"
                    />
                    <button
                        onClick={() => handleHizliButon("+10")}
                        className="px-3 py-2 bg-[#3B5D3A] text-white rounded-lg hover:bg-[#25401F] transition-all duration-200 font-bold text-sm"
                        title="10 artır"
                    >
                        +10
                    </button>
                    <button
                        onClick={() => handleHizliButon("-10")}
                        className="px-3 py-2 bg-[#3B5D3A] text-white rounded-lg hover:bg-[#25401F] transition-all duration-200 font-bold text-sm"
                        title="10 azalt"
                    >
                        -10
                    </button>
                </div>

                {/* Hızlı Ceza Butonu */}
                <div className="flex justify-center">
                    <button
                        onClick={() => handleHizliButon("100")}
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
                    onClick={onCezaEkle}
                    disabled={cezaAlan === -1 || !cezaSayisi}
                    className="w-full bg-[#8B2F2F] text-white py-2 rounded-lg shadow-lg hover:bg-[#5C1A1B] transition-all duration-300 transform hover:scale-105 border border-[#8B2F2F] font-bold disabled:bg-[#A0A0A0] disabled:cursor-not-allowed"
                >
                    ⚠️ {cezaAlan !== -1 ? `${oyunVerisi.oyuncular[cezaAlan]} Ceza Ekle` : 'Cezayı Ekle'}
                </button>
            </div>
        </div>
    );
} 