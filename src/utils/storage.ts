// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveToStorage = (key: string, value: any) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export const getFromStorage = <T>(key: string): T | null => {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
    return null;
};

// Kayıtlı oyunlar için tip tanımları
export type KayitliOyun = {
    id: string;
    oyunAdi: string;
    oyuncular: string[];
    skorlar: number[][];
    cezalar?: number[][];
    mesrubatlar?: { [mesrubatTuru: string]: number }; // Meşrubat takibi
    mesrubatFiyatlari?: { [mesrubatTuru: string]: number }; // Meşrubat fiyatları
    hedefSkor?: number; // Pişti için hedef skor
    elSayisi?: number; // Cezalı 101 için el sayısı
    kayitTarihi: string;
    kayitSaati: string;
};

// Kayıtlı oyunları kaydet
export const kayitliOyunKaydet = (oyunVerisi: { oyuncular: string[]; skorlar: number[][]; cezalar?: number[][]; mesrubatlar?: { [mesrubatTuru: string]: number }; mesrubatFiyatlari?: { [mesrubatTuru: string]: number }; elSayisi?: number }, oyunAdi: string) => {
    if (typeof window !== "undefined") {
        const kayitliOyunlar = getKayitliOyunlar();

        const yeniKayit: KayitliOyun = {
            id: Date.now().toString(),
            oyunAdi: oyunAdi,
            oyuncular: oyunVerisi.oyuncular,
            skorlar: oyunVerisi.skorlar,
            cezalar: oyunVerisi.cezalar || [],
            mesrubatlar: oyunVerisi.mesrubatlar || {},
            mesrubatFiyatlari: oyunVerisi.mesrubatFiyatlari || {},
            elSayisi: oyunVerisi.elSayisi,
            kayitTarihi: new Date().toLocaleDateString('tr-TR'),
            kayitSaati: new Date().toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        kayitliOyunlar.push(yeniKayit);
        localStorage.setItem('kayitliOyunlar', JSON.stringify(kayitliOyunlar));

        return yeniKayit;
    }
};

// Kayıtlı oyunları getir
export const getKayitliOyunlar = (): KayitliOyun[] => {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem('kayitliOyunlar');
        return data ? JSON.parse(data) : [];
    }
    return [];
};

// Kayıtlı oyunu sil
export const kayitliOyunSil = (id: string) => {
    if (typeof window !== "undefined") {
        const kayitliOyunlar = getKayitliOyunlar();
        const filtrelenmisOyunlar = kayitliOyunlar.filter(oyun => oyun.id !== id);
        localStorage.setItem('kayitliOyunlar', JSON.stringify(filtrelenmisOyunlar));
    }
};

// Oyun bitiş mantıkları
export type OyunBitisMantigi = {
    oyunAdi: string;
    hedefSkor?: number; // Pişti için 151, 251 gibi
    turSayisi?: number; // Okey için kaç tur
    kazananKontrol: (skorlar: number[][]) => { oyunBitti: boolean; kazanan?: string; kazananIndex?: number };
};

// Oyun mantıkları
export const oyunMantiklari: OyunBitisMantigi[] = [
    {
        oyunAdi: "Pişti",
        hedefSkor: 151, // Varsayılan, kullanıcı seçebilir
        kazananKontrol: (skorlar: number[][]) => {
            const toplamSkorlar = skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
            const kazananIndex = toplamSkorlar.findIndex(skor => skor >= 151);

            if (kazananIndex !== -1) {
                return { oyunBitti: true, kazanan: `Kazanan`, kazananIndex };
            }
            return { oyunBitti: false };
        }
    },
    {
        oyunAdi: "Cezalı 101",
        turSayisi: 11, // 11 el oynanıyor
        kazananKontrol: (skorlar: number[][], cezalar?: number[][]) => {
            const turSayisi = skorlar[0]?.length || 0;

            if (turSayisi >= 11) {
                const toplamSkorlar = skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
                const toplamCezalar = cezalar ? cezalar.map(cezaListesi =>
                    cezaListesi.reduce((toplam, ceza) => toplam + ceza, 0)
                ) : Array(skorlar.length).fill(0);

                // Skor + ceza toplamları
                const finalSkorlar = toplamSkorlar.map((skor, i) => skor + toplamCezalar[i]);
                const enYuksekSkor = Math.max(...finalSkorlar);
                const kaybedenIndex = finalSkorlar.findIndex(skor => skor === enYuksekSkor);

                return { oyunBitti: true, kazanan: `Kaybeden`, kazananIndex: kaybedenIndex };
            }
            return { oyunBitti: false };
        }
    },
    {
        oyunAdi: "Normal Okey",
        turSayisi: 15, // Okey genelde 15 tur oynanır
        kazananKontrol: (skorlar: number[][]) => {
            const turSayisi = skorlar[0]?.length || 0;

            if (turSayisi >= 15) {
                const toplamSkorlar = skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
                const enDusukSkor = Math.min(...toplamSkorlar);
                const kaybedenIndex = toplamSkorlar.findIndex(skor => skor === enDusukSkor);

                return { oyunBitti: true, kazanan: `Kaybeden`, kazananIndex: kaybedenIndex };
            }
            return { oyunBitti: false };
        }
    },
    {
        oyunAdi: "Batak",
        turSayisi: 13, // Batak 13 el oynanır
        kazananKontrol: (skorlar: number[][]) => {
            const turSayisi = skorlar[0]?.length || 0;

            if (turSayisi >= 13) {
                const toplamSkorlar = skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
                const enYuksekSkor = Math.max(...toplamSkorlar);
                const kazananIndex = toplamSkorlar.findIndex(skor => skor === enYuksekSkor);

                return { oyunBitti: true, kazanan: `Kazanan`, kazananIndex };
            }
            return { oyunBitti: false };
        }
    }
];

