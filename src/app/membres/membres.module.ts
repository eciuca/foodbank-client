import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {compareMembres, Membre} from './model/membre';
import { MembresComponent } from './membres.component';
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
import {DialogModule} from 'primeng/dialog';

const routes: Routes = [
  { path: '',
    component: MembresComponent,
  },
  {
    path: ':batId',
    component: MembreComponent,
  }
];
const entityMetaData: EntityMetadataMap = {
  Membre: {
    sortComparer: compareMembres,
    selectId: (membre: Membre) => membre.batId,
    entityDispatcherOptions: {optimisticUpdate: false},
    filterFn: (entities: Membre[], pattern: { startIndex: number, endIndex: number }) => {
      return entities.filter((entity, index) => {
        return ((index >= pattern.startIndex) && (index <= pattern.endIndex));
      });
    }
  }

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
        DialogModule,
    ],
  providers: [
    MembresDataService,
    MembreEntityService
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
