import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import {PanelModule} from 'primeng/panel';


const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  declarations: [
    HomeComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        PanelModule
    ]
})
export class HomeModule { }
