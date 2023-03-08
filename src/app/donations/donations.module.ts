import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {DonateursComponent} from './donateurs/donateurs.component';
import {DonateurComponent} from './donateurs/donateur/donateur.component';
import {DonsComponent} from './dons/dons.component';
import {DonComponent} from './dons/don/don.component';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {DonateurEntityService} from './services/donateur-entity.service';
import {DonateursDataService} from './services/donateurs-data.service';
import {DonEntityService} from './services/don-entity.service';
import {DonsDataService} from './services/dons-data.service';
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {AccordionModule} from 'primeng/accordion';
import {DialogModule} from 'primeng/dialog';
import {appEntityMetadata} from '../app-entity.metadata';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputSwitchModule} from 'primeng/inputswitch';
import {MessageModule} from 'primeng/message';
import {ToastModule} from 'primeng/toast';
import {CheckboxModule} from 'primeng/checkbox';
import {ChartModule} from 'primeng/chart';
import {AuditChangesDataService} from '../audits/services/auditChanges-data.service';
import {AuditChangeEntityService} from '../audits/services/auditChange-entity.service';

const routes: Routes = [
  {
    path: 'donateurs/:bankId',
    component: DonateursComponent
  },
  {
    path: 'donateur/:donateurId',
    component: DonateurComponent
  },
  {
    path: 'dons/:bankId',
    component: DonsComponent
  },
  {
    path: 'don/:idDon',
    component: DonComponent
  }
];

@NgModule({
  // tslint:disable-next-line:max-line-length
  declarations: [DonateursComponent, DonateurComponent, DonsComponent, DonComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
    PanelModule,
    AccordionModule,
    DialogModule,
    ConfirmPopupModule,
    AutoCompleteModule,
    InputNumberModule,
    InputSwitchModule,
    MessageModule,
    ToastModule,
    CheckboxModule,
    ChartModule
  ],
  providers: [
    DonateursDataService,
    DonateurEntityService,
    DonsDataService,
    DonEntityService,
    ConfirmationService,
    AuditChangesDataService,
    AuditChangeEntityService,
  ]
})
export class DonationsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private donateursDataService: DonateursDataService,
      private donsDataService: DonsDataService,
      private auditChangesDataService: AuditChangesDataService,
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Donation', donateursDataService);
    entityDataService.registerService('Don', donsDataService);
    entityDataService.registerService('AuditChange', auditChangesDataService);
  }
}

