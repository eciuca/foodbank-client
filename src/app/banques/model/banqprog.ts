export interface BanqProg {
    lienBanque: number ;
    luam: boolean ;
    lupm: boolean ;
    tuam: boolean ;
    tupm: boolean ;
    weam: boolean ;
    wepm: boolean ;
    tham: boolean ;
    thpm: boolean ;
    fram: boolean ;
    frpm: boolean ;
    saam: boolean ;
    sapm: boolean ;
    sunam: boolean ;
    sunpm: boolean ;
    reluam: string ;
    relupm: string ;
    retuam: string ;
    retupm: string ;
    reweam: string ;
    rewepm: string ;
    retham: string ;
    rethpm: string ;
    refram: string ;
    refrpm: string ;
    resaam: string ;
    resapm: string ;
    resunam: string ;
    resunpm: string ;
    cotAnnuelle: boolean ;
    cotAmount: string ;
    cotSup: boolean ;
    cotAmountSup: string ;
    bankShortName: string ;
}

export function compareBanqProgs(c1: BanqProg, c2: BanqProg) {

    const compare = c1.lienBanque > c2.lienBanque;

    if (compare) {
        return 1;
    } else if ( c1.lienBanque < c2.lienBanque) {
        return -1;
    } else { return 0; }

}
export class DefaultBanqProg implements BanqProg {
    bankShortName: string;
    cotAmount: string;
    cotAmountSup: string;
    cotAnnuelle: boolean;
    cotSup: boolean;
    fram: boolean;
    frpm: boolean;
    lienBanque: number;
    luam: boolean;
    lupm: boolean;
    refram: string;
    refrpm: string;
    reluam: string;
    relupm: string;
    resaam: string;
    resapm: string;
    resunam: string;
    resunpm: string;
    retham: string;
    rethpm: string;
    retuam: string;
    retupm: string;
    reweam: string;
    rewepm: string;
    saam: boolean;
    sapm: boolean;
    sunam: boolean;
    sunpm: boolean;
    tham: boolean;
    thpm: boolean;
    tuam: boolean;
    tupm: boolean;
    weam: boolean;
    wepm: boolean;
    constructor() {
        // this.lienBanque= 0 ; omit key

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
        this.cotAnnuelle = false;
        this.cotAmount = '';
        this.cotSup = false;
        this.cotAmountSup = '';
        this.bankShortName = '';
    }
}
