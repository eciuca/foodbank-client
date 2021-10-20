export interface Trip {
    tripId: number;

    tripDate: string;

    tripDepart: string;

    tripArrivee: string;

    tripKm: string;

    batId: number;

    dateEnreg: string;

    actif: boolean;
    membreNom: string;

    totalRecords: number;
}
export function compareTrips(c1: Trip, c2: Trip) {

    const compare = c1.tripId - c2.tripId;

    if (compare > 0) {
        return 1;
    } else if (compare < 0) {
        return -1;
    } else {
        return 0;
    }
}
export class DefaultTrip implements Trip {
    actif: boolean;
    batId: number;
    dateEnreg: string;
    membreNom: string;
    totalRecords: number;
    tripArrivee: string;
    tripDate: string;
    tripDepart: string;
    tripId: number;
    tripKm: string;
    constructor() {
        this.actif = true;
        this.batId = 0;
        this.dateEnreg = '';
        this.membreNom = '';
        this.tripArrivee = '';
        this.tripDate = '';
        this.tripDepart = '';
        this.tripKm = '';
    }
}
