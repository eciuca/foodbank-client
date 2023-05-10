export interface MovementReport {
    key: string; // key of the movement: month or day for summaries
    day: string; // day of the movement
    month: string; // month of the movement
    bankShortName: string;
    idOrg: number; // can be idOrg of Depot when responding to queries with Depot category
    orgname: string;
    category: string;
    quantity: number;
    nfamilies: number;
    npersons: number;
    norgs: number; // nb of orgs within Depot when responding to queries with Depot category
    lastupdated: string;

}