// Kayıtlı oyun için kazanan kontrolü
export const kayitliOyunKazananKontrol = (oyun: KayitliOyun) => {
    const mantik = oyunMantiklari.find(m => m.oyunAdi === oyun.oyunAdi);

    if (mantik) {
        if (oyun.oyunAdi === "Pişti" && oyun.hedefSkor) {
            // Pişti için özel hedef skor kontrolü
            const toplamSkorlar = oyun.skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
            const hedefSkor = oyun.hedefSkor;
            const kazananIndex = toplamSkorlar.findIndex(skor => skor >= hedefSkor);

            if (kazananIndex !== -1) {
                return { oyunBitti: true, kazanan: oyun.oyuncular[kazananIndex], kazananIndex };
            }
            return { oyunBitti: false };
        }

        // Cezalı 101 için özel kontrol
        if (oyun.oyunAdi === "Cezalı 101") {
            const turSayisi = oyun.skorlar[0]?.length || 0;
            const hedefElSayisi = oyun.elSayisi || 9;

            if (turSayisi >= hedefElSayisi) {
                const toplamSkorlar = oyun.skorlar.map(skor => skor.reduce((a, b) => a + b, 0));
                const toplamCezalar = oyun.cezalar ? oyun.cezalar.map(cezaListesi =>
                    cezaListesi.reduce((toplam, ceza) => toplam + ceza, 0)
                ) : Array(oyun.skorlar.length).fill(0);

                const finalSkorlar = toplamSkorlar.map((skor, i) => skor + toplamCezalar[i]);
                const enYuksekSkor = Math.max(...finalSkorlar);
                const kaybedenIndex = finalSkorlar.findIndex(skor => skor === enYuksekSkor);

                return {
                    oyunBitti: true,
                    kazanan: oyun.oyuncular[kaybedenIndex],
                    kazananIndex: kaybedenIndex
                };
            }
            return { oyunBitti: false };
        }

        const sonuc = mantik.kazananKontrol(oyun.skorlar);
        if (sonuc.oyunBitti && sonuc.kazananIndex !== undefined) {
            // Oyuncu adını kullan
            const oyuncuAdi = oyun.oyuncular[sonuc.kazananIndex];
            const kazananMetni = `${sonuc.kazanan}: ${oyuncuAdi}`;
            return { ...sonuc, kazanan: kazananMetni };
        }

        return sonuc;
    }

    return { oyunBitti: false };
};

// Kayıtlı oyunu aktif oyun olarak yükle
export const kayitliOyunuYukle = (id: string) => {
    if (typeof window !== "undefined") {
        const kayitliOyunlar = getKayitliOyunlar();
        const oyun = kayitliOyunlar.find(oyun => oyun.id === id);

        if (oyun) {
            // Oyun adına göre doğru storage key'i oluştur
            let storageKey = "";
            switch (oyun.oyunAdi.toLowerCase()) {
                case "cezalı 101":
                case "101":
                    storageKey = "oyunVerisi_cezali-101";
                    break;
                case "pişti":
                    storageKey = "oyunVerisi_pisti";
                    break;
                case "normal okey":
                case "okey":
                    storageKey = "oyunVerisi_okey";
                    break;
                case "batak":
                    storageKey = "oyunVerisi_batak";
                    break;
                default:
                    storageKey = `oyunVerisi_${oyun.oyunAdi.toLowerCase().replace(/\s+/g, '-')}`;
            }

            const oyunVerisi = {
                oyun: oyun.oyunAdi,
                oyuncular: oyun.oyuncular,
                skorlar: oyun.skorlar,
                cezalar: oyun.cezalar || [],
                mesrubatlar: oyun.mesrubatlar || {},
                mesrubatFiyatlari: oyun.mesrubatFiyatlari || {}
            };

            saveToStorage(storageKey, oyunVerisi);
            return { storageKey, oyunAdi: oyun.oyunAdi };
        }
    }
    return null;
};
