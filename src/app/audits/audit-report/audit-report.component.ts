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
  booShowByDate: boolean
  constructor(
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>,
      private auditReportService: AuditReportService,
      private banqueService: BanqueEntityService,
      public datepipe: DatePipe
  ) {
     this.booShowByDate = false;
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
    changeByDateFilter($event: any) {
        this.booShowByDate = $event.checked;
        if (this.booShowByDate) {
            this.filterParams['byDate'] = '1';
        }
        else {
            if (this.filterParams.hasOwnProperty('byDate')) {
                delete this.filterParams['byDate'];
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
          const reportLabels = [];
          const reportDataSets= [
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
          this.auditReports.map((item ) => {
              if ((item.key === null ) || (item.key === "0")) {
                  item.key = "Bank";
              }
              // reportLabels.push(item.key);
              // reportDataSets[0].data.push(item.loginCount);
              if (!reportLabels.includes(item.key)) {
                  reportLabels.push(item.key);
                  if (item.application === "FBIT") {
                      reportDataSets[1].data.push(item.loginCount);
                      reportDataSets[0].data.push(0);
                  } else {
                      reportDataSets[0].data.push(item.loginCount);
                      reportDataSets[1].data.push(0);
                  }
              } else {
                  const indexItem = reportLabels.indexOf(item.key);
                  if (item.application === "FBIT") {
                      reportDataSets[1].data[indexItem] = item.loginCount;
                  } else {
                      reportDataSets[0].data[indexItem] = item.loginCount;
                  }
              }

           });

          this.chartData = {
            labels: reportLabels,
            datasets: reportDataSets
          }

        });
  }


}
