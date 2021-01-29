import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {compareBeneficiaires, Beneficiaire} from './model/beneficiaire';
import { BeneficiairesComponent } from './beneficiaires.component';
import {BeneficiairesResolver} from './beneficiaires.resolver';
import { BeneficiaireComponent } from './beneficiaire/beneficiaire.component';

import {EntityDataService, EntityDefinitionService, EntityMetadataMap} from '@ngrx/data';
import {BeneficiaireEntityService} from './services/beneficiaire-entity.service';
import {BeneficiairesDataService} from './services/beneficiaires-data.service';
import {HttpClientModule} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';



const routes: Routes = [
  {
    path: '',
    component: BeneficiairesComponent,
    resolve: {
      BeneficiairesResolver
    }
  },
  {
    path: ':idClient',
    component: BeneficiaireComponent,
    resolve: {
      BeneficiairesResolver
    }
  }
];
const entityMetaData: EntityMetadataMap = {
  Beneficiaire: {
    sortComparer: compareBeneficiaires,
    selectId: (beneficiaire: Beneficiaire) => beneficiaire.idClient,
    entityDispatcherOptions: { optimisticUpdate: false}
  },

};
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
    PanelModule
  ],
  providers: [
    BeneficiairesDataService,
    BeneficiaireEntityService,
    BeneficiairesResolver
  ]

})
export class BeneficiairesModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private beneficiairesDataService: BeneficiairesDataService
  ) {
    eds.registerMetadataMap(entityMetaData);
    entityDataService.registerService('Beneficiaire', beneficiairesDataService);
  }
}