import {Cpas} from './cpas';

export interface ZipCode {
    totalRecords: number;
    zipCode: number;
    lienBanque: number;
    city: string;

    lcpas: number;

    zipCodeCpas: number;

    cityCpas: string;

    mailCpas: string;

    remCpas: string;
}

export function compareZipCodes(c1: ZipCode, c2: ZipCode) {

    const compare = c1.zipCode > c2.zipCode;

    if (compare) {
        return 1;
    } else if ( c1.zipCode < c2.zipCode) {
        return -1;
    } else { return 0; }


}
export class DefaultZipCode implements ZipCode {
    city: string;
    cityCpas: string;
    lcpas: number;
    lienBanque: number;
    mailCpas: string;
    remCpas: string;
    zipCode: number;
    zipCodeCpas: number;
    totalRecords: number;
    isNew: boolean; // calculated property to indicate we are creating a new zipcode
    constructor() {
        this.city = '';
        this.cityCpas = '';
        this.lcpas = 0;
        this.lienBanque = 0;
        this.mailCpas = '';
        this.remCpas = '';
        this.zipCode = 0;
        this.zipCodeCpas = 0;
        this.totalRecords = 0;
        this.isNew = true;
    }
}