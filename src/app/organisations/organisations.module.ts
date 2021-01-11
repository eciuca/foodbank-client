import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OrganisationsComponent } from './organisations.component';
import {OrganisationsDataService} from './services/organisations-data.service';
import {EntityDataService, EntityDefinitionService, EntityMetadataMap} from '@ngrx/data';
import {TableModule} from 'primeng/table';
import {HttpClientModule} from '@angular/common/http';
import {DialogModule} from 'primeng/dialog';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {compareOrganisations, Organisation} from './model/organisation';
import {OrganisationsResolver} from './organisations.resolver';
import {OrganisationEntityService} from './services/organisation-entity.service';

const routes: Routes = [
  { path: '',
    component: OrganisationsComponent ,
    resolve: {
      OrganisationsResolver
    }
  }
];
const entityMetaData: EntityMetadataMap = {
  Organisation: {
    sortComparer: compareOrganisations,
    selectId: (organisation: Organisation) => organisation.idDis,
    entityDispatcherOptions: { optimisticUpdate: false}
  },

};

@NgModule({
  declarations: [OrganisationsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    HttpClientModule,
    DialogModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule
  ],
  providers: [
   OrganisationsDataService,
    OrganisationEntityService,
    OrganisationsResolver
  ]
})
export class OrganisationsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private organisationsDataService: OrganisationsDataService
  ) {
    eds.registerMetadataMap(entityMetaData);
    entityDataService.registerService('Organisation', organisationsDataService);
  }
}
