import {Component, OnInit} from '@angular/core';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
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
import {DepotEntityService} from '../depots/services/depot-entity.service';
import {QueryParams} from '@ngrx/data';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {ExcelService} from '../services/excel.service';
import {AuthService} from '../auth/auth.service';
import {OrganisationHttpService} from './services/organisation-http.service';
import {formatDate} from '@angular/common';
import {labelActive, labelAgreed, labelLanguage} from '../shared/functions';


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
    orgCategories: any[];
    displayDialog: boolean;
    totalRecords: number;
    loading: boolean;
    filterBase: any;
    booShowArchived: boolean;
    booCanCreate: boolean;
    regions: any[];
    depots: any[];
    YNOptions:  any[];
    bankName: string;
    bankShortName: string;
    lienBanque: number;
    depotName: string;
    first: number;
    regionSelected: number;
    depotSelected: string;
    classeFBBASelected: number;
    statutSelected: string;
    statuts: any[];
    bankOptions: any[]
    filteredBankShortName: string;
    constructor(private organisationService: OrganisationEntityService,
                private banqueService: BanqueEntityService,
                private regionService: RegionEntityService,
                private depotService: DepotEntityService,
                private authService: AuthService,
                private excelService: ExcelService,
                private router: Router,
                private route: ActivatedRoute,
                private store: Store<AppState>,
                private organisationHttpService: OrganisationHttpService
    ) {
        this.booCanCreate = false;
        this.booShowArchived = false;
        this.orgCategories = enmOrgCategories;
        this.statuts = enmStatusCompany;
        this.YNOptions = enmYn;
        this.lienBanque = 0;
        this.bankName = '';
        this.bankShortName = '';
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
            if (event.filters.birbyN && event.filters.birbyN.value !== null) {
                queryParms['isBirb'] = event.filters.birbyN.value;
            }
            if (event.filters.refInt && event.filters.refInt.value !== null ) {
                queryParms['refint'] = event.filters.refInt.value;
            }
            if (event.filters.hasLogins && event.filters.hasLogins.value !== null ) {
                queryParms['hasLogins'] = event.filters.hasLogins.value;
            }
            if (this.regionSelected) {
                queryParms['regId'] = this.regionSelected;
            }
            if (this.depotSelected) {
                queryParms['lienDepot'] = this.depotSelected;
            }
            if (this.statutSelected && (this.statutSelected !== '')) {
                queryParms['statut'] = this.statutSelected;
            }
            if (this.classeFBBASelected) {
                queryParms['classeFBBA'] = this.classeFBBASelected;
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
        // exfilter all depots
        this.filterBase = { 'isDepot': '0' };
        if (authState.user) {
            if (authState.banque && authState.user.rights !== 'admin' && authState.user.rights !== 'Admin_FEAD' ) {
                this.lienBanque = authState.banque.bankId;
                this.bankName = authState.banque.bankName;
                this.bankShortName = authState.banque.bankShortName;
            }

            switch (authState.user.rights) {
                case 'admin':
                case 'Bank':
                case 'Admin_Banq':
                case 'Admin_FEAD':
                    if (authState.user.rights === 'Admin_Banq' ) { this.booCanCreate = true; }
                    const  queryDepotParms: QueryParams = {};
                    queryDepotParms['offset'] = '0';
                    queryDepotParms['rows'] = '999';
                    queryDepotParms['sortField'] = 'nom';
                    queryDepotParms['sortOrder'] = '1';
                    if (this.lienBanque) {
                        this.filterBase['lienBanque'] =this.lienBanque
                        queryDepotParms['lienBanque'] = this.lienBanque.toString();
                    }
                    queryDepotParms['actif'] = '1';
                    this.depotService.getWithQuery(queryDepotParms)
                        .subscribe(depots => {
                            this.depots = [{ value: null, label: ''}];
                            depots.map((depot) =>
                                this.depots.push({value: depot.idDepot, label: depot.nom})
                            );
                        });
                    if (authState.user.rights === 'admin' ) {
                        this.banqueService.getAll()
                            .pipe(
                                tap((banquesEntities) => {
                                    console.log('Banques now loaded:', banquesEntities);
                                    this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
                                })
                            ).subscribe();
                    }

                    break;
                case 'Asso':
                case 'Admin_Asso':
                    // This module is only called for depots see menu
                    this.filterBase['lienBanque'] = authState.banque.bankId;
                    this.depotName = authState.organisation.societe;
                    this.filterBase['lienDepot'] = authState.organisation.idDis;
                    if (authState.user.rights === 'Admin_Asso' ) { this.booCanCreate = true; }
                    break;

                default:
            }
            const  queryRegionParms: QueryParams = {};
            if (this.lienBanque) {
                queryRegionParms['lienBanque'] = this.lienBanque.toString();
            }
           this.regionService.getWithQuery(queryRegionParms)
            .subscribe(regions => {
                this.regions = [{ value: null, label: ''}];
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
    filterDepot(idDepot) {
        console.log('Depot filter is now:', idDepot);
        this.depotSelected = idDepot;
        this.first = 0;
        const latestQueryParams = {...this.loadPageSubject$.getValue()};
        console.log('Latest Depot Query Parms', latestQueryParams);
        // when we switch f we need to restart from first page
        latestQueryParams['offset'] = '0';
        if (this.depotSelected) {
            latestQueryParams['lienDepot'] = idDepot;
        } else {
            // delete idDepot entry
            if (latestQueryParams.hasOwnProperty('lienDepot')) {
                delete latestQueryParams['lienDepot'];
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
            this.classeFBBASelected = classeFBBA;
            latestQueryParams['classeFBBA'] = classeFBBA;
        } else {
            this.classeFBBASelected = null;
            if (latestQueryParams.hasOwnProperty('classeFBBA')) {
                delete latestQueryParams['classeFBBA'];
            }
        }
        this.loadPageSubject$.next(latestQueryParams);
    }

    filterStatut(statut) {
        console.log('statut filter is now:', statut);
        this.statutSelected = statut;
        this.first = 0;
        const latestQueryParams = {...this.loadPageSubject$.getValue()};
        console.log('Latest statut Query Parms', latestQueryParams);
        // when we switch f, we need to restart from first page
        latestQueryParams['offset'] = '0';
        if (statut !== '') {
            latestQueryParams['statut'] = statut;
        } else {
            if (latestQueryParams.hasOwnProperty('statut')) {
                delete latestQueryParams['statut'];
            }
        }
        this.loadPageSubject$.next(latestQueryParams);
    }
    exportAsXLSX(): void {
        let reportOption = null;
        if (!this.bankOptions) {
            reportOption = this.lienBanque;
        }
        this.organisationHttpService.getOrganisationReport(this.authService.accessToken, reportOption).subscribe(
            (organisations: any[]) => {
                const cleanedList = [];
                organisations.map((item) => {
                    const cleanedItem = {};
                    if (this.bankOptions) {
                        cleanedItem[$localize`:@@Bank:Bank`] = item.bankShortName;
                    }
                    cleanedItem['Id'] = item.idDis;
                    cleanedItem[$localize`:@@Organisation:Organisation`] =item.societe;
                    cleanedItem[$localize`:@@InternalRef:Internal Ref`] = item.refInt;
                    cleanedItem[$localize`:@@Active:Active`] = labelActive(item.actif);
                    cleanedItem[$localize`:@@Language:Language`] = labelLanguage(item.langue)
                    cleanedItem[$localize`:@@Address:Address`] = item.adresse;
                    cleanedItem[$localize`:@@ZipCode:Zip Code`] =item.cp;
                    cleanedItem[$localize`:@@City:City`] =item.localite;
                    const regionObject = this.regions.find(obj => obj.value == item.region);
                    cleanedItem[$localize`:@@Region:Region`] =(typeof regionObject !== "undefined") ? regionObject.label : '';
                    cleanedItem['Tel'] =item.tel;
                    cleanedItem['Gsm'] =item.gsm;
                    cleanedItem['email'] =item.email;
                    cleanedItem[$localize`:@@Agreed:Agreed`] = labelAgreed(item.agreed);
                    cleanedItem[$localize`:@@FeadCode:Fead Code`] =item.birbCode;
                    cleanedList.push( cleanedItem);
                });
                if (!this.bankOptions) {
                    this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.bankShortName + '.organisations.' + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
                }
                else {
                    this.excelService.exportAsExcelFile(cleanedList, 'foodit.organisations.' + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
                }
            });
    }

}

