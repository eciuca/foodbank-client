import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BeneficiairesComponent } from './beneficiaires.component';
import { BeneficiaireComponent } from './beneficiaire/beneficiaire.component';

import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {BeneficiaireEntityService} from './services/beneficiaire-entity.service';
import {CpassDataService} from '../cpass/services/cpass-data.service';
import {BeneficiairesDataService} from './services/beneficiaires-data.service';
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {DialogModule} from 'primeng/dialog';
import {appEntityMetadata} from '../app-entity.metadata';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {CpasEntityService} from '../cpass/services/cpas-entity.service';
import { DependentsComponent } from './dependents/dependents.component';
import { DependentComponent } from './dependents/dependent/dependent.component';
import {DependentsDataService} from './services/dependents-data.service';
import {DependentEntityService} from './services/dependent-entity.service';
import {CalendarModule} from 'primeng/calendar';
import {MessageModule} from 'primeng/message';
import {InputSwitchModule} from 'primeng/inputswitch';
import {CheckboxModule} from 'primeng/checkbox';
import {OrgSummariesDataService} from '../organisations/services/orgsummaries-data.service';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {InputNumberModule} from 'primeng/inputnumber';




const routes: Routes = [
    {
        path: '',
        component: BeneficiairesComponent,
    },
    {
        path: ':idClient',
        component: BeneficiaireComponent
    },
    {
        path: 'Dependent',
        component: DependentsComponent,
    },
    {
        path: 'Dependent/:idDep',
        component: DependentComponent
    }
];

@NgModule({
  declarations: [BeneficiairesComponent, BeneficiaireComponent, DependentsComponent, DependentComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        PanelModule,
        DialogModule,
        ConfirmPopupModule,
        AutoCompleteModule,
        CalendarModule,
        MessageModule,
        InputSwitchModule,
        CheckboxModule,
        InputNumberModule
    ],
  providers: [
        BeneficiairesDataService,
        DependentsDataService,
        OrgSummariesDataService,
        CpassDataService,
        BeneficiaireEntityService,
        DependentEntityService,
        OrgSummaryEntityService,
        CpasEntityService,
        ConfirmationService
  ]

})
export class BeneficiairesModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private beneficiairesDataService: BeneficiairesDataService,
      private cpassDataService: CpassDataService,
      private orgSummariesDataService: OrgSummariesDataService,
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Beneficiaire', beneficiairesDataService);
    entityDataService.registerService('Cpas', cpassDataService);
    entityDataService.registerService('OrgSummary', orgSummariesDataService);
  }
}
