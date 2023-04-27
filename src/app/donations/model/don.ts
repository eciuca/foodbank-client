export interface Don {
    idDon: number;
    amount: number;
    lienBanque: number;
    donateurId: number;
    dateEntered: string;
    appended: boolean;
    checked: boolean;
    date: string;
    donateurNom: string;
    donateurPrenom: string;
    totalAmount: number;
    totalRecords: number;
}
export function compareDons(c1: Don, c2: Don) {
    const compare = c1.idDon > c2.idDon;
    if (compare) {
        return 1;
    } else if ( c1.idDon < c2.idDon) {
        return -1;
    } else { return 0; }
}
export class DefaultDon implements Don {
    idDon: number;
    amount: number;
    lienBanque: number;
    donateurId: number;
    dateEntered: string;
    appended: boolean;
    checked: boolean;
    date: string;
    donateurNom: string;
    donateurPrenom: string;
    totalAmount: number;
    totalRecords: number;
    constructor() {
      this.amount = 0;
      this.lienBanque = 0;
      this.donateurId = 0;
      this.dateEntered = '';
      this.appended = false;
      this.checked = false;
      this.date = '';
      this.donateurNom = '';
      this.donateurPrenom = '';
    }
}
