export interface User {
    idUser: string;

    userName: string;

    idCompany: string;

    idOrg: number;

    idLanguage: string;

    lienBat: number;

    actif: number;

    rights: string;

    password: string;

    depot: string;

    droit1: number;

    email: string;

    gestBen: number;

    gestInv: number;

    gestFead: number;

    gestAsso: number;

    gestCpas: number;

    gestMemb: number;

    gestDon: number;

    lienBanque: number;

    lienCpas: number;

}
export function compareUsers(c1: User, c2: User) {

    const compare = c1.idUser > c2.idUser;

    if (compare) {
        return 1;
    } else if ( c1.idUser < c2.idUser) {
        return -1;
    } else { return 0; }


}
