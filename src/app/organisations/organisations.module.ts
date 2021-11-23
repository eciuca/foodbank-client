import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {OrganisationsComponent } from './organisations.component';
import {OrganisationComponent } from './organisation/organisation.component';

import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {OrganisationEntityService} from './services/organisation-entity.service';
import {OrganisationsDataService} from './services/organisations-data.service';
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {AccordionModule} from 'primeng/accordion';
import {DialogModule} from 'primeng/dialog';
import {appEntityMetadata} from '../app-entity.metadata';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {CpassDataService} from '../cpass/services/cpass-data.service';
import {CpasEntityService} from '../cpass/services/cpas-entity.service';
import {DepotsDataService} from '../depots/services/depots-data.service';
import {DepotEntityService} from '../depots/services/depot-entity.service';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputSwitchModule} from 'primeng/inputswitch';
import { OrgcontactsComponent } from './orgcontacts/orgcontacts.component';
import { OrgcontactComponent } from './orgcontacts/orgcontact/orgcontact.component';
import {OrgcontactsDataService} from './services/orgcontacts-data.service';
import {OrgcontactEntityService} from './services/orgcontact-entity.service';
import {MessageModule} from 'primeng/message';
import {ToastModule} from 'primeng/toast';
import {CheckboxModule} from 'primeng/checkbox';
import {ChartModule} from 'primeng/chart';
import {OrgReportComponent} from './orgreport/orgreport.component';
import {OrgReportService} from './services/org-report.service';
import {OrgOneReportComponent} from './orgonereport/orgonereport.component';
import {OrgSummariesDataService} from './services/orgsummaries-data.service';
import {OrgSummaryEntityService} from './services/orgsummary-entity.service';

const routes: Routes = [
    { path: '',
        component: OrganisationsComponent
    },
    {
        path: ':idDis',
        component: OrganisationComponent
   },
    {
        path: 'contacts/:idDis',
        component: OrgcontactsComponent
    },
    {
        path: 'orgreports/:bankId',
        component: OrgReportComponent
    },
    {
        path: 'orgreport/:idDis',
        component: OrgOneReportComponent
    }
];

@NgModule({
    // tslint:disable-next-line:max-line-length
  declarations: [OrganisationsComponent, OrganisationComponent, OrgcontactsComponent, OrgcontactComponent, OrgReportComponent, OrgOneReportComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        PanelModule,
        AccordionModule,
        DialogModule,
        ConfirmPopupModule,
        AutoCompleteModule,
        InputNumberModule,
        InputSwitchModule,
        MessageModule,
        ToastModule,
        CheckboxModule,
        ChartModule
    ],
  providers: [
        OrganisationsDataService,
        OrganisationEntityService,
        OrgSummariesDataService,
        OrgSummaryEntityService,
        OrgcontactsDataService,
        OrgcontactEntityService,
        OrgReportService,
        CpassDataService,
        CpasEntityService,
        DepotsDataService,
        DepotEntityService,
        ConfirmationService
  ]
})
export class OrganisationsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private organisationsDataService: OrganisationsDataService,
      private orgSummariesDataService: OrgSummariesDataService,
      private orgcontactsDataService: OrgcontactsDataService,
      private cpassDataService: CpassDataService,
      private depotsDataService: DepotsDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Organisation', organisationsDataService);
    entityDataService.registerService('OrgSummary', orgSummariesDataService);
    entityDataService.registerService('Orgcontact', orgcontactsDataService);
    entityDataService.registerService('Cpas', cpassDataService);
    entityDataService.registerService('Depot', depotsDataService);
  }
}
