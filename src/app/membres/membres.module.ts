import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MembresComponent } from './membres.component';
import {MembreComponent } from './membre/membre.component';
import {EntityDataService, EntityDefinitionService } from '@ngrx/data';
import {MembresDataService} from './services/membres-data.service';
import {MembreEntityService} from './services/membre-entity.service';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';
import {appEntityMetadata} from '../app-entity.metadata';
import {MessageModule} from 'primeng/message';
import {SelectButtonModule} from 'primeng/selectbutton';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';
import {CalendarModule} from 'primeng/calendar';
import {ToastModule} from 'primeng/toast';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {OrganisationsDataService} from '../organisations/services/organisations-data.service';
import {OrganisationEntityService} from '../organisations/services/organisation-entity.service';

const routes: Routes = [
  { path: '',
    component: MembresComponent,
  },
  {
    path: ':batId',
    component: MembreComponent,
  }
];
@NgModule({
  declarations: [MembresComponent, MembreComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        PanelModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        MessageModule,
        SelectButtonModule,
        ConfirmPopupModule,
        CalendarModule,
        ToastModule,
        AutoCompleteModule
    ],
  providers: [
    MembresDataService,
    MembreEntityService,
      OrganisationsDataService,
      OrganisationEntityService,
    ConfirmationService
  ],
})
export class MembresModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private membresDataService: MembresDataService,
      private organisationsDataService: OrganisationsDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Membre', membresDataService);
    entityDataService.registerService('Organisation', organisationsDataService);
  }

}
