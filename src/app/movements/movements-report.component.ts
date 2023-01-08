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
    titleMovementsEvolution: string;
    movementsRecordsMonthly: MovementReport[];
    titleFoodDeliveriesNonFEADEvolution: string;
    chartDataFoodDeliveriesNonFEADHistory: { labels: any[]; datasets: any[]; };
    titleFoodDeliveriesFEADNonAgreedEvolution: string;
    chartDataFoodDeliveriesFEADNonAgreedHistory: { labels: any[]; datasets: any[]; };
    titleFoodDeliveriesFEADAgreedCollectEvolution: string;
    chartDataFoodDeliveriesFEADAgreedCollectHistory: { labels: any[]; datasets: any[]; };
    chartDataFoodDeliveriesYearCurrent: { labels: any[]; datasets: any[]; };
    chartDataFoodDeliveriesYearPrevious: { labels: any[]; datasets: any[]; };
    chartDataFoodDeliveriesYearPrevious1: { labels: any[]; datasets: any[]; };
    chartDataFoodDeliveriesYearPrevious2: { labels: any[]; datasets: any[]; };
    titleFoodDeliveriesYearCurrent: string;
    titleFoodDeliveriesYearPrevious: string;
    titleFoodDeliveriesYearPrevious1: string;
    titleFoodDeliveriesYearPrevious2: string;
    constructor(
        private movementReportHttpService: MovementReportHttpService,
        private banqueService: BanqueEntityService,
        private excelService: ExcelService,
        private authService: AuthService,
        private http: HttpClient,
        private store: Store<AppState>
    ) {
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
       this.reportMovementsHistory();
       console.log('movements report is initialized');
    }
    reportMovementsHistory() {

        this.movementReportHttpService.getMovementReport(this.authService.accessToken,null,null).subscribe(
            (response: MovementReport[]) => {
                this.movementsRecordsMonthly = response;
                let reportLabels = [];
                let reportDataSetsMonthlyNonFEAD = [];
                let reportDataSetsMonthlyFEADnonAgreed = [];
                let reportDataSetsMonthlyFEADAgreedCollect = [];
                let reportDataSetsYearCurrent= [
                    {
                        data: [],
                        backgroundColor: this.backgroundColors,
                    }
                ];
                let reportDataSetsYearPrevious= [
                    {
                        data: [],
                        backgroundColor: this.backgroundColors,
                    }
                ];
                let reportDataSetsYearPrevious1= [
                    {
                        data: [],
                        backgroundColor: this.backgroundColors,
                    }
                ];
                let reportDataSetsYearPrevious2= [
                    {
                        data: [],
                        backgroundColor: this.backgroundColors,
                    }
                ];
                for (let i=0; i < this.bankOptions.length; i++ ) {
                    reportDataSetsYearCurrent[0].data.push(0);
                    reportDataSetsYearPrevious[0].data.push(0);
                    reportDataSetsYearPrevious1[0].data.push(0);
                    reportDataSetsYearPrevious2[0].data.push(0);
                }
                let colorIndex =0;
                for (let i=0; i < this.bankOptions.length; i++ ) {
                    reportDataSetsMonthlyNonFEAD.push(
                        {
                            type: 'bar',
                            label: this.bankOptions[i].label,
                            backgroundColor: this.backgroundColors[colorIndex],
                            data: []
                        });
                    reportDataSetsMonthlyFEADnonAgreed.push(
                        {
                            type: 'bar',
                            label: this.bankOptions[i].label,
                            backgroundColor: this.backgroundColors[colorIndex],
                            data: []
                        });
                    reportDataSetsMonthlyFEADAgreedCollect.push(
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

                const currentYear = new Date().getFullYear();
                const previousYear = currentYear - 1;
                const previousYear2 = currentYear - 2;
                const previousYear3 = currentYear - 3;
                for (let i = 0; i < this.movementsRecordsMonthly.length; i++) {
                    const bankOptionIndex = this.bankOptions.findIndex(obj => obj.value === this.movementsRecordsMonthly[i].bankShortName);
                    if (bankOptionIndex === -1) continue;
                    const movementYear = this.movementsRecordsMonthly[i].month.substr(0,4);
                    switch (movementYear) {
                        case currentYear.toString():
                        reportDataSetsYearCurrent[0].data[bankOptionIndex] += this.movementsRecordsMonthly[i].quantity;
                        break;
                        case previousYear.toString():
                        reportDataSetsYearPrevious[0].data[bankOptionIndex] += this.movementsRecordsMonthly[i].quantity;
                        break;
                        case previousYear2.toString():
                        reportDataSetsYearPrevious1[0].data[bankOptionIndex] += this.movementsRecordsMonthly[i].quantity;
                        break;
                        case previousYear3.toString():
                        reportDataSetsYearPrevious2[0].data[bankOptionIndex] += this.movementsRecordsMonthly[i].quantity;
                        break;
                        default:
                            console.log('Movements Report Unknown year',movementYear);
                    }
                    if (!reportLabels.includes(this.movementsRecordsMonthly[i].month)) {
                        reportLabels.push(this.movementsRecordsMonthly[i].month);
                        for (let i=0; i < this.bankOptions.length; i++ ) {
                            reportDataSetsMonthlyNonFEAD[i].data.push(0);
                            reportDataSetsMonthlyFEADnonAgreed[i].data.push(0);
                            reportDataSetsMonthlyFEADAgreedCollect[i].data.push(0);
                        }
                    }
                    const dataIndex = reportLabels.length;


                    switch (this.movementsRecordsMonthly[i].category) {
                        case 'NOFEADNONAGREED':
                            reportDataSetsMonthlyNonFEAD[bankOptionIndex].data[dataIndex] += this.movementsRecordsMonthly[i].quantity;
                            break;
                        case 'FEADNONAGREED':
                            reportDataSetsMonthlyFEADnonAgreed[bankOptionIndex].data[dataIndex] += this.movementsRecordsMonthly[i].quantity;
                            break;
                        case 'AGREEDFEADCOLLECT':
                            reportDataSetsMonthlyFEADAgreedCollect[bankOptionIndex].data[dataIndex] += this.movementsRecordsMonthly[i].quantity;
                            break;
                        default:
                            console.log('Unknown movement category: ' + this.movementsRecordsMonthly[i].category);
                    }
                }


                this.titleFoodDeliveriesNonFEADEvolution = $localize`:@@StatFoodDeliveriesNonFEADHistory:Food Delivered to Non FEAD Orgs(kg/month)`;
                this.chartDataFoodDeliveriesNonFEADHistory = {
                    labels: reportLabels,
                    datasets: reportDataSetsMonthlyNonFEAD
                }
                this.titleFoodDeliveriesFEADNonAgreedEvolution = $localize`:@@StatFoodDeliveriesFEADNonAgreedHistory:FEAD Food Delivered to Non Agreed Orgs(kg/month)`;
                this.chartDataFoodDeliveriesFEADNonAgreedHistory = {
                    labels: reportLabels,
                    datasets: reportDataSetsMonthlyFEADnonAgreed
                }

                this.titleFoodDeliveriesFEADAgreedCollectEvolution = $localize`:@@StatFoodDeliveriesFEADAgreedCollectHistory:FEAD + Collect Food Delivered to Agreed Orgs(kg/month)`;
                this.chartDataFoodDeliveriesFEADAgreedCollectHistory = {
                    labels: reportLabels,
                    datasets: reportDataSetsMonthlyFEADAgreedCollect
                }
                this.titleFoodDeliveriesYearCurrent = $localize`:@@StatFoodDeliveriesYearCurrent:Food Delivered in ${currentYear}(kg)`;
                this.chartDataFoodDeliveriesYearCurrent = {
                    labels: this.bankOptions.map(({label}) => label),
                    datasets: reportDataSetsYearCurrent
                }
                this.titleFoodDeliveriesYearPrevious = $localize`:@@StatFoodDeliveriesYearPrevious:Food Delivered in ${previousYear}(kg)`;
                this.chartDataFoodDeliveriesYearPrevious = {
                    labels: this.bankOptions.map(({label}) => label),
                    datasets: reportDataSetsYearPrevious
                }
                this.titleFoodDeliveriesYearPrevious1 = $localize`:@@StatFoodDeliveriesYearPrevious1:Food Delivered in ${previousYear2}(kg)`;
                this.chartDataFoodDeliveriesYearPrevious1 = {
                    labels: this.bankOptions.map(({label}) => label),
                    datasets: reportDataSetsYearPrevious1
                }
                this.titleFoodDeliveriesYearPrevious2 = $localize`:@@StatFoodDeliveriesYearPrevious2:Food Delivered in ${previousYear3}(kg)`;
                this.chartDataFoodDeliveriesYearPrevious2 = {
                    labels: this.bankOptions.map(({label}) => label),
                    datasets: reportDataSetsYearPrevious2
                }

            });

    }

}