import { NgModule } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuditsComponent } from './audits.component';
import {AuditsDataService} from './services/audits-data.service';
import {AuditEntityService} from './services/audit-entity.service';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {appEntityMetadata} from '../app-entity.metadata';
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {CalendarModule} from 'primeng/calendar';
import {CheckboxModule} from 'primeng/checkbox';
import {BanquesDataService} from '../banques/services/banques-data.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import { AuditReportComponent } from './audit-report/audit-report.component';
import {PanelModule} from 'primeng/panel';
import {ChartModule} from 'primeng/chart';

const routes: Routes = [
    {
        path: 'auditreports',
        component: AuditReportComponent
    },
  { path: '', component: AuditsComponent }
];

@NgModule({
  declarations: [
    AuditsComponent,
    AuditReportComponent
  ],
    imports: [
        CommonModule,
        TableModule,
        PaginatorModule,
        AutoCompleteModule,
        RouterModule.forChild(routes),
        CalendarModule,
        CheckboxModule,
        PanelModule,
        ChartModule
    ],
  providers: [
    AuditsDataService,
    AuditEntityService,
      BanquesDataService,
      BanqueEntityService,
      DatePipe
  ],
})
export class AuditsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private auditsDataService: AuditsDataService,
      private banquesDataService: BanquesDataService,
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Audit', auditsDataService);
    entityDataService.registerService('Banque', banquesDataService);
  }
}
