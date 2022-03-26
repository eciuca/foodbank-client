import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {MembreFunction} from '../model/membreFunction';

@Injectable()
export class MembreFunctionEntityService
    extends EntityCollectionServiceBase<MembreFunction> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('MembreFunction', serviceElementsFactory);
    }

}