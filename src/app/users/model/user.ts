export interface User {
    idUser: string;

    userName: string;

    idCompany: string;

    idOrg: number;

    idLanguage: string;

    lienBat: number;

    actif: boolean;

    rights: string;

    password: string;

    depot: string;

    droit1: boolean;

    email: string;

    gestBen: boolean;

    gestInv: boolean;

    gestFead: boolean;

    gestAsso: boolean;

    gestCpas: boolean;

    gestMemb: boolean;

    gestDon: boolean;

    lienBanque: number;

    lienCpas: number;

    societe: string;

    totalRecords: number;

}
export function compareUsers(c1: User, c2: User) {

    const compare = c1.idUser > c2.idUser;

    if (compare) {
        return 1;
    } else if ( c1.idUser < c2.idUser) {
        return -1;
    } else { return 0; }


}
export class DefaultUser implements User {
    actif: boolean;
    depot: string;
    droit1: boolean;
    email: string;
    gestAsso: boolean;
    gestBen: boolean;
    gestCpas: boolean;
    gestDon: boolean;
    gestFead: boolean;
    gestInv: boolean;
    gestMemb: boolean;
    idCompany: string;
    idLanguage: string;
    idOrg: number;
    idUser: string;
    lienBanque: number;
    lienBat: number;
    lienCpas: number;
    password: string;
    rights: string;
    societe: string;
    totalRecords: number;
    userName: string;
    isNew: boolean; // calculated property to indicate we are creating a new member

    constructor() {
        this.idLanguage = 'nl';
        this.actif = true;
        this.droit1 = false;
        this.gestAsso = false;
        this.gestCpas = false;
        this.gestDon = false;
        this.gestFead = false;
        this.gestInv = false;
        this.gestMemb = false;
        this.isNew = true;
    }
}
