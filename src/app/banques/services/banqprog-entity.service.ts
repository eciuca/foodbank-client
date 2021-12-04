import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {BanqProg} from '../model/banqProg';

@Injectable()
export class BanqProgEntityService
    extends EntityCollectionServiceBase<BanqProg> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('BanqProg', serviceElementsFactory);
    }

}