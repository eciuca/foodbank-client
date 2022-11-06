import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home.component';
import {PanelModule} from 'primeng/panel';
import {NotificationsComponent} from './notifications/notifications.component';
import {NotificationComponent} from './notifications/notification/notification.component';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {appEntityMetadata} from '../app-entity.metadata';
import {NotificationsDataService} from './services/notifications-data.service';
import {NotificationEntityService} from './services/notification-entity.service';
import {TableModule} from 'primeng/table';
import {DialogModule} from 'primeng/dialog';
import {MessageModule} from 'primeng/message';
import {SelectButtonModule} from 'primeng/selectbutton';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ToastModule} from 'primeng/toast';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {ConfirmationService} from 'primeng/api';
import {EditorModule} from 'primeng/editor';


const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  declarations: [
    HomeComponent,
    NotificationsComponent,
    NotificationComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        PanelModule,
        TableModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        SelectButtonModule,
        ConfirmPopupModule,
        ToastModule,
        MessageModule,
        DropdownModule,
        FormsModule,
        EditorModule
    ],
    providers: [
        NotificationsDataService,
        NotificationEntityService,
        ConfirmationService
    ]
})
export class HomeModule {
    constructor(
        private eds: EntityDefinitionService,
        private entityDataService: EntityDataService,
        private notificationsDataService: NotificationsDataService

    ) {
        eds.registerMetadataMap(appEntityMetadata);
        entityDataService.registerService('Notification', notificationsDataService);

    }
}
