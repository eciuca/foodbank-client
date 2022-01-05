

export interface MailAddress {
    nom: string;
    prenom: string;
    email: string;
    societe: string;
}

export function compareMailAddresses(c1: MailAddress, c2: MailAddress) {

    const compare = c1.email > c2.email;

    if (compare) {
        return 1;
    } else if ( c1.email < c2.email) {
        return -1;
    } else { return 0; }
}
export class DefaultMailAddress implements MailAddress {
    nom: string;
    prenom: string;
    email: string;
    societe: string;
    constructor() {
        this.nom = '';
        this.email = '';
        this.prenom = '';
        this.societe = '';
    }
}