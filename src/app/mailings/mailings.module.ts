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
import {InputTextareaModule} from 'primeng/inputtextarea';
import { MailaddressComponent } from './mailaddress/mailaddress.component';
import {MailAddressesDataService} from './services/mailaddresses-data.service';
import {MailadressEntityService} from './services/mailadress-entity.service';
import {RegionsDataService} from '../organisations/services/regions-data.service';
import {RegionEntityService} from '../organisations/services/region-entity.service';
import {DialogModule} from 'primeng/dialog';
import {DropdownModule} from 'primeng/dropdown';
import {CheckboxModule} from 'primeng/checkbox';
import {ProgressSpinnerModule} from 'primeng/progressspinner';



const routes: Routes = [
  { path: '',
      component: MailingsComponent
  }
];

@NgModule({
  declarations: [
    MailingsComponent,
    MailaddressComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        AutoCompleteModule,
        FormsModule,
        PanelModule,
        AccordionModule,
        DropdownModule,
        ToastModule,
        ConfirmPopupModule,
        EditorModule,
        ButtonModule,
        MessageModule,
        InputTextModule,
        FileUploadModule,
        InputTextareaModule,
        DialogModule,
        CheckboxModule,
        ProgressSpinnerModule
    ],
    providers: [
        MailingsDataService,
        MailAddressesDataService,
        MailingEntityService,
        MailadressEntityService,
        RegionsDataService,
        RegionEntityService,
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
        private mailAddressesDataService: MailAddressesDataService,
        private regionsDataService: RegionsDataService,
        private orgSummariesDataService: OrgSummariesDataService
    ) {
        eds.registerMetadataMap(appEntityMetadata);
        entityDataService.registerService('Mailing', mailingsDataService);
        entityDataService.registerService(' MailAddress', mailAddressesDataService);
        entityDataService.registerService('Region', regionsDataService);
        entityDataService.registerService('OrgSummary', orgSummariesDataService);
    }
}
