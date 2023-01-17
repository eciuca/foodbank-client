import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {globalAuthState} from '../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {AuthState} from '../auth/reducers';
import {MovementReportHttpService} from '../movements/services/movement-report-http.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {MovementReport} from '../movements/model/movementReport';
import {formatDate} from '@angular/common';
import {ExcelService} from '../services/excel.service';
import * as moment from 'moment';
import {DashboardMovement} from './model/dashboardMovement';
@Component({
    selector: 'app-dashboard-report',
    templateUrl: './dashboard-report.component.html',
    styleUrls: ['./dashboard-report.component.css']
})
export class DashboardReportComponent implements OnInit {

    bankOptions: any[];
    booIsLoaded: boolean;
    bankShortName: string;
    dashboardBankItems: DashboardItem[];
    dashboardOrgItems: DashboardItem[];

    constructor(
        private movementReportHttpService: MovementReportHttpService,
        private banqueService: BanqueEntityService,
        private excelService: ExcelService,
        private authService: AuthService,
        private http: HttpClient,
        private store: Store<AppState>
    ) {
    this.bankShortName = '';
    this.booIsLoaded = false;
    this.dashboardBankItems = [];
    this.dashboardOrgItems = [];
    }

    ngOnInit(): void {
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
        switch (authState.user.rights) {

            case 'Admin_Banq':
                this.bankShortName = authState.user.idCompany;
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
                        this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
                        this.booIsLoaded = true;
                    });
                break;
            default:
        }



    }

    report() {
        const lastDays = '20';

        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken,
            "daily", this.bankShortName, null,null,lastDays).subscribe(
            (response: MovementReport[]) => {
                const movementsRecords = response;
                this.dashboardBankItems = [];
                for (let i = 0; i < movementsRecords.length; i++) {
                    console.log(` ${movementsRecords[i].key} ${movementsRecords[i].bankShortName} ${movementsRecords[i].idOrg} ${movementsRecords[i].orgname} ${movementsRecords[i].category} ${movementsRecords[i].quantity} ${movementsRecords[i].lastupdated}`);
                    const dashboardItem = new DashboardItem();
                    dashboardItem.bankShortName = movementsRecords[i].bankShortName;
                    dashboardItem.type = $localize`:@@DasnboardTitleMovement:Food Supplied in kg `
                    dashboardItem.subtype = movementsRecords[i].category;
                    dashboardItem.key = movementsRecords[i].key;
                    dashboardItem.value = movementsRecords[i].quantity.toString();
                    this.dashboardBankItems.push(dashboardItem);
                }

            });
        this.movementReportHttpService.getMovementDailyReport(this.authService.accessToken,
             this.bankShortName, null,null,lastDays).subscribe(
            (response: MovementReport[]) => {
                const movementsRecords = response;
                this.dashboardOrgItems = [];
                for (let i = 0; i < movementsRecords.length; i++) {
                    console.log(` ${movementsRecords[i].day} ${movementsRecords[i].bankShortName} ${movementsRecords[i].idOrg} ${movementsRecords[i].orgname} ${movementsRecords[i].category} ${movementsRecords[i].quantity} ${movementsRecords[i].lastupdated}`);
                    const dashboardItem = new DashboardMovement();
                    dashboardItem.bankShortName = movementsRecords[i].bankShortName;
                    dashboardItem.type = $localize`:@@DasnboardTitleMovement:Food Supplied in kg `
                    dashboardItem.subtype = movementsRecords[i].orgname;
                    dashboardItem.key = movementsRecords[i].day;
                    dashboardItem.value = movementsRecords[i].quantity.toString();
                    this.dashboardOrgItems.push(dashboardItem);
                }

            });
    }

}