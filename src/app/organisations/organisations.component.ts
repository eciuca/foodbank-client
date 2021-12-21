import {Component, OnInit} from '@angular/core';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Organisation} from './model/organisation';
import {OrganisationEntityService} from './services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {globalAuthState} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {LazyLoadEvent} from 'primeng/api';
import {AuthState} from '../auth/reducers';
import {enmYn, enmStatusCompany, enmOrgCategories} from '../shared/enums';
import {RegionEntityService} from './services/region-entity.service';


@Component({
    selector: 'app-organisations',
    templateUrl: './organisations.component.html',
    styleUrls: ['./organisations.component.css']
})

export class OrganisationsComponent implements OnInit {
    isDepot: boolean;
    loadPageSubject$ = new BehaviorSubject(null);
    selectedIdDis$ = new BehaviorSubject(0);
    organisation: Organisation = null;
    organisations: Organisation[];
    orgCategories: any[];
    displayDialog: boolean;
    totalRecords: number;
    loading: boolean;
    filterBase: any;
    booShowArchived: boolean;
    booCanCreate: boolean;
    statutOptions: any[];
    regions: any[];
    YNOptions:  any[];
    bankName: string;
    lienBanque: number;
    depotName: string;
    first: number;
    regionSelected: number;
    constructor(private organisationService: OrganisationEntityService,
                private regionService: RegionEntityService,
                private router: Router,
                private route: ActivatedRoute,
                private store: Store<AppState>
    ) {
        this.booCanCreate = false;
        this.booShowArchived = false;
        this.statutOptions = enmStatusCompany;
        this.orgCategories = enmOrgCategories;
        this.YNOptions = enmYn;
        this.isDepot = false;
        this.lienBanque = 0;
        this.bankName = '';
        this.depotName = '';
        this.first = 0;
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
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
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
        if (this.booShowArchived ) {
            queryParms['actif'] = '0';
        }  else {
            queryParms['actif'] = '1';
        }
        if (event.filters) {
            if (event.filters.idDis && event.filters.idDis.value) {
                queryParms['idDis'] = event.filters.idDis.value;
            }
            if (event.filters.societe && event.filters.societe.value) {
                queryParms['societe'] = event.filters.societe.value;
            }
            if (event.filters.adresse && event.filters.adresse.value) {
                queryParms['adresse'] = event.filters.adresse.value;
            }
            if (event.filters.agreed && event.filters.agreed.value != null) {
                queryParms['agreed'] = event.filters.agreed.value;
            }
            if (event.filters.nomDepot && event.filters.nomDepot.value) {
                queryParms['nomDepot'] = event.filters.nomDepot.value;
            }
            if (event.filters.depyN && event.filters.depyN.value !== null ) {
                queryParms['isDepot'] = event.filters.depyN.value;
            }
            if (event.filters.birbyN && event.filters.birbyN.value !== null) {
                queryParms['isBirb'] = event.filters.birbyN.value;
            }
            if (event.filters.refInt && event.filters.refInt.value !== null ) {
                queryParms['refint'] = event.filters.refInt.value;
            }
        }
        this.loadPageSubject$.next(queryParms);
    }
    private initializeDependingOnUserRights(authState: AuthState) {
        if (authState.banque) {
            this.lienBanque = authState.banque.bankId;
            this.filterBase = { 'lienBanque': authState.banque.bankId};
            this.bankName = authState.banque.bankName;
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    if (authState.user.rights === 'Admin_Banq' ) { this.booCanCreate = true; }
                    break;
                case 'Asso':
                case 'Admin_Asso':
                    // This module is only called for depots see menu
                    this.depotName = authState.organisation.societe;
                    this.isDepot = true;
                    this.filterBase['lienDepot'] = authState.organisation.idDis;
                    if (authState.user.rights === 'Admin_Asso' ) { this.booCanCreate = true; }
                    break;
                default:
            }
        this.regionService.getWithQuery({'lienBanque': this.lienBanque.toString()})
            .subscribe(regions => {
                this.regions = [{ value: null, label: 'All'}];
                regions.map((region) =>
                    this.regions.push({value: region.regId, label: region.regName})
                );
            });
        }
    }

    showDialogToAdd() {
        this.selectedIdDis$.next(0);
        this.displayDialog = true;
    }

    getStatutLabel(statut) {
        const key = statut;

        const statutObject = this.statutOptions.find(i => i.value === key);
        if (statutObject) {
            return statutObject.label;
        }
        return 'Unknown Status';
    }

    labelSuspensionStatus(organisation: Organisation) {
     if  (organisation.susp === true)  {
         return 'Y ' + organisation.stopSusp ;
     }   else {
         return 'N';
     }
    }

    getTitle(): string {
        if ( this.depotName) {
            if (this.booShowArchived) {
                return $localize`:@@DepotOrgsTitleArchive:Archived Organisations of depot ${this.depotName} `;
            } else {
                return $localize`:@@DepotOrgsTitleActive:Active Organisations of depot ${this.depotName} `;
            }
        } else {
            if (this.booShowArchived) {
                    return $localize`:@@BankOrgsTitleArchive:Archived Organisations of bank ${this.bankName} `;
            } else {
                return $localize`:@@BankOrgsTitleActive:Active Organisations of bank ${this.bankName} `;
            }
        }
    }
    changeArchiveFilter($event) {
        console.log('Archive is now:', $event);
        this.booShowArchived = $event.checked;
        this.first = 0;
        const latestQueryParams = {...this.loadPageSubject$.getValue()};
        console.log('Latest Query Parms', latestQueryParams);
        // when we switch from active to archived list and vice versa , we need to restart from first page
        latestQueryParams['offset'] = '0';
        if (this.booShowArchived ) {
            latestQueryParams['actif'] = '0';
        } else {
            latestQueryParams['actif'] = '1';
        }
        this.loadPageSubject$.next(latestQueryParams);
    }

    filterRegion(regId) {
        console.log('Region filter is now:', regId);
        this.regionSelected = regId;
        this.first = 0;
        const latestQueryParams = {...this.loadPageSubject$.getValue()};
        console.log('Latest Region Query Parms', latestQueryParams);
        // when we switch from active to archived list and vice versa , we need to restart from first page
        latestQueryParams['offset'] = '0';
        if (this.regionSelected) {
            latestQueryParams['regId'] = regId;
        } else {
            // delete regId entry
            if (latestQueryParams.hasOwnProperty('regId')) {
                delete latestQueryParams['regId'];
            }
        }
        this.loadPageSubject$.next(latestQueryParams);
    }
    filterClasseFBBA(classeFBBA) {
        console.log('ClasseFBBA filter is now:', classeFBBA);
        this.first = 0;
        const latestQueryParams = {...this.loadPageSubject$.getValue()};
        console.log('Latest ClasseFBBA Query Parms', latestQueryParams);
        // when we switch from active to archived list and vice versa , we need to restart from first page
        latestQueryParams['offset'] = '0';
        if ((classeFBBA >= 0)  && (classeFBBA != 999 )) {
            latestQueryParams['classeFBBA'] = classeFBBA;
        } else {
            if (latestQueryParams.hasOwnProperty('classeFBBA')) {
                delete latestQueryParams['classeFBBA'];
            }
        }
        this.loadPageSubject$.next(latestQueryParams);
    }
}

