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
import {DepotsResolver} from './depots.resolver';
import {FormsModule} from '@angular/forms';
import {appEntityMetadata} from '../app-entity.metadata';
import {ConfirmationService} from 'primeng/api';
import {ConfirmPopupModule} from 'primeng/confirmpopup';

const routes: Routes = [
  { path: '',
    component: DepotsComponent,
    resolve: {
      DepotsResolver
    }
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
        ConfirmPopupModule
    ],
  providers: [
    DepotsDataService,
    DepotEntityService,
    ConfirmationService,
    DepotsResolver
  ],
})
export class DepotsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private depotsDataService: DepotsDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Depot', depotsDataService);
  }

}
