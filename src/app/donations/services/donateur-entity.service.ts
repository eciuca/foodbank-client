import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Donateur} from '../model/donateur';

@Injectable()
export class DonateurEntityService
    extends EntityCollectionServiceBase<Donateur> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Donateur', serviceElementsFactory);
    }

}