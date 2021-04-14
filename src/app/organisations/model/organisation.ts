export interface Organisation {

    idDis: number;

    lienBanque: number;

    refInt: string;

    lienDepot: number;

    societe: string;

    adresse: string;

    statut: string;

    email: string;

    cp: string;

    localite: string;

    pays: number;

    tva: string;
    website: string;

    tel: string;

    gsm: string;

    daten: number;

    banque: string;

    region: number;
    iban: string;
    classique: string;
    bic: string;

    actif: number;

    civilite: number;

    nom: string;

    prenom: string;

    civiliteVp: number;

    prenomVp: string;

    nomVp: string;

    telVp: string;

    gsmVp: string;

    civiliteSec: number;

    prenomSec: string;

    nomSec: string;

    telSec: string;

    gsmSec: string;

    civiliteTres: number;

    prenomTres: string;

    nomTres: string;

    telTres: string;

    gsmTres: string;

    emailPres: string;

    emailVp: string;

    emailSec: string;

    emailTres: string;

    telPres: string;

    gsmPres: string;

    disprog: string;

    afsca: string;

    webauthority: boolean;

    langue: number;

    lastvisit: string;

    nbrefix: number;

    cpasyN: number;

    lienCpas: number;

    depyN: number;

    logBirb: number;

    actComp1: number;

    actComp2: number;

    actComp3: number;

    actComp4: number;

    actComp5: number;

    actComp6: number;

    actComp7: string;

    nrTournee: number;

    susp: number;

    stopSusp: string;

    rem: string;

    msonac: number;

    classeFbba1: number;

    classeFbba2: number;

    classeFbba3: number;

    nFam: number;

    nPers: number;

    nNour: number;

    nBebe: number;

    nEnf: number;

    nAdo: number;

    n1824: number;

    nEq: number;

    nSen: number;

    depPrinc: number;

    gestBen: number;

    tourneeJour: number;

    tourneeSem: number;

    coldis: number;

    lienGd: number;

    lienGs: number;

    montCot: number;

    antenne: number;

    afsca1: string;

    afsca2: string;

    afsca3: string;

    nrFead: number;

    tourneeMois: number;

    distrListPdt: number;

    distrListVp: number;

    distrListSec: number;

    distrListTres: number;

    adresse2: string;

    cp2: string;

    localite2: string;

    pays2: number;

    dateReg: string;

    fax: string;

    feadN: number;

    remLivr: string;

    cotAnnuelle: number;

    cotMonths: number;

    cotSup: number;

    cotMonthsSup: number;

    depotram: number;

    lupdUserName: string;

    lupdTs: string;

}

