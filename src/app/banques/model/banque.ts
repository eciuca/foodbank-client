export interface  Banque {

 bankId: number;

 bankShortName: string;

 bankName: string;

 nrEntr: string;

 bankMail: string;

 actif: number;

 comGestactif: number;

 lastvisit: Date;

 nomPresactif: number;

 nomVpactif: number;

 nomSecactif: number;

 nomTresactif: number;

 nomItactif: number;

 nomLogactif: number;

 nomRhactif: number;

 nomShactif: number;

 nomPpactif: number;

 nomAssoactif: number;

 nomApproactif: number;

 nomPubrelactif: number;

 nomCeoactif: number;

 nomFeadactif: number;

 adresse: string;

 cp: string;

 localite: string;

 bankTel: string;

 bankGsm: string;

 adresseDepotPrinc: string;

 cpDepotPrinc: string;

 cityDepotPrinc: string;

 depPrincTel: string;

 ssAdresse: string;

 ssCp: string;

 ssCity: string;

 ssTel: string;

 regioactif: number;

 website: string;

 bank: string;
}

export function compareBanques(c1: Banque, c2: Banque) {

 const compare = c1.bankId - c2.bankId;

 if (compare > 0) {
  return 1;
 } else if ( compare < 0) {
  return -1;
 } else { return 0; }

}
