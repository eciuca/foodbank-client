export interface AuditUser {
    idUser: string;
    userName: string;
    idCompany: string;
    idOrg: number;
    societe: string;
    email: string;
    rights: string;
    loginCountPHP: number;
    loginCountFBIT: number;
    totalRecords: number;
}
export function compareAuditUsers(c1: AuditUser, c2: AuditUser) {
    const compare = c1.idUser > c2.idUser;
    if (compare) {
        return 1;
    } else if ( c1.idUser < c2.idUser) {
        return -1;
    } else { return 0; }
}