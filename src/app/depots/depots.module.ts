import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {compareDepots, Depot} from './model/depot';
import { DepotsComponent } from './depots.component';
import {DepotComponent } from './depot/depot.component';
import {EntityDataService, EntityDefinitionService, EntityMetadataMap} from '@ngrx/data';
import {DepotsDataService} from './services/depots-data.service';
import {DepotEntityService} from './services/depot-entity.service';
import {HttpClientModule} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {DialogModule} from 'primeng/dialog';
import {DepotsResolver} from './depots.resolver';

const routes: Routes = [
  { path: '',
    component: DepotsComponent,
    resolve: {
      DepotsResolver
    }
  },
  {
    path: ':idDepot',
    component: DepotComponent,
  }
];
const entityMetaData: EntityMetadataMap = {
  Depot: {
    sortComparer: compareDepots,
    selectId: (depot: Depot) => depot.idDepot,
    entityDispatcherOptions: {optimisticUpdate: false},
    filterFn: (entities: Depot[], pattern: { startIndex: number, endIndex: number }) => {
      return entities.filter((entity, index) => {
        return ((index >= pattern.startIndex) && (index <= pattern.endIndex));
      });
    }
  }

};
@NgModule({
  declarations: [DepotsComponent, DepotComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        HttpClientModule,
        PanelModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        MessageModule,
    ],
  providers: [
    DepotsDataService,
    DepotEntityService,
    DepotsResolver
  ],
})
export class DepotsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private depotsDataService: DepotsDataService
  ) {
    eds.registerMetadataMap(entityMetaData);
    entityDataService.registerService('Depot', depotsDataService);
  }

}
