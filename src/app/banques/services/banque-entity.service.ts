import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Banque} from '../model/banque';

@Injectable()
export class BanqueEntityService
    extends EntityCollectionServiceBase<Banque> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Banque', serviceElementsFactory);
    }

}
