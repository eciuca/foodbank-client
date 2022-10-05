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
import {ExcelService} from '../services/excel.service';
import {AuthService} from '../auth/auth.service';
import {MembreHttpService} from './services/membre-http.service';
import {formatDate} from '@angular/common';
import {labelActive, labelCivilite, labelLanguage} from '../shared/functions';
import {MembreFunctionEntityService} from './services/membreFunction-entity.service';


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
    booIsAdmin: boolean;
    userLanguage: string;
    anomaliesOptions: any[];
    anomalyFilter: any;
    bankid: number;
    bankName: string;
    bankShortName: string;
    filteredBankId: number;
    filteredBankShortName: string;
    lienDepot: number;
    depotName: string;
    idOrg: number;
    orgName: string;
    first: number;
    bankOptions: any[];
    membreFunctions : any[];
    selectedFunction: any;
    constructor(private membreService: MembreEntityService,
                private membreFunctionEntityService: MembreFunctionEntityService,
                private banqueService: BanqueEntityService,
                private orgsummaryService: OrgSummaryEntityService,
                private authService: AuthService,
                private excelService: ExcelService,
                private router: Router,
                private store: Store<AppState>,
                private membreHttpService: MembreHttpService
    ) {
        this.booCanCreate = false;
        this.booIsAdmin = false;
        this.anomaliesOptions = [
            {label: ' ', value: null },
            {label: $localize`:@@MemberAnomalyNoEmail:Members without emails`, value: '1'},
            {label: $localize`:@@MemberAnomalyNonUniqueEmail:Members with non-unique emails`, value: '2'},
            {label: $localize`:@@MemberAnomalyDuplicateNames:Members with duplicate names`, value: '3'},
        ];
        this.booShowArchived = false;
        this.bankid = 0;
        this.booShowOrganisations = false;
        this.first = 0;
        this.bankName = '';
        this.bankShortName = '';
        this.depotName = '';
        this.idOrg = 0;
        this.orgName = '';
        this.lienDepot = 0;
        this.membreFunctions = [{label: ' ',value: null}];
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
    filterFunction(fonction) {
      this.selectedFunction = fonction;
        this.first = 0;
        const latestQueryParams = {...this.loadPageSubject$.getValue()};
      // we need to restart from first page
        latestQueryParams['offset'] = '0';
        if (this.selectedFunction && (this.filteredOrganisation['idDis'] == 0)) {
            latestQueryParams['fonction'] = this.selectedFunction;
        }
       else {
            // delete fonction entry
            if (latestQueryParams.hasOwnProperty('fonction')) {
                delete latestQueryParams['fonction'];
            }
        }
        this.loadPageSubject$.next(latestQueryParams);
    }
    nextPage(event: LazyLoadEvent) {
        console.log('Lazy Loaded Event', event);
        this.loading = true;
        const queryParms = {...this.filterBase};
        if (event) {
            queryParms['offset'] = event.first.toString();
            queryParms['rows'] = event.rows.toString();
            queryParms['sortOrder'] = event.sortOrder.toString();
            if (event.sortField) {
                queryParms['sortField'] = event.sortField.toString();
            } else {
                queryParms['sortField'] = 'nom';
            }
        }
        else {
            queryParms['offset'] = 0;
            queryParms['rows'] = 10;
            queryParms['sortField'] = 'nom';
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
        if (this.anomalyFilter ) {
            queryParms['hasAnomalies'] = this.anomalyFilter;
        }
        if (this.selectedFunction && (this.filteredOrganisation['idDis'] == 0)) {
            queryParms['fonction'] = this.selectedFunction;
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
            if (event.filters.batmail && event.filters.batmail.value) {
                queryParms['batmail'] = event.filters.batmail.value;
            }
            if (event.filters.telgsm && event.filters.telgsm.value) {
                queryParms['telgsm'] = event.filters.telgsm.value;
            }
            if (event.filters.bankId && event.filters.bankId.value) {
                queryParms['lienBanque'] = event.filters.bankId.value;
                this.filteredBankId= event.filters.bankId.value;
                this.filteredBankShortName = this.bankOptions.find(obj => obj.value === this.filteredBankId).label;
                console.log('CurrentFilteredBankIdAndShortName',  this.filteredBankId,this.filteredBankShortName,this.bankOptions);
            } else {
                this.filteredBankId = null;
                this.filteredBankShortName = null;
            }
        }
        this.loadPageSubject$.next(queryParms);
    }
    changeAnomaliesFilter(value: any) {
        this.anomalyFilter = value;
        this.first = 0;
        const latestQueryParams = {...this.loadPageSubject$.getValue()};
        console.log('Latest Query Parms', latestQueryParams);
        // when we switch from active to archived list and vice versa , we need to restart from first page
        latestQueryParams['offset'] = '0';
        if (this.anomalyFilter ) {
            latestQueryParams['hasAnomalies'] = this.anomalyFilter;
        } else {
            if (latestQueryParams.hasOwnProperty('hasAnomalies')) {
                delete latestQueryParams['hasAnomalies'];
            }
        }
        this.loadPageSubject$.next(latestQueryParams);
    }
    private initializeDependingOnUserRights(authState: AuthState) {
        this.userLanguage = authState.user.idLanguage;
        if (authState.banque && authState.user.rights !== 'admin' && authState.user.rights !== 'Admin_FEAD'
            && authState.user.rights !== 'Admin_FBBA' && authState.user.rights !== 'Bank_FBBA' ) {
            this.bankid = authState.banque.bankId;
            this.bankName = authState.banque.bankName;
            this.bankShortName = authState.banque.bankShortName;
        }
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.booShowOrganisations = true;
                    this.loadFunctions(authState.banque.bankId);
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
                        this.idOrg = authState.organisation.idDis;
                        this.orgName = authState.organisation.societe;
                    }
                    if (authState.user.rights === 'Admin_Asso' ) { this.booCanCreate = true; }
                    break;
                case 'admin':
                case 'Admin_FBBA':
                case 'Bank_FBBA':
                    if (authState.user.rights != 'Bank_FBBA' ) {
                        this.booIsAdmin = true;
                    }
                    this.booShowOrganisations = true;
                    this.filteredOrganisationsPrepend = [
                        {idDis: null, fullname: $localize`:@@All:All` },
                        {idDis: 0, fullname: $localize`:@@banks:Banks` },
                        {idDis: 999, fullname: $localize`:@@organisations:Organisations` },
                    ];
                    this.loadFunctions(null);
                    if (authState.user.rights === 'admin') {
                        this.filterBase = { };
                        this.banqueService.getAll()
                            .subscribe( banquesEntities => {
                                console.log('Banques now loaded:', banquesEntities);
                                const bankOptionsPrepend = [{'label': '???', 'value': 999}];
                                this.bankOptions = bankOptionsPrepend.concat(banquesEntities.map(({
                                                                                                      bankShortName,
                                                                                                      bankId
                                                                                                  }) => ({
                                    'label': bankShortName,
                                    'value': bankId
                                })));
                                console.log('Bank Options are:', this.bankOptions);
                            });
                    }
                    else {
                        this.filterBase = { 'classicBanks': '1'};
                        const classicBanks = { 'classicBanks': '1' };
                        this.banqueService.getWithQuery(classicBanks).subscribe(
                            banquesEntities => {
                                this.bankOptions  = banquesEntities.map(({bankShortName, bankId}) => ({
                                    'label': bankShortName,
                                    'value': bankId
                                }));
                            });

                    }
                    break;
                default:
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
            if (this.filteredBankId) {
                queryOrganisationParms['lienBanque'] = this.filteredBankId.toString();
            } else {
                if (queryOrganisationParms.hasOwnProperty('lienBanque')) {
                    delete queryOrganisationParms['lienBanque'];
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
                else {
                    if (latestQueryParams.hasOwnProperty('lienDis')) {
                        delete latestQueryParams['lienDis'];
                    }
                }
            }
        if (this.selectedFunction && (this.filteredOrganisation['idDis'] == 0)) {
            latestQueryParams['fonction'] = this.selectedFunction;
        }
        else {
            if (latestQueryParams.hasOwnProperty('fonction')) {
                delete latestQueryParams['fonction'];
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
    loadFunctions(lienBanque: number) {
        const queryParms = { 'actif': '1' , 'language': this.userLanguage };
        if (lienBanque) {
            queryParms['lienBanque'] = lienBanque.toString();
        }
        this.membreFunctionEntityService.getWithQuery(queryParms)
            .subscribe((membreFunctions) => {
                console.log('Membre functions now loaded:', membreFunctions);
                membreFunctions.map((membreFunction) => {
                    if(this.userLanguage == 'fr') {
                        this.membreFunctions.push({label: membreFunction.bankShortName + ' ' + membreFunction.fonctionName, value: membreFunction.funcId});
                    }
                    else {
                        this.membreFunctions.push({label: membreFunction.bankShortName + ' ' + membreFunction.fonctionNameNl, value: membreFunction.funcId});
                    }
                });
            })
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
    exportAsXLSX(): void {
        let lienBanque = null;
        if (!this.bankOptions) {
            lienBanque = this.bankid;
        }
        this.membreHttpService.getMembreReport(this.authService.accessToken, lienBanque,this.idOrg).subscribe(
            (membres: any[]) => {
                const cleanedList = [];
                membres.map((item) => {
                    const cleanedItem = {};
                    if (this.bankOptions) {
                        cleanedItem[$localize`:@@Bank:Bank`] = item.bankShortName;
                    }
                    cleanedItem[$localize`:@@MemberTitle:Title`] = labelCivilite(item.civilite);
                    cleanedItem[$localize`:@@Name:Name`] = item.nom;
                    cleanedItem[$localize`:@@FirstName:First Name`] =item.prenom;
                    cleanedItem[$localize`:@@Organisation:Organisation`] =item.societe;
                    cleanedItem[$localize`:@@Active:Active`] = labelActive(item.actif);
                    cleanedItem[$localize`:@@Language:Language`] = labelLanguage(item.langue)
                    cleanedItem[$localize`:@@Address:Address`] = item.address;
                    cleanedItem[$localize`:@@ZipCode:Zip Code`] =item.zip;
                    cleanedItem[$localize`:@@City:City`] =item.city;
                    cleanedItem['Tel'] =item.tel;
                    cleanedItem['Gsm'] =item.gsm;
                    cleanedItem['email'] =item.batmail;
                    cleanedItem[$localize`:@@BirthDate:Birth Date`] =item.dateNaissance;
                    cleanedItem[$localize`:@@Nat Number:National Number`] =item.nnat;
                    cleanedList.push( cleanedItem);
                });
                if (this.idOrg > 0) {
                    this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.idOrg + '.members.' + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
                }
                else {
                    if (!this.bankOptions) {
                        this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.bankShortName + '.members.' + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
                    } else {
                        this.excelService.exportAsExcelFile(cleanedList, 'foodit.members.' + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
                    }
                }
            });
    }

    generateNbOfMemberUsers(nbOfUsers) {
        if(nbOfUsers == 0) {
            return $localize`:@@None:None`;
        }
        if(nbOfUsers == 1) {
            return $localize`:@@Yes:Yes`;
        }
        return  nbOfUsers;
    }
    generateNbOfMemberUsersTooltip() {
        return $localize`:@@ToolTipNbOfMemberUsers:User Id for this member`;
    }
    generateTooltipFunction() {
        return $localize`:@@TooltipFunction:Functions can be standard for all banks or specific for a food bank`;
    }


    generateTelGsm(membre: Membre) {
        let telgsm = "";
        if (membre.tel && membre.tel !="") {
            telgsm += membre.tel.trim() + " ";
        }
        if (membre.gsm && membre.gsm !="") {
            telgsm += membre.gsm.trim() + " ";
        }
        return telgsm;

    }
}

