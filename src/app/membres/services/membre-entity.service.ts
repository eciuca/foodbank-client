import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Membre} from '../model/membre';

@Injectable()
export class MembreEntityService
    extends EntityCollectionServiceBase<Membre> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Membre', serviceElementsFactory);
    }

}
