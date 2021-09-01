export interface OrgMemberReport {
    societe: string;
    nbMembers: number;
}
export function compareOrgMemberReports(c1: OrgMemberReport, c2: OrgMemberReport) {
// Alain: sort in desc order
    const compare = c1.nbMembers < c2.nbMembers;

    if (compare) {
        return 1;
    } else if ( c1.nbMembers > c2.nbMembers) {
        return -1;
    } else { return 0; }

}