import { Component, OnInit } from '@angular/core';
import {AuditReport} from '../model/auditreport';
import {AuthService} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {map, tap} from 'rxjs/operators';
import {AuditReportService} from '../services/audit-report.service';
import {AuthState} from '../../auth/reducers';
import {DatePipe} from '@angular/common';
import {QueryParams} from '@ngrx/data';
import {BanqueEntityService} from '../../banques/services/banque-entity.service';
import {BanqueOrgCountService} from '../../banques/services/banque-orgcount.service';
import {BanqueOrgCount} from '../../banques/model/banqueOrgCount';
import {enmYn} from '../../shared/enums';

@Component({
  selector: 'app-audit-report',
  templateUrl: './audit-report.component.html',
  styleUrls: ['./audit-report.component.css']
})
export class AuditReportComponent implements OnInit {
  auditReports : AuditReport[];
  horizontalOptions: any;
  stackedOptions: any;
  chartData: any;
  fromDate: any;
  toDate: Date;
  filterParams: QueryParams;
  bankOptions: any[];
  banqueOrgCounts: BanqueOrgCount[];
  banqueOrgFeadCounts: BanqueOrgCount[];
  bankShortName: string;
  viewOptions: any[];
  viewOption: any;
  feadOption: any;
  YNOptions:  any[];
  nbOfOrganisations : number;
  nbOfFeadOrganisations: number;
  title: string;
  constructor(
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>,
      private auditReportService: AuditReportService,
      private banqueService: BanqueEntityService,
      private banqueOrgCountService: BanqueOrgCountService,
      public datepipe: DatePipe
  ) {
      this.YNOptions = enmYn;
  }

