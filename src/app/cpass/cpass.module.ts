import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {Cpas} from './model/cpas';
import { CpassComponent } from './cpass.component';
import {CpasComponent } from './cpas/cpas.component';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {CpassDataService} from './services/cpass-data.service';
import {CpasEntityService} from './services/cpas-entity.service';
import {HttpClientModule} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {DialogModule} from 'primeng/dialog';
import {appEntityMetadata} from '../app-entity.metadata';
import {MessageModule} from 'primeng/message';

const routes: Routes = [
  { path: '',
    component: CpassComponent,
  },
  {
    path: ':cpasId',
    component: CpasComponent,
  }
];

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
        MessageModule,
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
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Cpas', cpassDataService);
  }

}
