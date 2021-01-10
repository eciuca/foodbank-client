import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
import {EntityDataService, EntityDefinitionService, EntityMetadataMap} from '@ngrx/data';
import {compareUsers, User} from './model/user';
import {UsersDataService} from '../users/services/users-data.service';
import {UserEntityService} from '../users/services/user-entity.service';
import {UsersResolver} from './users.resolver';
import {TableModule} from 'primeng/table';
import {HttpClientModule} from '@angular/common/http';
import {DialogModule} from 'primeng/dialog';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';




const routes: Routes = [
  { path: '',
    component: UsersComponent,
    resolve: {
      UsersResolver
    }
  }
];
const entityMetaData: EntityMetadataMap = {
  User: {
    sortComparer: compareUsers,
    selectId: (user: User) => user.idUser,
    entityDispatcherOptions: { optimisticUpdate: false}
  },

};
@NgModule({
  declarations: [UsersComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    HttpClientModule,
    DialogModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule
  ],
  providers: [
    UsersDataService,
    UserEntityService,
    UsersResolver
  ],
})
export class UsersModule {
  constructor(
      private eds: EntityDefinitionService,
      private entityDataService: EntityDataService,
      private usersDataService: UsersDataService
  ) {
    eds.registerMetadataMap(entityMetaData);
    entityDataService.registerService('User', usersDataService);
  }

}
