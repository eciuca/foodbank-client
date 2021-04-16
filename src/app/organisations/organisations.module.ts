import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {Organisation} from './model/organisation';
import {OrganisationsComponent } from './organisations.component';
import {OrganisationsResolver} from './organisations.resolver';
import {OrganisationComponent } from './organisation/organisation.component';

import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {OrganisationEntityService} from './services/organisation-entity.service';
import {OrganisationsDataService} from './services/organisations-data.service';
import {HttpClientModule} from '@angular/common/http';
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
        AccordionModule,
        DialogModule,
        ConfirmPopupModule,
        AutoCompleteModule,
        InputNumberModule,
        InputSwitchModule
    ],
  providers: [
        OrganisationsDataService,
        OrganisationEntityService,
        CpassDataService,
        CpasEntityService,
        DepotsDataService,
        DepotEntityService,
        ConfirmationService,
        OrganisationsResolver
  ]
})
export class OrganisationsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private organisationsDataService: OrganisationsDataService,
      private cpassDataService: CpassDataService,
      private depotsDataService: DepotsDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Organisation', organisationsDataService);
    entityDataService.registerService('Cpas', cpassDataService);
    entityDataService.registerService('Depot', depotsDataService);
  }
}
