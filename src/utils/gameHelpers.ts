import { saveToStorage } from "./storage";

// Oyun verisi tipi
export type OyunVerisi = {
    oyun: string;
    oyuncular: string[];
    skorlar: number[][];
    cezalar?: number[][]; // Her oyuncunun ceza listesi (Cezalı 101 için)
    mesrubatlar?: { [mesrubatTuru: string]: number }; // Genel meşrubat takibi
    mesrubatFiyatlari?: { [mesrubatTuru: string]: number }; // Meşrubat fiyatları (küsüratlı)
    elSayisi?: number; // El sayısı (Cezalı 101 için)
    hedefSkor?: number; // Pişti için hedef skor
};

// Meşrubat yönetimi fonksiyonları
export const mesrubatEkle = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    mesrubatTuru: string,
    miktar: number = 1
) => {
    if (!oyunVerisi) return;

    const guncellenmisMesrubatlar = { ...oyunVerisi.mesrubatlar };

    if (!guncellenmisMesrubatlar[mesrubatTuru]) {
        guncellenmisMesrubatlar[mesrubatTuru] = 0;
    }

    guncellenmisMesrubatlar[mesrubatTuru] += miktar;

    const guncelVeri: OyunVerisi = {
        ...oyunVerisi,
        mesrubatlar: guncellenmisMesrubatlar,
    };

    saveToStorage(storageKey, guncelVeri);
    setOyunVerisi(guncelVeri);
};

export const mesrubatCikar = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    mesrubatTuru: string,
    miktar: number = 1
) => {
    if (!oyunVerisi) return;

    const guncellenmisMesrubatlar = { ...oyunVerisi.mesrubatlar };

    if (!guncellenmisMesrubatlar[mesrubatTuru]) {
        return;
    }

    guncellenmisMesrubatlar[mesrubatTuru] = Math.max(0, guncellenmisMesrubatlar[mesrubatTuru] - miktar);

    const guncelVeri: OyunVerisi = {
        ...oyunVerisi,
        mesrubatlar: guncellenmisMesrubatlar,
    };

    saveToStorage(storageKey, guncelVeri);
    setOyunVerisi(guncelVeri);
};

export const mesrubatFiyatGuncelle = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    mesrubatTuru: string,
    fiyat: number
) => {
    if (!oyunVerisi) return;

    const guncellenmisFiyatlar = { ...oyunVerisi.mesrubatFiyatlari };
    guncellenmisFiyatlar[mesrubatTuru] = fiyat;

    const guncelVeri: OyunVerisi = {
        ...oyunVerisi,
        mesrubatFiyatlari: guncellenmisFiyatlar,
    };

    saveToStorage(storageKey, guncelVeri);
    setOyunVerisi(guncelVeri);
};

// Skor yönetimi fonksiyonları
export const skorEkle = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    yeniSkorlar: string[],
    setYeniSkorlar: (skorlar: string[]) => void
) => {
    if (!oyunVerisi) return;

    // Boş skor kontrolü
    const bosSkorlar = yeniSkorlar.filter(skor => skor.trim() === "");
    if (bosSkorlar.length > 0) {
        alert("⚠️ Lütfen tüm oyuncuların skorlarını girin!");
        return;
    }

    const sayilar = yeniSkorlar.map((s) => parseInt(s) || 0);
    const guncellenmisSkorlar = oyunVerisi.skorlar.map((skorlar, i) => [
        ...skorlar,
        sayilar[i],
    ]);

    const guncelVeri: OyunVerisi = {
        ...oyunVerisi,
        skorlar: guncellenmisSkorlar,
    };

    saveToStorage(storageKey, guncelVeri);
    setOyunVerisi(guncelVeri);
    setYeniSkorlar(Array(guncelVeri.oyuncular.length).fill(""));
};

