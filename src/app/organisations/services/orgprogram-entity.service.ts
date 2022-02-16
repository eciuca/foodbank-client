import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {OrgProgram} from '../model/orgprogram';

@Injectable()
export class OrgProgramEntityService
    extends EntityCollectionServiceBase<OrgProgram> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('OrgProgram', serviceElementsFactory);
    }
}