export interface Depot {
    idDepot: string;
    nom: string;
    adresse: string;
    adresse2: string;
    cp: string;
    ville: string;
    telephone: string;
    contact: string;
    email: string;
    memo: string;
    depPrinc: boolean;
    actif: boolean;
    depFead: boolean;
    idCompany: string;
    ipMainAddress: string;
    lienBanque: number;
    anomalies: string;
    sync: boolean; // used when saving depot stating sync is requested with matching organisation
    totalRecords: number;
}
export function compareDepots(c1: Depot, c2: Depot) {
    const compare = c1.idDepot > c2.idDepot;
    if (compare) {
        return 1;
    } else if ( c1.idDepot < c2.idDepot) {
        return -1;
    } else { return 0; }
}

export class DefaultDepot implements Depot {
    actif: boolean;
    adresse: string;
    adresse2: string;
    contact: string;
    cp: string;
    depFead: boolean;
    depPrinc: boolean;
    email: string;
    idDepot: string;
    ipMainAddress: string;
    lienBanque: number;
    idCompany: string;
    memo: string;
    nom: string;
    telephone: string;
    ville: string;
    anomalies: string;
    sync: boolean; // used when saving depot stating sync is requested with matching organisation
    totalRecords: number;
    isNew: boolean; // calculated property to indicate we are creating a new depot
    constructor() {
        this.actif = true;
        this.adresse = '';
        this.adresse2 = '';
        this.contact = '';
        this.cp = '';
        this.depFead = false;
        this.depPrinc = false;
        this.email = '';
        this.idDepot = '';
        this.lienBanque = 0;
        this.ipMainAddress ='';
        this.idCompany = '';
        this.memo = '';
        this.nom = '';
        this.telephone = '';
        this.ville = '';
        this.anomalies = '';
        this.totalRecords = 0;
        this.sync = false;  // used when saving depot stating sync is requested with matching organisation
        this.isNew = true;
    }
}
