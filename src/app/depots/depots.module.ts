import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {DepotsComponent} from './depots.component';
import {DepotComponent} from './depot/depot.component';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
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
import {TooltipModule} from 'primeng/tooltip';
import {BanquesDataService} from '../banques/services/banques-data.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {AuditChangesDataService} from '../audits/services/auditChanges-data.service';
import {AuditChangeEntityService} from '../audits/services/auditChange-entity.service';
import {CheckboxModule} from 'primeng/checkbox';
import {OrgSummariesDataService} from '../organisations/services/orgsummaries-data.service';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {AutoCompleteModule} from 'primeng/autocomplete';


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
        ToastModule,
        TooltipModule,
        CheckboxModule,
        AutoCompleteModule,
    ],
  providers: [
    DepotsDataService,
    DepotEntityService,
      OrgSummariesDataService,
      OrgSummaryEntityService,
    BanquesDataService,
    BanqueEntityService,
    AuditChangesDataService,
    AuditChangeEntityService,
    ConfirmationService
  ],
})
export class DepotsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private depotsDataService: DepotsDataService,
      private banquesDataService: BanquesDataService,
      private orgSummariesDataService: OrgSummariesDataService,
      private auditChangesDataService: AuditChangesDataService,
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Depot', depotsDataService);
    entityDataService.registerService('Banque', banquesDataService);
    entityDataService.registerService('OrgSummary', orgSummariesDataService);
    entityDataService.registerService('AuditChange', auditChangesDataService);
  }

}
