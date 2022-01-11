import { Component, OnInit } from '@angular/core';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Membre} from './model/membre';
import {MembreEntityService} from './services/membre-entity.service';
import {Router} from '@angular/router';
import {globalAuthState} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {LazyLoadEvent} from 'primeng/api';
import {AuthState} from '../auth/reducers';
import {QueryParams} from '@ngrx/data';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';


@Component({
    selector: 'app-membres',
    templateUrl: './membres.component.html',
    styleUrls: ['./membres.component.css']
})

export class MembresComponent implements OnInit {
    loadPageSubject$ = new BehaviorSubject(null);
    selectedBatid$ = new BehaviorSubject(0);
    membre: Membre = null;
    membres: Membre[];
    displayDialog: boolean;
    totalRecords: number;
    loading: boolean;
    filterBase: any;
    booShowArchived: boolean;
    booCanCreate: boolean;
    filteredOrganisation: any;
    filteredOrganisations: any[];
    filteredOrganisationsPrepend: any[];
    booShowOrganisations: boolean;
    bankid: number;
    bankName: string;
    filteredBankShortName: string;
    lienDepot: number;
    depotName: string;
    orgName: string;
    first: number;
    bankOptions: any[];
    constructor(private membreService: MembreEntityService,
                private banqueService: BanqueEntityService,
                private orgsummaryService: OrgSummaryEntityService,
                private router: Router,
                private store: Store<AppState>
    ) {
        this.booCanCreate = false;
        this.booShowArchived = false;
        this.bankid = 0;
        this.booShowOrganisations = false;
        this.first = 0;
        this.bankName = '';
        this.depotName = '';
        this.orgName = '';
        this.lienDepot = 0;
    }

