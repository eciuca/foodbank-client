import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MailingsComponent } from './mailings.component';
import {TableModule} from 'primeng/table';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {FormsModule} from '@angular/forms';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {OrgSummariesDataService} from '../organisations/services/orgsummaries-data.service';
import {appEntityMetadata} from '../app-entity.metadata';
import {MembreMailsDataService} from '../membres/services/membreMails-data.service';
import {MembreMailEntityService} from '../membres/services/membreMail-entity.service';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {ConfirmationService} from 'primeng/api';
import {PanelModule} from 'primeng/panel';
import {AccordionModule} from 'primeng/accordion';
import {ToastModule} from 'primeng/toast';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {EditorModule} from 'primeng/editor';
import {MailingsDataService} from './services/mailings-data.service';
import {MailingEntityService} from './services/mailing-entity.service';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {InputTextModule} from 'primeng/inputtext';
import {FileUploadModule} from 'primeng/fileupload';
import {HttpClientModule} from '@angular/common/http';



const routes: Routes = [
  { path: '',
      component: MailingsComponent
  }
];

@NgModule({
  declarations: [
    MailingsComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        AutoCompleteModule,
        FormsModule,
        PanelModule,
        AccordionModule,
        ToastModule,
        ConfirmPopupModule,
        EditorModule,
        ButtonModule,
        MessageModule,
        InputTextModule,
        FileUploadModule
    ],
    providers: [
        MailingsDataService,
        MembreMailsDataService,
        MailingEntityService,
        MembreMailEntityService,
        OrgSummariesDataService,
        OrgSummaryEntityService,
        ConfirmationService
    ],
})
export class MailingsModule {
    constructor(
        private eds: EntityDefinitionService,
        private entityDataService: EntityDataService,
        private mailingsDataService: MailingsDataService,
        private membreMailsDataService: MembreMailsDataService,
        private orgSummariesDataService: OrgSummariesDataService
    ) {
        eds.registerMetadataMap(appEntityMetadata);
        entityDataService.registerService('Mailing', mailingsDataService);
        entityDataService.registerService('MembreMail', membreMailsDataService);
        entityDataService.registerService('OrgSummary', orgSummariesDataService);
    }
}
