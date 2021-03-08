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