export function compareOrganisations(c1: Organisation, c2: Organisation) {

    const compare = c1.idDis > c2.idDis;

    if (compare) {
        return 1;
    } else if ( c1.idDis < c2.idDis) {
        return -1;
    } else { return 0; }

}
export class DefaultOrganisation implements Organisation {
    actComp1: number;
    actComp2: number;
    actComp3: number;
    actComp4: number;
    actComp5: number;
    actComp6: number;
    actComp7: string;
    actif: number;
    adresse: string;
    adresse2: string;
    afsca: string;
    afsca1: string;
    afsca2: string;
    afsca3: string;
    antenne: number;
    banque: string;
    bic: string;
    civilite: number;
    civiliteSec: number;
    civiliteTres: number;
    civiliteVp: number;
    classeFbba1: number;
    classeFbba2: number;
    classeFbba3: number;
    classique: string;
    coldis: number;
    cotAnnuelle: number;
    cotMonths: number;
    cotMonthsSup: number;
    cotSup: number;
    cp: string;
    cp2: string;
    cpasyN: number;
    dateReg: string;
    daten: number;
    depPrinc: number;
    depotram: number;
    depyN: number;
    disprog: string;
    distrListPdt: number;
    distrListSec: number;
    distrListTres: number;
    distrListVp: number;
    email: string;
    emailPres: string;
    emailSec: string;
    emailTres: string;
    emailVp: string;
    fax: string;
    feadN: number;
    gestBen: number;
    gsm: string;
    gsmPres: string;
    gsmSec: string;
    gsmTres: string;
    gsmVp: string;
    iban: string;
    idDis: number;
    langue: number;
    lastvisit: string;
    lienBanque: number;
    lienCpas: number;
    lienDepot: number;
    lienGd: number;
    lienGs: number;
    localite: string;
    localite2: string;
    logBirb: number;
    lupdTs: string;
    lupdUserName: string;
    montCot: number;
    msonac: number;
    nAdo: number;
    n1824: number;
    nBebe: number;
    nEnf: number;
    nEq: number;
    nFam: number;
    nNour: number;
    nPers: number;
    nSen: number;
    nbrefix: number;
    nom: string;
    nomSec: string;
    nomTres: string;
    nomVp: string;
    nrFead: number;
    nrTournee: number;
    pays: number;
    pays2: number;
    prenom: string;
    prenomSec: string;
    prenomTres: string;
    prenomVp: string;
    refInt: string;
    region: number;
    rem: string;
    remLivr: string;
    societe: string;
    statut: string;
    stopSusp: string;
    susp: number;
    tel: string;
    telPres: string;
    telSec: string;
    telTres: string;
    telVp: string;
    tourneeJour: number;
    tourneeMois: number;
    tourneeSem: number;
    tva: string;
    webauthority: boolean;
    website: string;
    constructor() {
        this.actComp1 = 0;
        this.actComp2 = 0;
        this.actComp3 = 0;
        this.actComp4 = 0;
        this.actComp5 = 0;
        this.actComp6 = 0;
        this.actComp7 = '';
        this.actif = 0;
        this.adresse = '';
        this.adresse2 = '';
        this.afsca = '';
        this.afsca1 = '';
        this.afsca2 = '';
        this.afsca3 = '';
        this.antenne = 0;
        this.banque = '';
        this.bic = '';
        this.civilite = 0;
        this.civiliteSec = 0;
        this.civiliteTres = 0;
        this.civiliteVp = 0;
        this.classeFbba1 = 0;
        this.classeFbba2 = 0;
        this.classeFbba3 = 0;
        this.classique = '';
        this.coldis = 0;
        this.cotAnnuelle = 0;
        this.cotMonths = 0;
        this.cotMonthsSup = 0;
        this.cotSup = 0;
        this.cp = '';
        this.cp2 = '';
        this.cpasyN = 0;
        this.dateReg = '';
        this.daten = 0;
        this.depPrinc = 0;
        this.depotram = 0;
        this.depyN = 0;
        this.disprog = '';
        this.distrListPdt = 0;
        this.distrListSec = 0;
        this.distrListTres = 0;
        this.distrListVp = 0;
        this.email = '';
        this.emailPres = '';
        this.emailSec = '';
        this.emailTres = '';
        this.emailVp = '';
        this.fax = '';
        this.feadN = 0;
        this.gestBen = 0;
        this.gsm = '';
        this.gsmPres = '';
        this.gsmSec = '';
        this.gsmTres = '';
        this.gsmVp = '';
        this.iban = '';
        // this.idDis = 0; no Id in default constructor for new Depot, will be autogenerated
        this.langue = 0;
        this.lastvisit = '';
        this.lienBanque = 0;
        this.lienCpas = 0;
        this.lienDepot = 0;
        this.lienGd = 0;
        this.lienGs = 0;
        this.localite = '';
        this.localite2 = '';
        this.logBirb = 0;
        this.lupdTs = '';
        this.lupdUserName = '';
        this.montCot = 0;
        this.msonac = 0;
        this.nAdo = 0;
        this.n1824 = 0;
        this.nBebe = 0;
        this.nEnf = 0;
        this.nEq = 0;
        this.nFam = 0;
        this.nNour = 0;
        this.nPers = 0;
        this.nSen = 0;
        this.nbrefix = 0;
        this.nom = '';
        this.nomSec = '';
        this.nomTres = '';
        this.nomVp = '';
        this.nrFead = 0;
        this.nrTournee = 0;
        this.pays = 0;
        this.pays2 = 0;
        this.prenom = '';
        this.prenomSec = '';
        this.prenomTres = '';
        this.prenomVp = '';
        this.refInt = '';
        this.region = 0;
        this.rem = '';
        this.remLivr = '';
        this.societe = '';
        this.statut = '';
        this.stopSusp = '';
        this.susp = 0;
        this.tel = '';
        this.telPres = '';
        this.telSec = '';
        this.telTres = '';
        this.telVp = '';
        this.tourneeJour = 0;
        this.tourneeMois = 0;
        this.tourneeSem = 0;
        this.tva = '';
        this.webauthority = true;
        this.website = '';
    }
}
