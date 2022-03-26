export interface MembreEmploiType {
    jobNr: number;
    jobNameFr: string;
    jobNameNl: string;
    lienBanque: number;
    actif: boolean;
    jobNameEn: string;
    jobNameGe: string;
}
export function compareMembreEmploiTypes(c1: MembreEmploiType, c2: MembreEmploiType) {

    const compare = c1.jobNr > c2.jobNr;

    if (compare) {
        return 1;
    } else if ( c1.jobNr < c2.jobNr) {
        return -1;
    } else { return 0; }

}
export class DefaultMembreEmploiType implements MembreEmploiType {
    actif: boolean;
    jobNameEn: string;
    jobNameFr: string;
    jobNameGe: string;
    jobNameNl: string;
    jobNr: number;
    lienBanque: number;
    constructor() {
        this.actif = true;
        this.jobNameEn ='';
        this.jobNameFr ='';
        this.jobNameGe ='';
        this.jobNameNl ='';
        this.lienBanque = 0;
    }

}