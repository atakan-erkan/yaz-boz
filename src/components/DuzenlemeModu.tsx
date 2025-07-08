import React from 'react';

type DuzenlemeModuTuru = "kapali" | "skor" | "ceza" | "isim" | "elSayisi";

interface DuzenlemeModuProps {
    duzenlemeModu: DuzenlemeModuTuru;
    duzenlenecekOyuncu: number;
    duzenlenecekTur: number;
    duzenlenecekCezaIndex: number;
    duzenlemeDegeri: string;
    setDuzenlemeDegeri: (deger: string) => void;
    onKaydet: () => void;
    onIptal: () => void;
    oyuncuIsimleri: string[];
}

export default function DuzenlemeModu({
    duzenlemeModu,
    duzenlenecekOyuncu,
    duzenlenecekTur,
    duzenlenecekCezaIndex,
    duzenlemeDegeri,
    setDuzenlemeDegeri,
    onKaydet,
    onIptal,
    oyuncuIsimleri
}: DuzenlemeModuProps) {
    if (duzenlemeModu === "kapali") return null;

    const getModuBasligi = () => {
        switch (duzenlemeModu) {
            case "skor": return "Skor Düzenleme";
            case "ceza": return "Ceza Düzenleme";
            case "isim": return "İsim Düzenleme";
            case "elSayisi": return "El Sayısı Düzenleme";
            default: return "Düzenleme";
        }
    };

    const getModuAciklamasi = () => {
        switch (duzenlemeModu) {
            case "skor":
                return `${oyuncuIsimleri[duzenlenecekOyuncu]} - ${duzenlenecekTur + 1}. Tur`;
            case "ceza":
                return `${oyuncuIsimleri[duzenlenecekOyuncu]} - ${duzenlenecekCezaIndex + 1}. Ceza`;
            case "isim":
                return `${oyuncuIsimleri[duzenlenecekOyuncu]} - İsim Düzenleme`;
            case "elSayisi":
                return "Hedef El Sayısı Düzenleme";
            default:
                return "";
        }
    };

    const isInputText = duzenlemeModu === "isim";

    return (
        <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-[#D4AF37] rounded-lg p-4 shadow-2xl border-2 border-[#8B2F2F] text-center">
                <h3 className="text-lg font-serif font-bold text-[#3E2723] mb-2">
                    ✏️ {getModuBasligi()} Modu
                </h3>
                <p className="text-[#3E2723] mb-3">
                    {getModuAciklamasi()}
                </p>
                <div className="flex gap-2 justify-center">
                    {isInputText ? (
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
                        onClick={onKaydet}
                        className="bg-[#3B5D3A] text-white px-4 py-2 rounded-lg hover:bg-[#25401F] transition-all duration-300 font-bold"
                    >
                        ✅ Kaydet
                    </button>
                    <button
                        onClick={onIptal}
                        className="bg-[#8B2F2F] text-white px-4 py-2 rounded-lg hover:bg-[#5C1A1B] transition-all duration-300 font-bold"
                    >
                        ❌ İptal
                    </button>
                </div>
            </div>
        </div>
    );
} 