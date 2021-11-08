import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Don} from '../model/don';

@Injectable()
export class DonEntityService
    extends EntityCollectionServiceBase<Don> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Don', serviceElementsFactory);
    }

}