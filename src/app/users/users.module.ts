import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {UsersComponent} from './users.component';
import {UserComponent} from './user/user.component';

import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {UsersDataService} from './services/users-data.service';
import {UserEntityService} from './services/user-entity.service';

import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';
import {appEntityMetadata} from '../app-entity.metadata';
import {InputSwitchModule} from 'primeng/inputswitch';
import {AccordionModule} from 'primeng/accordion';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';
import {MessageModule} from 'primeng/message';
import {MembresDataService} from '../membres/services/membres-data.service';
import {MembreEntityService} from '../membres/services/membre-entity.service';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ToastModule} from 'primeng/toast';
import {OrgSummariesDataService} from '../organisations/services/orgsummaries-data.service';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {CheckboxModule} from 'primeng/checkbox';
import {UsersRightsComponent} from './users-rights/users-rights.component';
import {BanquesDataService} from '../banques/services/banques-data.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {TooltipModule} from 'primeng/tooltip';
import {AuditChangesDataService} from '../audits/services/auditChanges-data.service';
import {AuditChangeEntityService} from '../audits/services/auditChange-entity.service';
import {DepotsDataService} from '../depots/services/depots-data.service';
import {DepotEntityService} from '../depots/services/depot-entity.service';
import { DropdownModule } from 'primeng/dropdown';
import {CpassDataService} from '../cpass/services/cpass-data.service';
import {CpasEntityService} from '../cpass/services/cpas-entity.service';

const routes: Routes = [
  { path: '',
    component: UsersComponent
  },
  {
        path: 'rights',
        component: UsersRightsComponent
  },
  {
    path: ':idUser',
    component: UserComponent
  }
];

@NgModule({
  declarations: [UsersComponent, UserComponent, UsersRightsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        PanelModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        DropdownModule,
        DialogModule,
        InputSwitchModule,
        AccordionModule,
        ConfirmPopupModule,
        MessageModule,
        AutoCompleteModule,
        ToastModule,
        CheckboxModule,
        TooltipModule,
    ],
  providers: [
        UsersDataService,
        UserEntityService,
        MembresDataService,
        MembreEntityService,
        BanquesDataService,
        BanqueEntityService,
        OrgSummariesDataService,
        OrgSummaryEntityService,
        DepotsDataService,
        DepotEntityService,
        CpassDataService,
        CpasEntityService,
        AuditChangesDataService,
        AuditChangeEntityService,
        ConfirmationService
  ],
})
export class UsersModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private usersDataService: UsersDataService,
      private membresDataService: MembresDataService,
      private banquesDataService: BanquesDataService,
      private orgSummariesDataService: OrgSummariesDataService,
      private depotsDataService: DepotsDataService,
      private cpassDataService: CpassDataService,
      private auditChangesDataService: AuditChangesDataService,
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('User', usersDataService);
    entityDataService.registerService('Membre', membresDataService);
    entityDataService.registerService('Banque', banquesDataService);
    entityDataService.registerService('OrgSummary', orgSummariesDataService);
    entityDataService.registerService('Depot', depotsDataService);
    entityDataService.registerService('Cpas', cpassDataService);
    entityDataService.registerService('AuditChange', auditChangesDataService);
  }

}
