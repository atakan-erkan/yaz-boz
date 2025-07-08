import React from 'react';

interface KontrolButonlariProps {
    onOyunuKaydet: () => void;
    onSifirla: () => void;
    onYeniOyunaBasla: () => void;
    disabled?: boolean;
    showOyunuKaydet?: boolean;
    showSifirla?: boolean;
    showYeniOyunaBasla?: boolean;
}

export default function KontrolButonlari({
    onOyunuKaydet,
    onSifirla,
    onYeniOyunaBasla,
    disabled = false,
    showOyunuKaydet = true,
    showSifirla = true,
    showYeniOyunaBasla = true
}: KontrolButonlariProps) {
    return (
        <div className="max-w-md mx-auto mt-6">
            <div className="bg-[#7B4B28] rounded-lg p-4 shadow-2xl border border-[#D4AF37]">
                <h2 className="text-xl font-serif font-bold text-[#D4AF37] text-center mb-4">
                    🎮 Kontroller
                </h2>
                <div className="space-y-3">
                    {showOyunuKaydet && (
                        <button
                            onClick={onOyunuKaydet}
                            className="w-full bg-[#D4AF37] text-[#3E2723] py-2 rounded-lg shadow-lg hover:bg-[#B8941F] transition-all duration-300 transform hover:scale-105 border border-[#D4AF37] font-bold"
                            disabled={disabled}
                        >
                            📚 Oyunu Kaydet
                        </button>
                    )}
                    {showSifirla && (
                        <button
                            onClick={onSifirla}
                            className="w-full bg-[#3B5D3A] text-white py-2 rounded-lg shadow-lg hover:bg-[#25401F] transition-all duration-300 transform hover:scale-105 border border-[#3B5D3A] font-bold"
                            disabled={disabled}
                        >
                            🔄 Oyunu Sıfırla
                        </button>
                    )}
                    {showYeniOyunaBasla && (
                        <button
                            onClick={onYeniOyunaBasla}
                            className="w-full bg-[#8B2F2F] text-white py-2 rounded-lg shadow-lg hover:bg-[#5C1A1B] transition-all duration-300 transform hover:scale-105 border border-[#8B2F2F] font-bold"
                            disabled={disabled}
                        >
                            🏠 Yeni Oyuna Başla
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 