    ngOnInit() {
        this.reload();
        this.loadPageSubject$
            .pipe(
                filter(queryParams => !!queryParams),
                mergeMap(queryParams => this.membreService.getWithQuery(queryParams))
            )
            .subscribe(loadedMembres => {
                console.log('Loaded membres from nextpage: ' + loadedMembres.length);
                if (loadedMembres.length > 0) {
                    this.totalRecords = loadedMembres[0].totalRecords;
                }  else {
                    this.totalRecords = 0;
                }
                this.membres  = loadedMembres;
                this.loading = false;
                this.membreService.setLoaded(true);
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

    handleSelect(membre) {
        console.log( 'Membre was selected', membre);
        this.selectedBatid$.next(membre.batId);
        this.displayDialog = true;
    }
    handleMembreQuit() {
        this.displayDialog = false;
    }
    handleMembreCreate(createdMembre: Membre) {
        this.membres.push({...createdMembre});
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

    handleMembreUpdate(updatedMembre) {
        const index = this.membres.findIndex(membre => membre.batId === updatedMembre.batId);
        this.membres[index] = updatedMembre;
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

    handleMembreDeleted(deletedMembre) {
        const index = this.membres.findIndex(membre => membre.batId === deletedMembre.batId);
        this.membres.splice(index, 1);
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
            queryParms['sortField'] =  'nom';
        }
        if (this.booShowOrganisations && this.filteredOrganisation && this.filteredOrganisation.idDis != null) {
            queryParms['lienDis'] = this.filteredOrganisation.idDis;
        }  else {
            if ( this.lienDepot !== 0) {
                queryParms['lienDis'] = this.lienDepot;
            }
        }
        if (this.booShowArchived ) {
            queryParms['actif'] = '0';
        }  else {
            queryParms['actif'] = '1';
        }
        if (event.filters) {
            if (event.filters.nom && event.filters.nom.value) {
                queryParms['nom'] = event.filters.nom.value;
            }
            if (event.filters.address && event.filters.address.value) {
                queryParms['address'] = event.filters.address.value;
            }
            if (event.filters.zip && event.filters.zip.value) {
                queryParms['zip'] = event.filters.zip.value;
            }
            if (event.filters.city && event.filters.city.value) {
                queryParms['city'] = event.filters.city.value;
            }
            if (event.filters.bankShortName && event.filters.bankShortName.value) {
                queryParms['bankShortName'] = event.filters.bankShortName.value;
                this.filteredBankShortName = event.filters.bankShortName.value;
            } else {
                this.filteredBankShortName = null;
            }
        }
        this.loadPageSubject$.next(queryParms);
    }
    private initializeDependingOnUserRights(authState: AuthState) {
        if (authState.banque) {
            this.bankid = authState.banque.bankId;

            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.bankName = authState.banque.bankName;
                    this.booShowOrganisations = true;
                    this.filterBase = { 'lienBanque': authState.banque.bankId};
                    if (authState.user.rights === 'Admin_Banq' ) { this.booCanCreate = true; }
                    this.filteredOrganisationsPrepend = [
                        {idDis: null, fullname: $localize`:@@All:All` },
                        {idDis: 0, fullname: $localize`:@@bank:Bank` },
                        {idDis: 999, fullname: $localize`:@@organisations:Organisations` },
                    ];
                    this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
                    break;
                case 'Asso':
                case 'Admin_Asso':
                    this.bankName = authState.banque.bankName;
                    if (authState.organisation && authState.organisation.depyN === true) {
                        this.booShowOrganisations = true;
                        this.lienDepot = authState.organisation.idDis;
                        this.depotName = authState.organisation.societe;
                        this.filteredOrganisationsPrepend = [
                            {idDis: null, fullname: 'Depot' },
                            {idDis: 999, fullname: $localize`:@@organisations:Organisations` },
                        ];
                        this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
                    } else {
                        this.filterBase = { 'lienDis': authState.organisation.idDis};
                        this.orgName = authState.organisation.societe;
                    }
                    if (authState.user.rights === 'Admin_Asso' ) { this.booCanCreate = true; }
                    break;
                default:
            }
            if (authState.user && (authState.user.rights === 'admin')) {
                this.booShowOrganisations = true;
                this.filteredOrganisationsPrepend = [
                    {idDis: null, fullname: $localize`:@@All:All` },
                    {idDis: 0, fullname: $localize`:@@banks:Banks` },
                    {idDis: 999, fullname: $localize`:@@organisations:Organisations` },
                ];
                this.banqueService.getAll()
                    .pipe(
                        tap((banquesEntities) => {
                            console.log('Banques now loaded:', banquesEntities);
                            this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
                        })
                    ).subscribe();
            }
        }
    }

    showDialogToAdd() {
        this.selectedBatid$.next(0);
        this.displayDialog = true;
    }
    filterOrganisation(event ) {
        const  queryOrganisationParms: QueryParams = {};
        queryOrganisationParms['actif'] = '1';
        if (this.bankOptions) {
            if (this.filteredBankShortName) {
                queryOrganisationParms['bankShortName'] = this.filteredBankShortName;
            } else {
                if (queryOrganisationParms.hasOwnProperty('bankShortName')) {
                    delete queryOrganisationParms['bankShortName'];
                }
            }
        }
        else {
            if (this.lienDepot === 0) {
                queryOrganisationParms['lienBanque'] = this.bankid.toString();
            } else {
                queryOrganisationParms['lienDepot'] = this.lienDepot.toString();
            }
        }
        if (event.query.length > 0) {
            queryOrganisationParms['societe'] = event.query.toLowerCase();
        }

        this.orgsummaryService.getWithQuery(queryOrganisationParms)
            .subscribe(filteredOrganisations => {
                this.filteredOrganisations = this.filteredOrganisationsPrepend.concat(filteredOrganisations.map((organisation) =>
                    Object.assign({}, organisation, {fullname: organisation.idDis + ' ' + organisation.societe})
                ));
                console.log('Proposed Organisations', this.filteredOrganisations);
            });

    }

    filterOrganisationMembers(idDis: number) {
        // when we switch we need to restart from first page
        this.first = 0;
        const latestQueryParams = {...this.loadPageSubject$.getValue()};
        latestQueryParams['offset'] = '0';

            if (idDis === 999) {

                if (this.lienDepot != 0) {
                        latestQueryParams['lienDepot'] = this.lienDepot;
                    if (latestQueryParams.hasOwnProperty('lienDis')) {
                        delete latestQueryParams['lienDis'];
                    }
                }
                else {
                    latestQueryParams['lienDis'] = 999;
                }

            }
            else if (idDis != null) {
                latestQueryParams['lienDis'] = idDis;
                if (latestQueryParams.hasOwnProperty('lienDepot')) {
                    delete latestQueryParams['lienDepot'];
                }
            }
            else {
                if (this.lienDepot != 0) {
                    latestQueryParams['lienDis'] = this.lienDepot;
                    if (latestQueryParams.hasOwnProperty('lienDepot')) {
                        delete latestQueryParams['lienDepot'];
                    }
                }
            }

        this.loadPageSubject$.next(latestQueryParams);
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
    getTitle(): string {
        if ( this.depotName) {
            if (this.booShowArchived) {
                return $localize`:@@DepotMembersTitleArchive:Archived Members of depot ${this.depotName} `;
            } else {
                return $localize`:@@DepotMembersTitleActive:Active Members of depot ${this.depotName} `;
            }
        } else if ( this.orgName) {
            if (this.booShowArchived) {
                return $localize`:@@OrgMembersTitleArchive:Archived Members of organisation ${this.orgName} `;
            } else {
                return $localize`:@@OrgMembersTitleActive:Active Members of organisation ${this.orgName} `;
            }
        } else if ( this.bankName) {
            if (this.booShowArchived) {
                return $localize`:@@BankMembersTitleArchive:Archived Members of bank ${this.bankName} `;
            } else {
                return $localize`:@@BankMembersTitleActive:Active Members of bank ${this.bankName} `;
            }
        } else {
            if (this.booShowArchived) {
                return $localize`:@@AllMembersTitleArchive:Archived Members `;
            } else {
                return $localize`:@@AllMembersTitleActive:Active Members  `;
            }
        }
    }
}

