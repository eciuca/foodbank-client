import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {MovementReportComponent} from './movements-report.component';
import {TooltipModule} from 'primeng/tooltip';
import {ChartModule} from 'primeng/chart';
import {BanquesDataService} from '../banques/services/banques-data.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {appEntityMetadata} from '../app-entity.metadata';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';


const routes: Routes = [

  { path: '',
    component: MovementReportComponent,
  }
];
@NgModule({
  declarations: [MovementReportComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TooltipModule,
        ChartModule

    ],
  providers: [
      BanquesDataService,
      BanqueEntityService,
   ],
})
export class MovementsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private banquesDataService: BanquesDataService,
  ) {
      eds.registerMetadataMap(appEntityMetadata);
      entityDataService.registerService('Banque', banquesDataService);
  }

}
