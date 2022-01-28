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
import {BanqueEntityService} from '../../banques/services/banque-entity.service';
import {DatePipe} from '@angular/common';
import {QueryParams} from '@ngrx/data';

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
  bankShortName: string;
  constructor(
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>,
      private auditReportService: AuditReportService,
      private banqueService: BanqueEntityService,
      public datepipe: DatePipe
  ) {

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
        if (authState.user && (authState.user.rights === 'Admin_Banq')) {
            this.bankShortName = authState.banque.bankShortName;
            this.filterParams = { 'bankShortName': authState.banque.bankShortName};
            this.changeDateRangeFilter();
        }


        if (authState.user && (authState.user.rights === 'admin')) {
            this.filterParams = {};
            this.banqueService.getAll()
                .pipe(
                    tap((banquesEntities) => {
                        console.log('Banques now loaded:', banquesEntities);
                        this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
                        this.changeDateRangeFilter();
                    })
                ).subscribe();
        }
    }
    changeDateRangeFilter() {
        this.filterParams['fromDate'] = this.datepipe.transform(this.fromDate, 'yyyy-MM-dd');
        this.filterParams['toDate'] = this.datepipe.transform(this.toDate, 'yyyy-MM-dd');
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
          const reportLabels = [];
          const reportDataSets= [{
              label: 'Logins',
              backgroundColor: '#42A5F5',
              data: []
          }];
          // initialize first chart arrays
          this.auditReports.map((item ) => {

              reportLabels.push(item.key);
              reportDataSets[0].data.push(item.loginCount);
           });
            console.log('Loaded labels & report dataset is',reportLabels, reportDataSets);
          // now initialize to zero data in reports dataset

          this.chartData = {
            labels: reportLabels,
            datasets: reportDataSets
          }
          console.log('Final Chart Data is',this.chartData);
        });
  }

}
