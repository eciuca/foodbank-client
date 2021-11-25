export interface Region {
    regId: number;
    regName: string;
    bankLink: number;
    bankShortName: string;
}
export function compareRegions(c1: Region, c2: Region) {

    const compare = c1.regName > c2.regName;

    if (compare) {
        return 1;
    } else if ( c1.regName < c2.regName) {
        return -1;
    } else { return 0; }

}
export class DefaultRegion implements Region {
    regId: number;
    regName: string;
    bankLink: number;
    bankShortName: string;

    constructor() {
        this.regName = '';
        this.bankLink = 0;
        this.bankShortName = '';

    }
}
