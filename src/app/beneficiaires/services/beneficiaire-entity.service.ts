import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Beneficiaire} from '../model/beneficiaire';

@Injectable()
export class BeneficiaireEntityService
    extends EntityCollectionServiceBase<Beneficiaire> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Beneficiaire', serviceElementsFactory);
    }

}