export const skorDuzenle = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    duzenlenecekOyuncu: number,
    duzenlenecekTur: number,
    duzenlemeDegeri: string,
    duzenlemeModunuKapat: () => void
) => {
    if (!oyunVerisi || duzenlenecekOyuncu === -1 || duzenlenecekTur === -1 || !duzenlemeDegeri) return;

    const yeniDeger = parseInt(duzenlemeDegeri);
    if (isNaN(yeniDeger)) return;

    const guncellenmisSkorlar = [...oyunVerisi.skorlar];
    guncellenmisSkorlar[duzenlenecekOyuncu] = [...guncellenmisSkorlar[duzenlenecekOyuncu]];
    guncellenmisSkorlar[duzenlenecekOyuncu][duzenlenecekTur] = yeniDeger;

    const guncelVeri: OyunVerisi = {
        ...oyunVerisi,
        skorlar: guncellenmisSkorlar,
    };

    saveToStorage(storageKey, guncelVeri);
    setOyunVerisi(guncelVeri);
    duzenlemeModunuKapat();
};

// İsim yönetimi fonksiyonları
export const isimDuzenle = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    duzenlenecekOyuncu: number,
    duzenlemeDegeri: string,
    duzenlemeModunuKapat: () => void
) => {
    if (!oyunVerisi || duzenlenecekOyuncu === -1 || !duzenlemeDegeri.trim()) return;

    const yeniIsim = duzenlemeDegeri.trim();
    if (yeniIsim.length === 0) return;

    const guncellenmisOyuncular = [...oyunVerisi.oyuncular];
    guncellenmisOyuncular[duzenlenecekOyuncu] = yeniIsim;

    const guncelVeri: OyunVerisi = {
        ...oyunVerisi,
        oyuncular: guncellenmisOyuncular,
    };

    saveToStorage(storageKey, guncelVeri);
    setOyunVerisi(guncelVeri);
    duzenlemeModunuKapat();
};

// Ceza yönetimi fonksiyonları (Cezalı 101 için)
export const cezaEkle = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    cezaAlan: number,
    cezaSayisi: string,
    setCezaAlan: (index: number) => void,
    setCezaSayisi: (sayi: string) => void
) => {
    if (!oyunVerisi || cezaAlan === -1 || !cezaSayisi) return;

    const cezaMiktari = parseInt(cezaSayisi);
    if (isNaN(cezaMiktari) || cezaMiktari <= 0) return;

    const guncellenmisCezalar = [...(oyunVerisi.cezalar || [])];
    guncellenmisCezalar[cezaAlan] = [...(guncellenmisCezalar[cezaAlan] || []), cezaMiktari];

    const guncelVeri: OyunVerisi = {
        ...oyunVerisi,
        cezalar: guncellenmisCezalar,
    };

    saveToStorage(storageKey, guncelVeri);
    setOyunVerisi(guncelVeri);
    setCezaAlan(-1);
    setCezaSayisi("");
};

export const cezaDuzenle = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    duzenlenecekOyuncu: number,
    duzenlenecekCezaIndex: number,
    duzenlemeDegeri: string,
    duzenlemeModunuKapat: () => void
) => {
    if (!oyunVerisi || duzenlenecekOyuncu === -1 || duzenlenecekCezaIndex === -1 || !duzenlemeDegeri) return;

    const yeniDeger = parseInt(duzenlemeDegeri);
    if (isNaN(yeniDeger) || yeniDeger <= 0) return;

    const guncellenmisCezalar = [...(oyunVerisi.cezalar || [])];
    guncellenmisCezalar[duzenlenecekOyuncu] = [...(guncellenmisCezalar[duzenlenecekOyuncu] || [])];
    guncellenmisCezalar[duzenlenecekOyuncu][duzenlenecekCezaIndex] = yeniDeger;

    const guncelVeri: OyunVerisi = {
        ...oyunVerisi,
        cezalar: guncellenmisCezalar,
    };

    saveToStorage(storageKey, guncelVeri);
    setOyunVerisi(guncelVeri);
    duzenlemeModunuKapat();
};

