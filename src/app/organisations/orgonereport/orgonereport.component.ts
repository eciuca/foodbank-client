import {Component, OnInit} from '@angular/core';
import {OrgReportService} from '../services/org-report.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Router} from '@angular/router';
import {AuthService} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {OrgBeneficiaryReport} from '../model/orgbeneficiaryreport';

@Component({
  selector: 'app-orgonereport',
  templateUrl: './orgonereport.component.html',
  styleUrls: ['./orgonereport.component.css']
})
export class OrgOneReportComponent implements OnInit {
  idDis: number;
  beneficiaryData: any;
  chartOptions: any;
  constructor(
      private messageService: MessageService,
      private confirmationService: ConfirmationService,
      private router: Router,
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>,
      private orgReportService: OrgReportService
  ) {
    this.idDis = 0;
  }

  ngOnInit(): void {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.idDis = authState.organisation.idDis;
            })
        )
        .subscribe();
    this.orgReportService.getBeneficiaryReportForOrg(this.authService.accessToken, this.idDis).subscribe(
        (report: OrgBeneficiaryReport) => {
          const nbAdults = report.nPers - report.nNour - report.nBebe - report.nEnf - report.nAdo - report.n1824 - report.nSen;
          this.beneficiaryData = {
            labels: ['Infants', 'Babies', 'Children', 'Ados', 'Young Adults(18-24)', 'Adults', 'Seniors'],
            datasets: [
              {
                data: [report.nNour, report.nBebe, report.nEnf, report.nAdo, report.n1824, Math.max(nbAdults, 0), report.nSen],
                backgroundColor: [
                  '#FF0000',  // red
                  '#FF7F00',  // orange
                  '#FFF101',  // yellow
                  '#04F404',  // green
                  '#99CCFF',  // light blue
                  '#5D6FD3',  // indigo,
                  '#000000'  // black
                ],
                hoverBackgroundColor: [
                  '#FF0000',  // red
                  '#FF7F00',  // orange
                  '#FFF101',  // yellow
                  '#04F404',  // green
                  '#99CCFF',  // light blue
                  '#5D6FD3',  // indigo,
                  '#000000'  // black
                ]
              }
            ]
          };
        });
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      }
    };
  }

}
