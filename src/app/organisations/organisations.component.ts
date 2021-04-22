import { Component, OnInit } from '@angular/core';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Organisation} from './model/organisation';
import {OrganisationEntityService} from './services/organisation-entity.service';
import {Router} from '@angular/router';
import {globalAuthState} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {LazyLoadEvent} from 'primeng/api';
import {AuthState} from '../auth/reducers';


@Component({
    selector: 'app-organisations',
    templateUrl: './organisations.component.html',
    styleUrls: ['./organisations.component.css']
})

export class OrganisationsComponent implements OnInit {
    loadPageSubject$ = new BehaviorSubject(null);
    selectedIdDis$ = new BehaviorSubject(0);
    organisation: Organisation = null;
    organisations: Organisation[];
    cols: any[];
    displayDialog: boolean;
    totalRecords: number;
    loading: boolean;
    filterBase: any;
    booCanCreate: boolean;

    constructor(private organisationService: OrganisationEntityService,
                private router: Router,
                private store: Store<AppState>
    ) {
        this.booCanCreate = false;
    }

    ngOnInit() {
        this.reload();
        this.loadPageSubject$
            .pipe(
                filter(queryParams => !!queryParams),
                mergeMap(queryParams => this.organisationService.getWithQuery(queryParams))
            )
            .subscribe(loadedOrganisations => {
                console.log('Loaded organisations from nextpage: ' + loadedOrganisations.length);
                if (loadedOrganisations.length > 0) {
                    this.totalRecords = loadedOrganisations[0].totalRecords;
                }  else {
                    this.totalRecords = 0;
                }
                this.organisations  = loadedOrganisations;
                this.loading = false;
                this.organisationService.setLoaded(true);
            });
    }

    reload() {
        this.loading = true;
        this.totalRecords = 0;

        this.store
            .pipe(
                select(globalAuthState),
                map((authState) => {
                    this.initializeDependingOnUserRights(authState);
                })
            )
            .subscribe();

        this.cols = [
            { field: 'societe', header: 'Nom' },
            { field: 'adresse', header: 'Adresse' },
            { field: 'cp', header: 'Code Postal' },
            { field: 'localite', header: 'Commune' }
        ];

    }

    handleSelect(organisation) {
        console.log( 'Organisation was selected', organisation);
        this.selectedIdDis$.next(organisation.idDis);
        this.displayDialog = true;
    }
    handleOrganisationQuit() {
        this.displayDialog = false;
    }
    handleOrganisationCreate(createdOrganisation: Organisation) {
        this.organisations.push({...createdOrganisation});
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

    handleOrganisationUpdate(updatedOrganisation) {
        const index = this.organisations.findIndex(organisation => organisation.idDis === updatedOrganisation.idDis);
        this.organisations[index] = updatedOrganisation;
        this.displayDialog = false;
    }

    handleOrganisationDeleted(deletedOrganisation) {
        const index = this.organisations.findIndex(organisation => organisation.idDis === deletedOrganisation.idDis);
        this.organisations.splice(index, 1);
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

    nextPage(event: LazyLoadEvent) {
        console.log('Lazy Loaded Event', event);
        this.loading = true;
        const queryParms = {...this.filterBase};
        queryParms['offset'] = event.first.toString();
        queryParms['rows'] = event.rows.toString();
        queryParms['sortOrder'] = event.sortOrder.toString();
        if (event.filters) {
            if (event.filters.societe && event.filters.societe.value) {
                queryParms['sortField'] = 'societe';
                queryParms['searchField'] = 'societe';
                queryParms['searchValue'] = event.filters.societe.value;
            } else if (event.filters.adresse && event.filters.adresse.value) {
                queryParms['sortField'] = 'adresse';
                queryParms['searchField'] = 'adresse';
                queryParms['searchValue'] = event.filters.adresse.value;
            } else if (event.filters.cp && event.filters.cp.value) {
                queryParms['sortField'] = 'cp';
                queryParms['searchField'] = 'cp';
                queryParms['searchValue'] = event.filters.cp.value;
            } else if (event.filters.localite && event.filters.localite.value) {
                queryParms['sortField'] = 'localite';
                queryParms['searchField'] = 'localite';
                queryParms['searchValue'] = event.filters.localite.value;
            }
        }
        if (!queryParms.hasOwnProperty('sortField')) {
            if (event.sortField) {
                queryParms['sortField'] = event.sortField;
            } else {
                queryParms['sortField'] = 'nom';
            }
        }
        this.organisationService.getWithQuery(queryParms)
            .subscribe(loadedOrganisations => {
                console.log('Loaded organisations from nextpage: ' + loadedOrganisations.length);
                if (loadedOrganisations.length > 0) {
                    this.totalRecords = loadedOrganisations[0].totalRecords;
                } else {
                    this.totalRecords = 0;
                }
                this.organisations  = loadedOrganisations;
                this.loading = false;
                this.organisationService.setLoaded(true);
            });
    }
    private initializeDependingOnUserRights(authState: AuthState) {
        if (authState.banque) {
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.filterBase = { 'lienBanque': authState.banque.bankId};
                    if (authState.user.rights === 'Admin_Banq' ) { this.booCanCreate = true; }
                    break;
                case 'Asso':
                case 'Admin_Asso':
                    this.filterBase = { 'idDis': authState.organisation.idDis};
                    if (authState.user.rights === 'Admin_Asso' ) { this.booCanCreate = true; }
                    break;
                default:
            }
        }
    }

    showDialogToAdd() {
        this.selectedIdDis$.next(0);
        this.displayDialog = true;
    }
}

