import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BanquesComponent } from './banques.component';
import { BanquesResolver} from './banques.resolver';
import { BanqueComponent } from './banque/banque.component';

import {BanquesDataService} from './services/banques-data.service';
import {BanqueEntityService} from './services/banque-entity.service';
import {EntityDataService, EntityDefinitionService } from '@ngrx/data';
import {TableModule } from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {DialogModule} from 'primeng/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MembresDataService} from '../membres/services/membres-data.service';
import {MembreEntityService} from '../membres/services/membre-entity.service';
import {appEntityMetadata} from '../app-entity.metadata';
import {MessageModule} from 'primeng/message';
import {ConfirmationService} from 'primeng/api';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ToastModule} from 'primeng/toast';
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

@NgModule({
  declarations: [BanquesComponent, BanqueComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        PanelModule,
        DialogModule,
        FormsModule,
        ReactiveFormsModule,
        MessageModule,
        ConfirmPopupModule,
        AutoCompleteModule,
        ToastModule
    ],
  providers: [
    BanquesDataService,
    BanqueEntityService,
    MembresDataService,
    MembreEntityService,
    ConfirmationService,
    BanquesResolver
  ],
})
export class BanquesModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private banquesDataService: BanquesDataService,
      private membresDataService: MembresDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Banque', banquesDataService);
    entityDataService.registerService('Membre', membresDataService);
  }

}
