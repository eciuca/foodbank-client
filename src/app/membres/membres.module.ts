import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {compareMembres, Membre} from './model/membre';
import { MembresComponent } from './membres.component';
import {MembresResolver} from './membres.resolver';
import {MembreComponent } from './membre/membre.component';

import {EntityDataService, EntityDefinitionService, EntityMetadataMap} from '@ngrx/data';
import {MembresDataService} from './services/membres-data.service';
import {MembreEntityService} from './services/membre-entity.service';
import {HttpClientModule} from '@angular/common/http';

import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';




const routes: Routes = [
  { path: '',
    component: MembresComponent,
    resolve: {
      MembresResolver
    }
  },
  {
    path: ':batId',
    component: MembreComponent,
    resolve: {
      MembresResolver
    }

  }
];
const entityMetaData: EntityMetadataMap = {
  Membre: {
    sortComparer: compareMembres,
    selectId: (membre: Membre) => membre.batId,
    entityDispatcherOptions: { optimisticUpdate: false}
  },

};
@NgModule({
  declarations: [MembresComponent, MembreComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    HttpClientModule,
    PanelModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
  ],
  providers: [
    MembresDataService,
    MembreEntityService,
    MembresResolver
  ],
})
export class MembresModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private membresDataService: MembresDataService
  ) {
    eds.registerMetadataMap(entityMetaData);
    entityDataService.registerService('Membre', membresDataService);
  }

}
