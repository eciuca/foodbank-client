import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {globalAuthState} from '../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {AuthState} from '../auth/reducers';
import {MovementReportHttpService} from './services/movement-report-http.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {MovementReport} from './model/movementReport';
import {ExportMovementDailyReport} from './model/exportMovementDailyReport';
import {ExportMovementMonthlyReport} from './model/exportMovementMonthlyReport';
import {formatDate} from '@angular/common';
import {ExcelService} from '../services/excel.service';
import * as moment from 'moment';
import {forEach} from '@angular-devkit/schematics';
import {DepotHttpService} from '../depots/services/depot-http.service';
import {Depot} from '../depots/model/depot';
import {OrgSummary} from '../organisations/model/orgsummary';
@Component({
    selector: 'app-movements-report',
    templateUrl: './movements-report.component.html',
    styleUrls: ['./movements-report.component.css']
})
export class MovementReportComponent implements OnInit {
    isAdmin: boolean;
    booIsLoaded: boolean;
    categoryOptions: any[];
    categoryOptionsNonFEAD: any[];
    categoryOptionsFEADNonAgreed: any[];
    categoryOptionsFEADAgreedCollect: any[];
    category: string;
    bankShortName: string;
    bankId: number;
    bankOptions: any[];
    depotOptions: any[];
    backgroundColors: any[];
    basicOptions: any;
    stackedOptions: any;
    pieOptions: any;
    booShowDaily: boolean;
    titleMovementsEvolution: string;
    movementReports: MovementReport[];
    titleFoodDeliveriesNonFEADEvolution: string;
    chartDataFoodDeliveriesNonFEADHistory: { labels: any[]; datasets: any[]; };
    titleFoodDeliveriesFEADNonAgreedEvolution: string;
    chartDataFoodDeliveriesFEADNonAgreedHistory: { labels: any[]; datasets: any[]; };
    titleFoodDeliveriesFEADAgreedCollectEvolution: string;
    chartDataFoodDeliveriesFEADAgreedCollectHistory: { labels: any[]; datasets: any[]; };
    chartDataFoodDeliveriesCurrent: { labels: any[]; datasets: any[]; };
    chartDataFoodDeliveriesPrevious: { labels: any[]; datasets: any[]; };
    chartDataFoodDeliveriesPrevious1: { labels: any[]; datasets: any[]; };
    chartDataFoodDeliveriesPrevious2: { labels: any[]; datasets: any[]; };
    titleFoodDeliveriesCurrent: string;
    titleFoodDeliveriesPrevious: string;
    titleFoodDeliveriesPrevious1: string;
    titleFoodDeliveriesPrevious2: string;
    totalFoodDeliveriesNonFEAD: number;
    totalFoodDeliveriesFEADNonAgreed: number;
    totalFoodDeliveriesFEADAgreedCollect: number;
    totalFoodDeliveriesCurrent: number;
    totalFoodDeliveriesPrevious: number;
    totalFoodDeliveriesPrevious1: number;
    totalFoodDeliveryFamiliesCurrent: number;
    totalFoodDeliveryPersonsCurrent: number;
    totalFoodDeliveryFamiliesPrevious: number;
    totalFoodDeliveryPersonsPrevious: number;
    totalFoodDeliveryFamiliesPrevious1: number;
    totalFoodDeliveryPersonsPrevious1: number;
    totalFoodDeliveriesCurrentOrganisations:number;
    totalFoodDeliveriesPreviousOrganisations:number;
    totalFoodDeliveriesPrevious1Organisations:number;
    totalFoodDeliveriesCurrentPerFamily: number;
    totalFoodDeliveriesCurrentPerPerson: number;
    totalFoodDeliveriesPreviousPerFamily: number;
    totalFoodDeliveriesPreviousPerPerson: number;
    totalFoodDeliveriesPrevious1PerFamily: number;
    totalFoodDeliveriesPrevious1PerPerson: number;

    reportLabels: any[];
    reportDataSetsNonFEAD: any[];
    reportDataSetsFEADnonAgreed: any[];
    reportDataSetsFEADAgreedCollect: any[];
    reportDataSetsCurrent: any[];
    reportDataSetsPrevious: any[];
    reportDataSetsPrevious1: any[];
    reportDataSetsPrevious2: any[];
    reportDataSetsPrevious3: any[];
    currentPeriod: any;
    previousPeriod: any;
    previousPeriod1: any;
    previousPeriod2: any;
    previousPeriod3: any;
    previousOrganisationData :{key: any, categoryIndex: number,nfamilies: number,npersons: number,norgs:number}[] = [];
    currentOrganisationData :{key: any, categoryIndex: number,nfamilies: number,npersons: number;norgs:number}[] = [];
    previous1OrganisationData :{key: any, categoryIndex: number,nfamilies: number,npersons: number;norgs:number}[] = [];
    exportListMovementsMonthly:ExportMovementMonthlyReport[];
    exportListMovementsDaily:ExportMovementDailyReport[]
    depotId: string;

