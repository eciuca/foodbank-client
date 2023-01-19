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
import {BanqueClientReport} from '../banques/model/banqueClientReport';
import {BanqueReportService} from '../banques/services/banque-report.service';
import {BanqueFeadReport} from '../banques/model/banqueFeadReport';
import {BanqueOrgCount} from '../banques/model/banqueOrgCount';

@Component({
    selector: 'app-dashboard-report',
    templateUrl: './dashboard-report.component.html',
    styleUrls: ['./dashboard-report.component.css']
})
export class DashboardReportComponent implements OnInit {

    bankOptions: any[];
    days: string[];
    selectedDay: string;
    booIsLoadedBankItems: boolean;
    booisLoadedOrgItems: boolean;
    booIsLoaded: boolean;
    bankShortName: string;
    dashboardBankItems: MovementReport[];
    dashboardOrgItems: MovementReport[];
    selectedBankItems: MovementReport[];
    selectedOrgItems: MovementReport[];
    banqueOrgReportRecords: BanqueClientReport[];
    clientNFam: number;
    clientNpers: number;
    clientNNour: number;
    clientNBebe: number;
    clientNEnf: number;
    clientNAdo: number;
    clientN1824: number;
    clientNSen: number;
    orgCount: number;
    orgFeadCount: number;
    orgAgreedCount: number;
    orgFeadFromUsCount: number;
    userBankCount: number;
    userOrgCount: number;
    memberBankCount: number;
    memberOrgCount: number;

