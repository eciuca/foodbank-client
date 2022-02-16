export interface OrgProgram {

    lienDis: number;

    lienBanque: number;

    lienDepot: number;

    luam: boolean;

    lupm: boolean;

    tuam: boolean;

    tupm: boolean;

    weam: boolean;

    wepm: boolean;

    tham: boolean;

    thpm: boolean;

    fram: boolean;

    frpm: boolean;

    saam: boolean;

    sapm: boolean;

    sunam: boolean;

    sunpm: boolean;
    reluam: string;
    relupm: string;
    retuam: string;
    retupm: string;
    reweam: string;
    rewepm: string;
    retham: string;
    rethpm: string;
    refram: string;
    refrpm: string;
    resaam: string;
    resapm: string;
    resunam: string;
    resunpm: string;

    porc: boolean;
    legFrais: boolean;

    congel: boolean;
    congelCap: string;

    auditor: number;
    dateAudit: string;
    lastAudit: number;

}

export function compareOrgPrograms(c1: OrgProgram, c2: OrgProgram) {

    const compare = c1.lienDis > c2.lienDis;

    if (compare) {
        return 1;
    } else if ( c1.lienDis < c2.lienDis) {
        return -1;
    } else { return 0; }

}
export class DefaultOrgProgram implements OrgProgram {

    lienDis: number;

    lienBanque: number;

    lienDepot: number;

    luam: boolean;

    lupm: boolean;

    tuam: boolean;

    tupm: boolean;

    weam: boolean;

    wepm: boolean;

    tham: boolean;

    thpm: boolean;

    fram: boolean;

    frpm: boolean;

    saam: boolean;

    sapm: boolean;

    sunam: boolean;

    sunpm: boolean;
    reluam: string;
    relupm: string;
    retuam: string;
    retupm: string;
    reweam: string;
    rewepm: string;
    retham: string;
    rethpm: string;
    refram: string;
    refrpm: string;
    resaam: string;
    resapm: string;
    resunam: string;
    resunpm: string;

    porc: boolean;
    legFrais: boolean;

    congel: boolean;
    congelCap: string;

    auditor: number;
    dateAudit: string;
    lastAudit: number;

    constructor() {

        // this.lienDis = 0; no Id in default constructor

        this.lienBanque = 0;

        this.lienDepot = 0;

        this.luam = false;

        this.lupm = false;

        this.tuam = false;

        this.tupm = false;

        this.weam = false;

        this.wepm = false;

        this.tham = false;

        this.thpm = false;

        this.fram = false;

        this.frpm = false;

        this.saam = false;

        this.sapm = false;

        this.sunam = false;

        this.sunpm = false;
        this.reluam = '';
        this.relupm = '';
        this.retuam = '';
        this.retupm = '';
        this.reweam = '';
        this.rewepm = '';
        this.retham = '';
        this.rethpm = '';
        this.refram = '';
        this.refrpm = '';
        this.resaam = '';
        this.resapm = '';
        this.resunam = '';
        this.resunpm = '';

        this.porc = false;
        this.legFrais = false;

        this.congel = false;
        this.congelCap = '';

        this.auditor = 0;
        this.dateAudit = '';
        this.lastAudit = 0;

    }
}
