import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
import {UserComponent } from './user/user.component';

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
import { UsersRightsComponent } from './users-rights/users-rights.component';
import {BanquesDataService} from '../banques/services/banques-data.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {TooltipModule} from 'primeng/tooltip';

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
      private orgSummariesDataService: OrgSummariesDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('User', usersDataService);
    entityDataService.registerService('Membre', membresDataService);
    entityDataService.registerService('Banque', banquesDataService);
    entityDataService.registerService('OrgSummary', orgSummariesDataService);
  }

}
