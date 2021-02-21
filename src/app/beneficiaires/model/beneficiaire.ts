export interface  Beneficiaire {
    idClient: number;

    idInt: string;

    lienDis: number;

    nom: string;

    prenom: string;

    nomconj: string;

    prenomconj: string;

    civilite: number;
    daten: string;

    datenConj: string;

    civiliteconj: number;
    adresse: string;
    cp: string;
    localite: string;

    pays: string;
    email: string;
    tel: string;
    gsm: string;

    connu: string;

    genre: number;

    actif: number;

    birb: number;

    natnr: string;

    dateUpd: Date;

    regio: string;

    lCpas: number;

    datUpdBirb: string;

    critBirb: number;

    coeff: number;

    nomsav: string;

    prenomsav: string;

    genreconj: number;

    lbanque: number;
    bankName: string;
    bankShortName: string;
    totalRecords: number;
}
export function compareBeneficiaires(c1: Beneficiaire, c2: Beneficiaire) {

    const compare = c1.idClient > c2.idClient;

    if (compare) {
        return 1;
    } else if ( c1.idClient < c2.idClient) {
        return -1;
    } else { return 0; }

}
