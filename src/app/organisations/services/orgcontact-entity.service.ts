import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Orgcontact} from '../model/orgcontact';

@Injectable()
export class OrgcontactEntityService
    extends EntityCollectionServiceBase<Orgcontact> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Orgcontact', serviceElementsFactory);
    }
}
