export interface MembreFunction {
    funcId: number;
    fonctionName: string;
    fonctionNameNl: string;
    definitionFonction: string;
    actif: boolean;
    rem: string;
    lienBanque: number;
    lienDis: number;
    bankShortName: string;
}
export function compareMembreFunctions(c1: MembreFunction, c2: MembreFunction) {

    const compare = c1.funcId > c2.funcId;

    if (compare) {
        return 1;
    } else if ( c1.funcId < c2.funcId) {
        return -1;
    } else { return 0; }

}
export class DefaultMembreFunction implements MembreFunction {
    actif: boolean;
    definitionFonction: string;
    fonctionName: string;
    fonctionNameNl: string;
    funcId: number;
    lienBanque: number;
    lienDis: number;
    rem: string;
    bankShortName: string;
    constructor() {
        this.actif = true;
        this.definitionFonction = '';
        this.fonctionName = '';
        this.fonctionNameNl = '';
        this.lienBanque = 0;
        this.lienDis = 0;
        this.rem = '';
        this.bankShortName ='';
 }
}