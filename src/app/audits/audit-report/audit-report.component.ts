import {Component, OnInit} from '@angular/core';
import {AuditReport} from '../model/auditreport';
import {AuthService} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {map, tap} from 'rxjs/operators';
import {AuditReportService} from '../services/audit-report.service';
import {BanqueReportService} from '../../banques/services/banque-report.service';
import {AuthState} from '../../auth/reducers';
import {DatePipe} from '@angular/common';
import {QueryParams} from '@ngrx/data';
import {BanqueEntityService} from '../../banques/services/banque-entity.service';
import {BanqueCount} from '../../banques/model/banqueCount';
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
  banqueOrgCounts: BanqueCount[];
  banqueOrgFeadCounts: BanqueCount[];
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
      private banqueReportService: BanqueReportService,
      public datepipe: DatePipe
  ) {
      this.YNOptions = enmYn;
      this.viewOption = 'general';
      this.filterParams = {'reportType':'general'};
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
  }
    private initializeDependingOnUserRights(authState: AuthState) {

        if (authState.user && (authState.user.rights === 'Admin_Banq')) {
            this.bankShortName = authState.banque.bankShortName;
            this.filterParams[ 'bankShortName'] = authState.banque.bankShortName;
            this.viewOptions =  [
                {label: $localize`:@@General:General` , value:'general'},
                {label: $localize`:@@History:History` , value: 'history'},
            ];
            this.changeDateRangeFilter();
        }


        if (['Admin_FBBA','Bank_FBBA','admin'].includes(authState.user.rights)) {

            this.viewOptions =  [
                {label: $localize`:@@General:General` , value: 'general'},
                {label: $localize`:@@History:History` , value: 'history'},
                {label: $localize`:@@Usage:Usage` , value: 'usage' },
                {label: $localize`:@@Rights:Rights` , value: 'rights' },
            ];
            const classicBanks = { 'classicBanks': '1' };
            this.banqueService.getWithQuery(classicBanks)
                .subscribe((banquesEntities) => {
                    console.log('Banques now loaded:', banquesEntities);
                    this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
                        this.changeDateRangeFilter();
                    });
            this.nbOfOrganisations = 0;
            this.nbOfFeadOrganisations = 0;
            this.banqueReportService.getOrgCountReport(this.authService.accessToken,false)
                .subscribe((banqueOrgCounts) => {
                        console.log('BanqueOrgCounts now loaded:', banqueOrgCounts);
                        this.banqueOrgCounts = banqueOrgCounts;
                        this.banqueOrgCounts.forEach(item => this.nbOfOrganisations += item.count);
                    });
            this.banqueReportService.getOrgCountReport(this.authService.accessToken,true)
                .pipe(
                    tap((banqueOrgCounts) => {
                        console.log('BanqueOrgFeadCounts now loaded:', banqueOrgCounts);
                        this.banqueOrgFeadCounts = banqueOrgCounts;
                        this.banqueOrgFeadCounts.forEach(item => this.nbOfFeadOrganisations += item.count);

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

        this.filterParams['reportType'] = this.viewOption;

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
            let reportLabels = [];
            let reportDataSets = [];
         switch(this.viewOption) {
             case 'usage':
                 let nbOfSelectedLogins = 0;
                 let nbOfSelectedOrganisations = 0;
                 reportDataSets = [
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
                 console.log('Fead Option', this.feadOption);
                 let selectedBanqueOrgCounts = this.banqueOrgCounts;
                 if (this.feadOption) {
                     selectedBanqueOrgCounts = this.banqueOrgFeadCounts;
                 }
                 selectedBanqueOrgCounts.map((item) => {
                     reportLabels.push(item.bankShortName);
                     reportDataSets[0].data.push(item.count);
                     reportDataSets[1].data.push(0);


                 })
                 this.auditReports.map((item) => {

                     const indexItem = reportLabels.indexOf(item.key);
                     if (indexItem >= 0) {
                         reportDataSets[1].data[indexItem]++;
                         nbOfSelectedLogins += item.loginCount;
                         nbOfSelectedOrganisations++;
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
                 break;
             case 'general':
             case 'history':
                 let nbOfSelectedFBITLogins = 0;
                 let nbOfSelectedPHPLogins = 0;

                 reportDataSets = [
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
                         if (this.viewOption === 'history' ||
                             (this.viewOption === 'general' && (this.filterParams.hasOwnProperty('bankShortName') || (!this.bankOptions ) ||
                                 (this.bankOptions.find(opt => opt.label === item.key) )))) {
                             reportLabels.push(item.key);

                             if (item.category === "FBIT") {
                                 reportDataSets[1].data.push(item.loginCount);
                                 reportDataSets[0].data.push(0);
                                 nbOfSelectedFBITLogins += item.loginCount;
                             } else {
                                 reportDataSets[0].data.push(item.loginCount);
                                 reportDataSets[1].data.push(0);
                                 nbOfSelectedPHPLogins += item.loginCount;
                             }
                         }
                     } else {
                         const indexItem = reportLabels.indexOf(item.key);
                         if (item.category === "FBIT") {
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
                 break;
             case 'rights':
                 reportDataSets = [
                     {
                         type: 'bar',
                         label: 'Admin_Banq',
                         backgroundColor: 'Red',
                         data: []
                     },
                     {
                         type: 'bar',
                         label: 'Bank',
                         backgroundColor: 'Orange',
                         data: []
                     },
                     {
                         type: 'bar',
                         label: 'Admin_Asso',
                         backgroundColor: 'Blue',
                         data: []
                     },
                     {
                         type: 'bar',
                         label: 'Asso',
                         backgroundColor: '#ADD8E6', // light blue
                         data: []
                     },
                     {
                         type: 'bar',
                         label: 'admin',
                         backgroundColor: 'Green',
                         data: []
                     },
                     {
                         type: 'bar',
                         label: 'Admin_FEAD',
                         backgroundColor: '#90EE90', // light green
                         data: []
                     },
                     {
                         type: 'bar',
                         label: 'ADMIN_EXT',
                         backgroundColor: 'Yellow',
                         data: []
                     },
                     {
                         type: 'bar',
                         label: 'Admin_CPAS',
                         backgroundColor: 'Indigo',
                         data: []
                     },
                     {
                         type: 'bar',
                         label: 'Admin_FBBA',
                         backgroundColor: 'Black',
                         data: []
                     },
                     {
                         label: 'Bank_FBBA',
                         backgroundColor: 'Grey',
                         data: []
                     },
                     {
                         type: 'bar',
                         label: 'Other',
                         backgroundColor: 'Brown',
                         data: []
                     },
                 ];

                 this.bankOptions.map((option) => {
                     reportLabels.push(option.value);
                 })
                 reportDataSets.map((dataSetitem) => {
                     for (let i=0; i < this.bankOptions.length; i++ ) {
                         dataSetitem.data.push(0);
                     }
                 })
                 console.log( 'initialized chart data', reportLabels,  reportDataSets);
                 for (let i=0; i < this.auditReports.length; i++ ) {
                     if (this.auditReports[i].key === null ) continue;
                     const indexLabel = reportLabels.indexOf(this.auditReports[i].key);
                     let indexDataset = reportDataSets.findIndex(item => item.label.toUpperCase() === this.auditReports[i].category.toUpperCase());
                     if( indexDataset === -1) { indexDataset = reportDataSets.length - 1 } // Assign to Other
                     console.log(this.auditReports[i],'indexLabel', indexLabel, 'indexDataset',indexDataset);
                     if (indexLabel >= 0 && indexDataset >= 0 && indexLabel < reportLabels.length && indexDataset < reportDataSets.length) {
                         reportDataSets[indexDataset].data[indexLabel] += this.auditReports[i].loginCount;
                     }
                     else {
                         console.log('can not create a audit report entry for item', this.auditReports[i],indexLabel,indexDataset);
                     }
                 }
                 this.title = `Breakdown by User Rights`;
                 this.chartData = {
                     labels: reportLabels,
                     datasets: reportDataSets
                 }
                 break;
             default:
                 console.log('Unknown audit report option:', this.viewOption);
         }


        });
  }


}
