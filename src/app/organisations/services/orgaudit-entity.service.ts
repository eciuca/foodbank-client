import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Orgaudit} from '../model/orgaudit';

@Injectable()
export class OrgauditEntityService
    extends EntityCollectionServiceBase<Orgaudit> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Orgaudit', serviceElementsFactory);
    }
}