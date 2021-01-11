import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Organisation} from '../model/organisation';

@Injectable()
export class OrganisationEntityService
    extends EntityCollectionServiceBase<Organisation> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Organisation', serviceElementsFactory);
    }

}
