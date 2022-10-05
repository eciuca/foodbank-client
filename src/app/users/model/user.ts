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
    membreNom: string;
    membrePrenom: string;
    membreEmail: string;
    membreLangue: number;
    membreActif: boolean;
    membreBankShortname: string;
    nbLogins: number;
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
    membreNom: string;
    membrePrenom: string;
    membreEmail: string;
    membreLangue: number;
    membreActif: boolean;
    membreBankShortname: string;
    nbLogins: number;
    totalRecords: number;
    userName: string;
    isNew: boolean; // calculated property to indicate we are creating a new employee

    constructor() {
        this.idLanguage = 'nl';
        this.actif = true;
        this.depot = '';
        this.droit1 = false;
        this.email = '';
        this.gestAsso = false;
        this.gestCpas = false;
        this.gestDon = false;
        this.gestFead = false;
        this.gestInv = false;
        this.gestMemb = false;
        this.idCompany = '';
        this.idOrg = 0;
        this.idUser = '';
        this.lienBanque = 0;
        this.lienBat = 0;
        this.lienCpas = 0;
        this.password = '';
        this.rights = '';
        this.societe = '';
        this.membreNom = '';
        this.membrePrenom = '';
        this.membreEmail = '';
        this.membreLangue = 0;
        this.membreActif = true;
        this.membreBankShortname = '';
        this.nbLogins = 0;
        this.isNew = true;
    }
}
