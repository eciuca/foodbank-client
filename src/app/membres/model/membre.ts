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

    ca: boolean;

    ag: boolean;

    cg: boolean;

    civilite: number;

    pays: number;

    actif: boolean;

    authority: number;

    datmand: string;

    rem: string;

    ben: boolean;

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
    ldep: number;
    lienBanque: number;
    societe: string; // calculated field
    bankShortName: string;
    fonctionType: string;
    fonctionName: string;
    fonctionNameNl: string;
    nbUsers: number;
    totalRecords: number;
    lastVisit: string;
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

    actif: boolean;
    address: string;
    ag: boolean;
    authority: number;
    lienBanque: number;
    batId: number;
    batmail: string;
    ben: boolean;
    ca: boolean;
    cg: boolean;
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
    ldep: number;
    langue: number;
    lienDis: number;
    nnat: string;
    nom: string;
    nrCodeAcces: number;
    pays: number;
    prenom: string;
    rem: string;
    societe: string; // calculated field
    bankShortName: string; // calculated field
    fonctionType: string; // calculated field
    fonctionName: string; // calculated field
    fonctionNameNl: string; // calculated field
    tel: string;
    totalRecords: number;
    typEmploi: number;
    veh: string;
    vehImm: string;
    vehTyp: string;
    zip: string;
    lastVisit: string;
    nbUsers: number;
    constructor() {
        this.actif = true;
        this.address = '';
        this.ag = false;
        this.authority = 0;
        this.lienBanque = 0;
        this.batmail = '';
        this.ben = true;
        this.ca = false;
        this.cg = false;
        this.city = '';
        this.civilite = 1;
        this.codeAcces = 0;
        this.dateContrat = '';
        this.dateFin = '';
        this.dateNaissance = '';
        this.datedeb = '';
        this.datmand = '';
        this.deleted = 0;
        this.fonction = 0;
        this.fullname = '';
        this.gsm = '';
        this.ldep = 0;
        this.langue = 2;
        this.lienDis = 0;
        this.nnat = '';
        this.nom = '';
        this.nrCodeAcces = 0;
        this.pays = 1;
        this.prenom = '';
        this.rem = '';
        this.societe = ''; // calculated field
        this.bankShortName = ''; // calculated field
        this.fonctionType = '';  // calculated field
        this.fonctionName = '';  // calculated field
        this.fonctionNameNl = ''; // calculated field
        this.tel = '';
        this.totalRecords = 0;
        this.typEmploi = 0;
        this.veh = '';
        this.vehImm = '';
        this.vehTyp = '';
        this.zip = '';
        this.lastVisit = '';
        this.nbUsers = 0;
    }
}