    constructor(
        private movementReportHttpService: MovementReportHttpService,
        private banqueService: BanqueEntityService,
        private depotHttpService: DepotHttpService,
        private excelService: ExcelService,
        private authService: AuthService,
        private http: HttpClient,
        private store: Store<AppState>
    ) {
        this.isAdmin = false;
        this.booShowDaily = false;
        this.backgroundColors = ['magenta', 'violet', 'indigo', 'blue', 'x0080ff', 'cyan', 'green', 'olive', 'yellow', 'orange', 'red', 'darkred', 'black', 'silver'];
        // x0080ff dodger blue

        this.basicOptions = {
            tooltips: {
                mode: 'index',
                intersect: false
            },
            responsive: true,
        };
        this.stackedOptions = {
            tooltips: {
                mode: 'index',
                intersect: false
            },
            responsive: true,

            scales: {
                xAxes: {
                    stacked: true,
                },
                yAxes: {
                    stacked: true
                }
            }
        };

        this.pieOptions = {
            tooltips: {
                mode: 'index',
                intersect: false
            },
            responsive: true,
        }
        this.titleMovementsEvolution = '';
    }

    ngOnInit(): void {
        this.booIsLoaded = false;
        this.store
            .pipe(
                select(globalAuthState),
                map((authState) => {
                    this.initializeDependingOnUserRights(authState);
                })
            )
            .subscribe();
    }

