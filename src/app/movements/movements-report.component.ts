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
    titleMovementsEvolution: string;
    movementsRecordsMonthly: MovementReport[];
    titleFoodDeliveriesNonFEADEvolution: string;
    chartDataFoodDeliveriesNonFEADHistory: { labels: any[]; datasets: any[]; };
    titleFoodDeliveriesFEADNonAgreedEvolution: string;
    chartDataFoodDeliveriesFEADNonAgreedHistory: { labels: any[]; datasets: any[]; };
    titleFoodDeliveriesFEADAgreedCollectEvolution: string;
    chartDataFoodDeliveriesFEADAgreedCollectHistory: { labels: any[]; datasets: any[]; };
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

                for (let j=0; j < 50; j++ ) {
                    console.log(this.movementsRecordsMonthly[j]);
                }
                for (let i = 0; i < this.movementsRecordsMonthly.length; i++) {
                    const bankOptionIndex = this.bankOptions.findIndex(obj => obj.value === this.movementsRecordsMonthly[i].bankShortName);
                    if (bankOptionIndex === -1) continue;
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
                    console.log('movements report is done. reportDataFoodDeliveriesNonFEADHistory:', reportDataSetsMonthlyNonFEAD);
                console.log('movements report is done. reportDataFoodDeliveriesFEADNonAgreedHistory:', reportDataSetsMonthlyFEADnonAgreed);
                console.log('movements report is done. reportDataFoodDeliveriesFEADAgreedCollectHistory:', reportDataSetsMonthlyFEADAgreedCollect);
                this.titleFoodDeliveriesNonFEADEvolution = $localize`:@@StatFoodDeliveriesNonFEADHistory:Food Delivered to Non FEAD Orgs(kg)`;
                this.chartDataFoodDeliveriesNonFEADHistory = {
                    labels: reportLabels,
                    datasets: reportDataSetsMonthlyNonFEAD
                }
                this.titleFoodDeliveriesFEADNonAgreedEvolution = $localize`:@@StatFoodDeliveriesFEADNonAgreedHistory:FEAD Food Delivered to Non Agreed Orgs(kg)`;
                this.chartDataFoodDeliveriesFEADNonAgreedHistory = {
                    labels: reportLabels,
                    datasets: reportDataSetsMonthlyFEADnonAgreed
                }

                this.titleFoodDeliveriesFEADAgreedCollectEvolution = $localize`:@@StatFoodDeliveriesFEADAgreedCollectHistory:FEAD + Collect Food Delivered to Agreed Orgs(kg)`;
                this.chartDataFoodDeliveriesFEADAgreedCollectHistory = {
                    labels: reportLabels,
                    datasets: reportDataSetsMonthlyFEADAgreedCollect
                }
            });

    }

}