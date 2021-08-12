import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {MembreMail} from '../model/membreMail';

@Injectable()
export class MembreMailEntityService
    extends EntityCollectionServiceBase<MembreMail> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('MembreMail', serviceElementsFactory);
    }

}
