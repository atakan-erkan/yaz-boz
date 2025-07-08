import React from 'react';
import { OyunVerisi } from '@/utils/gameHelpers';

interface YeniSkorGirisiProps {
    oyunVerisi: OyunVerisi;
    yeniSkorlar: string[];
    setYeniSkorlar: (skorlar: string[]) => void;
    onSkorEkle: () => void;
    disabled?: boolean;
    showHizliButonlar?: boolean;
}

export default function YeniSkorGirisi({
    oyunVerisi,
    yeniSkorlar,
    setYeniSkorlar,
    onSkorEkle,
    disabled = false,
    showHizliButonlar = false
}: YeniSkorGirisiProps) {
    const handleSkorChange = (index: number, value: string) => {
        // Sadece sayı ve boş string kabul et
        if (value === '' || /^\d+$/.test(value)) {
            const yeni = [...yeniSkorlar];
            yeni[index] = value;
            setYeniSkorlar(yeni);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        // Sadece sayı tuşlarına izin ver
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handleHizliButon = (index: number, islem: string) => {
        const yeni = [...yeniSkorlar];
        const mevcutDeger = parseInt(yeni[index]) || 0;

        switch (islem) {
            case "2x":
                yeni[index] = (mevcutDeger * 2).toString();
                break;
            case "4x":
                yeni[index] = (mevcutDeger * 4).toString();
                break;
            case "+200":
                yeni[index] = (mevcutDeger + 200).toString();
                break;
            case "-100":
                yeni[index] = (mevcutDeger - 100).toString();
                break;
        }

        setYeniSkorlar(yeni);
    };

    return (
        <div className="max-w-md mx-auto mt-6">
            <div className="bg-[#7B4B28] rounded-lg p-6 shadow-2xl border-2 border-[#D4AF37]">
                <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                    ✏️ Yeni Tur Puanları
                </h2>
                <div className="space-y-3">
                    {oyunVerisi.oyuncular.map((oyuncu, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder={`${oyuncu} puanı`}
                                    value={yeniSkorlar[i]}
                                    onChange={(e) => handleSkorChange(i, e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1 p-3 border-2 border-[#D4AF37] rounded-lg bg-[#F3E9DD] text-[#3E2723] placeholder-[#A0A0A0] focus:border-[#D4AF37] focus:outline-none font-medium disabled:bg-[#A0A0A0] disabled:cursor-not-allowed"
                                    disabled={disabled}
                                />
                                {showHizliButonlar && (
                                    <>
                                        <button
                                            onClick={() => handleHizliButon(i, "2x")}
                                            className="px-3 py-2 bg-[#8B2F2F] text-white rounded-lg hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm"
                                            title="2 katına çıkar"
                                            disabled={disabled}
                                        >
                                            2×
                                        </button>
                                        <button
                                            onClick={() => handleHizliButon(i, "4x")}
                                            className="px-3 py-2 bg-[#8B2F2F] text-white rounded-lg hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm"
                                            title="4 katına çıkar"
                                            disabled={disabled}
                                        >
                                            4×
                                        </button>
                                    </>
                                )}
                            </div>
                            {showHizliButonlar && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleHizliButon(i, "+200")}
                                        className="flex-1 py-1 bg-[#3B5D3A] text-white rounded-lg hover:bg-[#25401F] transition-all duration-200 font-bold text-xs"
                                        title="Eli açmama cezası (200 puan)"
                                        disabled={disabled}
                                    >
                                        +200
                                    </button>
                                    <button
                                        onClick={() => handleHizliButon(i, "-100")}
                                        className="flex-1 py-1 bg-[#3B5D3A] text-white rounded-lg hover:bg-[#25401F] transition-all duration-200 font-bold text-xs"
                                        title="Bitti cezası (-100 puan)"
                                        disabled={disabled}
                                    >
                                        -100
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="space-y-3 mt-6">
                    <button
                        onClick={onSkorEkle}
                        className="w-full bg-[#3B5D3A] text-white py-3 rounded-lg shadow-lg hover:bg-[#25401F] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold disabled:bg-[#A0A0A0] disabled:cursor-not-allowed"
                        disabled={disabled}
                    >
                        ✅ Skorları Ekle
                    </button>
                </div>
            </div>
        </div>
    );
} 