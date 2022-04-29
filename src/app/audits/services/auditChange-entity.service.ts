import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {AuditChange, DefaultAuditChange} from '../model/auditChange';

@Injectable()
export class AuditChangeEntityService
    extends EntityCollectionServiceBase<AuditChange> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('AuditChange', serviceElementsFactory);
    }
    logDbChange(user: string, userName: string,  bankId: number, idDis: number, entity: string, entity_key: string, action: string) {
        const auditChange = new DefaultAuditChange(user, userName, bankId, idDis, entity, entity_key, action);
        this.add(auditChange);
    }

}