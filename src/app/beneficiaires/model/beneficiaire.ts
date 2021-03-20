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

    dateUpd: string;

    regio: string;

    lcpas: number;

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
export class DefaultBeneficiaire implements Beneficiaire {
    actif: number;
    adresse: string;
    bankName: string;
    bankShortName: string;
    birb: number;
    civilite: number;
    civiliteconj: number;
    coeff: number;
    connu: string;
    cp: string;
    critBirb: number;
    datUpdBirb: string;
    dateUpd: string;
    daten: string;
    datenConj: string;
    email: string;
    genre: number;
    genreconj: number;
    gsm: string;
    idClient: number;
    idInt: string;
    lcpas: number;
    lbanque: number;
    lienDis: number;
    localite: string;
    natnr: string;
    nom: string;
    nomconj: string;
    nomsav: string;
    pays: string;
    prenom: string;
    prenomconj: string;
    prenomsav: string;
    regio: string;
    tel: string;
    totalRecords: number;
    isNew: boolean; // calculated property to indicate we are creating a new beneficiary
    constructor() {
        this.pays = '1';
        this.civilite = 1;
        this.civiliteconj = 1;
        this.actif = 1;
        this.genre = 1; // duplicate of civilite
        this.genreconj = 1; // duplicate of civilite for conjoint
        this.birb = 1; // statut FEAD
        this.connu = '';
        this.dateUpd = '2021-01-01T14:00:00';
        this.daten = '';
        this.datenConj = '';
        this.regio = '';
        this.isNew = true;
    }

}