export const cezaSil = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    oyuncuIndex: number,
    cezaIndex: number
) => {
    if (!oyunVerisi) return;

    const guncellenmisCezalar = [...(oyunVerisi.cezalar || [])];
    guncellenmisCezalar[oyuncuIndex] = (guncellenmisCezalar[oyuncuIndex] || []).filter((_: number, index: number) => index !== cezaIndex);

    const guncelVeri: OyunVerisi = {
        ...oyunVerisi,
        cezalar: guncellenmisCezalar,
    };

    saveToStorage(storageKey, guncelVeri);
    setOyunVerisi(guncelVeri);
};

// El sayısı düzenleme fonksiyonu (Cezalı 101 için)
export const elSayisiDuzenle = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    duzenlemeDegeri: string,
    duzenlemeModunuKapat: () => void
) => {
    if (!oyunVerisi || !duzenlemeDegeri) return;

    const yeniElSayisi = parseInt(duzenlemeDegeri);
    if (isNaN(yeniElSayisi) || yeniElSayisi <= 0) return;

    const guncelVeri: OyunVerisi = {
        ...oyunVerisi,
        elSayisi: yeniElSayisi,
    };

    saveToStorage(storageKey, guncelVeri);
    setOyunVerisi(guncelVeri);
    duzenlemeModunuKapat();
};

// Toplam hesaplama fonksiyonları
export const toplamCezalariHesapla = (cezalar: number[][]) => {
    return cezalar.map(cezaListesi =>
        cezaListesi.reduce((toplam, ceza) => toplam + ceza, 0)
    );
};

export const toplamMesrubatFiyatiniHesapla = (mesrubatlar: { [key: string]: number }, mesrubatFiyatlari: { [key: string]: number }) => {
    return Object.entries(mesrubatlar || {}).reduce((toplam, [mesrubatTuru, miktar]) => {
        const fiyat = mesrubatFiyatlari?.[mesrubatTuru] || 0;
        return toplam + (miktar * fiyat);
    }, 0);
};

// Oyun sıfırlama fonksiyonları
export const oyunuSifirla = (
    oyunVerisi: OyunVerisi,
    storageKey: string,
    setOyunVerisi: (veri: OyunVerisi) => void,
    oyunTuru: "normal" | "cezali101" | "pisti" = "normal",
    hedefSkor?: number
) => {
    if (!oyunVerisi) return;

    let temiz: OyunVerisi;

    switch (oyunTuru) {
        case "cezali101":
            temiz = {
                ...oyunVerisi,
                skorlar: Array(oyunVerisi.oyuncular.length).fill([]).map(() => []),
                cezalar: Array(oyunVerisi.oyuncular.length).fill([]).map(() => []),
                elSayisi: 9,
                // Meşrubatlar ve meşrubat fiyatları korunuyor
            };
            break;
        case "pisti":
            temiz = {
                ...oyunVerisi,
                skorlar: Array(oyunVerisi.oyuncular.length).fill([]),
                hedefSkor: hedefSkor || 151,
                mesrubatlar: {},
                mesrubatFiyatlari: {},
            };
            break;
        default:
            temiz = {
                ...oyunVerisi,
                skorlar: Array(oyunVerisi.oyuncular.length).fill([]),
                mesrubatlar: {},
                mesrubatFiyatlari: {},
            };
    }

    saveToStorage(storageKey, temiz);
    setOyunVerisi(temiz);
};

// Meşrubat verileri
export const MESRUBAT_TURLERI = [
    { id: "çay", ad: "Çay", emoji: "☕" },
    { id: "kahve", ad: "Kahve", emoji: "☕" },
    { id: "ayran", ad: "Ayran", emoji: "🥛" },
    { id: "kola", ad: "Kola", emoji: "🥤" },
    { id: "soda", ad: "Soda", emoji: "🥤" },
    { id: "meyveli-soda", ad: "Meyveli Soda", emoji: "🥤" },
    { id: "nescafe", ad: "Nescafe", emoji: "☕" },
    { id: "su", ad: "Su", emoji: "💧" },
]; 