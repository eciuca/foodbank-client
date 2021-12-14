export interface Audit {
    auditId: number;
    user: string;
    dateIn: string;
    ipAddress: string;
    idDis: number;
    application: string;
    societe: string;
    shortBankName: string;
    userName: string;
    rights: string;
    totalRecords: number;
}
export function compareAudits(c1: Audit, c2: Audit) {
    const compare = c1.auditId > c2.auditId;
    if (compare) {
        return 1;
    } else if ( c1.auditId < c2.auditId) {
        return -1;
    } else { return 0; }
}
