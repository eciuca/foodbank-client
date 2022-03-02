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
import { RegionsComponent } from './regions/regions.component';
import { RegionComponent } from './regions/region/region.component';
import {RegionsDataService} from './services/regions-data.service';
import {RegionEntityService} from './services/region-entity.service';
import { OrgMembershipsComponent } from './org-memberships/org-memberships.component';
import { OrgMembershipComponent } from './org-memberships/org-membership/org-membership.component';
import {EditorModule} from 'primeng/editor';
import {MailingsDataService} from '../mailings/services/mailings-data.service';
import {MailingEntityService} from '../mailings/services/mailing-entity.service';
import {BanquesDataService} from '../banques/services/banques-data.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {BanqProgEntityService} from '../banques/services/banqprog-entity.service';
import {BanqProgsDataService} from '../banques/services/banqprogs-data.service';
import { OrgMembershipMailingComponent } from './org-membership-mailing/org-membership-mailing.component';
import {MembresDataService} from '../membres/services/membres-data.service';
import {MembreEntityService} from '../membres/services/membre-entity.service';
import {FileUploadModule} from 'primeng/fileupload';
import {RadioButtonModule} from 'primeng/radiobutton';
import { OrgauditsComponent } from './orgaudits/orgaudits.component';
import { OrgauditComponent } from './orgaudits/orgaudit/orgaudit.component';
import {OrgauditsDataService} from './services/orgaudits-data.service';
import {OrgauditEntityService} from './services/orgaudit-entity.service';
import { OrgbenefoverviewComponent } from './orgbenefoverview/orgbenefoverview.component';
import { OrgbenefdetailComponent } from './orgbenefoverview/orgbenefdetail/orgbenefdetail.component';
import { OrgfeadoverviewComponent } from './orgfeadoverview/orgfeadoverview.component';
import { OrgfeaddetailComponent } from './orgfeadoverview/orgfeaddetail/orgfeaddetail.component';
import {OrgProgramsDataService} from './services/orgprograms-data.service';
import {OrgProgramEntityService} from './services/orgprogram-entity.service';
import {TooltipModule} from 'primeng/tooltip';
const routes: Routes = [
    {
        path: 'contacts/:idDis',
        component: OrgcontactsComponent
    },
    {
        path: 'orgaudits/:bankId',
        component: OrgauditsComponent
    },
    {
        path: 'orgreports/:bankId',
        component: OrgReportComponent
    },
    {
        path: 'orgreport/:idDis',
        component: OrgOneReportComponent
    },
    {
        path: 'orgbenefoverview',
        component: OrgbenefoverviewComponent
    },
    {
        path: 'orgbenefdetail/:idDis',
        component: OrgbenefdetailComponent
    },
    {
        path: 'orgfeadoverview',
        component: OrgfeadoverviewComponent
    },
    {
        path: 'orgfeaddetail/:idDis',
        component: OrgfeaddetailComponent
    },
    {
        path: 'regions/:bankId',
        component: RegionsComponent
    },
    {
        path: 'region/:regId',
        component: RegionComponent
    },
    {
        path: 'memberships/:bankId',
        component: OrgMembershipsComponent
    },
    {
        path: 'membershipmailing/:bankId',
        component: OrgMembershipMailingComponent
    },
    { path: '',
        component: OrganisationsComponent
    },
    {
        path: ':idDis',
        component: OrganisationComponent
    }
];

@NgModule({
    // tslint:disable-next-line:max-line-length
  declarations: [OrganisationsComponent, OrganisationComponent, OrgcontactsComponent, OrgcontactComponent, OrgReportComponent, OrgOneReportComponent, RegionsComponent, RegionComponent, OrgMembershipsComponent, OrgMembershipComponent, OrgMembershipMailingComponent, OrgauditsComponent, OrgauditComponent, OrgbenefoverviewComponent, OrgbenefdetailComponent, OrgfeadoverviewComponent, OrgfeaddetailComponent],
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
        ChartModule,
        EditorModule,
        FileUploadModule,
        RadioButtonModule,
        TooltipModule
    ],
  providers: [
        OrganisationsDataService,
        OrganisationEntityService,
        OrgSummariesDataService,
        OrgSummaryEntityService,
        OrgcontactsDataService,
        OrgcontactEntityService,
      OrgProgramsDataService,
      OrgProgramEntityService,
      OrgauditsDataService,
      OrgauditEntityService,
        RegionsDataService,
        RegionEntityService,
      MembresDataService,
      MembreEntityService,
        OrgReportService,
        CpassDataService,
        CpasEntityService,
        DepotsDataService,
        DepotEntityService,
        MailingsDataService,
        MailingEntityService,
      BanquesDataService,
      BanqueEntityService,
      BanqProgsDataService,
      BanqProgEntityService,
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
      private orgProgramsDataService: OrgProgramsDataService,
      private orgauditsDataService: OrgauditsDataService,
      private regionsDataService: RegionsDataService,
      private membresDataService: MembresDataService,
      private cpassDataService: CpassDataService,
      private depotsDataService: DepotsDataService,
      private banquesDataService: BanquesDataService,
      private banqProgsDataService: BanqProgsDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Organisation', organisationsDataService);
    entityDataService.registerService('OrgSummary', orgSummariesDataService);
    entityDataService.registerService('Orgcontact', orgcontactsDataService);
    entityDataService.registerService('OrgProgram', orgProgramsDataService);
    entityDataService.registerService('Orgaudit', orgauditsDataService);
    entityDataService.registerService('Region', regionsDataService);
    entityDataService.registerService('Membre', membresDataService);
    entityDataService.registerService('Cpas', cpassDataService);
    entityDataService.registerService('Depot', depotsDataService);
    entityDataService.registerService('Banque', banquesDataService);
    entityDataService.registerService('BanqProg', banqProgsDataService);
  }
}
