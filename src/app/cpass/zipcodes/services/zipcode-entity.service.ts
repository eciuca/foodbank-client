import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Zipcode} from '../../model/zipcode';

@Injectable()
export class ZipcodeEntityService
    extends EntityCollectionServiceBase<Zipcode> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Zipcode', serviceElementsFactory);
    }

}
