import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {TripsComponent} from './trips.component';

import {appEntityMetadata} from '../app-entity.metadata';
import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {TripsDataService} from './services/trips-data.service';
import {TripEntityService} from './services/trip-entity.service';
import {ConfirmationService} from 'primeng/api';
import {TableModule} from 'primeng/table';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {MessageModule} from 'primeng/message';
import {SelectButtonModule} from 'primeng/selectbutton';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {CalendarModule} from 'primeng/calendar';
import {ToastModule} from 'primeng/toast';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {TripComponent} from './trip/trip.component';
import {InputNumberModule} from 'primeng/inputnumber';


const routes: Routes = [
  { path: '', component: TripsComponent },
  {
    path: ':tripId',
    component: TripComponent,
  }
];

@NgModule({
  declarations: [
    TripsComponent,
    TripComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        PanelModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        MessageModule,
        SelectButtonModule,
        ConfirmPopupModule,
        CalendarModule,
        ToastModule,
        AutoCompleteModule,
        InputNumberModule
    ],
  providers: [
    TripsDataService,
    TripEntityService,
    ConfirmationService
  ],

})
export class TripsModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private tripsDataService: TripsDataService,
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('Trip', tripsDataService);
  }

}
