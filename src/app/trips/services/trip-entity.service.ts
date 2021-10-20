import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Trip} from '../model/trip';

@Injectable()
export class TripEntityService
    extends EntityCollectionServiceBase<Trip> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Trip', serviceElementsFactory);
    }

}