import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {OrgSummary} from '../model/orgsummary';

@Injectable()
export class OrgSummaryEntityService
    extends EntityCollectionServiceBase<OrgSummary> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('OrgSummary', serviceElementsFactory);
    }
}