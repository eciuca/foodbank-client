import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Depot} from '../model/depot';

@Injectable()
export class DepotEntityService
    extends EntityCollectionServiceBase<Depot> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Depot', serviceElementsFactory);
    }

}
