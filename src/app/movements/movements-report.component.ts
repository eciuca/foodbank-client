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
@Component({
    selector: 'app-movements-report',
    templateUrl: './movements-report.component.html',
    styleUrls: ['./movements-report.component.css']
})
export class MovementReportComponent implements OnInit {
    booIsLoaded: boolean;
    bankOptions: any[];
    bankShortName: string;
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

    constructor(
        private movementReportHttpService: MovementReportHttpService,
        private banqueService: BanqueEntityService,
        private excelService: ExcelService,
        private authService: AuthService,
        private http: HttpClient,
        private store: Store<AppState>
    ) {
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
                    this.bankOptions = [{'label': this.bankShortName, 'value': this.bankShortName}];
                    if (!this.booIsLoaded) {
                        this.report();
                    }
                    this.booIsLoaded = true;
                    break;
                case 'admin':
                case 'Admin_FBBA':
                    const classicBanks = {'classicBanks': '1'};
                    this.banqueService.getWithQuery(classicBanks)
                        .subscribe((banquesEntities) => {
                            this.bankOptions = banquesEntities.map(({bankShortName}) => ({
                                'label': bankShortName,
                                'value': bankShortName
                            }));
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

    reportMovementsHistoryMonthly() {

        this.initializeChart();
        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken, "monthly", this.bankShortName).subscribe(
            (response: MovementReport[]) => {
                this.movementReports = response;

                this.currentPeriod = new Date().getFullYear();
                this.previousPeriod = this.currentPeriod - 1;
                this.previousPeriod1 = this.currentPeriod - 2;

                for (let i = 0; i < this.movementReports.length; i++) {
                    const bankOptionIndex = this.bankOptions.findIndex(obj => obj.value === this.movementReports[i].bankShortName);
                    if (bankOptionIndex === -1) continue;
                    const movementYear = this.movementReports[i].key.substr(0, 4);
                    if (movementYear < this.previousPeriod2) continue;
                    switch (movementYear) {
                        case this.currentPeriod.toString():
                            this.reportDataSetsCurrent[0].data[bankOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesCurrent += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod.toString():
                            this.reportDataSetsPrevious[0].data[bankOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod1.toString():
                            this.reportDataSetsPrevious1[0].data[bankOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious1 += this.movementReports[i].quantity;
                            break;

                        default:

                    }
                    if (!this.reportLabels.includes(this.movementReports[i].key)) {
                        this.reportLabels.push(this.movementReports[i].key);
                        for (let i = 0; i < this.bankOptions.length; i++) {
                            this.reportDataSetsNonFEAD[i].data.push(0);
                            this.reportDataSetsFEADnonAgreed[i].data.push(0);
                            this.reportDataSetsFEADAgreedCollect[i].data.push(0);
                        }
                    }
                    const dataIndex = this.reportLabels.length;


                    switch (this.movementReports[i].category) {
                        case 'NOFEADNONAGREED':
                            this.reportDataSetsNonFEAD[bankOptionIndex].data[dataIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesNonFEAD += this.movementReports[i].quantity;
                            break;
                        case 'FEADNONAGREED':
                            this.reportDataSetsFEADnonAgreed[bankOptionIndex].data[dataIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesFEADNonAgreed += this.movementReports[i].quantity;
                            break;
                        case 'AGREEDFEADCOLLECT':
                            this.reportDataSetsFEADAgreedCollect[bankOptionIndex].data[dataIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesFEADAgreedCollect += this.movementReports[i].quantity;
                            break;
                        default:
                            console.log('Unknown movement category: ' + this.movementReports[i].category);
                    }
                }
                this.createReportData();

            });

    }

    reportMovementsHistoryDaily() {
        this.initializeChart()
        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken, "daily", this.bankShortName).subscribe(
            (response: MovementReport[]) => {
                this.movementReports = response;

                this.currentPeriod = moment().format('YYYY-MM');
                this.previousPeriod = moment().subtract(1, 'months').format('YYYY-MM');
                this.previousPeriod1 = moment().subtract(2, 'months').format('YYYY-MM');

                for (let i = 0; i < this.movementReports.length; i++) {
                    const bankOptionIndex = this.bankOptions.findIndex(obj => obj.value === this.movementReports[i].bankShortName);
                    if (bankOptionIndex === -1) continue;
                    const movementMonth = this.movementReports[i].key.substr(0, 7);
                    switch (movementMonth) {
                        case this.currentPeriod.toString():
                            this.reportDataSetsCurrent[0].data[bankOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesCurrent += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod.toString():
                            this.reportDataSetsPrevious[0].data[bankOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious += this.movementReports[i].quantity;
                            break;
                        case this.previousPeriod1.toString():
                            this.reportDataSetsPrevious1[0].data[bankOptionIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious1 += this.movementReports[i].quantity;
                            break;

                        default:

                    }
                    if (!this.reportLabels.includes(this.movementReports[i].key)) {
                        this.reportLabels.push(this.movementReports[i].key);
                        for (let i = 0; i < this.bankOptions.length; i++) {
                            this.reportDataSetsNonFEAD[i].data.push(0);
                            this.reportDataSetsFEADnonAgreed[i].data.push(0);
                            this.reportDataSetsFEADAgreedCollect[i].data.push(0);
                        }
                    }
                    const dataIndex = this.reportLabels.length;


                    switch (this.movementReports[i].category) {
                        case 'NOFEADNONAGREED':
                            this.reportDataSetsNonFEAD[bankOptionIndex].data[dataIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesNonFEAD += this.movementReports[i].quantity;
                            break;
                        case 'FEADNONAGREED':
                            this.reportDataSetsFEADnonAgreed[bankOptionIndex].data[dataIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesFEADNonAgreed += this.movementReports[i].quantity;
                            break;
                        case 'AGREEDFEADCOLLECT':
                            this.reportDataSetsFEADAgreedCollect[bankOptionIndex].data[dataIndex] += this.movementReports[i].quantity;
                            this.totalFoodDeliveriesFEADAgreedCollect += this.movementReports[i].quantity;
                            break;
                        default:
                            console.log('Unknown movement category: ' + this.movementReports[i].category);
                    }
                }


                this.createReportData();

            });

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
        for (let i = 0; i < this.bankOptions.length; i++) {
            this.reportDataSetsCurrent[0].data.push(0);
            this.reportDataSetsPrevious[0].data.push(0);
            this.reportDataSetsPrevious1[0].data.push(0);
            this.reportDataSetsPrevious2[0].data.push(0);
        }
        let colorIndex = 0;
        for (let i = 0; i < this.bankOptions.length; i++) {
            this.reportDataSetsNonFEAD.push(
                {
                    type: 'bar',
                    label: this.bankOptions[i].label,
                    backgroundColor: this.backgroundColors[colorIndex],
                    data: []
                });
            this.reportDataSetsFEADnonAgreed.push(
                {
                    type: 'bar',
                    label: this.bankOptions[i].label,
                    backgroundColor: this.backgroundColors[colorIndex],
                    data: []
                });
            this.reportDataSetsFEADAgreedCollect.push(
                {
                    type: 'bar',
                    label: this.bankOptions[i].label,
                    backgroundColor: this.backgroundColors[colorIndex],
                    data: []
                });

            colorIndex++;
            if (colorIndex >= this.backgroundColors.length) {
                console.log('Not enough colors in backgroundColors array');
                colorIndex = 0;
            }

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

        this.titleFoodDeliveriesCurrent = $localize`:@@StatFoodDeliveriesCurrent:Food Delivered in ${this.currentPeriod}(kg) ${mthPercentage}% of ${this.previousPeriod}`;
        this.chartDataFoodDeliveriesCurrent = {
            labels: this.bankOptions.map(({label}) => label),
            datasets: this.reportDataSetsCurrent
        }
        const growthPercentage = this.totalFoodDeliveriesPrevious1 > 0 ? (((this.totalFoodDeliveriesPrevious - this.totalFoodDeliveriesPrevious1) * 100 )/ this.totalFoodDeliveriesPrevious1).toFixed(2) : 0;

        this.titleFoodDeliveriesPrevious = $localize`:@@StatFoodDeliveriesPrevious:Food Delivered in ${this.previousPeriod}(kg) ${growthPercentage}% growth vs ${this.previousPeriod1}`;
        this.chartDataFoodDeliveriesPrevious = {
            labels: this.bankOptions.map(({label}) => label),
            datasets: this.reportDataSetsPrevious
        }
        this.titleFoodDeliveriesPrevious1 = $localize`:@@StatFoodDeliveriesPrevious1:Food Delivered in ${this.previousPeriod1}(kg)`;
        this.chartDataFoodDeliveriesPrevious1 = {
            labels: this.bankOptions.map(({label}) => label),
            datasets: this.reportDataSetsPrevious1
        }
        this.titleFoodDeliveriesPrevious2 = $localize`:@@StatFoodDeliveriesPrevious2:Food Delivered in ${this.previousPeriod2}(kg)`;
        this.chartDataFoodDeliveriesPrevious2 = {
            labels: this.bankOptions.map(({label}) => label),
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
        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken, "monthly", this.bankShortName).subscribe(
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