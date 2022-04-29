export interface AuditChange {
    auditId: number;
    user: string;
    dateIn: string;
    bankId: number;
    idDis: number;
    entity: string;
    entity_key: string;
    action: string;
    societe: string;
    bankShortName: string;
    userName: string;
    totalRecords: number;
}
export function compareAuditChanges(c1: AuditChange, c2: AuditChange) {
    const compare = c1.auditId > c2.auditId;
    if (compare) {
        return 1;
    } else if ( c1.auditId < c2.auditId) {
        return -1;
    } else { return 0; }
}

export class DefaultAuditChange implements AuditChange {
    action: string;
    auditId: number;
    bankId: number;
    bankShortName: string;
    dateIn: string;
    entity: string;
    entity_key: string;
    idDis: number;
    societe: string;
    totalRecords: number;
    user: string;
    userName: string;

    constructor(user: string, userName: string,  bankId: number, idDis: number, entity: string, entity_key: string, action: string ) {
        this.user = user;
        this.userName = userName;
        this.bankId = bankId;
        this.idDis = idDis;
        this.entity = entity;
        this.entity_key = entity_key;
        this.action = action;

    }
}