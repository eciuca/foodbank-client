import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { Membre} from './model/membre';
import { MembresComponent } from './membres.component';
import {MembreComponent } from './membre/membre.component';
import {EntityDataService, EntityDefinitionService } from '@ngrx/data';
import {MembresDataService} from './services/membres-data.service';
import {MembreEntityService} from './services/membre-entity.service';
import {HttpClientModule} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';
import {appEntityMetadata} from '../app-entity.metadata';
import {MessageModule} from 'primeng/message';
import {SelectButtonModule} from 'primeng/selectbutton';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';
const routes: Routes = [
  { path: '',
    component: MembresComponent,
  },
  {
    path: ':batId',
    component: MembreComponent,
  }
];
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
        MessageModule,
        SelectButtonModule,
        ConfirmPopupModule
    ],
  providers: [
    MembresDataService,
    MembreEntityService,
    ConfirmationService
  ],
})
export class MembresModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private membresDataService: MembresDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Membre', membresDataService);
  }

}
