import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {BanquesComponent} from './banques.component';
import {BanquesResolver} from './banques.resolver';
import {BanqueComponent} from './banque/banque.component';

import {BanquesDataService} from './services/banques-data.service';
import {BanqueEntityService} from './services/banque-entity.service';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {DialogModule} from 'primeng/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MembresDataService} from '../membres/services/membres-data.service';
import {MembreEntityService} from '../membres/services/membre-entity.service';
import {appEntityMetadata} from '../app-entity.metadata';
import {MessageModule} from 'primeng/message';
import {ConfirmationService} from 'primeng/api';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ToastModule} from 'primeng/toast';
import {BanqProgEntityService} from './services/banqprog-entity.service';
import {BanqProgsDataService} from './services/banqprogs-data.service';
import {AccordionModule} from 'primeng/accordion';
import {InputSwitchModule} from 'primeng/inputswitch';
import {InputNumberModule} from 'primeng/inputnumber';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import {BankreportsComponent} from './bankreports/bankreports.component';
import {ChartModule} from 'primeng/chart';
import {AuditChangesDataService} from '../audits/services/auditChanges-data.service';
import {AuditChangeEntityService} from '../audits/services/auditChange-entity.service';
import {EditorModule} from 'primeng/editor';
import { RadioButtonModule } from 'primeng/radiobutton';

const routes: Routes = [
    {
        path: 'bankreports',
        component: BankreportsComponent
    },
    {   path: '',
        component: BanquesComponent,
        resolve: {
            BanquesResolver
        }
    },
    {
        path: ':bankId',
        component: BanqueComponent,
        resolve: {
            BanquesResolver
        }
    }
];

@NgModule({
  declarations: [BanquesComponent, BanqueComponent,  BankreportsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        PanelModule,
        DialogModule,
        FormsModule,
        ReactiveFormsModule,
        MessageModule,
        ConfirmPopupModule,
        AutoCompleteModule,
        ToastModule,
        AccordionModule,
        InputSwitchModule,
        InputNumberModule,
        RadioButtonModule,
        OverlayPanelModule,
        EditorModule,
        ChartModule
    ],
  providers: [
    BanquesDataService,
    BanqueEntityService,
    BanqProgsDataService,
    BanqProgEntityService,
    MembresDataService,
    MembreEntityService,
    AuditChangesDataService,
    AuditChangeEntityService,
    ConfirmationService,
    BanquesResolver
  ],
})
export class BanquesModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private banquesDataService: BanquesDataService,
      private banqProgsDataService: BanqProgsDataService,
      private membresDataService: MembresDataService,
      private auditChangesDataService: AuditChangesDataService,
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Banque', banquesDataService);
    entityDataService.registerService('Membre', membresDataService);
    entityDataService.registerService('BanqProg',  banqProgsDataService);
    entityDataService.registerService('AuditChange', auditChangesDataService);
  }

}
