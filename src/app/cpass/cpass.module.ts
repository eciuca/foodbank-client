import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {CpassComponent} from './cpass.component';
import {CpasComponent} from './cpas/cpas.component';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {CpassDataService} from './services/cpass-data.service';
import {CpasEntityService} from './services/cpas-entity.service';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {DialogModule} from 'primeng/dialog';
import {appEntityMetadata} from '../app-entity.metadata';
import {MessageModule} from 'primeng/message';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';
import { ZipcodesComponent } from './zipcodes/zipcodes.component';
import {ZipcodesDataService} from './zipcodes/services/zipcodes-data.service';
import {ZipcodeEntityService} from './zipcodes/services/zipcode-entity.service';


const routes: Routes = [
  {
      path: 'zipcodes',
      component: ZipcodesComponent,
  },
  { path: '',
    component: CpassComponent,
  },
  {
    path: ':cpasId',
    component: CpasComponent,
  }
];

@NgModule({
  declarations: [CpassComponent, CpasComponent, ZipcodesComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        PanelModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        MessageModule,
        ConfirmPopupModule,
        InputTextareaModule,
    ],
  providers: [
        CpassDataService,
        CpasEntityService,
        ZipcodesDataService,
        ZipcodeEntityService,
        ConfirmationService
  ],
})
export class CpassModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private cpassDataService: CpassDataService,
      private zipcodesDataService: ZipcodesDataService,
        private zipcodeEntityService: ZipcodeEntityService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Cpas', cpassDataService);
    entityDataService.registerService('Zipcode', zipcodesDataService);
  }

}
