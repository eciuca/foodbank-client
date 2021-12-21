export interface Orgaudit {
    auditId: number;

    lienDis: number;

    lienDep: number;

    auditorNr: number;

    demunisYNRem: string;

    hygCheck: string;

    servUsage: string;

    probSug: string;

    auditDate: string;

    benefCheck: boolean;

    societe: string;

    depotName: string;

    lienBanque: number;
    auditorName: string;

    totalRecords: number;
}
export function compareOrgaudits(c1: Orgaudit, c2: Orgaudit) {

    const compare  = c1.lienDis > c2.lienDis;

    if (compare) {
        return 1;
    } else if ( c1.lienDis < c2.lienDis) {
        return -1;
    } else { return 0; }

}
export class DefaultOrgaudit implements Orgaudit {
    auditDate: string;
    auditId: number;
    auditorNr: number;
    auditorName: string;
    benefCheck: boolean;
    demunisYNRem: string;
    depotName: string;
    hygCheck: string;
    lienBanque: number;
    lienDep: number;
    lienDis: number;
    probSug: string;
    servUsage: string;
    societe: string;
    totalRecords: number;
    constructor() {

        this.lienDis = 0;

        this.lienDep = 0;

        this.auditorNr = 0;

        this.demunisYNRem = '';

        this.hygCheck = '';

        this.servUsage = '';

        this.probSug = '';

        this.auditDate = '';

        this.benefCheck  = false;

        this.societe = '';

        this.depotName = '';

        this.lienBanque = 0;
        this.auditorName = '';

        this.totalRecords = 0;
    }
}