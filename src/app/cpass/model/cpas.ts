export interface Cpas {

    cpasId: number;

    cpasZip: string;

    cpasName: string;

    cpasMail: string;

    cpasStreet: string;

    cpasTel: string;

    cpasGsm: string;

    cpasContactName: string;

    cpasContactSurname: string;

    civilite: number;

    rem: string;

    password: string;

    lBanque: number;

    langue: number;

    totalRecords: number;
}
export function compareCpass(c1: Cpas, c2: Cpas) {

    const compare = c1.cpasId > c2.cpasId;

    if (compare) {
        return 1;
    } else if ( c1.cpasId < c2.cpasId) {
        return -1;
    } else { return 0; }

}
