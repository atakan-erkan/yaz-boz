import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getFromStorage } from "@/utils/storage";
import { OyunVerisi } from "@/utils/gameHelpers";

export const useOyunYonetimi = (oyunAdi: string) => {
    const router = useRouter();
    const storageKey = `oyunVerisi_${oyunAdi}`;

    const [oyunVerisi, setOyunVerisi] = useState<OyunVerisi | null>(null);
    const [yeniSkorlar, setYeniSkorlar] = useState<string[]>([]);

    // Düzenleme modu state'leri
    const [duzenlemeModu, setDuzenlemeModu] = useState<"kapali" | "skor" | "isim" | "ceza" | "elSayisi">("kapali");
    const [duzenlenecekOyuncu, setDuzenlenecekOyuncu] = useState<number>(-1);
    const [duzenlenecekTur, setDuzenlenecekTur] = useState<number>(-1);
    const [duzenlenecekCezaIndex, setDuzenlenecekCezaIndex] = useState<number>(-1);
    const [duzenlemeDegeri, setDuzenlemeDegeri] = useState<string>("");

    useEffect(() => {
        const veri = getFromStorage<OyunVerisi>(storageKey);
        if (veri) {
            // Eğer meşrubatlar yoksa, yeni formata çevir
            if (!veri.mesrubatlar) {
                veri.mesrubatlar = {};
            }
            // Eğer meşrubat fiyatları yoksa, yeni formata çevir
            if (!veri.mesrubatFiyatlari) {
                veri.mesrubatFiyatlari = {};
            }
            // Cezalı 101 için cezalar kontrolü
            if (oyunAdi === "cezali-101" && !veri.cezalar) {
                veri.cezalar = Array(veri.oyuncular.length).fill([]).map(() => []);
            }
            // Cezalı 101 için el sayısı kontrolü
            if (oyunAdi === "cezali-101" && !veri.elSayisi) {
                veri.elSayisi = 9;
            }
            // Pişti için hedef skor kontrolü
            if (oyunAdi === "pisti" && !veri.hedefSkor) {
                veri.hedefSkor = 151;
            }

            setOyunVerisi(veri);
            setYeniSkorlar(Array(veri.oyuncular.length).fill(""));
        } else {
            router.push("/");
        }
    }, [storageKey, oyunAdi, router]);

    // Düzenleme modunu kapatma fonksiyonu
    const duzenlemeModunuKapat = () => {
        setDuzenlemeModu("kapali");
        setDuzenlenecekOyuncu(-1);
        setDuzenlenecekTur(-1);
        setDuzenlenecekCezaIndex(-1);
        setDuzenlemeDegeri("");
    };

    // Skor düzenleme modunu açma
    const skorDuzenlemeBaslat = (oyuncuIndex: number, turIndex: number) => {
        setDuzenlemeModu("skor");
        setDuzenlenecekOyuncu(oyuncuIndex);
        setDuzenlenecekTur(turIndex);
        setDuzenlemeDegeri(oyunVerisi?.skorlar[oyuncuIndex]?.[turIndex]?.toString() || "0");
    };

    // İsim düzenleme modunu açma
    const isimDuzenlemeBaslat = (oyuncuIndex: number) => {
        setDuzenlemeModu("isim");
        setDuzenlenecekOyuncu(oyuncuIndex);
        setDuzenlemeDegeri(oyunVerisi?.oyuncular[oyuncuIndex] || "");
    };

    // Ceza düzenleme modunu açma (Cezalı 101 için)
    const cezaDuzenlemeBaslat = (oyuncuIndex: number, cezaIndex: number) => {
        setDuzenlemeModu("ceza");
        setDuzenlenecekOyuncu(oyuncuIndex);
        setDuzenlenecekCezaIndex(cezaIndex);
        setDuzenlemeDegeri(oyunVerisi?.cezalar?.[oyuncuIndex]?.[cezaIndex]?.toString() || "0");
    };

    // El sayısı düzenleme modunu açma (Cezalı 101 için)
    const elSayisiDuzenlemeBaslat = () => {
        setDuzenlemeModu("elSayisi");
        setDuzenlemeDegeri(oyunVerisi?.elSayisi?.toString() || "9");
    };

    return {
        oyunVerisi,
        setOyunVerisi,
        yeniSkorlar,
        setYeniSkorlar,
        storageKey,
        duzenlemeModu,
        setDuzenlemeModu,
        duzenlenecekOyuncu,
        setDuzenlenecekOyuncu,
        duzenlenecekTur,
        setDuzenlenecekTur,
        duzenlenecekCezaIndex,
        setDuzenlenecekCezaIndex,
        duzenlemeDegeri,
        setDuzenlemeDegeri,
        duzenlemeModunuKapat,
        skorDuzenlemeBaslat,
        isimDuzenlemeBaslat,
        cezaDuzenlemeBaslat,
        elSayisiDuzenlemeBaslat,
    };
}; 