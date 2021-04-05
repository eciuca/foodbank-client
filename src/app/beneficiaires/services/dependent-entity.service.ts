import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Dependent} from '../model/dependent';

@Injectable()
export class DependentEntityService
    extends EntityCollectionServiceBase<Dependent> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Dependent', serviceElementsFactory);
    }

}
