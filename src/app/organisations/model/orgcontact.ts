import {Organisation} from './organisation';

export interface Orgcontact {
    orgPersId: number;
    lienAsso: number;
    civilite: number;
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    gsm: string;
    fonction: string;
    deleted: boolean;
    distr: boolean;
}
export function compareOrgcontacts(c1: Orgcontact, c2: Orgcontact) {

    const compare = c1.nom > c2.nom;

    if (compare) {
        return 1;
    } else if ( c1.nom < c2.nom) {
        return -1;
    } else { return 0; }

}
export class DefaultOrgcontact implements Orgcontact {
    orgPersId: number;
    lienAsso: number;
    civilite: number;
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    gsm: string;
    fonction: string;
    deleted: boolean;
    distr: boolean;
    constructor() {
        this.civilite = 0;
        this.lienAsso = 0;
        this.nom = '';
        this.prenom = '';
        this.email = '';
        this.tel = '';
        this.gsm = '';
        this.fonction = '';
        this.deleted = false;
        this.distr = false;
    }

}
