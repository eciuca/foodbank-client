import {Injectable} from '@angular/core';
import {EntityCollectionServiceBase, EntityCollectionServiceElementsFactory} from '@ngrx/data';
import {Mailing} from '../model/mailing';

@Injectable()
export class MailingEntityService
    extends EntityCollectionServiceBase<Mailing> {

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Mailing', serviceElementsFactory);
    }
}
