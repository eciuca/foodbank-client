import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DefaultZipcode, Zipcode} from '../model/zipcode';
import {ZipcodeEntityService} from './services/zipcode-entity.service';
import {globalAuthState} from '../../auth/auth.selectors';
import {filter, map, mergeMap} from 'rxjs/operators';
import {AuthService} from '../../auth/auth.service';
import {AppState} from '../../reducers';
import {select, Store} from '@ngrx/store';
import {LazyLoadEvent} from 'primeng/api';

@Component({
  selector: 'app-zipcodes',
  templateUrl: './zipcodes.component.html',
  styleUrls: ['./zipcodes.component.css']
})
export class ZipcodesComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  selectedZipcode$ = new BehaviorSubject(0);
  zipcode: Zipcode = null;
  zipcodes: Zipcode[];
  booIsAdmin: boolean;
  loading: boolean;
    totalRecords: number;
  constructor(
      private zipcodeEntityService: ZipcodeEntityService,
      private authService: AuthService,
      private store: Store<AppState>,
  ) {
    this.booIsAdmin = false;
  }

  ngOnInit(): void {
      this.reload();

      this.loadPageSubject$
          .pipe(
              filter(queryParams => !!queryParams),
              mergeMap(queryParams => this.zipcodeEntityService.getWithQuery(queryParams))
          )
          .subscribe(loadedZipcodes => {
              console.log('Loaded zipcodes from nextpage: ' + loadedZipcodes.length);
              this.zipcodes = loadedZipcodes;
              this.loading = false;
              this.zipcodeEntityService.setLoaded(true);
              if (loadedZipcodes.length > 0) {
                  this.totalRecords = loadedZipcodes[0].totalRecords;
              }  else {
                  this.totalRecords = 0;
              }
            });
  }
    reload() {
        this.loading = true;
        this.totalRecords = 0;
        this.store
            .pipe(
                select(globalAuthState),
                map((authState) => {
                    if (authState.user.rights == 'admin') {
                        this.booIsAdmin = true;
                    }
                })
            )
            .subscribe();
    }
    nextPage(event: LazyLoadEvent) {
        this.loading = true;
        const queryParms = {};
        queryParms['offset'] = event.first.toString();
        queryParms['rows'] = event.rows.toString();
        queryParms['sortOrder'] = event.sortOrder.toString();
        if (event.sortField) {
            queryParms['sortField'] = event.sortField.toString();
        } else {
            queryParms['sortField'] = 'zipCode';
        }
        if (event.filters) {
            if (event.filters.zipCode && event.filters.zipCode.value) {
                queryParms['zipCode'] = event.filters.zipCode.value;
            }
            if (event.filters.city && event.filters.city.value) {
                queryParms['city'] = event.filters.city.value;
            }
            if (event.filters.zipCodeCpas && event.filters.zipCodeCpas.value) {
                queryParms['zipCodeCpas'] = event.filters.zipCodeCpas.value;
            }
            if (event.filters.cityCpas && event.filters.cityCpas.value) {
                queryParms['cityCpas'] = event.filters.cityCpas.value;
            }

        }
        this.zipcodeEntityService.getWithQuery(queryParms)
            .subscribe(loadedZipcodes => {
                console.log('Loaded zipcodes from nextpage: ' + loadedZipcodes.length);
                if (loadedZipcodes.length > 0) {
                    this.totalRecords = loadedZipcodes[0].totalRecords;
                } else {
                    this.totalRecords = 0;
                }
                this.zipcodes  = loadedZipcodes;
                this.loading = false;
                this.zipcodeEntityService.setLoaded(true);
            });
    }

    showDialogToAdd() {
        this.zipcode = new DefaultZipcode();

       //  this.zipcodeEntityService.add(this.zipcode);
    }

    handleSelect(cpas: any) {

    }
}
