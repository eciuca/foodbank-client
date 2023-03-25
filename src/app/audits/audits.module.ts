import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {AuditsComponent} from './audits.component';
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
import {AuditReportComponent} from './audit-report/audit-report.component';
import {PanelModule} from 'primeng/panel';
import {ChartModule} from 'primeng/chart';
import {AuditChangesComponent} from './audit-changes.component';
import {AuditChangeEntityService} from './services/auditChange-entity.service';
import {AuditChangesDataService} from './services/auditChanges-data.service';
import {AuditUsersDataService} from './services/audit-users-data.service';
import {AuditUserEntityService} from './services/audit-user-entity.service';
import {AuditUsersComponent} from './audit-users.component';
import {TooltipModule} from 'primeng/tooltip';

const routes: Routes = [
    {
        path: 'auditreports',
        component: AuditReportComponent
    },
    {
        path: 'auditusers',
        component: AuditUsersComponent
    },
    {
        path: 'entitychanges',
        component: AuditChangesComponent
    },
  { path: '', component: AuditsComponent }
];

@NgModule({
  declarations: [
    AuditsComponent,
    AuditUsersComponent,
    AuditReportComponent,
    AuditChangesComponent
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
        TooltipModule,
        ChartModule
    ],
  providers: [
    AuditsDataService,
    AuditEntityService,
      AuditUsersDataService,
      AuditUserEntityService,
      AuditChangesDataService,
      AuditChangeEntityService,
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
      private auditUserReportsDataService: AuditUsersDataService,
      private auditChangesDataService: AuditChangesDataService,
      private banquesDataService: BanquesDataService,
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Audit', auditsDataService);
    entityDataService.registerService('AuditUserReport', auditUserReportsDataService);
    entityDataService.registerService('AuditChange', auditChangesDataService);
    entityDataService.registerService('Banque', banquesDataService);
  }
}
