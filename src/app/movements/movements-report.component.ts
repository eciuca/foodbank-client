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
                this.bankOptions = banquesEntities.map(({bankShortName,bankId}) => ({'label': bankShortName, 'value': bankId}));
                if (! this.booIsLoaded) {
                    this.report();
                }
                this.booIsLoaded = true;
            });


    }
    report() {
        // this.reportBeneficiaries();
       console.log('movements report is initialized');
    }


}