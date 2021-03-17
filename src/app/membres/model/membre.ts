export interface Membre {
    batId: number;

    lienDis: number;

    nom: string;

    prenom: string;

    fullname: string; // fullname is a calculated field

    address: string;

    city: string;

    zip: string;

    tel: string;

    gsm: string;

    batmail: string;

    veh: string;

    vehTyp: string;

    vehImm: string;

    fonction: number;

    ca: number;

    ag: number;

    cg: number;

    civilite: number;

    pays: number;

    actif: number;

    authority: number;

    datmand: string;

    rem: string;

    ben: number;

    codeAcces: number;

    nrCodeAcces: number;

    langue: number;
    datedeb: string;

    dateFin: string;

    deleted: number;

    typEmploi: number;

    dateNaissance: string;

    nnat: string;

    dateContrat: string;

    lDep: number;
    bankName: string;
    bankShortName: string;
    totalRecords: number;
}

export function compareMembres(c1: Membre, c2: Membre) {

    const compare = c1.batId > c2.batId;

    if (compare) {
        return 1;
    } else if ( c1.batId < c2.batId) {
        return -1;
    } else { return 0; }

}
export class DefaultMembre implements Membre {

    actif: number;
    address: string;
    ag: number;
    authority: number;
    bankName: string;
    bankShortName: string;
    batId: number;
    batmail: string;
    ben: number;
    ca: number;
    cg: number;
    city: string;
    civilite: number;
    codeAcces: number;
    dateContrat: string;
    dateFin: string;
    dateNaissance: string;
    datedeb: string;
    datmand: string;
    deleted: number;
    fonction: number;
    fullname: string;
    gsm: string;
    lDep: number;
    langue: number;
    lienDis: number;
    nnat: string;
    nom: string;
    nrCodeAcces: number;
    pays: number;
    prenom: string;
    rem: string;
    tel: string;
    totalRecords: number;
    typEmploi: number;
    veh: string;
    vehImm: string;
    vehTyp: string;
    zip: string;

    constructor() {
       this.pays = 1;
       this.civilite = 1;
       this.langue = 2 ;
       this.actif = 1;
       this.authority = 1;
       this.ben = 1;
    }
}
