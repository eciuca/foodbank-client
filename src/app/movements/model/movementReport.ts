export interface MovementReport {
    key: string; // key of the movement: month or day for summaries
    day: string; // day of the movement
    month: string; // month of the movement
    bankShortName: string;
    idOrg: number;

    orgname: string;

    category: string;

    quantity: number;

    lastupdated: string;

}

