import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {compareOrganisations, Organisation} from './model/organisation';
import { OrganisationsComponent } from './organisations.component';
import {OrganisationsResolver} from './organisations.resolver';
import { OrganisationComponent } from './organisation/organisation.component';

import {EntityDataService, EntityDefinitionService, EntityMetadataMap} from '@ngrx/data';
import {OrganisationEntityService} from './services/organisation-entity.service';
import {OrganisationsDataService} from './services/organisations-data.service';
import {HttpClientModule} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {AccordionModule} from 'primeng/accordion';

const routes: Routes = [
    { path: '',
        component: OrganisationsComponent ,
        resolve: {
          OrganisationsResolver
        }
    },
    {
        path: ':idDis',
        component: OrganisationComponent,
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
  declarations: [OrganisationsComponent, OrganisationComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        HttpClientModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        PanelModule,
        AccordionModule
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
