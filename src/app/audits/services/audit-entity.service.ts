import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Audit} from '../model/audit';

@Injectable()
export class AuditEntityService
    extends EntityCollectionServiceBase<Audit> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Audit', serviceElementsFactory);
    }

}