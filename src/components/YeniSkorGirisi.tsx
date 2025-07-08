import React from 'react';
import { OyunVerisi } from '@/utils/gameHelpers';

interface YeniSkorGirisiProps {
    oyunVerisi: OyunVerisi;
    yeniSkorlar: string[];
    setYeniSkorlar: (skorlar: string[]) => void;
    onSkorEkle: () => void;
    disabled?: boolean;
    showHizliButonlar?: boolean;
    oyunTuru?: string;
}

export default function YeniSkorGirisi({
    oyunVerisi,
    yeniSkorlar,
    setYeniSkorlar,
    onSkorEkle,
    disabled = false,
    showHizliButonlar = false,
    oyunTuru = ""
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
            // Okey için özel butonlar
            case "per":
                yeni[index] = "0";
                break;
            case "cifte_gitti":
                yeni[index] = "1";
                break;
            case "uclu_gitti":
                yeni[index] = "2";
                break;
            case "dortlu_gitti":
                yeni[index] = "3";
                break;
            case "serbest":
                yeni[index] = "4";
                break;
            case "cifte_bitti":
                yeni[index] = "5";
                break;
            case "uclu_bitti":
                yeni[index] = "6";
                break;
            case "dortlu_bitti":
                yeni[index] = "7";
                break;
            // Batak için özel butonlar
            case "el":
                yeni[index] = "1";
                break;
            case "kupa_asi":
                yeni[index] = "1";
                break;
            case "kupa_10":
                yeni[index] = "1";
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
                                {showHizliButonlar && oyunTuru === "cezali-101" && (
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
                                {oyunTuru === "okey" && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleHizliButon(i, "per")}
                                            className="px-2 py-2 bg-[#3B5D3A] text-white rounded-lg hover:bg-[#25401F] transition-all duration-200 font-bold text-xs"
                                            title="Per (0 puan)"
                                            disabled={disabled}
                                        >
                                            Per
                                        </button>
                                        <button
                                            onClick={() => handleHizliButon(i, "cifte_gitti")}
                                            className="px-2 py-2 bg-[#8B2F2F] text-white rounded-lg hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-xs"
                                            title="Çifte Gitti (1 puan)"
                                            disabled={disabled}
                                        >
                                            ÇG
                                        </button>
                                        <button
                                            onClick={() => handleHizliButon(i, "uclu_gitti")}
                                            className="px-2 py-2 bg-[#8B2F2F] text-white rounded-lg hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-xs"
                                            title="Üçlü Gitti (2 puan)"
                                            disabled={disabled}
                                        >
                                            ÜG
                                        </button>
                                        <button
                                            onClick={() => handleHizliButon(i, "serbest")}
                                            className="px-2 py-2 bg-[#8B2F2F] text-white rounded-lg hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-xs"
                                            title="Serbest (4 puan)"
                                            disabled={disabled}
                                        >
                                            Ser
                                        </button>
                                    </div>
                                )}
                                {oyunTuru === "batak" && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleHizliButon(i, "el")}
                                            className="px-2 py-2 bg-[#3B5D3A] text-white rounded-lg hover:bg-[#25401F] transition-all duration-200 font-bold text-xs"
                                            title="El (1 puan)"
                                            disabled={disabled}
                                        >
                                            El
                                        </button>
                                        <button
                                            onClick={() => handleHizliButon(i, "kupa_asi")}
                                            className="px-2 py-2 bg-[#8B2F2F] text-white rounded-lg hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-xs"
                                            title="Kupa Ası (1 puan)"
                                            disabled={disabled}
                                        >
                                            A
                                        </button>
                                        <button
                                            onClick={() => handleHizliButon(i, "kupa_10")}
                                            className="px-2 py-2 bg-[#8B2F2F] text-white rounded-lg hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-xs"
                                            title="Kupa 10'u (1 puan)"
                                            disabled={disabled}
                                        >
                                            10
                                        </button>
                                    </div>
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