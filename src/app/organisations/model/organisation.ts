export interface Organisation {

    idDis: string;

    lienBanque: number;

    refInt: string;

    birbCode: string;

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

    lastvisit: Date;

    nbrefix: number;

    cpasyN: number;

    lienCpas: number;

    birbyN: number;

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

    lupdTs: Date;

    bankShortName: string;

    bankName: string;

}

export function compareOrganisations(c1: Organisation, c2: Organisation) {

    const compare = c1.idDis > c2.idDis;

    if (compare) {
        return 1;
    } else if ( c1.idDis < c2.idDis) {
        return -1;
    } else { return 0; }

}
