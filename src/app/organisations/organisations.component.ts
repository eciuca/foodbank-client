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
import {enmStatusCompany} from '../shared/enums';


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
    displayDialog: boolean;
    totalRecords: number;
    loading: boolean;
    filterBase: any;
    booCanCreate: boolean;
    statutOptions: any[];
    YNOptions: any[];

    constructor(private organisationService: OrganisationEntityService,
                private router: Router,
                private store: Store<AppState>
    ) {
        this.booCanCreate = false;
        this.statutOptions = enmStatusCompany;
        this.YNOptions =  [
            {label: 'false', value: 0},
            {label: 'true', value: 1}
        ];;
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
        if (event.sortField) {
            queryParms['sortField'] = event.sortField.toString();
        } else {
            queryParms['sortField'] =  'societe';
        }
        if (event.filters) {
            if (event.filters.societe && event.filters.societe.value) {
                queryParms['societe'] = event.filters.societe.value;
            }
            if (event.filters.adresse && event.filters.adresse.value) {
                queryParms['adresse'] = event.filters.adresse.value;
            }
            if (event.filters.cp && event.filters.cp.value) {
                queryParms['cp'] = event.filters.cp.value;
            }
            if (event.filters.localite && event.filters.localite.value) {
                queryParms['localite'] = event.filters.localite.value;
            }
            console.log('Depot Filter : ', event.filters.depyN);
            if (event.filters.depyN && event.filters.depyN.value === 0) {
                queryParms['isDepot'] = '0';
            }
            if (event.filters.depyN && event.filters.depyN.value === 1) {
                queryParms['isDepot'] = '1';
            }
            if (event.filters.birbyN && event.filters.birbyN.value === 0) {
                queryParms['isBirb'] = '0';
            }
            if (event.filters.birbyN && event.filters.birbyN.value === 1) {
                queryParms['isBirb'] = '1';
            }
            if (event.filters.statut ) {
                queryParms['statut'] = event.filters.statut.value;
            }
        }
        this.loadPageSubject$.next(queryParms);
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

    getStatutLabel(statut) {
        const key = Number(statut);

        const label = this.statutOptions.find(i => i.value === key).label;
        return label;
    }
    getYNLabel(isTrue: boolean) {
       if (isTrue) {
           return 'true';
       } else {
           return 'false';
       }
    }
}

