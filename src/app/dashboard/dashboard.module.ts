import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {TooltipModule} from 'primeng/tooltip';
import {ChartModule} from 'primeng/chart';
import {BanquesDataService} from '../banques/services/banques-data.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {appEntityMetadata} from '../app-entity.metadata';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {PanelModule} from 'primeng/panel';
import {CheckboxModule} from 'primeng/checkbox';
import {DashboardReportComponent} from './dashboard-report.component';
import {TableModule} from 'primeng/table';


const routes: Routes = [

  { path: '',
    component: DashboardReportComponent,
  }
];
@NgModule({
  declarations: [DashboardReportComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TooltipModule,
        TableModule,
        CheckboxModule,
        ChartModule

    ],
  providers: [
      BanquesDataService,
      BanqueEntityService,
   ],
})
export class DashboardModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private banquesDataService: BanquesDataService,
  ) {
      eds.registerMetadataMap(appEntityMetadata);
      entityDataService.registerService('Banque', banquesDataService);
  }

}
