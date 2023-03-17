import {Cpas} from './cpas';

export interface Zipcode {
    totalRecords: number;
    zipCode: number;

    city: string;

    lCpas: number;

    zipCodeCpas: number;

    cityCpas: string;

    mailCpas: string;

    remCpas: string;
}

export function compareZipcodes(c1: Zipcode, c2: Zipcode) {

    const compare = c1.zipCode > c2.zipCode;

    if (compare) {
        return 1;
    } else if ( c1.zipCode < c2.zipCode) {
        return -1;
    } else { return 0; }


}
export class DefaultZipcode implements Zipcode {
    city: string;
    cityCpas: string;
    lCpas: number;
    mailCpas: string;
    remCpas: string;
    zipCode: number;
    zipCodeCpas: number;
    totalRecords: number;
    constructor() {
        this.city = '';
        this.cityCpas = '';
        this.lCpas = 0;
        this.mailCpas = '';
        this.remCpas = '';
        this.zipCode = 0;
        this.zipCodeCpas = 0;
        this.totalRecords = 0;
    }
}