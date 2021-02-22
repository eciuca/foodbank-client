import {Depot} from '../../Depots/model/Depot';

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

    depPrinc: number;

    actif: number;

    depFead: number;
    bankName: string;
    bankShortName: string;
}
export function compareDepots(c1: Depot, c2: Depot) {

    const compare = c1.idDepot > c2.idDepot;

    if (compare) {
        return 1;
    } else if ( c1.idDepot < c2.idDepot) {
        return -1;
    } else { return 0; }

}
