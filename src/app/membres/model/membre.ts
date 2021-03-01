export interface Membre {
    batId: number;

    lienDis: number;

    nom: string;

    prenom: string;

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

    lastVisit: Date;

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
