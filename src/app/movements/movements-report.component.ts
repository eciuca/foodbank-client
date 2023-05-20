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
    orgOptions: any[];
    orgOptionsNonFEAD: any[];
    orgOptionsFEADNonAgreed: any[];
    orgOptionsFEADAgreedCollect: any[];
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
    previousOrganisationData :{idOrg: any,nfamilies: number,npersons: number}[] = [];
    currentOrganisationData :{idOrg: any, nfamilies: number,npersons: number}[] = [];
    previous1OrganisationData :{idOrg: any, nfamilies: number,npersons: number}[] = [];
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
    createCategoryOptionsForOrgs()  {
          this.orgOptionsFEADAgreedCollect = [];
          this.orgOptionsNonFEAD = [];
          this.orgOptionsFEADNonAgreed = [];
          this.orgOptions = [];
           this.movementReports.forEach(movementReport => {
               const index = this.orgOptions.findIndex(item => item.value === movementReport.idOrg.toString());
               if  (index === -1) {
                    if (this.orgOptions.length < 9) {
                        this.orgOptions.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                    }
                    else if (this.orgOptions.length == 9) {
                     this.orgOptions.push({value: null,label: 'OTHER'});
                    }
               }
               switch (movementReport.category) {
                   case 'NOFEADNONAGREED':

                       const index1 = this.orgOptionsNonFEAD.findIndex(item => item.value === movementReport.idOrg.toString());
                       if  (index1 === -1) {
                           if (this.orgOptionsNonFEAD.length < 9) {
                               this.orgOptionsNonFEAD.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                           }
                           else if (this.orgOptionsNonFEAD.length == 9) {
                               this.orgOptionsNonFEAD.push({value: null,label: 'OTHER'});
                           }
                       }
                       break;
                   case 'FEADNONAGREED':
                       const index2 = this.orgOptionsFEADNonAgreed.findIndex(item => item.value === movementReport.idOrg.toString());
                       if  (index2 === -1) {
                           if (this.orgOptionsFEADNonAgreed.length < 9) {
                               this.orgOptionsFEADNonAgreed.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                           }
                           else if (this.orgOptionsFEADNonAgreed.length == 9) {
                               this.orgOptionsFEADNonAgreed.push({value: null,label: 'OTHER'});
                           }
                       }
                       break;
                   case 'AGREEDFEADCOLLECT':
                       const index3 = this.orgOptionsFEADAgreedCollect.findIndex(item => item.value === movementReport.idOrg.toString());
                       if  (index3 === -1) {
                           if (this.orgOptionsFEADAgreedCollect.length < 9) {
                               this.orgOptionsFEADAgreedCollect.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                           }
                           else if (this.orgOptionsFEADAgreedCollect.length == 9) {
                               this.orgOptionsFEADAgreedCollect.push({value: null,label: 'OTHER'});
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
                    if (this.depotId) {
                        categoryOptionIndex = this.orgOptions.findIndex(obj => obj.value === this.movementReports[i].idOrg.toString());
                        if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.orgOptions.length - 1;
                        }
                    }
                    else {
                        if (this.category == 'Depot') {
                            categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.value === this.movementReports[i].lienDepot.toString());
                        } else {
                            categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.label === this.movementReports[i].bankShortName);
                        }
                    }
                    if (categoryOptionIndex === -1) {
                         categoryOptionIndex = this.categoryOptions.length - 1;
                    }
                    const movementYear = String(this.movementReports[i].month).substring(0, 4);
                    if (movementYear < this.previousPeriod2) continue;
                    switch (movementYear) {
                        case this.currentPeriod.toString():                           
                            const currentOrganisationDataItem = this.currentOrganisationData.find(item => item.idOrg === this.movementReports[i].idOrg)
                            if (!currentOrganisationDataItem) {
                                this.currentOrganisationData.push({idOrg: this.movementReports[i].idOrg, 
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons});
                            }
                            this.reportDataSetsCurrent[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesCurrent += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod.toString():                           
                            const previousOrganisationDataItem = this.previousOrganisationData.find(item => item.idOrg === this.movementReports[i].idOrg)
                            if (!previousOrganisationDataItem) {
                                this.previousOrganisationData.push({idOrg: this.movementReports[i].idOrg, 
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons});
                            }
                            this.reportDataSetsPrevious[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod1.toString():                           
                            const previous1OrganisationDataItem = this.previous1OrganisationData.find(item => item.idOrg === this.movementReports[i].idOrg)
                            if (!previous1OrganisationDataItem) {
                                this.previous1OrganisationData.push({idOrg: this.movementReports[i].idOrg,
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons});
                            }
                            this.reportDataSetsPrevious1[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious1 += this.movementReports[i].quantity;
                            break;

                        default:

                    }
                    this.addMovementReportToSubCategoryReportDataSets(this.movementReports[i],'month');

                }
                console.log( 'Previous1 report data',this.reportDataSetsPrevious1);
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
                    if (this.depotId) {
                        categoryOptionIndex = this.orgOptions.findIndex(obj => obj.value === this.movementReports[i].idOrg.toString());
                        if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.orgOptions.length - 1;
                        }
                    }
                    else {
                        if (this.category == 'Depot') {
                            categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.value === this.movementReports[i].lienDepot.toString());
                        } else {
                            categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.label === this.movementReports[i].bankShortName);
                        }
                        if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.categoryOptions.length - 1;
                        }
                    }
                    const movementDay = this.movementReports[i].day.substr(0, 7);
                    switch (movementDay) {
                        case this.currentPeriod.toString():
                          
                            const currentOrganisationDataItem = this.currentOrganisationData.find(item => item.idOrg === this.movementReports[i].idOrg)
                            if (!currentOrganisationDataItem) {
                                this.currentOrganisationData.push({idOrg: this.movementReports[i].idOrg, 
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons});
                            }
                            this.reportDataSetsCurrent[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesCurrent += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod.toString():
                          
                            const previousOrganisationDataItem = this.previousOrganisationData.find(item => item.idOrg === this.movementReports[i].idOrg)
                            if (!previousOrganisationDataItem) {
                                this.previousOrganisationData.push({idOrg: this.movementReports[i].idOrg,
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons});
                            }
                            this.reportDataSetsPrevious[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious += this.movementReports[i].quantity;                          
                            break;
                        case this.previousPeriod1.toString():
                           
                            const previous1OrganisationDataItem = this.previous1OrganisationData.find(item => item.idOrg === this.movementReports[i].idOrg)
                            if (!previous1OrganisationDataItem) {
                                this.previous1OrganisationData.push({idOrg: this.movementReports[i].idOrg, 
                                    nfamilies:this.movementReports[i].nfamilies, npersons : this.movementReports[i].npersons});
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
        });
        this.totalFoodDeliveriesCurrentOrganisations = this.currentOrganisationData.length;
        this.previousOrganisationData.forEach(item => {
            this.totalFoodDeliveryFamiliesPrevious += item.nfamilies;
            this.totalFoodDeliveryPersonsPrevious += item.npersons;
        });
        this.totalFoodDeliveriesPreviousOrganisations = this.previousOrganisationData.length;
        this.previous1OrganisationData.forEach(item => {
            this.totalFoodDeliveryFamiliesPrevious1 += item.nfamilies;
            this.totalFoodDeliveryPersonsPrevious1 += item.npersons;
        });
        this.totalFoodDeliveriesPrevious1Organisations = this.previous1OrganisationData.length;
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
                if (this.depotId) {
                    for (let i = 0; i < this.orgOptionsNonFEAD.length; i++) {
                        this.reportDataSetsNonFEAD[i].data.push(0);
                    }
                    for (let i = 0; i < this.orgOptionsFEADNonAgreed.length; i++) {
                        this.reportDataSetsFEADnonAgreed[i].data.push(0);
                    }
                    for (let i = 0; i < this.orgOptionsFEADAgreedCollect.length; i++) {
                        this.reportDataSetsFEADAgreedCollect[i].data.push(0);
                    }
                }
                else {
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
            }
            const dataIndex = this.reportLabels.length -1;
            let categoryOptionIndex =0;
            switch (movementReport.category) {
                case 'NOFEADNONAGREED':
                    if (this.depotId) {
                        categoryOptionIndex = this.orgOptionsNonFEAD.findIndex(obj => obj.value === movementReport.idOrg.toString());
                        if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.orgOptionsNonFEAD.length - 1;
                        }
                    }
                    else {
                        if (this.category == 'Depot') {
                            categoryOptionIndex = this.categoryOptionsNonFEAD.findIndex(obj => obj.value === movementReport.lienDepot.toString());
                        } else {
                            categoryOptionIndex = this.categoryOptionsNonFEAD.findIndex(obj => obj.label === movementReport.bankShortName);
                        }
                        if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.categoryOptionsNonFEAD.length - 1;
                        }
                    }
                    this.reportDataSetsNonFEAD[categoryOptionIndex].data[dataIndex] += movementReport.quantity;
                    this.totalFoodDeliveriesNonFEAD += movementReport.quantity;
                    break;
                case 'FEADNONAGREED':
                    if (this.depotId) {
                        categoryOptionIndex = this.orgOptionsFEADNonAgreed.findIndex(obj => obj.value === movementReport.idOrg.toString());
                        if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.orgOptionsFEADNonAgreed.length - 1;
                        }
                    }
                    else {
                        if (this.category == 'Depot') {
                            categoryOptionIndex = this.categoryOptionsFEADNonAgreed.findIndex(obj => obj.value === movementReport.lienDepot.toString());
                        } else {
                            categoryOptionIndex = this.categoryOptionsFEADNonAgreed.findIndex(obj => obj.label === movementReport.bankShortName);
                        }
                        if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.categoryOptionsFEADNonAgreed.length - 1;
                        }
                    }
                    this.reportDataSetsFEADnonAgreed[categoryOptionIndex].data[dataIndex] += movementReport.quantity;
                    this.totalFoodDeliveriesFEADNonAgreed += movementReport.quantity;
                    break;
                case 'AGREEDFEADCOLLECT':
                    if (this.depotId) {
                        categoryOptionIndex = this.orgOptionsFEADAgreedCollect.findIndex(obj => obj.value === movementReport.idOrg.toString());
                        if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.orgOptionsFEADAgreedCollect.length - 1;
                        }
                    }
                    else {
                        if (this.category == 'Depot') {
                            categoryOptionIndex = this.categoryOptionsFEADAgreedCollect.findIndex(obj => obj.value === movementReport.lienDepot.toString());
                        } else {
                            categoryOptionIndex = this.categoryOptionsFEADAgreedCollect.findIndex(obj => obj.label === movementReport.bankShortName);
                        }
                        if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.categoryOptionsFEADAgreedCollect.length - 1;
                        }
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

        let colorIndex = 0;
        if (this.depotId) {
            for (let i = 0; i < this.orgOptions.length; i++) {
                this.reportDataSetsCurrent[0].data.push(0);
                this.reportDataSetsPrevious[0].data.push(0);
                this.reportDataSetsPrevious1[0].data.push(0);
                this.reportDataSetsPrevious2[0].data.push(0);
            }
            this.orgOptionsNonFEAD.forEach((orgOption) => {
                this.reportDataSetsNonFEAD.push(
                    {
                        type: 'bar',
                        label: orgOption.label,
                        backgroundColor: this.backgroundColors[colorIndex],
                        data: []
                    });
                colorIndex++;
                if (colorIndex >= this.backgroundColors.length) {
                    console.log('Not enough colors in backgroundColors array');
                    colorIndex = 0;
                }
            })
            colorIndex = 0;
            this.orgOptionsFEADNonAgreed.forEach((orgOption) => {
                this.reportDataSetsFEADnonAgreed.push(
                    {
                        type: 'bar',
                        label: orgOption.label,
                        backgroundColor: this.backgroundColors[colorIndex],
                        data: []
                    });
                colorIndex++;
                if (colorIndex >= this.backgroundColors.length) {
                    console.log('Not enough colors in backgroundColors array');
                    colorIndex = 0;
                }
            })
            colorIndex = 0;
            this.orgOptionsFEADAgreedCollect.forEach((orgOption) => {

                this.reportDataSetsFEADAgreedCollect.push(
                    {
                        type: 'bar',
                        label: orgOption.label,
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
        else {
            for (let i = 0; i < this.categoryOptions.length; i++) {
                this.reportDataSetsCurrent[0].data.push(0);
                this.reportDataSetsPrevious[0].data.push(0);
                this.reportDataSetsPrevious1[0].data.push(0);
                this.reportDataSetsPrevious2[0].data.push(0);
            }
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
            colorIndex = 0;
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
            colorIndex = 0;
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
        let labels = this.categoryOptions.map(({label}) => label);
        if (this.depotId) {
            labels = this.orgOptions.map(({label}) => label);
        }
        this.titleFoodDeliveriesCurrent = $localize`:@@StatFoodDeliveriesCurrent:Food Delivered in ${this.currentPeriod}(kg) ${mthPercentage}% of ${this.previousPeriod}`;
        this.chartDataFoodDeliveriesCurrent = {
            labels: labels,
            datasets: this.reportDataSetsCurrent
        }
        const growthPercentage = this.totalFoodDeliveriesPrevious1 > 0 ? (((this.totalFoodDeliveriesPrevious - this.totalFoodDeliveriesPrevious1) * 100 )/ this.totalFoodDeliveriesPrevious1).toFixed(2) : 0;

        this.titleFoodDeliveriesPrevious = $localize`:@@StatFoodDeliveriesPrevious:Food Delivered in ${this.previousPeriod}(kg) ${growthPercentage}% growth vs ${this.previousPeriod1}`;
        this.chartDataFoodDeliveriesPrevious = {
            labels: labels,
            datasets: this.reportDataSetsPrevious
        }
        this.titleFoodDeliveriesPrevious1 = $localize`:@@StatFoodDeliveriesPrevious1:Food Delivered in ${this.previousPeriod1}(kg)`;
        this.chartDataFoodDeliveriesPrevious1 = {
            labels: labels,
            datasets: this.reportDataSetsPrevious1
        }
        this.titleFoodDeliveriesPrevious2 = $localize`:@@StatFoodDeliveriesPrevious2:Food Delivered in ${this.previousPeriod2}(kg)`;
        this.chartDataFoodDeliveriesPrevious2 = {
            labels: labels,
            datasets: this.reportDataSetsPrevious2
        }
    }

    getTotalFoodDeliveriesPrevious() {
        return $localize`:@@StatFoodDeliveriesPreviousTotal:Total: ${Math.round(this.totalFoodDeliveriesPrevious)} kg for ${this.totalFoodDeliveriesPreviousOrganisations} organisations serving ${this.totalFoodDeliveryFamiliesPrevious} families - ${this.totalFoodDeliveryPersonsPrevious} persons`;
    }
    getTotalFoodDeliveriesPreviousPerFamily() {
      return $localize`:@@StatFoodDeliveriesPreviousTotalPerFamily:${this.totalFoodDeliveriesPreviousPerFamily.toFixed(2)} kg per family. ${this.totalFoodDeliveriesPreviousPerPerson.toFixed(2)} kg per person.`;
    }

    getTotalFoodDeliveriesPrevious1() {
        return $localize`:@@StatFoodDeliveriesPrevious1Total:Total: ${Math.round(this.totalFoodDeliveriesPrevious1)} kg for ${this.totalFoodDeliveriesPrevious1Organisations} organisations serving ${this.totalFoodDeliveryFamiliesPrevious1} families - ${this.totalFoodDeliveryPersonsPrevious1} persons`;
    }
    getTotalFoodDeliveriesPrevious1PerFamily() {
        return $localize`:@@StatFoodDeliveriesPrevious1TotalPerFamily:${this.totalFoodDeliveriesPrevious1PerFamily.toFixed(2)} kg per family. ${this.totalFoodDeliveriesPrevious1PerPerson.toFixed(2)} kg per person.`;
    }
    getTotalFoodDeliveriesCurrent() {
        return $localize`:@@StatFoodDeliveriesCurrentTotal:Total: ${Math.round(this.totalFoodDeliveriesCurrent)} kg for ${this.totalFoodDeliveriesCurrentOrganisations} organisations serving ${this.totalFoodDeliveryFamiliesCurrent} families - ${this.totalFoodDeliveryPersonsCurrent} persons`;
    }
    getTotalFoodDeliveriesCurrentPerFamily() {
        return $localize`:@@StatFoodDeliveriesCurrentTotalPerFamily:${this.totalFoodDeliveriesCurrentPerFamily.toFixed(2)} kg per family. ${this.totalFoodDeliveriesCurrentPerPerson.toFixed(2)} kg per person.`;
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