import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DepotsComponent } from './depots.component';
import {DepotComponent } from './depot/depot.component';
import {EntityDataService, EntityDefinitionService } from '@ngrx/data';
import {DepotsDataService} from './services/depots-data.service';
import {DepotEntityService} from './services/depot-entity.service';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {InputSwitchModule} from 'primeng/inputswitch';
import {MessageModule} from 'primeng/message';
import {DialogModule} from 'primeng/dialog';
import {ConfirmDialogModule} from 'primeng/confirmdialog';

import {FormsModule} from '@angular/forms';
import {appEntityMetadata} from '../app-entity.metadata';
import {ConfirmationService} from 'primeng/api';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ToastModule} from 'primeng/toast';
import {BanquesDataService} from '../banques/services/banques-data.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';

const routes: Routes = [
  { path: '',
    component: DepotsComponent,
  },
  {
    path: ':idDepot',
    component: DepotComponent,
  }
];

@NgModule({
  declarations: [DepotsComponent, DepotComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        PanelModule,
        PaginatorModule,
        InputTextModule,
        InputSwitchModule,
        ButtonModule,
        DialogModule,
        ConfirmDialogModule,
        MessageModule,
        FormsModule,
        ConfirmPopupModule,
        ToastModule
    ],
  providers: [
    DepotsDataService,
    DepotEntityService,
    BanquesDataService,
    BanqueEntityService,
    ConfirmationService
  ],
})
export class DepotsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private depotsDataService: DepotsDataService,
      private banquesDataService: BanquesDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Depot', depotsDataService);
    entityDataService.registerService('Banque', banquesDataService);
  }

}