    constructor(
        private movementReportHttpService: MovementReportHttpService,
        private banqueReportService: BanqueReportService,
        private banqueService: BanqueEntityService,
        private excelService: ExcelService,
        private authService: AuthService,
        private http: HttpClient,
        private store: Store<AppState>
    ) {
    this.bankShortName = '';
    this.booIsLoaded = false;
    this.booIsLoadedBankItems = false;
    this.booisLoadedOrgItems = false;
    this.dashboardBankItems = [];
    this.dashboardOrgItems = [];
    this.selectedBankItems = [];
    this.selectedOrgItems = [];
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
        const lastDays = '7';

        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken,
            "daily", this.bankShortName, null,null,lastDays).subscribe(
            (response: MovementReport[]) => {
                const movementsRecords = response;
                this.dashboardBankItems = [];
                for (let i = 0; i < movementsRecords.length; i++) {
                    this.dashboardBankItems.push(movementsRecords[i]);
                }
                this.booIsLoadedBankItems = true;
                this.selectedBankItems = this.dashboardBankItems;
                if (this.booisLoadedOrgItems) {
                    this.setDropdownDays();
                }

            });
        this.movementReportHttpService.getMovementDailyReport(this.authService.accessToken,
             this.bankShortName, null,null,lastDays).subscribe(
            (response: MovementReport[]) => {
                const movementsRecords = response;
                this.dashboardOrgItems = [];
                for (let i = 0; i < movementsRecords.length; i++) {
                    this.dashboardOrgItems.push(movementsRecords[i]);
                }
                this.booisLoadedOrgItems = true;
                if (this.booIsLoadedBankItems) {
                    this.setDropdownDays();
                }

            });
        this.banqueReportService.getOrgClientReport(this.authService.accessToken,this.bankShortName).subscribe(
            (response: BanqueClientReport[]) => {
                const banqueOrgReportRecords: BanqueClientReport[] = response;
                this.clientNFam=banqueOrgReportRecords[0].nFam;
                this.clientNpers=banqueOrgReportRecords[0].nPers;
                this.clientNNour=banqueOrgReportRecords[0].nNour;
                this.clientNBebe=banqueOrgReportRecords[0].nBebe;
                this.clientNEnf=banqueOrgReportRecords[0].nEnf;
                this.clientNAdo=banqueOrgReportRecords[0].nAdo;
                this.clientN1824=banqueOrgReportRecords[0].n1824;
                this.clientNSen=banqueOrgReportRecords[0].nSen;
            });
        this.banqueReportService.getOrgFeadReport(this.authService.accessToken,this.bankShortName).subscribe(
            (response: BanqueFeadReport[]) => {
                const banqueOrgFeadRecords:  BanqueFeadReport[] = response;
                this.orgCount= banqueOrgFeadRecords[0].orgCount;
                this.orgFeadCount= banqueOrgFeadRecords[0].orgFeadCount;
                this.orgAgreedCount= banqueOrgFeadRecords[0].orgAgreedCount;
                this.orgFeadFromUsCount= banqueOrgFeadRecords[0].orgFeadFromUsCount;
            });
        this.banqueReportService.getMembreCountReport(this.authService.accessToken,this.bankShortName).subscribe(
            (response: BanqueOrgCount[]) => {
                const bankMemberCounts: BanqueOrgCount[] = response;
                this.memberBankCount= bankMemberCounts[0].bankCount;
                this.memberOrgCount= bankMemberCounts[0].orgCount;
            });
        this.banqueReportService.getUserCountReport(this.authService.accessToken,this.bankShortName).subscribe(
            (response: BanqueOrgCount[]) => {
                const bankUserCounts: BanqueOrgCount[] = response;
                this.userBankCount= bankUserCounts[0].bankCount;
                this.userOrgCount= bankUserCounts[0].orgCount;
            });

    }
    labelCategory(category: string) {
        switch (category) {
            case "AGREEDFEADCOLLECT":
                return $localize`:@@MovementCategoryFeadCollect:FEAD and Collect day food deliveries for Agreed Associations`;
            case "NOFEADNONAGREED":
                return $localize`:@@MovementCategoryNoFeadNotAgreed: non-FEAD day food deliveries for Not Agreed Associations`;
            case "FEADNONAGREED":
                return $localize`:@@MovementCategoryFeadNotAgreed: FEAD day food deliveries for Not Agreed Associations`;
            default:
                return category;
        }
    }
    formatQuantity(quantity: number) {
        return `${quantity.toFixed(0)} kg`;
    }
    setDropdownDays() {
        var bankDays = this.dashboardBankItems.map(x => x.key); // beware of the key is 'key' for aggregated bank items
        var orgDays = this.dashboardOrgItems.map(x => x.day); // beware of the key is 'day' for org items
        var allDays = bankDays.concat(orgDays).filter((v, i, a) => a.indexOf(v) === i); // remove duplicates
        this.days = allDays.sort().reverse();
        this.filterDay(allDays[0]);
    }
    filterDay(myDay: string) {
        this.selectedDay = myDay;
        this.selectedBankItems = this.dashboardBankItems.filter(x => x.key === myDay);
        this.selectedOrgItems = this.dashboardOrgItems.filter(x => x.day === myDay);
    }
    labelClientNFam() {
        return $localize`:@@ClientNFam:Families`;
    }
    labelClientNpers() {
        return $localize`:@@ClientNpers:Persons`;
    }
    labelClientNNour() {
        return $localize`:@@ClientNNour:Infants`;
    }
    labelClientNBebe() {
        return $localize`:@@ClientNBebe:Babies`;
    }
    labelClientNEnf() {
        return $localize`:@@ClientChild:Children`;
    }
    labelClientNAdo() {
        return $localize`:@@ClientNAdo:Adolescents`;
    }
    labelClientN1824() {
        return $localize`:@@ClientN1824:Young Adults`;
    }
    labelClientNSen() {
        return $localize`:@@ClientSeniors:Seniors`;
    }
    labelOrgCount() {
        return $localize`:@@OrgCount:Number of Organisations of the Bank`;
    }
    labelOrgFeadCount() {
        return $localize`:@@OrgFeadCount:Number of FEAD Organisations of the Bank`;
    }
    labelOrgAgreedCount() {
        return $localize`:@@OrgAgreedCount:Number of Agreed Organisations of the Bank`;
    }
    labelOrgFeadFromUsCount() {
        return $localize`:@@OrgFeadFromUsCount:Number of FEAD Organisations of the Bank receiving food from us`;
    }
    labelMemberBankCount() {
        return $localize`:@@MemberBankCount:Number of Members of the Bank`;
    }
    labelMemberOrgCount() {
        return $localize`:@@MemberorgCount:Number of Members of the Organisations of the Bank`;
    }
    labelUserBankCount() {
        return $localize`:@@UserBankCount:Number of Users of the Bank`;
    }
    labelUserOrgCount() {
        return $localize`:@@UserorgCount:Number of Users of the Organisations of the Bank`;
    }


}