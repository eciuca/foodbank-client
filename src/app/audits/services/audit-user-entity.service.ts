import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {AuditUser} from '../model/auditUser';

@Injectable()
export class AuditUserEntityService
    extends EntityCollectionServiceBase<AuditUser> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('AuditUser', serviceElementsFactory);
    }

}