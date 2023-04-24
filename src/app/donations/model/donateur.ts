export interface Donateur {
    titre: string;
    nom: string;
    prenom: string;
    adresse: string;
    cp: string;
    city: string;
    pays: number;
    email: string;
    donateurId: number;
    lienBanque: number;
    totalDons: number;
    totalRecords: number;
}
export function compareDonateurs(c1: Donateur, c2: Donateur) {
    const compare = c1.donateurId > c2.donateurId;
    if (compare) {
        return 1;
    } else if ( c1.donateurId < c2.donateurId) {
        return -1;
    } else { return 0; }
}
export class DefaultDonateur implements Donateur {
    donateurId: number;
    lienBanque: number;
    nom: string;
    prenom: string;
    adresse: string;
    cp: string;
    city: string;
    pays: number;
    email: string;
    titre: string;
    totalDons: number;
    totalRecords: number;
    constructor() {
        this.lienBanque = 0;
        this.nom = '';
        this.prenom = '';
        this.adresse = '';
        this.cp = '';
        this.city = '';
        this.pays = 1; // see enmCountry Belgium
        this.titre = '';
        this.email = '';
        this.totalDons = 0;
        this.totalRecords = 0;
    }
}
