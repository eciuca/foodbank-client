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
    orgs: string[];
    selectedDay: string;
    selectedOrg: string;
    booIsLoadedBankItems: boolean;
    booisLoadedOrgItems: boolean;
    booIsLoaded: boolean;
    booIsLoadedMovements: boolean;
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
    clientNAdults: number;
    clientNFamAgreed: number;
    clientNpersAgreed: number;
    clientNNourAgreed: number;
    clientNBebeAgreed: number;
    clientNEnfAgreed: number;
    clientNAdoAgreed: number;
    clientN1824Agreed: number;
    clientNSenAgreed: number;
    clientNAdultsAgreed: number;
    clientNFamGestBen: number;
    clientNpersGestBen: number;
    clientNNourGestBen: number;
    clientNBebeGestBen: number;
    clientNEnfGestBen: number;
    clientNAdoGestBen: number;
    clientN1824GestBen: number;
    clientNSenGestBen: number;
    clientNAdultsGestBen: number;
    clientNbofOrgs: number;
    clientNbofOrgsAgreed: number;
    clientNbofOrgsGestBen: number;
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
    this.booIsLoadedMovements = false;
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
        const lastDays = '10';

        this.movementReportHttpService.getMovementReportByBank(this.authService.accessToken,
            "daily", 'bank',this.bankShortName, null,null,null,lastDays).subscribe(
            (response: MovementReport[]) => {
                const movementsRecords = response;
                this.dashboardBankItems = [];
                for (let i = 0; i < movementsRecords.length; i++) {
                    this.dashboardBankItems.push(movementsRecords[i]);
                }
                this.booIsLoadedBankItems = true;
                this.selectedBankItems = this.dashboardBankItems;
                if ((!this.booIsLoadedMovements) && this.booisLoadedOrgItems) {
                    this.setDropdownDays();
                    this.setDropdownOrgs();
                    this.booIsLoadedMovements = true;
                }
                this.booIsLoadedBankItems = true;

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
                if ((!this.booIsLoadedMovements) && this.booIsLoadedBankItems) {
                    this.setDropdownDays();
                    this.setDropdownOrgs();
                    this.booIsLoadedMovements = true;
                }

            });
        this.clientNFam=0
        this.clientNpers=0;
        this.clientNNour=0;
        this.clientNBebe=0;
        this.clientNEnf=0;
        this.clientNAdo=0;
        this.clientN1824=0;
        this.clientNSen=0;
        this.clientNAdults=0;
        this.clientNFamAgreed=0
        this.clientNpersAgreed=0;
        this.clientNNourAgreed=0;
        this.clientNBebeAgreed=0;
        this.clientNEnfAgreed=0;
        this.clientNAdoAgreed=0;
        this.clientN1824Agreed=0;
        this.clientNSenAgreed=0;
        this.clientNAdultsAgreed=0;
        this.clientNFamGestBen=0
        this.clientNpersGestBen=0;
        this.clientNNourGestBen=0;
        this.clientNBebeGestBen=0;
        this.clientNEnfGestBen=0;
        this.clientNAdoGestBen=0;
        this.clientN1824GestBen=0;
        this.clientNSenGestBen=0;
        this.clientNAdultsGestBen=0;
        this.clientNbofOrgs=0;
        this.clientNbofOrgsAgreed=0;
        this.clientNbofOrgsGestBen=0;
        this.banqueReportService.getOrgClientReport(this.authService.accessToken,this.bankShortName).subscribe(
            (response: BanqueClientReport[]) => {
                const banqueOrgReportRecords: BanqueClientReport[] = response;
                for (let i = 0; i < banqueOrgReportRecords.length; i++) {
                    this.clientNbofOrgs+=  banqueOrgReportRecords[i].orgCount;
                    this.clientNFam += banqueOrgReportRecords[i].nFam;
                    this.clientNpers += banqueOrgReportRecords[i].nPers;
                    this.clientNNour += banqueOrgReportRecords[i].nNour;
                    this.clientNBebe += banqueOrgReportRecords[i].nBebe;
                    this.clientNEnf += banqueOrgReportRecords[i].nEnf;
                    this.clientNAdo += banqueOrgReportRecords[i].nAdo;
                    this.clientN1824 += banqueOrgReportRecords[i].n1824;
                    this.clientNSen += banqueOrgReportRecords[i].nSen;
                    if (banqueOrgReportRecords[i].nonAgreed == 0) {
                        this.clientNbofOrgsAgreed+=  banqueOrgReportRecords[i].orgCount;
                        this.clientNFamAgreed += banqueOrgReportRecords[i].nFam;
                        this.clientNpersAgreed += banqueOrgReportRecords[i].nPers;
                        this.clientNNourAgreed += banqueOrgReportRecords[i].nNour;
                        this.clientNBebeAgreed += banqueOrgReportRecords[i].nBebe;
                        this.clientNEnfAgreed += banqueOrgReportRecords[i].nEnf;
                        this.clientNAdoAgreed += banqueOrgReportRecords[i].nAdo;
                        this.clientN1824Agreed += banqueOrgReportRecords[i].n1824;
                        this.clientNSenAgreed += banqueOrgReportRecords[i].nSen;
                    }
                    if (banqueOrgReportRecords[i].gestBen == 1) {
                        this.clientNbofOrgsGestBen+=  banqueOrgReportRecords[i].orgCount;
                        this.clientNFamGestBen += banqueOrgReportRecords[i].nFam;
                        this.clientNpersGestBen += banqueOrgReportRecords[i].nPers;
                        this.clientNNourGestBen += banqueOrgReportRecords[i].nNour;
                        this.clientNBebeGestBen += banqueOrgReportRecords[i].nBebe;
                        this.clientNEnfGestBen += banqueOrgReportRecords[i].nEnf;
                        this.clientNAdoGestBen += banqueOrgReportRecords[i].nAdo;
                        this.clientN1824GestBen += banqueOrgReportRecords[i].n1824;
                        this.clientNSenGestBen += banqueOrgReportRecords[i].nSen;
                    }
                }
                this.clientNAdults = this.clientNpers - this.clientNNour - this.clientNBebe - this.clientNEnf - this.clientNAdo - this.clientN1824 - this.clientNSen;
                this.clientNAdultsAgreed = this.clientNpersAgreed - this.clientNNourAgreed - this.clientNBebeAgreed - this.clientNEnfAgreed - this.clientNAdoAgreed - this.clientN1824Agreed - this.clientNSenAgreed;
                this.clientNAdultsGestBen = this.clientNpersGestBen - this.clientNNourGestBen - this.clientNBebeGestBen - this.clientNEnfGestBen - this.clientNAdoGestBen - this.clientN1824GestBen - this.clientNSenGestBen;
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
        console.log("setDropdownDays with " + this.dashboardBankItems.length + " bank items" + this.dashboardOrgItems.length + " org items");
        var bankDays = this.dashboardBankItems.map(x => x.key); // beware of the key is 'key' for aggregated bank items
        var orgDays = this.dashboardOrgItems.map(x => x.day); // beware of the key is 'day' for org items
        var allDays = bankDays.concat(orgDays).filter((v, i, a) => a.indexOf(v) === i); // remove duplicates
        this.days = allDays.sort().reverse();
        console.log("setDropdownDays with " + this.days.length + " days");
        this.filterDay(allDays[0]);
    }
    setDropdownOrgs() {
        console.log("setDropdownOrgs with " + this.dashboardOrgItems.length + " org items");
        var orgs = this.dashboardOrgItems.map(x => x.idOrg + ' ' + x.orgname).filter((v, i, a) => a.indexOf(v) === i); // remove duplicates

        this.orgs = this.dashboardOrgItems.sort(({idOrg:a}, {idOrg:b}) => a-b).map(x => x.idOrg + ' ' + x.orgname).filter((v, i, a) => a.indexOf(v) === i);
        this.orgs.unshift(" ");
        console.log("setDropdownOrgs with " + this.orgs.length + " orgs");
    }
    filterDay(myDay: string) {
        this.selectedDay = myDay;
        this.selectedOrg = " ";
        this.selectedBankItems = this.dashboardBankItems.filter(x => x.key === myDay);
        this.selectedOrgItems = this.dashboardOrgItems.filter(x => x.day === myDay);
    }
    filterOrg(myOrg: string) {
        this.selectedOrg = myOrg;
        this.selectedDay = " ";
        this.selectedBankItems = [];
        this.selectedOrgItems = this.dashboardOrgItems.filter(x => (x.idOrg + ' ' + x.orgname) === myOrg);
    }
    labelClientNbOfOrgs() {
        return $localize`:@@ClientNbOfOrgs:Number of Organizations`;
    }
    labelClientNFam() {
        return $localize`:@@ClientNFam:Families`;
    }
    labelClientNpers() {
        return $localize`:@@ClientNpers:Persons`;
    }
    labelClientAdults() {
        return $localize`:@@ClientAdults:Adults`;
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
    labelOrgsTotal() {
        return $localize`:@@OrgsTotal:All Organisations`;
    }
    labelOrgsAgreed() {
        return $localize`:@@OrgsAgreed:Agreed Organisations`;
    }
    labelOrgsGestBen() {
        return $localize`:@@OrgsGestBen:Organisations Recording Beneficiaries`;
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