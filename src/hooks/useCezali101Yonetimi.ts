import { useState } from "react";
import { useOyunYonetimi } from "./useOyunYonetimi";
import { cezaEkle, cezaDuzenle, cezaSil, elSayisiDuzenle } from "@/utils/gameHelpers";

export const useCezali101Yonetimi = () => {
    const {
        oyunVerisi,
        setOyunVerisi,
        yeniSkorlar,
        setYeniSkorlar,
        storageKey,
        duzenlemeModu,
        duzenlenecekOyuncu,
        duzenlenecekTur,
        duzenlenecekCezaIndex,
        duzenlemeDegeri,
        setDuzenlemeDegeri,
        duzenlemeModunuKapat,
        skorDuzenlemeBaslat,
        isimDuzenlemeBaslat,
        cezaDuzenlemeBaslat,
        elSayisiDuzenlemeBaslat,
    } = useOyunYonetimi("cezali-101");

    const [cezaAlan, setCezaAlan] = useState<number>(-1);
    const [cezaSayisi, setCezaSayisi] = useState<string>("");

    // Cezalı 101 için özel skor ekleme
    const handleSkorEkle = () => {
        if (!oyunVerisi) return;

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

        const guncelVeri = {
            ...oyunVerisi,
            skorlar: guncellenmisSkorlar,
        };

        localStorage.setItem(storageKey, JSON.stringify(guncelVeri));
        setOyunVerisi(guncelVeri);
        setYeniSkorlar(Array(guncelVeri.oyuncular.length).fill(""));
    };

    // Ceza ekleme
    const handleCezaEkle = () => {
        if (!oyunVerisi) return;
        cezaEkle(oyunVerisi, storageKey, setOyunVerisi, cezaAlan, cezaSayisi, setCezaAlan, setCezaSayisi);
    };

    // Ceza düzenleme
    const handleCezaDuzenle = () => {
        if (!oyunVerisi) return;
        cezaDuzenle(oyunVerisi, storageKey, setOyunVerisi, duzenlenecekOyuncu, duzenlenecekCezaIndex, duzenlemeDegeri, duzenlemeModunuKapat);
    };

    // Ceza silme
    const handleCezaSil = (oyuncuIndex: number, cezaIndex: number) => {
        if (!oyunVerisi) return;
        cezaSil(oyunVerisi, storageKey, setOyunVerisi, oyuncuIndex, cezaIndex);
    };

    // El sayısı düzenleme
    const handleElSayisiDuzenle = () => {
        if (!oyunVerisi) return;
        elSayisiDuzenle(oyunVerisi, storageKey, setOyunVerisi, duzenlemeDegeri, duzenlemeModunuKapat);
    };

    // Skor düzenleme
    const handleSkorDuzenle = () => {
        if (!oyunVerisi || duzenlenecekOyuncu === -1 || duzenlenecekTur === -1 || !duzenlemeDegeri) return;

        const yeniDeger = parseInt(duzenlemeDegeri);
        if (isNaN(yeniDeger)) return;

        const guncellenmisSkorlar = [...oyunVerisi.skorlar];
        guncellenmisSkorlar[duzenlenecekOyuncu] = [...guncellenmisSkorlar[duzenlenecekOyuncu]];
        guncellenmisSkorlar[duzenlenecekOyuncu][duzenlenecekTur] = yeniDeger;

        const guncelVeri = {
            ...oyunVerisi,
            skorlar: guncellenmisSkorlar,
        };

        localStorage.setItem(storageKey, JSON.stringify(guncelVeri));
        setOyunVerisi(guncelVeri);
        duzenlemeModunuKapat();
    };

    // İsim düzenleme
    const handleIsimDuzenle = () => {
        if (!oyunVerisi || duzenlenecekOyuncu === -1 || !duzenlemeDegeri.trim()) return;

        const yeniIsim = duzenlemeDegeri.trim();
        if (yeniIsim.length === 0) return;

        const guncellenmisOyuncular = [...oyunVerisi.oyuncular];
        guncellenmisOyuncular[duzenlenecekOyuncu] = yeniIsim;

        const guncelVeri = {
            ...oyunVerisi,
            oyuncular: guncellenmisOyuncular,
        };

        localStorage.setItem(storageKey, JSON.stringify(guncelVeri));
        setOyunVerisi(guncelVeri);
        duzenlemeModunuKapat();
    };

    return {
        // State'ler
        oyunVerisi,
        setOyunVerisi,
        yeniSkorlar,
        setYeniSkorlar,
        storageKey,
        duzenlemeModu,
        duzenlenecekOyuncu,
        duzenlenecekTur,
        duzenlenecekCezaIndex,
        duzenlemeDegeri,
        setDuzenlemeDegeri,
        cezaAlan,
        setCezaAlan,
        cezaSayisi,
        setCezaSayisi,

        // Fonksiyonlar
        duzenlemeModunuKapat,
        skorDuzenlemeBaslat,
        isimDuzenlemeBaslat,
        cezaDuzenlemeBaslat,
        elSayisiDuzenlemeBaslat,
        handleSkorEkle,
        handleCezaEkle,
        handleCezaDuzenle,
        handleCezaSil,
        handleElSayisiDuzenle,
        handleSkorDuzenle,
        handleIsimDuzenle,
    };
}; 