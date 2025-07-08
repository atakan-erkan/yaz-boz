import React from 'react';
import { OyunVerisi, mesrubatEkle, mesrubatCikar, mesrubatFiyatGuncelle, toplamMesrubatFiyatiniHesapla, MESRUBAT_TURLERI } from '@/utils/gameHelpers';

interface MesrubatTakipProps {
    oyunVerisi: OyunVerisi;
    storageKey: string;
    setOyunVerisi: (veri: OyunVerisi) => void;
    allowDecimal?: boolean; // Cezalı 101 için ondalık fiyat desteği
}

export default function MesrubatTakip({ oyunVerisi, storageKey, setOyunVerisi, allowDecimal = false }: MesrubatTakipProps) {
    const handleMesrubatEkle = (mesrubatTuru: string) => {
        mesrubatEkle(oyunVerisi, storageKey, setOyunVerisi, mesrubatTuru);
    };

    const handleMesrubatCikar = (mesrubatTuru: string) => {
        mesrubatCikar(oyunVerisi, storageKey, setOyunVerisi, mesrubatTuru);
    };

    const handleFiyatGuncelle = (mesrubatTuru: string, fiyat: number) => {
        mesrubatFiyatGuncelle(oyunVerisi, storageKey, setOyunVerisi, mesrubatTuru, fiyat);
    };

    const handleMesrubatlariSifirla = () => {
        const guncelVeri: OyunVerisi = {
            ...oyunVerisi,
            mesrubatlar: {},
            mesrubatFiyatlari: {},
        };
        // saveToStorage fonksiyonunu import etmek yerine doğrudan kullanıyoruz
        localStorage.setItem(storageKey, JSON.stringify(guncelVeri));
        setOyunVerisi(guncelVeri);
    };

    const toplamFiyat = toplamMesrubatFiyatiniHesapla(oyunVerisi.mesrubatlar || {}, oyunVerisi.mesrubatFiyatlari || {});

    return (
        <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                    ☕ Masada İçilen Meşrubatlar
                </h2>

                {/* Meşrubat Butonları */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                    {MESRUBAT_TURLERI.map((mesrubat) => (
                        <div key={mesrubat.id} className="relative">
                            <button
                                onClick={() => handleMesrubatEkle(mesrubat.id)}
                                className="w-full bg-[#F3E9DD] hover:bg-[#EAD7C1] rounded-lg p-4 border-2 border-[#D4AF37] transition-all duration-200 transform hover:scale-105 text-center group"
                                title={`${mesrubat.ad} ekle`}
                            >
                                <div className="text-2xl mb-2">{mesrubat.emoji}</div>
                                <div className="text-[#3E2723] font-bold text-lg">{mesrubat.ad}</div>
                                <div className="text-[#8B2F2F] font-bold text-xl mt-1">
                                    {oyunVerisi.mesrubatlar?.[mesrubat.id] || 0}
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        step={allowDecimal ? "0.01" : "1"}
                                        min="0"
                                        placeholder="Fiyat"
                                        value={oyunVerisi.mesrubatFiyatlari?.[mesrubat.id] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (allowDecimal) {
                                                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                    handleFiyatGuncelle(mesrubat.id, parseFloat(value) || 0);
                                                }
                                            } else {
                                                if (value === '' || /^\d+$/.test(value)) {
                                                    handleFiyatGuncelle(mesrubat.id, parseInt(value) || 0);
                                                }
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (allowDecimal) {
                                                if (!/[0-9.]/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            } else {
                                                if (!/[0-9]/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }
                                        }}
                                        className="w-full p-1 text-center text-sm border border-[#D4AF37] rounded bg-[#F5E9DA] text-[#3E2723] placeholder-[#A0A0A0]"
                                        title={`${mesrubat.ad} fiyatı ${allowDecimal ? '(örn: 7.50)' : ''}`}
                                    />
                                </div>
                            </button>
                            <button
                                onClick={() => handleMesrubatCikar(mesrubat.id)}
                                disabled={!oyunVerisi.mesrubatlar?.[mesrubat.id]}
                                className="absolute top-2 right-2 w-6 h-6 bg-[#8B2F2F] text-white rounded-full hover:bg-[#5C1A1B] transition-all duration-200 font-bold text-sm disabled:bg-[#A0A0A0] disabled:cursor-not-allowed shadow-lg"
                                title={`${mesrubat.ad} çıkar`}
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>

                {/* Kontrol Butonları */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleMesrubatlariSifirla}
                        className="bg-[#3B5D3A] hover:bg-[#25401F] text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105"
                    >
                        🔄 Sıfırla
                    </button>
                </div>

                {/* Toplam Fiyat */}
                <div className="flex items-center justify-between bg-[#D4AF37] rounded-lg p-3 mt-4 border border-[#8B2F2F]">
                    <span className="text-[#3E2723] font-bold text-lg">💰 Toplam Fiyat</span>
                    <span className="text-[#3E2723] font-bold text-xl">
                        {allowDecimal ? toplamFiyat.toFixed(2) : toplamFiyat} ₺
                    </span>
                </div>
            </div>
        </div>
    );
} 