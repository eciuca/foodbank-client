import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuditsComponent } from './audits.component';
import {AuditsDataService} from './services/audits-data.service';
import {AuditEntityService} from './services/audit-entity.service';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {appEntityMetadata} from '../app-entity.metadata';
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {AutoCompleteModule} from 'primeng/autocomplete';


const routes: Routes = [
  { path: '', component: AuditsComponent }
];

@NgModule({
  declarations: [
    AuditsComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    AutoCompleteModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    AuditsDataService,
    AuditEntityService,
  ],
})
export class AuditsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private auditsDataService: AuditsDataService,
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Audit', auditsDataService);

  }
}
