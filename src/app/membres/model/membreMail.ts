export interface MembreMail {
    batId: number;
    societe: string; // calculated field
    nom: string;
    prenom: string;
    batmail: string;
}
export function compareMembreMails(c1: MembreMail, c2: MembreMail) {

    const compare = c1.batId > c2.batId;

    if (compare) {
        return 1;
    } else if ( c1.batId < c2.batId) {
        return -1;
    } else { return 0; }

}
