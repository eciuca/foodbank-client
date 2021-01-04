import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BanquesComponent } from './banques.component';
import { HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import {BanquesDataService} from './services/banques-data.service';
import {BanqueEntityService} from './services/banque-entity.service';
import {BanquesResolver} from './banques.resolver';
import {EntityDataService, EntityDefinitionService, EntityMetadataMap} from '@ngrx/data';
import {compareBanques} from '../banques/model/banque';

const routes: Routes = [
  { path: '',
    component: BanquesComponent,
    resolve: {
      BanquesResolver
    }
  }
];
const entityMetaData: EntityMetadataMap = {
  Banque: {
    sortComparer: compareBanques,
    entityDispatcherOptions: { optimisticUpdate: true}
  },

};
@NgModule({
  declarations: [BanquesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    HttpClientModule
  ],
  providers: [
    BanquesDataService,
    BanqueEntityService,
    BanquesResolver

  ],
})
export class BanquesModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private banquesDataService: BanquesDataService
  ) {
    eds.registerMetadataMap(entityMetaData);
    entityDataService.registerService('Banque', banquesDataService);
  }

}
