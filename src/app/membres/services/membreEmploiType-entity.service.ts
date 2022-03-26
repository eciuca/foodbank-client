import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {MembreEmploiType} from '../model/membreEmploiType';

@Injectable()
export class MembreEmploiTypeEntityService
    extends EntityCollectionServiceBase<MembreEmploiType> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('MembreEmploiType', serviceElementsFactory);
    }

}