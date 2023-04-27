import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {ZipCode} from '../../model/zipCode';

@Injectable()
export class ZipcodeEntityService
    extends EntityCollectionServiceBase<ZipCode> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Zipcode', serviceElementsFactory);
    }

}
