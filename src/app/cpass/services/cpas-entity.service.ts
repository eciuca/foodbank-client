import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Cpas} from '../model/cpas';

@Injectable()
export class CpasEntityService
    extends EntityCollectionServiceBase<Cpas> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Cpas', serviceElementsFactory);
    }

}
