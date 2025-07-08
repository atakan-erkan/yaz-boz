import React from 'react';
import { OyunVerisi, toplamCezalariHesapla } from '@/utils/gameHelpers';

interface CezaTablosuProps {
    oyunVerisi: OyunVerisi;
    onCezaDuzenlemeBaslat: (oyuncuIndex: number, cezaIndex: number) => void;
    onIsimDuzenlemeBaslat: (oyuncuIndex: number) => void;
    onCezaSil: (oyuncuIndex: number, cezaIndex: number) => void;
}

export default function CezaTablosu({
    oyunVerisi,
    onCezaDuzenlemeBaslat,
    onIsimDuzenlemeBaslat,
    onCezaSil
}: CezaTablosuProps) {
    const toplamCezalar = toplamCezalariHesapla(oyunVerisi.cezalar || []);

    return (
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
                                const cezaListesi = oyunVerisi.cezalar?.[i] || [];
                                const cezaGruplari = [];
                                for (let j = 0; j < cezaListesi.length; j += 10) {
                                    cezaGruplari.push(cezaListesi.slice(j, j + 10));
                                }
                                return (
                                    <tr key={i} className={i % 2 === 0 ? "bg-[#F3E9DD]" : "bg-[#EAD7C1] hover:bg-[#F5E9DA]"}>
                                        <td
                                            className="border border-[#D4AF37] px-2 py-1 font-bold text-[#D4AF37] cursor-pointer hover:bg-[#D4AF37] hover:text-[#3E2723] transition-all duration-200"
                                            onClick={() => onIsimDuzenlemeBaslat(i)}
                                            title="İsmi düzenlemek için tıklayın"
                                        >
                                            {oyuncu}
                                        </td>
                                        <td className="border border-[#D4AF37] px-2 py-1 text-[#8B2F2F] text-left">
                                            {cezaListesi.length > 0 ? (
                                                cezaGruplari.map((grup, grupIndex) => (
                                                    <div key={grupIndex}>
                                                        {grup.map((ceza, cezaIndex) => {
                                                            const globalCezaIndex = grupIndex * 10 + cezaIndex;
                                                            return (
                                                                <span key={globalCezaIndex} className="inline-flex items-center gap-1 mr-2 mb-1">
                                                                    <span
                                                                        className="cursor-pointer hover:bg-[#D4AF37] hover:text-[#3E2723] px-1 rounded transition-all duration-200"
                                                                        onClick={() => onCezaDuzenlemeBaslat(i, globalCezaIndex)}
                                                                        title="Ceza düzenle"
                                                                    >
                                                                        {ceza}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => onCezaSil(i, globalCezaIndex)}
                                                                        className="text-[#8B2F2F] hover:text-[#5C1A1B] text-xs font-bold"
                                                                        title="Ceza sil"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </span>
                                                            );
                                                        })}
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
    );
} 