import {Component, OnInit} from '@angular/core';
import {DefaultDepot, Depot} from './model/depot';
import {DepotEntityService} from './services/depot-entity.service';
import {BehaviorSubject} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {filter, map, mergeMap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {LazyLoadEvent, MessageService} from 'primeng/api';
import {ExcelService} from '../services/excel.service';
import {AuthService} from '../auth/auth.service';
import {DepotHttpService} from './services/depot-http.service';
import {AuthState} from '../auth/reducers';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {formatDate} from '@angular/common';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {DataServiceError, QueryParams} from '@ngrx/data';
import {AuditChangeEntityService} from '../audits/services/auditChange-entity.service';
import {OrgSummary} from '../organisations/model/orgsummary';
import {generateTooltipOrganisation } from '../shared/functions';


@Component({
  selector: 'app-depots',
  templateUrl: './depots.component.html',
  styleUrls: ['./depots.component.css']
})

export class DepotsComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  selectedIdDepot$ = new BehaviorSubject(0);
  depots: Depot[];
  depot: Depot = null;
  displayDialog: boolean;
  loading: boolean;
  filterBase: any;
  booIsAdmin: boolean;
  booShowArchived: boolean;
  booCanCreate: boolean;
  lienBanque: number;
  userId: string;
  userName: string;
  bankShortName: string;
  bankOptions: any[];
  first: number;
  totalRecords: number;
  selectedIdDis: number;
  candidateOrganisation: any;
  candidateOrganisations: OrgSummary[];
  filteredBankShortName: string;
  constructor(private depotService: DepotEntityService,
              private banqueService: BanqueEntityService,
              private orgsummaryService: OrgSummaryEntityService,
              private auditChangeEntityService: AuditChangeEntityService,
              private authService: AuthService,
              private excelService: ExcelService,
              private messageService: MessageService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store,
              private depotHttpService: DepotHttpService
  ) {
    this.booIsAdmin = false;
    this.booCanCreate = false;
    this.booShowArchived = false;
    this.first = 0;
    this.totalRecords = 0;
    this.bankShortName = '';
    this.lienBanque = 0;
    this.filterBase = {};
    this.selectedIdDis = 1;
    this.candidateOrganisations= [];
  }
  ngOnInit() {
    this.reload();
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.depotService.getWithQuery(queryParams))
        )
        .subscribe(loadedDepots => {
          console.log('Loaded depots from nextpage: ' + loadedDepots.length);
          if (loadedDepots.length > 0) {
            this.totalRecords = loadedDepots[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.depots  = loadedDepots;
          this.loading = false;
          this.depotService.setLoaded(true);
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
  handleSelect(depot) {
    this.selectedIdDepot$.next(depot.idDepot);
    this.displayDialog = true;
  }
  addNewDepotFromOrg(idDis: number) {
   this.selectedIdDis = idDis;
   this.candidateOrganisation = null;

   const newDepot = new DefaultDepot();
   newDepot.idDepot = this.selectedIdDis.toString();
   newDepot.lienBanque = this.lienBanque;
 if (this.filteredBankShortName) {
   newDepot.idCompany = this.filteredBankShortName;
 }
 else {
   newDepot.idCompany = this.bankShortName;
 }
   console.log('Creating Depot with content:', newDepot);
   this.depotService.add(newDepot)
       .subscribe((createdDepot) => {
               this.messageService.add({
                   severity: 'success',
                   summary: 'Creation',
                   detail: $localize`:@@messageDepotCreated:The depot ${createdDepot.idDepot} ${createdDepot.nom}  has been created`
               });

               this.auditChangeEntityService.logDbChange(this.userId, this.userName, createdDepot.lienBanque, 0, 'Depot',
                   createdDepot.idDepot + ' ' + createdDepot.nom, 'Create');
               const latestQueryParams = this.loadPageSubject$.getValue();
               this.loadPageSubject$.next(latestQueryParams);
           },
           (dataserviceerrorFn: () => DataServiceError) => {
            const dataserviceerror = dataserviceerrorFn();
            if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
             console.log('Error creating depot', dataserviceerror.message);
             const errMessage = {
               severity: 'error', summary: 'Create',
               // tslint:disable-next-line:max-line-length
               detail: $localize`:@@messageDepotNotCreated:The depot  ${newDepot.idDepot} ${newDepot.nom} could not be created: error: ${dataserviceerror.message}`,
               life: 6000
             };
             this.messageService.add(errMessage);
           });



  }

  handleDepotQuit() {
    this.displayDialog = false;
  }

  handleDepotUpdate(updatedDepot) {
    const index = this.depots.findIndex(depot => depot.idDepot === updatedDepot.idDepot);
    this.depots[index] = updatedDepot;
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }


  handleDepotDeleted(deletedDepot) {
    const index = this.depots.findIndex(depot => depot.idDepot === deletedDepot.idDepot);
    this.depots.splice(index, 1);
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
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
      queryParms['sortField'] =  'nom';
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
     if (event.filters.idCompany && event.filters.idCompany.value) {
        this.filteredBankShortName= event.filters.idCompany.value;
        queryParms['idCompany'] = this.filteredBankShortName;
     } else {
          this.filteredBankShortName = null;
      }
    }
    this.loadPageSubject$.next(queryParms);
  }

  changeArchiveFilter($event) {
    this.booShowArchived = $event.checked;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
     // when we switch from active to archived list and vice versa , we need to restart from first page
    latestQueryParams['offset'] = '0';
    if (this.booShowArchived ) {
      latestQueryParams['actif'] = '0';
    } else {
      latestQueryParams['actif'] = '1';
    }
    this.loadPageSubject$.next(latestQueryParams);
  }
  filterCandidateOrganisations(event ) {
    const  queryOrganisationParms: QueryParams = {};
    queryOrganisationParms['actif'] = '1';
    queryOrganisationParms['depotMissing'] = '1';

    if (this.bankOptions) {
      if (this.filteredBankShortName) {
        queryOrganisationParms['bankShortName'] = this.filteredBankShortName;
      } else {
        if (queryOrganisationParms.hasOwnProperty('lienBanque')) {
          delete queryOrganisationParms['lienBanque'];
        }
      }
    }
    else {
      queryOrganisationParms['bankShortName'] = this.bankShortName;
    }
    if (event.query.length > 0) {
      queryOrganisationParms['societeOrIdDis'] = event.query.toLowerCase();
    }

    this.orgsummaryService.getWithQuery(queryOrganisationParms)
        .subscribe(filteredOrganisations => {
          this.candidateOrganisations = filteredOrganisations.map((organisation) =>
              Object.assign({}, organisation, {fullname: organisation.idDis + ' ' + organisation.societe})
          );
        });

  }


  private initializeDependingOnUserRights(authState: AuthState) {
    this.filterBase = { 'actif': '1'};
    if (authState.user) {
      this.userId= authState.user.idUser;
      this.userName = authState.user.membreNom + ' ' + authState.user.membrePrenom;
      switch (authState.user.rights) {
        case 'Bank':
          this.filterBase ['idCompany'] = authState.banque.bankShortName;
          this.bankShortName = authState.banque.bankShortName;
          this.lienBanque = authState.banque.bankId;
          break;
        case 'Admin_Banq':
          this.filterBase ['idCompany'] = authState.banque.bankShortName;
          this.bankShortName = authState.banque.bankShortName;
          this.lienBanque = authState.banque.bankId;
          this.booCanCreate = true;
          break;
        case 'admin':
          this.booIsAdmin = true;
          const classicBanks = { 'classicBanks': '1' };
          this.banqueService.getWithQuery(classicBanks)
              .subscribe((banquesEntities) => {
                  this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
              });

          break;
        default:
            this.filterBase ['idCompany'] = '999';
      }
    }
  }
  exportAsXLSX(): void {
    this.depotHttpService.getDepotReport(this.authService.accessToken, this.bankShortName).subscribe(
        (depots: any[] ) => {
          const cleanedList = depots.map(({ actif, isNew, totalRecords, ...item }) => item);
          this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.bankShortName + '.depots.' + formatDate(new Date(),'ddMMyyyy.HHmm','en-US') + '.xlsx');
        });
  }

    hasDepotAnomalies(depot: Depot) {
        if (depot.anomalies == "") return false;
        else return true;
    }

  generateToolTipMessageForDepotAnomalies(depot: Depot) {
    if (depot.anomalies == "") return $localize`:@@ToolTipDepotNoAnomalies:Depot Info is consistent with its Organisation Info`;
    else return $localize`:@@ToolTipDepotAnomalies:Depot Info is not consistent with its Organisation Info - see depot details`;
  }
  generateToolTipMessageForOrgsWithoutDepot() {
   return $localize`:@@ToolTipOrgsWithoutDepot:${this.candidateOrganisations.length} organisations without depot proposed`;
  }
  generateTooltipOrganisation() {
        return generateTooltipOrganisation();
    }
}


