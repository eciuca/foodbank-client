export interface Organisation {

    idDis: number;

    lienBanque: number;

    bankShortName: string; // calculated field

    refInt: string;

    birbCode: string;

    lienDepot: number;
    nomDepot: string;

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

    agreed: boolean;

    banque: string;

    region: number;
    iban: string;
    classique: string;
    bic: string;

    actif: boolean;

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

    cpasyN: boolean;

    lienCpas: number;

    birbyN: boolean;

    depyN: boolean;

    logBirb: number;

    actComp1: number;

    actComp2: number;

    actComp3: number;

    actComp4: number;

    actComp5: number;

    actComp6: number;

    actComp7: string;

    nrTournee: number;

    susp: boolean;

    stopSusp: string;

    rem: string;

    msonac: boolean;

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

    depPrinc: boolean;

    gestBen: boolean;

    tourneeJour: number;

    tourneeSem: number;

    coldis: number;

    lienGd: number;

    lienGs: number;

    montCot: number;

    antenne: number;

    antenneOrgName: string;

    afsca1: string;

    afsca2: string;

    afsca3: string;

    nrFead: number;

    tourneeMois: number;

    distrListPdt: boolean;

    distrListVp: boolean;

    distrListSec: boolean;

    distrListTres: boolean;

    adresse2: string;

    cp2: string;

    localite2: string;

    pays2: number;

    dateReg: string;

    fax: string;

    feadN: boolean;

    remLivr: string;

    cotAnnuelle: boolean;

    cotMonths: number;

    cotSup: boolean;

    cotMonthsSup: number;

    depotram: number;
    nomDepotRamasse: string;

    lupdUserName: string;

    lupdTs: string;

    nbLogins: number;
    anomalies: string;
    totalRecords: number;

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
    actif: boolean;
    adresse: string;
    adresse2: string;
    afsca: string;
    afsca1: string;
    afsca2: string;
    afsca3: string;
    antenne: number;
    antenneOrgName: string;
    banque: string;
    bic: string;
    birbCode: string;
    civilite: number;
    civiliteSec: number;
    civiliteTres: number;
    civiliteVp: number;
    classeFbba1: number;
    classeFbba2: number;
    classeFbba3: number;
    classique: string;
    coldis: number;
    cotAnnuelle: boolean;
    cotMonths: number;
    cotMonthsSup: number;
    cotSup: boolean;
    cp: string;
    cp2: string;
    cpasyN: boolean;
    dateReg: string;
    agreed: boolean;
    depPrinc: boolean;
    depotram: number;
    nomDepotRamasse: string;
    birbyN: boolean;
    depyN: boolean;
    disprog: string;
    distrListPdt: boolean;
    distrListSec: boolean;
    distrListTres: boolean;
    distrListVp: boolean;
    email: string;
    emailPres: string;
    emailSec: string;
    emailTres: string;
    emailVp: string;
    fax: string;
    feadN: boolean;
    gestBen: boolean;
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
    bankShortName: string; // calculated field
    lienCpas: number;
    lienDepot: number;
    nomDepot: string;
    lienGd: number;
    lienGs: number;
    localite: string;
    localite2: string;
    logBirb: number;
    lupdTs: string;
    lupdUserName: string;
    montCot: number;
    msonac: boolean;
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
    susp: boolean;
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
    nbLogins: number;
    anomalies: string;
    totalRecords: number;

    constructor() {
        this.actComp1 = 0;
        this.actComp2 = 0;
        this.actComp3 = 0;
        this.actComp4 = 0;
        this.actComp5 = 0;
        this.actComp6 = 0;
        this.actComp7 = '';
        this.actif = true;
        this.adresse = '';
        this.adresse2 = '';
        this.afsca = '';
        this.afsca1 = '';
        this.afsca2 = '';
        this.afsca3 = '';
        this.antenne = 0;
        this.antenneOrgName = '';
        this.banque = '';
        this.bic = '';
        this.birbCode = '';
        this.civilite = 0;
        this.civiliteSec = 0;
        this.civiliteTres = 0;
        this.civiliteVp = 0;
        this.classeFbba1 = 0;
        this.classeFbba2 = 0;
        this.classeFbba3 = 0;
        this.classique = '';
        this.coldis = 0;
        this.cotAnnuelle = false;
        this.cotMonths = 0;
        this.cotMonthsSup = 0;
        this.cotSup = false;
        this.cp = '';
        this.cp2 = '';
        this.cpasyN = false;
        this.dateReg = '';
        this.agreed = true;
        this.depPrinc = false;
        this.depotram = 0;
        this.nomDepotRamasse ='';
        this.birbyN = false;
        this.depyN = false;
        this.disprog = '';
        this.distrListPdt = true;
        this.distrListSec = true;
        this.distrListTres = false;
        this.distrListVp = true;
        this.email = '';
        this.emailPres = '';
        this.emailSec = '';
        this.emailTres = '';
        this.emailVp = '';
        this.fax = '';
        this.feadN = false;
        this.gestBen = false;
        this.gsm = '';
        this.gsmPres = '';
        this.gsmSec = '';
        this.gsmTres = '';
        this.gsmVp = '';
        this.iban = '';
        // this.idDis = 0; no idDis in default constructor for new Depot, will be autogenerated
        this.langue = 0;
        this.lastvisit = '';
        this.lienBanque = 0;
        this.bankShortName = '';
        this.lienCpas = 0;
        this.lienDepot = 0;
        this.nomDepot ='';
        this.lienGd = 0;
        this.lienGs = 0;
        this.localite = '';
        this.localite2 = '';
        this.logBirb = 0;
        this.lupdTs = '';
        this.lupdUserName = '';
        this.montCot = 0;
        this.msonac = false;
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
        this.susp = false;
        this.tel = '';
        this.telPres = '';
        this.telSec = '';
        this.telTres = '';
        this.telVp = '';
        this.tourneeJour = 0; // every day see enmSupplyDay
        this.tourneeMois = 3; // every month see enmSupplyMonth
        this.tourneeSem = 5;  // every week see enmSupplyWeek
        this.tva = '';
        this.webauthority = true;
        this.website = '';
        this.nbLogins = 0;
        this.anomalies ='';
        this.totalRecords = 0;
    }
}