    private initializeDependingOnUserRights(authState: AuthState) {

        if (authState.user) {
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.bankShortName = authState.banque.bankShortName;
                    this.bankId = authState.banque.bankId;
                    this.category = 'Depot'
                   this.depotHttpService.getDepotReport(this.authService.accessToken,this.bankShortName)
                            .subscribe((depots:Depot[]) => {
                                this.depotOptions = depots.map(({idDepot, nom}) => ({'value': idDepot, 'label': nom}));
                                this.categoryOptions =[...this.depotOptions];
                                this.categoryOptions.push({label: 'OTHER', value: null});
                                this.categoryOptionsFEADAgreedCollect = [...this.categoryOptions];
                                this.categoryOptionsFEADNonAgreed = [...this.categoryOptions];
                                this.categoryOptionsNonFEAD  = [...this.categoryOptions];
                                this.depotOptions.unshift({'value': null, 'label': ' '});
                                if (!this.booIsLoaded) {
                                    this.report();
                                }
                                this.booIsLoaded = true;
                            });
                    break;
                case 'admin':
                case 'Admin_FBBA':
                    this.isAdmin = true;
                    this.category = 'Bank';

                    const classicBanks = {'classicBanks': '1'};
                    this.banqueService.getWithQuery(classicBanks)
                        .subscribe((banquesEntities) => {
                            this.bankOptions = banquesEntities.map(({bankShortName}) => ({
                                'label': bankShortName,
                                'value': bankShortName
                            }));
                            this.categoryOptions =[...this.bankOptions];
                            this.categoryOptions.push({label: 'OTHER', value: null});
                            this.categoryOptionsFEADAgreedCollect = [...this.categoryOptions];
                            this.categoryOptionsFEADNonAgreed = [...this.categoryOptions];
                            this.categoryOptionsNonFEAD  = [...this.categoryOptions];
                           this.bankOptions.unshift({'value': null, 'label': ' '});
                            if (!this.booIsLoaded) {
                                this.report();
                            }
                            this.booIsLoaded = true;
                        });
                    break;
                default:
            }
        }

    }

    report() {

        this.reportMovementsHistoryMonthly();
    }

    changePeriodFilter($event) {
        this.booShowDaily = $event.checked;
        if (this.booShowDaily) {
            this.reportMovementsHistoryDaily();
        } else {
            this.reportMovementsHistoryMonthly();
        }
    }
    filterDepot(depotId) {
        this.depotId = depotId;
        if (this.depotId) {
           this.categoryOptions =[];
        }
        else {
            this.categoryOptions =[...this.depotOptions];
            this.categoryOptions.shift();
            this.categoryOptions.push({label: 'OTHER', value: null});
        }
        this.categoryOptionsFEADAgreedCollect = [...this.categoryOptions];
        this.categoryOptionsFEADNonAgreed = [...this.categoryOptions];
        this.categoryOptionsNonFEAD  = [...this.categoryOptions];
        if (this.booShowDaily) {
            this.reportMovementsHistoryDaily();
        } else {
            this.reportMovementsHistoryMonthly();
        }
    }
    filterBank(bankShortName) {
        this.bankShortName = bankShortName;
        this.depotId = null;
        if (this.bankShortName) {
            this.category = 'Depot'
            this.depotHttpService.getDepotReport(this.authService.accessToken,this.bankShortName)
                .subscribe((depots:Depot[]) => {
                    this.depotOptions = depots.map(({idDepot, nom}) => ({'value': idDepot, 'label': nom}));
                    this.categoryOptions =[...this.depotOptions];
                    this.categoryOptions.push({label: 'OTHER', value: null});
                    this.categoryOptionsFEADAgreedCollect = [...this.categoryOptions];
                    this.categoryOptionsFEADNonAgreed = [...this.categoryOptions];
                    this.categoryOptionsNonFEAD  = [...this.categoryOptions];
                    this.depotOptions.unshift({'value': null, 'label': ' '});
                    this.category='Depot';
                    if (this.booShowDaily) {
                        this.reportMovementsHistoryDaily();
                    } else {
                        this.reportMovementsHistoryMonthly();
                    }
                });

        }
        else {
            this.category = 'Bank';
            this.categoryOptions =[...this.bankOptions];
            this.categoryOptions.shift();
            this.categoryOptions.push({label: 'OTHER', value: null});
            this.categoryOptionsFEADAgreedCollect = [...this.categoryOptions];
            this.categoryOptionsFEADNonAgreed = [...this.categoryOptions];
            this.categoryOptionsNonFEAD  = [...this.categoryOptions];
            if (this.booShowDaily) {
                this.reportMovementsHistoryDaily();
            } else {
                this.reportMovementsHistoryMonthly();
            }
        }
    }
     createCategoryOptionsForOrgs() {
           this.movementReports.forEach(movementReport => {
               const index = this.categoryOptions.findIndex(item => item.value === movementReport.idOrg.toString());
               if  (index === -1) {
                    if (this.categoryOptions.length < 9) {
                        this.categoryOptions.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                    }
                    else if (this.categoryOptions.length == 9) {
                     this.categoryOptions.push({value: null,label: 'OTHER'});
                    }
               }
               switch (movementReport.category) {
                   case 'NOFEADNONAGREED':

                       const index1 = this.categoryOptionsNonFEAD.findIndex(item => item.value === movementReport.idOrg.toString());
                       if  (index1 === -1) {
                           if (this.categoryOptionsNonFEAD.length < 9) {
                               this.categoryOptionsNonFEAD.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                           }
                           else if (this.categoryOptionsNonFEAD.length == 9) {
                               this.categoryOptionsNonFEAD.push({value: null,label: 'OTHER'});
                           }
                       }
                       break;
                   case 'FEADNONAGREED':
                       const index2 = this.categoryOptionsFEADNonAgreed.findIndex(item => item.value === movementReport.idOrg.toString());
                       if  (index2 === -1) {
                           if (this.categoryOptionsFEADNonAgreed.length < 9) {
                               this.categoryOptionsFEADNonAgreed.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                           }
                           else if (this.categoryOptionsFEADNonAgreed.length == 9) {
                               this.categoryOptionsFEADNonAgreed.push({value: null,label: 'OTHER'});
                           }
                       }
                       break;
                   case 'AGREEDFEADCOLLECT':
                       const index3 = this.categoryOptionsFEADAgreedCollect.findIndex(item => item.value === movementReport.idOrg.toString());
                       if  (index3 === -1) {
                           if (this.categoryOptionsFEADAgreedCollect.length < 9) {
                               this.categoryOptionsFEADAgreedCollect.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                           }
                           else if (this.categoryOptionsFEADAgreedCollect.length == 9) {
                               this.categoryOptionsFEADAgreedCollect.push({value: null,label: 'OTHER'});
                           }
                       }
                       break;
                   default:
                       console.log('Unknown movement category: ' + movementReport.category);
               }
           });
     }
    reportMovementsHistoryMonthly() {
        this.currentPeriod = new Date().getFullYear();
        this.previousPeriod = this.currentPeriod - 1;
        this.previousPeriod1 = this.currentPeriod - 2;
        const lowRange = `${this.previousPeriod1}01`;
        const highRange = `${this.currentPeriod}12`;

        this.movementReportHttpService.getMovementMonthlyReport(this.authService.accessToken, this.bankShortName,this.depotId, lowRange,highRange).subscribe(
            (response: MovementReport[]) => {
                this.movementReports = response;


                if (this.depotId) {
                    this.createCategoryOptionsForOrgs();
                }
                this.initializeChart();
                this.previousOrganisationData = [];
                this.currentOrganisationData = [];
                this.previous1OrganisationData = [];
                for (let i = 0; i < this.movementReports.length; i++) {
                    if ( this.movementReports[i].orgname) {
                        this.movementReports[i].orgname = this.movementReports[i].orgname.replace(/[^0-9a-z]/gi, '');
                    }
                    let categoryOptionIndex = -1;
                    if (this.category == 'Depot') {
                        categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.value === this.movementReports[i].lienDepot.toString());
                    }
                    else {
                         categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.label === this.movementReports[i].bankShortName);
                    }
                    if (categoryOptionIndex === -1) {
                         categoryOptionIndex = this.categoryOptions.length - 1;
                    }
                    const movementYear = String(this.movementReports[i].month).substring(0, 4);
                    if (movementYear < this.previousPeriod2) continue;
                    switch (movementYear) {
                        case this.currentPeriod.toString():
                            let itemKey: any = this.movementReports[i].bankShortName;
                            if (this.category == 'Depot') {
                                itemKey = this.movementReports[i].lienDepot;
                            }
                            const currentOrganisationDataItem = this.currentOrganisationData.find(item => item.key === itemKey)
                            if (!currentOrganisationDataItem) {
                                this.currentOrganisationData.push({key: itemKey, categoryIndex: categoryOptionIndex,
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons,norgs:1});
                            }
                            else {
                                currentOrganisationDataItem.norgs++;
                            }
                            this.reportDataSetsCurrent[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesCurrent += this.movementReports[i].quantity;

                            break;
                        case this.previousPeriod.toString():
                            let itemKeyPrevious: any = this.movementReports[i].bankShortName;
                            if (this.category == 'Depot') {
                                itemKeyPrevious = this.movementReports[i].lienDepot;
                            }
                            const previousOrganisationDataItem = this.previousOrganisationData.find(item => item.key === itemKeyPrevious)
                            if (!previousOrganisationDataItem) {
                                this.previousOrganisationData.push({key: itemKeyPrevious, categoryIndex: categoryOptionIndex,
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons,norgs:1});
                            }
                            else {
                                previousOrganisationDataItem.norgs++;
                            }
                            this.reportDataSetsPrevious[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod1.toString():
                            let itemKeyPrevious1: any = this.movementReports[i].bankShortName;
                            if (this.category == 'Depot') {
                                itemKeyPrevious1 = this.movementReports[i].lienDepot;
                            }
                            const previous1OrganisationDataItem = this.previous1OrganisationData.find(item => item.key === itemKeyPrevious1)
                            if (!previous1OrganisationDataItem) {
                                this.previous1OrganisationData.push({key: itemKeyPrevious1, categoryIndex: categoryOptionIndex,
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons,norgs:1});
                            }
                            else {
                                previous1OrganisationDataItem.norgs++;
                            }
                            this.reportDataSetsPrevious1[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious1 += this.movementReports[i].quantity;
                            break;

                        default:

                    }
                    this.addMovementReportToSubCategoryReportDataSets(this.movementReports[i],'month');

                }
                this.setStatisticsByOrganisation();
                this.createReportData();

            });

    }
    reportMovementsHistoryDaily() {
        this.currentPeriod = moment().format('YYYY-MM');
        this.previousPeriod = moment().subtract(1, 'months').format('YYYY-MM');
        this.previousPeriod1 = moment().subtract(2, 'months').format('YYYY-MM');
        const lowRange = `${this.previousPeriod1}\-01`;
        const highRange = `${this.currentPeriod}\-31`;
        this.movementReportHttpService.getMovementDailyReport(this.authService.accessToken, this.bankShortName,this.depotId, lowRange,highRange).subscribe(
            (response: MovementReport[]) => {
                this.movementReports = response;

                if (this.depotId) {
                    this.createCategoryOptionsForOrgs();
                }
                this.initializeChart();
                for (let i = 0; i < this.movementReports.length; i++) {
                    if ( this.movementReports[i].orgname) {
                        this.movementReports[i].orgname = this.movementReports[i].orgname.replace(/[^0-9a-z]/gi, '');
                    }
                    let categoryOptionIndex = -1;
                    if (this.category == 'Depot') {
                        categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.value === this.movementReports[i].lienDepot.toString());
                    } else {
                        categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.label === this.movementReports[i].bankShortName);
                    }
                    if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.categoryOptions.length - 1;
                    }
                    const movementDay = this.movementReports[i].day.substr(0, 7);
                    switch (movementDay) {
                        case this.currentPeriod.toString():
                            let itemKey: any = this.movementReports[i].bankShortName;
                            if (this.category == 'Depot') {
                                itemKey = this.movementReports[i].lienDepot;
                            }
                            const currentOrganisationDataItem = this.currentOrganisationData.find(item => item.key === itemKey)
                            if (!currentOrganisationDataItem) {
                                this.currentOrganisationData.push({key: itemKey, categoryIndex: categoryOptionIndex,
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons,norgs:1});
                            }
                            else {
                                currentOrganisationDataItem.norgs++;
                            }
                            this.reportDataSetsCurrent[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesCurrent += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod.toString():
                            let itemKeyPrevious: any = this.movementReports[i].bankShortName;
                            if (this.category == 'Depot') {
                                itemKeyPrevious = this.movementReports[i].lienDepot;
                            }
                            const previousOrganisationDataItem = this.previousOrganisationData.find(item => item.key === itemKeyPrevious)
                            if (!previousOrganisationDataItem) {
                                this.previousOrganisationData.push({key: itemKeyPrevious, categoryIndex: categoryOptionIndex,
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons,norgs:1});
                            }
                            else {
                                previousOrganisationDataItem.norgs++;
                            }
                            this.reportDataSetsPrevious[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious += this.movementReports[i].quantity;
                            if (this.movementReports[i].nfamilies > 0) {
                                this.totalFoodDeliveriesPreviousPerFamily += (this.movementReports[i].quantity / this.movementReports[i].nfamilies);
                            }
                            if (this.movementReports[i].npersons > 0) {
                                this.totalFoodDeliveriesPreviousPerPerson += (this.movementReports[i].quantity / this.movementReports[i].npersons);
                            }
                            break;
                        case this.previousPeriod1.toString():
                            let itemKeyPrevious1: any = this.movementReports[i].bankShortName;
                            if (this.category == 'Depot') {
                                itemKeyPrevious1 = this.movementReports[i].lienDepot;
                            }
                            const previous1OrganisationDataItem = this.previous1OrganisationData.find(item => item.key === itemKeyPrevious1)
                            if (!previous1OrganisationDataItem) {
                                this.previous1OrganisationData.push({key: itemKeyPrevious1, categoryIndex: categoryOptionIndex,
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons,norgs:1});
                            }
                            else {
                                previous1OrganisationDataItem.norgs++;
                            }
                            this.reportDataSetsPrevious1[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious1 += this.movementReports[i].quantity;

                            break;

                        default:

                    }
                    this.addMovementReportToSubCategoryReportDataSets(this.movementReports[i],'day');

                }
                this.setStatisticsByOrganisation();
                this.createReportData();

            });

    }
    setStatisticsByOrganisation()  {
        this.totalFoodDeliveryFamiliesCurrent = 0;
        this.totalFoodDeliveryPersonsCurrent = 0;
        this.totalFoodDeliveryFamiliesPrevious = 0;
        this.totalFoodDeliveryPersonsPrevious = 0;
        this.totalFoodDeliveryFamiliesPrevious1 = 0;
        this.totalFoodDeliveryPersonsPrevious1 = 0;
        this.totalFoodDeliveriesCurrentOrganisations = 0;
        this.totalFoodDeliveriesPreviousOrganisations = 0;
        this.totalFoodDeliveriesPrevious1Organisations= 0;
        this.currentOrganisationData.forEach(item => {
            this.totalFoodDeliveryFamiliesCurrent += item.nfamilies;
            this.totalFoodDeliveryPersonsCurrent += item.npersons;
            this.totalFoodDeliveriesCurrentOrganisations += item.norgs;
        });
        this.previousOrganisationData.forEach(item => {
            this.totalFoodDeliveryFamiliesPrevious += item.nfamilies;
            this.totalFoodDeliveryPersonsPrevious += item.npersons;
            this.totalFoodDeliveriesPreviousOrganisations += item.norgs;
        });
        this.previous1OrganisationData.forEach(item => {
            this.totalFoodDeliveryFamiliesPrevious1 += item.nfamilies;
            this.totalFoodDeliveryPersonsPrevious1 += item.npersons;
            this.totalFoodDeliveriesPrevious1Organisations += item.norgs
        });
        if (this.totalFoodDeliveryFamiliesCurrent >0) {
            this.totalFoodDeliveriesCurrentPerFamily =
                this.totalFoodDeliveriesCurrent / this.totalFoodDeliveryFamiliesCurrent;
        }
        if (this.totalFoodDeliveryFamiliesPrevious >0) {
            this.totalFoodDeliveriesPreviousPerFamily =
                this.totalFoodDeliveriesPrevious / this.totalFoodDeliveryFamiliesPrevious;
        }
        if (this.totalFoodDeliveryFamiliesPrevious1 >0) {
            this.totalFoodDeliveriesPrevious1PerFamily =
                this.totalFoodDeliveriesPrevious1 / this.totalFoodDeliveryFamiliesPrevious1;
        }
        if (this.totalFoodDeliveryPersonsCurrent >0) {
            this.totalFoodDeliveriesCurrentPerPerson =
                this.totalFoodDeliveriesCurrent / this.totalFoodDeliveryPersonsCurrent;
        }
        if (this.totalFoodDeliveryPersonsPrevious >0) {
            this.totalFoodDeliveriesPreviousPerPerson =
                this.totalFoodDeliveriesPrevious / this.totalFoodDeliveryPersonsPrevious;
        }
        if (this.totalFoodDeliveryPersonsPrevious1 >0) {
            this.totalFoodDeliveriesPrevious1PerPerson =
                this.totalFoodDeliveriesPrevious1 / this.totalFoodDeliveryPersonsPrevious1;
        }
    }
    addMovementReportToSubCategoryReportDataSets(movementReport,period:string) {
            let key = String(movementReport.month);
            if (period === 'day') {
                key = movementReport.day;
            }

            if (!this.reportLabels.includes(key)) {
                this.reportLabels.push(key);
                for (let i = 0; i < this.categoryOptionsNonFEAD.length; i++) {
                    this.reportDataSetsNonFEAD[i].data.push(0);
                }
                for (let i = 0; i < this.categoryOptionsFEADNonAgreed.length; i++) {
                    this.reportDataSetsFEADnonAgreed[i].data.push(0);
                }
                for (let i = 0; i < this.categoryOptionsFEADAgreedCollect.length; i++) {
                    this.reportDataSetsFEADAgreedCollect[i].data.push(0);
                }
            }
            const dataIndex = this.reportLabels.length -1;
            let categoryOptionIndex =0;
            switch (movementReport.category) {
                case 'NOFEADNONAGREED':
                    if (this.category == 'Depot') {
                        categoryOptionIndex = this.categoryOptionsNonFEAD.findIndex(obj => obj.value === movementReport.lienDepot.toString());
                    }
                    else {
                        categoryOptionIndex = this.categoryOptionsNonFEAD.findIndex(obj => obj.label === movementReport.bankShortName);
                    }
                    if (categoryOptionIndex  === -1) {
                        categoryOptionIndex = this.categoryOptionsNonFEAD.length -1;
                    }
                    this.reportDataSetsNonFEAD[categoryOptionIndex].data[dataIndex] += movementReport.quantity;
                    this.totalFoodDeliveriesNonFEAD += movementReport.quantity;
                    break;
                case 'FEADNONAGREED':
                    if (this.category == 'Depot') {
                        categoryOptionIndex = this.categoryOptionsFEADNonAgreed.findIndex(obj => obj.value === movementReport.lienDepot.toString());
                    }
                    else {
                        categoryOptionIndex = this.categoryOptionsFEADNonAgreed.findIndex(obj => obj.label === movementReport.bankShortName);
                    }
                    if (categoryOptionIndex  === -1) {
                        categoryOptionIndex = this.categoryOptionsFEADNonAgreed.length -1;
                    }
                    this.reportDataSetsFEADnonAgreed[categoryOptionIndex].data[dataIndex] += movementReport.quantity;
                    this.totalFoodDeliveriesFEADNonAgreed += movementReport.quantity;
                    break;
                case 'AGREEDFEADCOLLECT':
                    if (this.category == 'Depot') {
                        categoryOptionIndex = this.categoryOptionsFEADAgreedCollect.findIndex(obj => obj.value === movementReport.lienDepot.toString());
                    }
                    else {
                        categoryOptionIndex = this.categoryOptionsFEADAgreedCollect.findIndex(obj => obj.label === movementReport.bankShortName);
                    }
                   if (categoryOptionIndex  === -1) {
                       categoryOptionIndex = this.categoryOptionsFEADAgreedCollect.length -1;
                   }
                    this.reportDataSetsFEADAgreedCollect[categoryOptionIndex].data[dataIndex] += movementReport.quantity;
                    this.totalFoodDeliveriesFEADAgreedCollect += movementReport.quantity;
                    break;
                default:
                    console.log('Unknown movement category: ' + movementReport.category);
            }

    }


    initializeChart() {
        this.totalFoodDeliveriesNonFEAD = 0;
        this.totalFoodDeliveriesFEADNonAgreed = 0;
        this.totalFoodDeliveriesFEADAgreedCollect = 0;
        this.totalFoodDeliveriesCurrent = 0;
        this.totalFoodDeliveriesPrevious = 0;
        this.totalFoodDeliveriesPrevious1 = 0;
        this.totalFoodDeliveriesCurrentPerFamily = 0;
        this.totalFoodDeliveriesCurrentPerPerson = 0;
        this.totalFoodDeliveriesPreviousPerFamily = 0;
        this.totalFoodDeliveriesPreviousPerPerson = 0;
        this.totalFoodDeliveriesPrevious1PerFamily = 0;
        this.totalFoodDeliveriesPrevious1PerPerson = 0;

        this.reportLabels = [];
        this.reportDataSetsNonFEAD = [];
        this.reportDataSetsFEADnonAgreed = [];
        this.reportDataSetsFEADAgreedCollect = [];
        this.reportDataSetsCurrent = [
            {
                data: [],
                backgroundColor: this.backgroundColors,
            }
        ];
        this.reportDataSetsPrevious = [
            {
                data: [],
                backgroundColor: this.backgroundColors,
            }
        ];
        this.reportDataSetsPrevious1 = [
            {
                data: [],
                backgroundColor: this.backgroundColors,
            }
        ];
        this.reportDataSetsPrevious2 = [
            {
                data: [],
                backgroundColor: this.backgroundColors,
            }
        ];
        for (let i = 0; i < this.categoryOptions.length; i++) {
            this.reportDataSetsCurrent[0].data.push(0);
            this.reportDataSetsPrevious[0].data.push(0);
            this.reportDataSetsPrevious1[0].data.push(0);
            this.reportDataSetsPrevious2[0].data.push(0);
        }
        let colorIndex = 0;
        this.categoryOptionsNonFEAD.forEach((categoryOption) => {
            this.reportDataSetsNonFEAD.push(
                {
                    type: 'bar',
                    label: categoryOption.label,
                    backgroundColor: this.backgroundColors[colorIndex],
                    data: []
                });
            colorIndex++;
            if (colorIndex >= this.backgroundColors.length) {
                console.log('Not enough colors in backgroundColors array');
                colorIndex = 0;
            }
        })
        colorIndex =0;
        this.categoryOptionsFEADNonAgreed.forEach((categoryOption) => {
            this.reportDataSetsFEADnonAgreed.push(
                {
                    type: 'bar',
                    label: categoryOption.label,
                    backgroundColor: this.backgroundColors[colorIndex],
                    data: []
                });
            colorIndex++;
            if (colorIndex >= this.backgroundColors.length) {
                console.log('Not enough colors in backgroundColors array');
                colorIndex = 0;
            }
        })
        colorIndex =0;
        this.categoryOptionsFEADAgreedCollect.forEach((categoryOption) => {

            this.reportDataSetsFEADAgreedCollect.push(
                {
                    type: 'bar',
                    label: categoryOption.label,
                    backgroundColor: this.backgroundColors[colorIndex],
                    data: []
                });
            colorIndex++;
            if (colorIndex >= this.backgroundColors.length) {
                console.log('Not enough colors in backgroundColors array');
                colorIndex = 0;
            }
        })


    }

    createReportData() {
        this.titleFoodDeliveriesNonFEADEvolution = $localize`:@@StatFoodDeliveriesNonFEADHistory:Food Delivered to Non FEAD Orgs(kg)`;
        this.chartDataFoodDeliveriesNonFEADHistory = {
            labels: this.reportLabels,
            datasets: this.reportDataSetsNonFEAD
        }
        this.titleFoodDeliveriesFEADNonAgreedEvolution = $localize`:@@StatFoodDeliveriesFEADNonAgreedHistory:FEAD Food Delivered to Non Agreed Orgs(kg)`;
        this.chartDataFoodDeliveriesFEADNonAgreedHistory = {
            labels: this.reportLabels,
            datasets: this.reportDataSetsFEADnonAgreed
        }

        this.titleFoodDeliveriesFEADAgreedCollectEvolution = $localize`:@@StatFoodDeliveriesFEADAgreedCollectHistory:FEAD + Collect Food Delivered to Agreed Orgs(kg)`;
        this.chartDataFoodDeliveriesFEADAgreedCollectHistory = {
            labels: this.reportLabels,
            datasets: this.reportDataSetsFEADAgreedCollect
        }

        const mthPercentage = this.totalFoodDeliveriesPrevious > 0 ? ((this.totalFoodDeliveriesCurrent  * 100) / this.totalFoodDeliveriesPrevious  ).toFixed(2) : 0;

        this.titleFoodDeliveriesCurrent = $localize`:@@StatFoodDeliveriesCurrent:Food Delivered in ${this.currentPeriod}(kg) ${mthPercentage}% of ${this.previousPeriod}`;
        this.chartDataFoodDeliveriesCurrent = {
            labels: this.categoryOptions.map(({label}) => label),
            datasets: this.reportDataSetsCurrent
        }
        const growthPercentage = this.totalFoodDeliveriesPrevious1 > 0 ? (((this.totalFoodDeliveriesPrevious - this.totalFoodDeliveriesPrevious1) * 100 )/ this.totalFoodDeliveriesPrevious1).toFixed(2) : 0;

        this.titleFoodDeliveriesPrevious = $localize`:@@StatFoodDeliveriesPrevious:Food Delivered in ${this.previousPeriod}(kg) ${growthPercentage}% growth vs ${this.previousPeriod1}`;
        this.chartDataFoodDeliveriesPrevious = {
            labels: this.categoryOptions.map(({label}) => label),
            datasets: this.reportDataSetsPrevious
        }
        this.titleFoodDeliveriesPrevious1 = $localize`:@@StatFoodDeliveriesPrevious1:Food Delivered in ${this.previousPeriod1}(kg)`;
        this.chartDataFoodDeliveriesPrevious1 = {
            labels: this.categoryOptions.map(({label}) => label),
            datasets: this.reportDataSetsPrevious1
        }
        this.titleFoodDeliveriesPrevious2 = $localize`:@@StatFoodDeliveriesPrevious2:Food Delivered in ${this.previousPeriod2}(kg)`;
        this.chartDataFoodDeliveriesPrevious2 = {
            labels: this.categoryOptions.map(({label}) => label),
            datasets: this.reportDataSetsPrevious2
        }
    }

    getTotalFoodDeliveriesPrevious() {
        return $localize`:@@StatFoodDeliveriesPreviousTotal:Total: ${Math.round(this.totalFoodDeliveriesPrevious)} kg`;
       // todo later return $localize`:@@StatFoodDeliveriesPreviousTotal:Total: ${Math.round(this.totalFoodDeliveriesPrevious)} kg( ${this.totalFoodDeliveriesPreviousPerFamily.toFixed(2)} kg per family. ${this.totalFoodDeliveriesPreviousPerPerson.toFixed(2)} kg per person.)`;
    }

    getTotalFoodDeliveriesPrevious1() {
        return $localize`:@@StatFoodDeliveriesPrevious1Total:Total: ${Math.round(this.totalFoodDeliveriesPrevious1)} kg`;
    }

    getTotalFoodDeliveriesCurrent() {
        return $localize`:@@StatFoodDeliveriesCurrentTotal:Total: ${Math.round(this.totalFoodDeliveriesCurrent)} kg`;
    }

    getTotalFoodDeliveriesNonFEAD() {
        return $localize`:@@StatFoodDeliveriesNonFEADTotal:Total: ${this.totalFoodDeliveriesNonFEAD} kg`;
    }

    getTotalFoodDeliveriesFEADNonAgreed() {
        return $localize`:@@StatFoodDeliveriesFEADNonAgreedTotal:Total: ${this.totalFoodDeliveriesFEADNonAgreed} kg`;
    }

    getTotalFoodDeliveriesFEADAgreedCollect() {
        return $localize`:@@StatFoodDeliveriesFEADAgreedCollectTotal:Total: ${this.totalFoodDeliveriesFEADAgreedCollect} kg`;
    }

    exportAsXLSX(scope: string) {

        this.exportListMovementsMonthly =[];
        this.exportListMovementsDaily=[];

        if (scope === 'month') {
        this.movementReportHttpService.getMovementMonthlyReport(this.authService.accessToken, this.bankShortName).subscribe(
            (response: MovementReport[]) => {
                const movementReports = response;
                for (let movementReport of movementReports) {
                    const exportListMonthly = new ExportMovementMonthlyReport();
                    exportListMonthly.month = String(movementReport.month);
                    exportListMonthly.bank = movementReport.bankShortName;
                    exportListMonthly.category = movementReport.category;
                    exportListMonthly.quantity = movementReport.quantity.toFixed(0);
                    this.exportListMovementsMonthly.push(exportListMonthly);
                }
                this.excelService.exportAsExcelFile(this.exportListMovementsMonthly, 'foodit.movementStatistics.month.' + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');

            });
        } else {
            this.movementReportHttpService.getMovementDailyReport(this.authService.accessToken, this.bankShortName).subscribe(
                (response: MovementReport[]) => {
                    const movementReports = response;
                    for (let movementReport of movementReports) {
                        let exportListDaily = new ExportMovementDailyReport();
                        exportListDaily.day = movementReport.day;
                        exportListDaily.bank = movementReport.bankShortName;
                        exportListDaily.idOrg = movementReport.idOrg;
                        exportListDaily.orgname = movementReport.orgname;
                        exportListDaily.category = movementReport.category;
                        exportListDaily.quantity = movementReport.quantity.toFixed(0);
                        this.exportListMovementsDaily.push(exportListDaily);
                    }
                    this.excelService.exportAsExcelFile(this.exportListMovementsDaily, 'foodit.movementStatistics.day.' + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
                });
        }
    }



}