  ngOnInit(): void {
      this.fromDate = new Date();
      this.fromDate.setDate(this.fromDate.getDate() - 30);
      this.toDate = new Date();
      this.toDate.setDate(this.toDate.getDate() + 1);
      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  this.initializeDependingOnUserRights(authState);
              })
          )
          .subscribe();

    this.horizontalOptions = {
      indexAxis: 'y',
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
        layout: {
            padding: {
                left: 100,
            },
        },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
  }
    private initializeDependingOnUserRights(authState: AuthState) {
        this.viewOption = 'general';
        if (authState.user && (authState.user.rights === 'Admin_Banq')) {
            this.bankShortName = authState.banque.bankShortName;
            this.filterParams = { 'bankShortName': authState.banque.bankShortName};
            this.viewOptions =  [
                {label: $localize`:@@General:General` , value:'general'},
                {label: $localize`:@@History:History` , value: 'history'},
            ];
            this.changeDateRangeFilter();
        }


        if (authState.user && (authState.user.rights === 'admin')) {
            this.filterParams = {};
            this.viewOptions =  [
                {label: $localize`:@@General:General` , value: 'general'},
                {label: $localize`:@@History:History` , value: 'history'},
                {label: $localize`:@@Usage:Usage` , value: 'usage' },
            ];
            this.banqueService.getAll()
                .pipe(
                    tap((banquesEntities) => {
                    console.log('Banques now loaded:', banquesEntities);
                    this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
                        this.changeDateRangeFilter();
                    })
                ).subscribe();
            this.nbOfOrganisations = 0;
            this.nbOfFeadOrganisations = 0;
            this.banqueOrgCountService.getOrgCountReport(this.authService.accessToken,false)
                .pipe(
                    tap((banqueOrgCounts) => {
                        console.log('BanqueOrgCounts now loaded:', banqueOrgCounts);
                        this.banqueOrgCounts = banqueOrgCounts;
                        this.banqueOrgCounts.forEach(item => this.nbOfOrganisations += item.orgCount);
                    })
                ).subscribe();
            this.banqueOrgCountService.getOrgCountReport(this.authService.accessToken,true)
                .pipe(
                    tap((banqueOrgCounts) => {
                        console.log('BanqueOrgFeadCounts now loaded:', banqueOrgCounts);
                        this.banqueOrgFeadCounts = banqueOrgCounts;
                        this.banqueOrgFeadCounts.forEach(item => this.nbOfFeadOrganisations += item.orgCount);

                    })
                ).subscribe();
        }
    }
    changeDateRangeFilter() {
        this.filterParams['fromDate'] = this.datepipe.transform(this.fromDate, 'yyyy-MM-dd');
        this.filterParams['toDate'] = this.datepipe.transform(this.toDate, 'yyyy-MM-dd');
        this.report(null);
    }
    changeFilter() {
      console.log('Audit Option Selected:',this.viewOption)
        // remove previous filters
        if (this.filterParams.hasOwnProperty('byDate')) {
            delete this.filterParams['byDate'];
        }
        if (this.filterParams.hasOwnProperty('byUsage')) {
            delete this.filterParams['byUsage'];
        }

       if (this.viewOption === 'history')
        {
            this.filterParams['byDate'] = '1';
        }
        if (this.viewOption === 'usage')
        {
            this.filterParams['byUsage'] = '1';
            if ((!this.bankShortName) && ( this.filterParams.hasOwnProperty('bankShortName'))) {
                delete this.filterParams['bankShortName'];
            }
        }
        this.report(null);

    }
  report(event: any) {
      console.log('Audit Report Started', event);
    if (event)  {
        this.filterParams['bankShortName']= event;
    }
    else {
        if ((!this.bankShortName) && ( this.filterParams.hasOwnProperty('bankShortName'))) {
            delete this.filterParams['bankShortName'];
        }
    }
    this.auditReportService.getAuditReport(this.authService.accessToken, this.filterParams).subscribe(
        (response: AuditReport[]) => {
          this.auditReports = response;
          if (this.viewOption === 'usage') {
              let nbOfSelectedLogins = 0;
              let nbOfSelectedOrganisations = 0;
              const reportLabels = [];
              const reportDataSets = [
                  {
                      label: 'NB Organisations',
                      backgroundColor: '#42A5F5',
                      data: []
                  },
                  {
                      label: 'NB Organisations Using Foodbanks IT',
                      backgroundColor: '#FFA726',
                      data: []
                  },
              ];
              console.log('Fead Option',this.feadOption);
              let selectedBanqueOrgCounts = this.banqueOrgCounts;
              if (this.feadOption) {
                  selectedBanqueOrgCounts = this.banqueOrgFeadCounts;
              }
              selectedBanqueOrgCounts.map((item) => {
                  reportLabels.push(item.bankShortName);
                  reportDataSets[0].data.push(item.orgCount);
                  reportDataSets[1].data.push(0);


              })
              this.auditReports.map((item) => {

                  const indexItem = reportLabels.indexOf(item.key);
                  if (indexItem >= 0) {
                      reportDataSets[1].data[indexItem]++;
                      nbOfSelectedLogins += item.loginCount;
                      nbOfSelectedOrganisations ++ ;
                  }

              })
              let nbOrgs = this.nbOfOrganisations;
              if (this.feadOption) {
                  nbOrgs = this.nbOfFeadOrganisations;
              }
              this.title = `There are ${nbOfSelectedLogins} logins for ${nbOfSelectedOrganisations} organisations out of ${nbOrgs}`;
              this.chartData = {
                  labels: reportLabels,
                  datasets: reportDataSets
              }
          }
          else {
              let nbOfSelectedFBITLogins = 0;
              let nbOfSelectedPHPLogins = 0;

              const reportLabels = [];
              const reportDataSets = [
                  {
                      label: 'PHP',
                      backgroundColor: '#42A5F5',
                      data: []
                  },
                  {
                      label: 'FBIT',
                      backgroundColor: '#FFA726',
                      data: []
                  },
              ];
              // initialize first chart arrays
              this.auditReports.map((item) => {
                  if ((item.key === null) || (item.key === "0")) {
                      item.key = "Bank";
                  }
                  // reportLabels.push(item.key);
                  // reportDataSets[0].data.push(item.loginCount);
                  if (!reportLabels.includes(item.key)) {
                      reportLabels.push(item.key);
                      if (item.application === "FBIT") {
                          reportDataSets[1].data.push(item.loginCount);
                          reportDataSets[0].data.push(0);
                          nbOfSelectedFBITLogins += item.loginCount;
                      } else {
                          reportDataSets[0].data.push(item.loginCount);
                          reportDataSets[1].data.push(0);
                          nbOfSelectedPHPLogins += item.loginCount;
                      }
                  } else {
                      const indexItem = reportLabels.indexOf(item.key);
                      if (item.application === "FBIT") {
                          reportDataSets[1].data[indexItem] = item.loginCount;
                          nbOfSelectedFBITLogins += item.loginCount;
                      } else {
                          reportDataSets[0].data[indexItem] = item.loginCount;
                          nbOfSelectedPHPLogins += item.loginCount;
                      }
                  }

              });
              this.title = `There are ${nbOfSelectedPHPLogins} PHP logins and ${nbOfSelectedFBITLogins} FBIT logins`;
              this.chartData = {
                  labels: reportLabels,
                  datasets: reportDataSets
              }
          }

        });
  }


}
