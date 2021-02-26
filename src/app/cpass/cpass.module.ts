import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {compareCpass, Cpas} from './model/cpas';
import { CpassComponent } from './cpass.component';
import {CpasComponent } from './cpas/cpas.component';
import {EntityDataService, EntityDefinitionService, EntityMetadataMap} from '@ngrx/data';
import {CpassDataService} from './services/cpass-data.service';
import {CpasEntityService} from './services/cpas-entity.service';
import {HttpClientModule} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';

const routes: Routes = [
  { path: '',
    component: CpassComponent,
  },
  {
    path: ':cpasId',
    component: CpasComponent,
  }
];
const entityMetaData: EntityMetadataMap = {
  Cpas: {
    sortComparer: compareCpass,
    selectId: (cpas: Cpas) => cpas.cpasId,
    entityDispatcherOptions: {optimisticUpdate: false},
    filterFn: (entities: Cpas[], pattern: { startIndex: number, endIndex: number }) => {
      return entities.filter((entity, index) => {
        return ((index >= pattern.startIndex) && (index <= pattern.endIndex));
      });
    }
  }

};
@NgModule({
  declarations: [CpassComponent, CpasComponent],
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
    CpassDataService,
    CpasEntityService
  ],
})
export class CpassModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private cpassDataService: CpassDataService
  ) {
    eds.registerMetadataMap(entityMetaData);
    entityDataService.registerService('Cpas', cpassDataService);
  }

}
