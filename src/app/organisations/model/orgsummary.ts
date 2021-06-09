export interface OrgSummary {
    idDis: number;
    societe: string;
}
export function compareOrgSummaries(c1: OrgSummary, c2: OrgSummary) {

    const compare = c1.societe > c2.societe;

    if (compare) {
    return 1;
    } else if ( c1.societe < c2.societe) {
        return -1;
    } else { return 0; }

}
