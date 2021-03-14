import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Cpas} from './model/cpas';
import {CpasEntityService} from './services/cpas-entity.service';
import {LazyLoadEvent} from 'primeng/api';
import {filter, mergeMap} from 'rxjs/operators';

@Component({
  selector: 'app-cpass',
  templateUrl: './cpass.component.html',
  styleUrls: ['./cpass.component.css']
})

export class CpassComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  cpas: Cpas = null;
  cpass: Cpas[];
  cols: any[];
  displayDialog: boolean;
  title: string;
  totalRecords: number;
  loading: boolean;
  filterBase: any;

  constructor(private cpasService: CpasEntityService)   { }

  ngOnInit() {
    this.reload();
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.cpasService.getWithQuery(queryParams))
        )
        .subscribe(loadedCpass => {
          console.log('Loaded cpass from nextpage: ' + loadedCpass.length);
          if (loadedCpass.length > 0) {
            this.totalRecords = loadedCpass[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.cpass  = loadedCpass;
          this.loading = false;
          this.cpasService.setLoaded(true);
        });
  }

  reload() {
    this.loading = true;
    this.totalRecords = 0;
    this.cols = [
      { field: 'cpasName', header: 'Nom' },
      { field: 'cpasZip', header: 'Code Postal' },
      { field: 'cpasStreet', header: 'Adresse' },
      { field: 'cpasTel', header: 'Tel' },
      { field: 'cpasGsm', header: 'Gsm' },
    ];

  }

  handleSelect(cpas) {
    console.log( 'Cpas was selected', cpas);
    this.cpas = cpas;
    this.displayDialog = true;
  }
  handleCpasQuit() {
    this.displayDialog = false;
  }

  handleCpasUpdate(updatedCpas) {
    const index = this.cpass.findIndex(cpas => cpas.cpasId === updatedCpas.cpasId);
    this.cpass[index] = updatedCpas;
    this.displayDialog = false;
  }

  handleCpasDeleted(deletedCpas) {
    const index = this.cpass.findIndex(cpas => cpas.cpasId === deletedCpas.cpasId);
    this.cpass.splice(index, 1);
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  };

  nextPage(event: LazyLoadEvent) {
    console.log('Lazy Loaded Event', event);
    this.loading = true;
    if (event.sortField == null) {
      setTimeout(() => {
        console.log('waiting first 250ms for reset to take place');
      }, 250);
    }
    const queryParms = {...this.filterBase};
    queryParms['offset'] = event.first.toString();
    queryParms['rows'] = event.rows.toString();
    queryParms['sortOrder'] = event.sortOrder.toString();
    if (event.filters) {
      if (event.filters.cpasName && event.filters.cpasName.value) {
        queryParms['sortField'] = 'cpasName';
        queryParms['searchField'] = 'cpasName';
        queryParms['searchValue'] = event.filters.cpasName.value;
      } else if (event.filters.cpasZip && event.filters.cpasZip.value) {
        queryParms['sortField'] = 'cpasZip';
        queryParms['searchField'] = 'cpasZip';
        queryParms['searchValue'] = event.filters.cpasZip.value;
      }
    }
    if (!queryParms.hasOwnProperty('sortField')) {
      if (event.sortField) {
        queryParms['sortField'] = event.sortField;
      } else {
        queryParms['sortField'] = 'cpasName';
      }
    }
    this.cpasService.getWithQuery(queryParms)
        .subscribe(loadedCpass => {
          console.log('Loaded cpass from nextpage: ' + loadedCpass.length);
          if (loadedCpass.length > 0) {
            this.totalRecords = loadedCpass[0].totalRecords;
          } else {
            this.totalRecords = 0;
          }
          this.cpass  = loadedCpass;
          this.loading = false;
          this.cpasService.setLoaded(true);
        });
  }

}


