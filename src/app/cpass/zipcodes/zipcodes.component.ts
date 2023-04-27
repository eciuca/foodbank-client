import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ZipCode} from '../model/zipCode';
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
export class ZipCodesComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  selectedZipcode$ = new BehaviorSubject(0);
  zipcode: ZipCode = null;
  zipcodes: ZipCode[];
  booIsAdmin: boolean;
  loading: boolean;
  totalRecords: number;
    displayDialog: boolean;
    filterBase: any;
    booCanCreate: boolean;
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
          .subscribe(loadedzipcodes => {
              console.log('Loaded zipcodes from nextpage: ' + loadedzipcodes.length);
              this.zipcodes = loadedzipcodes;
              this.loading = false;
              this.zipcodeEntityService.setLoaded(true);
              if (loadedzipcodes.length > 0) {
                  this.totalRecords = loadedzipcodes[0].totalRecords;
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
                    if (authState.banque) {
                        switch (authState.user.rights) {
                            case 'Bank':
                                this.filterBase = {'lienBanque': authState.banque.bankId};
                                break;
                            case 'Admin_Banq':
                                this.filterBase = {'lienBanque': authState.banque.bankId};
                                this.booCanCreate = true;
                                break;
                            case 'admin':
                                this.filterBase = {};
                                // this.booCanCreate = true;
                                break;
                            default:
                                this.filterBase = {'lienBanque': 999};
                        }
                    }
                })
            )
            .subscribe();
    }
    nextPage(event: LazyLoadEvent) {
        this.loading = true;
        const queryParms = {...this.filterBase};
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
            .subscribe(loadedzipcodes => {
                console.log('Loaded zipcodes from nextpage: ' + loadedzipcodes.length);
                if (loadedzipcodes.length > 0) {
                    this.totalRecords = loadedzipcodes[0].totalRecords;
                } else {
                    this.totalRecords = 0;
                }
                this.zipcodes  = loadedzipcodes;
                this.loading = false;
                this.zipcodeEntityService.setLoaded(true);
            });
    }

    showDialogToAdd() {
        this.selectedZipcode$.next(0);
        this.displayDialog = true;
    }

    handleSelect(zipCode) {
        this.selectedZipcode$.next(zipCode.zipCode);
        this.displayDialog = true;
    }
    handleZipCodeQuit() {
        this.displayDialog = false;
    }
    handleZipCodeCreate(createdZipCode: ZipCode) {
        this.zipcodes.push({...createdZipCode});
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

    handleZipCodeUpdate(updatedZipCode) {
        const index = this.zipcodes.findIndex(zipCode => zipCode.zipCode === updatedZipCode.zipCode);
        this.zipcodes[index] = updatedZipCode;
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

    handleZipCodeDeleted(deletedZipCode) {
        const index = this.zipcodes.findIndex(zipCode => zipCode.zipCode === deletedZipCode.zipCode);
        this.zipcodes.splice(index, 1);
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

    getTitle() {
        return $localize`:@@ZipCodeLink:ZipCode link with CPAS`;
    }
}
