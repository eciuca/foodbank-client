export interface  Banque {

 bankId: number;

 bankShortName: string;

 bankName: string;

 nrEntr: string;

 bankMail: string;

 actif: number;

 comGest: number;

 lastvisit: Date;

 idMemberPres: number;

 idMemberVp: number;

 idMemberSec: number;

 idMemberTres: number;

 idMemberIt: number;

 idMemberLog: number;

 idMemberRh: number;

 idMemberSh: number;

 idMemberPp: number;

 idMemberAsso: number;

 idMemberAppro: number;

 idMemberPubrel: number;

 idMemberCeo: number;

 idMemberFead: number;

 idMemberQual: number;

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

 regio: number;

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
