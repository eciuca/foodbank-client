export interface MovementReport {
    key: string; // key of the movement: month or day
    day: string; // day of the movement
    month: number; // month of the movement
    bankShortName: string;
    lienDepot: number;
    idOrg: number;
    orgname: string;
    category: string;
    quantity: number;
    nfamilies: number;
    npersons: number;
    lastupdated: string;

}

