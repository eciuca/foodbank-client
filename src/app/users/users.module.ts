import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
import {UserComponent } from './user/user.component';

import {EntityDataService, EntityDefinitionService} from '@ngrx/data';
import {UsersDataService} from './services/users-data.service';
import {UserEntityService} from './services/user-entity.service';
import {HttpClientModule} from '@angular/common/http';

import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';
import {appEntityMetadata} from '../app-entity.metadata';
import {InputSwitchModule} from 'primeng/inputswitch';
import {AccordionModule} from 'primeng/accordion';




const routes: Routes = [
  { path: '',
    component: UsersComponent
  },
  {
    path: ':idUser',
    component: UserComponent
  }
];

@NgModule({
  declarations: [UsersComponent, UserComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TableModule,
        HttpClientModule,
        PanelModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        InputSwitchModule,
        AccordionModule,
    ],
  providers: [
    UsersDataService,
    UserEntityService
  ],
})
export class UsersModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private usersDataService: UsersDataService
  ) {
    eds.registerMetadataMap(appEntityMetadata);
    entityDataService.registerService('User', usersDataService);
  }

}
