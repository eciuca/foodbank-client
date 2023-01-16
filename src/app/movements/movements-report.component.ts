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
import {formatDate} from '@angular/common';
import {ExcelService} from '../services/excel.service';
import * as moment from 'moment';
@Component({
    selector: 'app-movements-report',
    templateUrl: './movements-report.component.html',
    styleUrls: ['./movements-report.component.css']
})
export class MovementReportComponent implements OnInit {
    booIsLoaded: boolean;
    bankOptions: any[];
    backgroundColors: any[];
    basicOptions: any;
    stackedOptions: any;
    pieOptions: any;
    booShowDaily: boolean;
    titleMovementsEvolution: string;
    movementsRecords: MovementReport[];
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
    totalFoodDeliveriesNonFEAD: number ;
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

    constructor(
        private movementReportHttpService: MovementReportHttpService,
        private banqueService: BanqueEntityService,
        private excelService: ExcelService,
        private authService: AuthService,
        private http: HttpClient,
        private store: Store<AppState>
    ) {
        this.booShowDaily = false;
        this.backgroundColors = ['magenta','violet','indigo','blue','x0080ff','cyan','green','olive','yellow','orange','red','darkred', 'black','silver'];
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

        const classicBanks = { 'classicBanks': '1' };
        this.banqueService.getWithQuery(classicBanks)
            .subscribe((banquesEntities) => {
                this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
                if (! this.booIsLoaded) {
                    this.report();
                }
                this.booIsLoaded = true;
            });


    }
    report() {

       this.reportMovementsHistoryMonthly();
    }

