import {Injectable, ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {Banque, compareBanques} from '../banques/model/banque';
import { BanquesComponent } from './banques.component';
import {BanquesResolver} from './banques.resolver';
import { BanqueComponent } from './banque/banque.component';
import {HttpClientModule} from '@angular/common/http';

import {BanquesDataService} from './services/banques-data.service';
import {BanqueEntityService} from './services/banque-entity.service';
import {EntityDataService, EntityDefinitionService, EntityMetadataMap} from '@ngrx/data';

import { TableModule } from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';

import {PanelModule} from 'primeng/panel';
import {DialogModule} from 'primeng/dialog';

const routes: Routes = [
    {   path: '',
        component: BanquesComponent,
        resolve: {
            BanquesResolver
        }
    },
    {
        path: ':bankId',
        component: BanqueComponent,
        resolve: {
            BanquesResolver
        }
    }
];
const entityMetaData: EntityMetadataMap = {
  Banque: {
    sortComparer: compareBanques,
    selectId: (banque: Banque) => banque.bankId,
    entityDispatcherOptions: { optimisticUpdate: false}
  },

};
@NgModule({
  declarations: [BanquesComponent, BanqueComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        HttpClientModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        PanelModule,
        DialogModule
    ],
  providers: [
    BanquesDataService,
    BanqueEntityService,
    BanquesResolver
  ],
})
export class BanquesModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private banquesDataService: BanquesDataService
  ) {
    eds.registerMetadataMap(entityMetaData);
    entityDataService.registerService('Banque', banquesDataService);
  }

}
