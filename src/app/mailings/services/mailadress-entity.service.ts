import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {MailAddress} from '../model/mailaddress';

@Injectable()
export class MailadressEntityService
    extends EntityCollectionServiceBase<MailAddress> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('MailAddress', serviceElementsFactory);
    }
}