    changePeriodFilter($event) {
        this.booShowDaily = $event.checked;
        if (this.booShowDaily) {
            this.reportMovementsHistoryDaily();
        }
        else {
            this.reportMovementsHistoryMonthly();
        }
    }
    reportMovementsHistoryMonthly() {

        this.initializeChart();
        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken,"monthly",null).subscribe(
            (response: MovementReport[]) => {
                this.movementsRecords = response;

                this.currentPeriod = new Date().getFullYear();
                this.previousPeriod = this.currentPeriod - 1;
                this.previousPeriod2 = this.currentPeriod - 2;

                for (let i = 0; i < this.movementsRecords.length; i++) {
                    const bankOptionIndex = this.bankOptions.findIndex(obj => obj.value === this.movementsRecords[i].bankShortName);
                    if (bankOptionIndex === -1) continue;
                    const movementYear = this.movementsRecords[i].key.substr(0,4);
                    if (movementYear <  this.previousPeriod2) continue;
                    switch (movementYear) {
                        case this.currentPeriod.toString():
                            this.reportDataSetsCurrent[0].data[bankOptionIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesCurrent += this.movementsRecords[i].quantity;
                        break;
                        case this.previousPeriod.toString():
                            this.reportDataSetsPrevious[0].data[bankOptionIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesPrevious += this.movementsRecords[i].quantity;
                        break;
                        case this.previousPeriod2.toString():
                            this.reportDataSetsPrevious1[0].data[bankOptionIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesPrevious1 += this.movementsRecords[i].quantity;
                        break;

                        default:

                    }
                    if (!this.reportLabels.includes(this.movementsRecords[i].key)) {
                        this.reportLabels.push(this.movementsRecords[i].key);
                        for (let i=0; i < this.bankOptions.length; i++ ) {
                            this.reportDataSetsNonFEAD[i].data.push(0);
                            this.reportDataSetsFEADnonAgreed[i].data.push(0);
                            this.reportDataSetsFEADAgreedCollect[i].data.push(0);
                        }
                    }
                    const dataIndex = this.reportLabels.length;


                    switch (this.movementsRecords[i].category) {
                        case 'NOFEADNONAGREED':
                            this.reportDataSetsNonFEAD[bankOptionIndex].data[dataIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesNonFEAD += this.movementsRecords[i].quantity;
                            break;
                        case 'FEADNONAGREED':
                            this.reportDataSetsFEADnonAgreed[bankOptionIndex].data[dataIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesFEADNonAgreed += this.movementsRecords[i].quantity;
                            break;
                        case 'AGREEDFEADCOLLECT':
                            this.reportDataSetsFEADAgreedCollect[bankOptionIndex].data[dataIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesFEADAgreedCollect += this.movementsRecords[i].quantity;
                            break;
                        default:
                            console.log('Unknown movement category: ' + this.movementsRecords[i].category);
                    }
                }
                this.createReportData();

            });

    }
    reportMovementsHistoryDaily() {
       this.initializeChart()
        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken,"daily",null).subscribe(
            (response: MovementReport[]) => {
                this.movementsRecords = response;

                this.currentPeriod = moment().format('YYYY-MM');
                this.previousPeriod = moment().subtract(1, 'months').format('YYYY-MM');
                this.previousPeriod2 = moment().subtract(2, 'months').format('YYYY-MM');

                for (let i = 0; i < this.movementsRecords.length; i++) {
                    const bankOptionIndex = this.bankOptions.findIndex(obj => obj.value === this.movementsRecords[i].bankShortName);
                    if (bankOptionIndex === -1) continue;
                    const movementMonth = this.movementsRecords[i].key.substr(0,7);
                    switch (movementMonth) {
                        case this.currentPeriod.toString():
                            this.reportDataSetsCurrent[0].data[bankOptionIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesCurrent += this.movementsRecords[i].quantity;
                            break;
                        case this.previousPeriod.toString():
                            this.reportDataSetsPrevious[0].data[bankOptionIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesPrevious += this.movementsRecords[i].quantity;
                            break;
                        case this.previousPeriod2.toString():
                            this.reportDataSetsPrevious1[0].data[bankOptionIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesPrevious1 += this.movementsRecords[i].quantity;
                            break;

                        default:
                            console.log('Movements Report Obsolete month',movementMonth);
                    }
                    if (!this.reportLabels.includes(this.movementsRecords[i].key)) {
                        this.reportLabels.push(this.movementsRecords[i].key);
                        for (let i=0; i < this.bankOptions.length; i++ ) {
                            this.reportDataSetsNonFEAD[i].data.push(0);
                            this.reportDataSetsFEADnonAgreed[i].data.push(0);
                            this.reportDataSetsFEADAgreedCollect[i].data.push(0);
                        }
                    }
                    const dataIndex = this.reportLabels.length;


                    switch (this.movementsRecords[i].category) {
                        case 'NOFEADNONAGREED':
                            this.reportDataSetsNonFEAD[bankOptionIndex].data[dataIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesNonFEAD += this.movementsRecords[i].quantity;
                            break;
                        case 'FEADNONAGREED':
                            this.reportDataSetsFEADnonAgreed[bankOptionIndex].data[dataIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesFEADNonAgreed += this.movementsRecords[i].quantity;
                            break;
                        case 'AGREEDFEADCOLLECT':
                            this.reportDataSetsFEADAgreedCollect[bankOptionIndex].data[dataIndex] += this.movementsRecords[i].quantity;
                            this.totalFoodDeliveriesFEADAgreedCollect += this.movementsRecords[i].quantity;
                            break;
                        default:
                            console.log('Unknown movement category: ' + this.movementsRecords[i].category);
                    }
                }


              this.createReportData();
             
            });

    }
    initializeChart() {
        this.totalFoodDeliveriesNonFEAD = 0 ;
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
        this.reportDataSetsCurrent= [
            {
                data: [],
                backgroundColor: this.backgroundColors,
            }
        ];
        this.reportDataSetsPrevious= [
            {
                data: [],
                backgroundColor: this.backgroundColors,
            }
        ];
        this.reportDataSetsPrevious1= [
            {
                data: [],
                backgroundColor: this.backgroundColors,
            }
        ];
        this.reportDataSetsPrevious2= [
            {
                data: [],
                backgroundColor: this.backgroundColors,
            }
        ];
        for (let i=0; i < this.bankOptions.length; i++ ) {
            this.reportDataSetsCurrent[0].data.push(0);
            this.reportDataSetsPrevious[0].data.push(0);
            this.reportDataSetsPrevious1[0].data.push(0);
            this.reportDataSetsPrevious2[0].data.push(0);
        }
        let colorIndex =0;
        for (let i=0; i < this.bankOptions.length; i++ ) {
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
                colorIndex=0;
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
        this.titleFoodDeliveriesCurrent = $localize`:@@StatFoodDeliveriesCurrent:Food Delivered in ${this.currentPeriod}(kg)`;
        this.chartDataFoodDeliveriesCurrent = {
            labels: this.bankOptions.map(({label}) => label),
            datasets: this.reportDataSetsCurrent
        }
        this.titleFoodDeliveriesPrevious = $localize`:@@StatFoodDeliveriesPrevious:Food Delivered in ${this.previousPeriod}(kg)`;
        this.chartDataFoodDeliveriesPrevious = {
            labels: this.bankOptions.map(({label}) => label),
            datasets: this.reportDataSetsPrevious
        }
        this.titleFoodDeliveriesPrevious1 = $localize`:@@StatFoodDeliveriesPrevious1:Food Delivered in ${this.previousPeriod2}(kg)`;
        this.chartDataFoodDeliveriesPrevious1 = {
            labels: this.bankOptions.map(({label}) => label),
            datasets: this.reportDataSetsPrevious1
        }
        this.titleFoodDeliveriesPrevious2 = $localize`:@@StatFoodDeliveriesPrevious2:Food Delivered in ${this.previousPeriod3}(kg)`;
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
}