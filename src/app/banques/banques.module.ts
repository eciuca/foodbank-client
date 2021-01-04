import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BanquesComponent } from './banques.component';
import { HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import {BanqueService} from './services/banqueservice';


const routes: Routes = [
  { path: '', component: BanquesComponent }
];

@NgModule({
  declarations: [BanquesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    HttpClientModule
  ],
  providers: [
    BanqueService
  ],
})
export class BanquesModule {

}
