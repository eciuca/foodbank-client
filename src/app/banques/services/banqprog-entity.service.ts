import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {BanqProg} from '../model/banqprog';

@Injectable()
export class BanqProgEntityService
    extends EntityCollectionServiceBase<BanqProg> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('BanqProg', serviceElementsFactory);
    }

}