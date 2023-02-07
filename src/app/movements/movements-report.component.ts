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
    totalFoodDeliveriesPrevious2: number;
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
                    this.category = 'Bank'

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
        console.log('new depot id:', this.depotId);
        if (this.depotId) {
           this.categoryOptions =[];
        }
        else {
            this.categoryOptions =[...this.depotOptions];
            this.categoryOptions.pop();
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
            this.categoryOptions.pop();
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
               if (this.categoryOptions.length < 9) {
                   this.categoryOptions.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
               } else if (this.categoryOptions.length == 9) {
                   this.categoryOptions.push({value: null,label: 'OTHER'});
               }
               switch (movementReport.category) {
                   case 'NOFEADNONAGREED':
                       if (this.categoryOptionsNonFEAD.length < 9) {
                           this.categoryOptionsNonFEAD.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                       } else if (this.categoryOptionsNonFEAD.length == 9) {
                           this.categoryOptionsNonFEAD.push({value: null,label: 'OTHER'});
                       }
                       break;
                   case 'FEADNONAGREED':
                       if (this.categoryOptionsFEADNonAgreed.length < 9) {
                           this.categoryOptionsFEADNonAgreed.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                       } else if (this.categoryOptionsFEADNonAgreed.length == 9) {
                           this.categoryOptionsFEADNonAgreed.push({value: null,label: 'OTHER'});
                       }
                       break;
                   case 'AGREEDFEADCOLLECT':
                       if (this.categoryOptionsFEADAgreedCollect.length < 9) {
                           this.categoryOptionsFEADAgreedCollect.push({value: movementReport.idOrg.toString(), label: movementReport.orgname.replace(/[^0-9a-z]/gi , '')});
                       } else if (this.categoryOptionsFEADAgreedCollect.length == 9) {
                           this.categoryOptionsFEADAgreedCollect.push({value: null,label: 'OTHER'});
                       }
                       break;
                   default:
                       console.log('Unknown movement category: ' + movementReport.category);
               }
           });
     }
    reportMovementsHistoryMonthly() {


        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken, "monthly", this.category,this.bankShortName,this.depotId).subscribe(
            (response: MovementReport[]) => {
                this.movementReports = response;

                this.currentPeriod = new Date().getFullYear();
                this.previousPeriod = this.currentPeriod - 1;
                this.previousPeriod1 = this.currentPeriod - 2;
                if (this.depotId) {
                    this.createCategoryOptionsForOrgs();
                }
                this.initializeChart();
                console.log('category', this.category,'category options', this.categoryOptions);
                for (let i = 0; i < this.movementReports.length; i++) {
                    if ( this.movementReports[i].orgname) {
                        this.movementReports[i].orgname = this.movementReports[i].orgname.replace(/[^0-9a-z]/gi, '');
                    }
                    let categoryOptionIndex = -1;
                    if (this.category == 'Depot') {
                        categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.value === this.movementReports[i].idOrg.toString());
                    }
                    else {
                         categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.label === this.movementReports[i].bankShortName);
                    }
                    if (categoryOptionIndex === -1) {
                         categoryOptionIndex = this.categoryOptions.length - 1;
                         console.log('cannot find category option', this.movementReports[i]);
                    }
                    const movementYear = this.movementReports[i].key.substr(0, 4);
                    if (movementYear < this.previousPeriod2) continue;
                    switch (movementYear) {
                        case this.currentPeriod.toString():
                            this.reportDataSetsCurrent[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesCurrent += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod.toString():
                            this.reportDataSetsPrevious[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod1.toString():
                            this.reportDataSetsPrevious1[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious1 += this.movementReports[i].quantity;
                            break;

                        default:

                    }
                    this.addMovementReportToSubCategoryReportDataSets(this.movementReports[i]);

                }
                this.createReportData();

            });

    }
    reportMovementsHistoryDaily() {

        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken, "daily", this.category,this.bankShortName,this.depotId).subscribe(
            (response: MovementReport[]) => {
                this.movementReports = response;
                this.currentPeriod = moment().format('YYYY-MM');
                this.previousPeriod = moment().subtract(1, 'months').format('YYYY-MM');
                this.previousPeriod1 = moment().subtract(2, 'months').format('YYYY-MM');
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
                        categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.value === this.movementReports[i].idOrg.toString());
                    } else {
                        categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.label === this.movementReports[i].bankShortName);
                    }
                    if (categoryOptionIndex === -1) {
                            categoryOptionIndex = this.categoryOptions.length - 1;
                    }
                    const movementDay = this.movementReports[i].key.substr(0, 7);
                    switch (movementDay) {
                        case this.currentPeriod.toString():
                            this.reportDataSetsCurrent[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesCurrent += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod.toString():
                            this.reportDataSetsPrevious[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod1.toString():
                            this.reportDataSetsPrevious1[0].data[categoryOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious1 += this.movementReports[i].quantity;
                            break;

                        default:

                    }
                    this.addMovementReportToSubCategoryReportDataSets(this.movementReports[i]);

                }
                this.createReportData();

            });

    }
    addMovementReportToSubCategoryReportDataSets(movementReport) {

            if (!this.reportLabels.includes(movementReport.key)) {
                this.reportLabels.push(movementReport.key);
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
                        categoryOptionIndex = this.categoryOptionsNonFEAD.findIndex(obj => obj.value === movementReport.idOrg.toString());
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
                        categoryOptionIndex = this.categoryOptionsFEADNonAgreed.findIndex(obj => obj.value === movementReport.idOrg.toString());
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
                        categoryOptionIndex = this.categoryOptionsFEADAgreedCollect.findIndex(obj => obj.value === movementReport.idOrg.toString());
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
        this.totalFoodDeliveriesPrevious2 = 0;
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
        console.log('previous report dataset',this.reportDataSetsPrevious);
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
        console.log('chart data previous', this.chartDataFoodDeliveriesPrevious);
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
    }

    getTotalFoodDeliveriesPrevious1() {
        return $localize`:@@StatFoodDeliveriesPrevious1Total:Total: ${Math.round(this.totalFoodDeliveriesPrevious1)} kg`;
    }

    getTotalFoodDeliveriesPrevious2() {
        return $localize`:@@StatFoodDeliveriesPrevious2Total:Total: ${Math.round(this.totalFoodDeliveriesPrevious2)} kg`;
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

       // title gets added in the export service
      /*  if (scope === 'month') {
            const exportListMonthlyHeader =new ExportMovementMonthlyReport();
            exportListMonthlyHeader.month = $localize`:@@Month:Month`;
            exportListMonthlyHeader.bank = $localize`:@@Bank:Bank`;
            exportListMonthlyHeader.category = $localize`:@@Category:Category`;
            exportListMonthlyHeader.quantity = $localize`:@@Quantity:Quantity(kg)`
            exportListMovementsMonthly.push(exportListMonthlyHeader);

        } else {
            const exportListDailyHeader =new ExportMovementDailyReport();
            exportListDailyHeader.day = $localize`:@@Day:Day`;
            exportListDailyHeader.bank = $localize`:@@Bank:Bank`;
            exportListDailyHeader.idOrg = $localize`:@@OrganisationId :Organisation Id`;
            exportListDailyHeader.orgname = $localize`:@@OrganisationName:Organisation Name`;
            exportListDailyHeader.category = $localize`:@@Category:Category`;
            exportListDailyHeader.quantity = $localize`:@@Quantity:Quantity(kg)`;
            exportListMovementsDaily.push(exportListDailyHeader);
        }

*/
        if (scope === 'month') {
        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken, "monthly",this.category, this.bankShortName).subscribe(
            (response: MovementReport[]) => {
                const movementReports = response;
                for (let movementReport of movementReports) {
                    const exportListMonthly = new ExportMovementMonthlyReport();
                    exportListMonthly.month = movementReport.key;
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