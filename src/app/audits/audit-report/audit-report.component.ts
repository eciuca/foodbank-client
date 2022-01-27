import { Component, OnInit } from '@angular/core';
import {AuditReport} from '../model/auditreport';
import {AuthService} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {AuditReportService} from '../services/audit-report.service';

@Component({
  selector: 'app-audit-report',
  templateUrl: './audit-report.component.html',
  styleUrls: ['./audit-report.component.css']
})
export class AuditReportComponent implements OnInit {
  auditReports : AuditReport[];
  shortBankName: string;
  horizontalOptions: any;
  stackedOptions: any;
  reportType: string;
  chartData: any;
  constructor(
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>,
      private auditReportService: AuditReportService
  ) {
    this.shortBankName = '';
    this.reportType = 'Overview';
  }

  ngOnInit(): void {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.shortBankName = authState.banque.bankShortName;
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
    this.report(null);
  }
  report(event: any) {
    this.auditReportService.getAuditReport(this.authService.accessToken, this.reportType).subscribe(
        (response: AuditReport[]) => {
          this.auditReports = response;
          const reportLabels = [];
          const reportDataSets= [];
          // initialize first chart arrays
          this.auditReports.map((item ) => {
            if (!reportLabels.includes(item.societe)) {
              reportLabels.push(item.societe);
            }
            if (!reportDataSets.findIndex(x => x.label === item.societe)) {
              reportDataSets.push(
                  {
                    label: item.societe,
                    data: []
                  });
            }
            });
            console.log('PreInitialized labels & report dataset is',reportLabels, reportDataSets);
          // now initialize to zero data in reports dataset
          for (let i = 0; i < reportLabels.length; i++) {
            reportDataSets.forEach((dataset) => {
              dataset.data.push(0);
            })
          }
          console.log('Initialized report dataset is',reportDataSets);
          // now fill in the data
          this.auditReports.map((item ) => {
              const indexLabel = reportLabels.indexOf(item.date);
              const indexDataset = reportDataSets.findIndex(x => x.label === item.societe);
              reportDataSets[indexLabel].data[indexDataset] = item.loginCount;
          });
          this.chartData = {
            labels: reportLabels,
            datasets: reportDataSets
          }
          console.log('Final Chart Data is',this.chartData);
        });
  }

}
