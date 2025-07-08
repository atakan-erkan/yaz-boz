import React from 'react';
import { OyunVerisi } from '@/utils/gameHelpers';

interface SkorTablosuProps {
    oyunVerisi: OyunVerisi;
    onSkorDuzenlemeBaslat: (oyuncuIndex: number, turIndex: number) => void;
    onIsimDuzenlemeBaslat: (oyuncuIndex: number) => void;
    kazananIndex?: number;
    showCezalar?: boolean;
    toplamCezalar?: number[];
    oyunBitti?: boolean;
}

export default function SkorTablosu({
    oyunVerisi,
    onSkorDuzenlemeBaslat,
    onIsimDuzenlemeBaslat,
    kazananIndex,
    showCezalar = false,
    toplamCezalar = [],
    oyunBitti = false
}: SkorTablosuProps) {
    const hasSkorlar = oyunVerisi.skorlar[0] && oyunVerisi.skorlar[0].length > 0;

    return (
        <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                    📊 {showCezalar ? "Skorlar ve Cezalar" : "Skor Tablosu"}
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-[#D4AF37] text-sm text-center bg-[#F3E9DD]">
                        <thead className="bg-[#D4AF37] text-[#3E2723]">
                            <tr>
                                <th className="border border-[#D4AF37] px-2 py-1 font-bold">Tur</th>
                                {oyunVerisi.oyuncular.map((oyuncu, i) => (
                                    <th
                                        key={i}
                                        className="border border-[#D4AF37] px-2 py-1 font-bold cursor-pointer hover:bg-[#8B2F2F] hover:text-[#F5E9DA] transition-all duration-200"
                                        onClick={() => onIsimDuzenlemeBaslat(i)}
                                        title="İsmi düzenlemek için tıklayın"
                                    >
                                        {oyuncu}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {hasSkorlar ? oyunVerisi.skorlar[0].map((_, tur) => (
                                <tr key={tur} className={tur % 2 === 0 ? "bg-[#F3E9DD]" : "bg-[#EAD7C1] hover:bg-[#F5E9DA]"}>
                                    <td className="border border-[#D4AF37] px-2 py-1 font-bold text-[#D4AF37]">{tur + 1}</td>
                                    {oyunVerisi.oyuncular.map((_, oyuncuIndex) => (
                                        <td
                                            key={oyuncuIndex}
                                            className="border border-[#D4AF37] px-2 py-1 text-[#3E2723] cursor-pointer hover:bg-[#D4AF37] hover:text-[#3E2723] transition-all duration-200"
                                            onClick={() => onSkorDuzenlemeBaslat(oyuncuIndex, tur)}
                                            title="Skoru düzenlemek için tıklayın"
                                        >
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
                        {hasSkorlar && (
                            <tfoot className="bg-[#EAD7C1] text-[#3E2723] font-bold">
                                {oyunBitti && <tr>
                                    <td className="border border-[#D4AF37] px-2 py-1">Toplam Skor</td>
                                    {oyunVerisi.skorlar.map((skor, i) => (
                                        <td key={i} className="border border-[#D4AF37] px-2 py-1 bg-[#F3E9DD] text-[#3E2723]">
                                            {Array.isArray(skor) ? skor.reduce((a, b) => (a || 0) + (b || 0), 0) : 0}
                                        </td>
                                    ))}
                                </tr>}
                                {showCezalar && toplamCezalar.length > 0 && (
                                    <tr className="bg-[#EAD7C1] text-[#8B2F2F]">
                                        <td className="border border-[#D4AF37] px-2 py-1">Toplam Cezalar</td>
                                        {toplamCezalar.map((ceza, i) => (
                                            <td key={i} className="border border-[#D4AF37] px-2 py-1">
                                                {ceza}
                                            </td>
                                        ))}
                                    </tr>
                                )}
                                {showCezalar && oyunBitti && (
                                    <tr className="bg-[#D4AF37] text-[#3E2723] font-bold">
                                        <td className="border border-[#D4AF37] px-2 py-1">Final Skor</td>
                                        {oyunVerisi.skorlar.map((skor, i) => {
                                            const toplamSkor = Array.isArray(skor) ? skor.reduce((a, b) => (a || 0) + (b || 0), 0) : 0;
                                            const toplamCeza = toplamCezalar[i] || 0;
                                            const finalSkor = toplamSkor + toplamCeza; // Cezalar eklenir
                                            const isKaybeden = kazananIndex === i;
                                            return (
                                                <td key={i} className={`border border-[#D4AF37] px-2 py-1 ${isKaybeden ? 'bg-[#8B2F2F] text-[#F5E9DA]' : 'bg-[#F3E9DD] text-[#3E2723]'}`}>
                                                    {finalSkor}
                                                    {isKaybeden && <span className="ml-1">💀</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                )}
                                {!showCezalar && kazananIndex !== undefined && (
                                    <tr className="bg-[#D4AF37] text-[#3E2723] font-bold">
                                        <td className="border border-[#D4AF37] px-2 py-1">Toplam</td>
                                        {oyunVerisi.skorlar.map((skor, i) => {
                                            const toplamSkor = skor.reduce((a, b) => a + b, 0);
                                            const isKazanan = kazananIndex === i;
                                            return (
                                                <td key={i} className={`border border-[#D4AF37] px-2 py-1 ${isKazanan ? 'bg-[#D4AF37] text-[#3E2723]' : 'bg-[#F3E9DD] text-[#3E2723]'}`}>
                                                    {toplamSkor}
                                                    {isKazanan && <span className="ml-1">🏆</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                )}
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
} 