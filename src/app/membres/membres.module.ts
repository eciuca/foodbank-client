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
import {OrgSummariesDataService} from '../organisations/services/orgsummaries-data.service';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {InputSwitchModule} from 'primeng/inputswitch';
import {CheckboxModule} from 'primeng/checkbox';
import {BanquesDataService} from '../banques/services/banques-data.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';

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
        AutoCompleteModule,
        InputSwitchModule,
        CheckboxModule
    ],
  providers: [
    MembresDataService,
    MembreEntityService,
      OrgSummariesDataService,
      OrgSummaryEntityService,
      BanquesDataService,
      BanqueEntityService,
    ConfirmationService
  ],
})
export class MembresModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private membresDataService: MembresDataService,
      private banquesDataService: BanquesDataService,
      private orgSummariesDataService: OrgSummariesDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Membre', membresDataService);
    entityDataService.registerService('Banque', banquesDataService);
    entityDataService.registerService('OrgSummary', orgSummariesDataService);
  }

}
