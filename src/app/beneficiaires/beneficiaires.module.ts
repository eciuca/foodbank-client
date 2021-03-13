import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {Beneficiaire} from './model/beneficiaire';
import { BeneficiairesComponent } from './beneficiaires.component';
import { BeneficiaireComponent } from './beneficiaire/beneficiaire.component';

import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {BeneficiaireEntityService} from './services/beneficiaire-entity.service';
import {BeneficiairesDataService} from './services/beneficiaires-data.service';
import {HttpClientModule} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {DialogModule} from 'primeng/dialog';
import {appEntityMetadata} from '../app-entity.metadata';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';



const routes: Routes = [
  {
    path: '',
    component: BeneficiairesComponent,
  },
  {
    path: ':idClient',
    component: BeneficiaireComponent
  }
];

@NgModule({
  declarations: [BeneficiairesComponent, BeneficiaireComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        HttpClientModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        PanelModule,
        DialogModule,
        ConfirmPopupModule
    ],
  providers: [
    BeneficiairesDataService,
    BeneficiaireEntityService,
    ConfirmationService
  ]

})
export class BeneficiairesModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private beneficiairesDataService: BeneficiairesDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Beneficiaire', beneficiairesDataService);
  }
}
