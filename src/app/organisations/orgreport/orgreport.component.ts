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
import {OrgMemberReport} from '../model/orgmemberreport';
import {OrgBeneficiaryReport} from '../model/orgbeneficiaryreport';

@Component({
  selector: 'app-orgreport',
  templateUrl: './orgreport.component.html',
  styleUrls: ['./orgreport.component.css']
})
export class OrgReportComponent implements OnInit {
    bankid: number;
   // memberData: any;  Report to be revisited
    beneficiaryData: any;
    orgMemberReports: OrgMemberReport[];
    orgBeneficiaryReports: OrgBeneficiaryReport[];
    horizontalOptions: any;
    stackedOptions: any;
  constructor(private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private router: Router,
              private authService: AuthService,
              private http: HttpClient,
              private store: Store<AppState>,
              private orgReportService: OrgReportService) {
      this.bankid = 0;
  }

  ngOnInit(): void {
     this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  this.bankid = authState.banque.bankId;
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
      /* Report to be revisited
    console.log('Entering Organisation Report', event );
    this.orgReportService.getMemberReport(this.authService.accessToken, this.bankid).subscribe(
          (response: OrgMemberReport[]) => {
             this.orgMemberReports = response;
             const reportLabels = [];
                 this.orgMemberReports.map((item ) => { reportLabels.push( item.societe); });     // pluck('societe');
             const reportValues =  [];
              this.orgMemberReports.map((item ) => { reportValues.push( item.nbMembers); });
              this.memberData = {
                 labels: reportLabels,
                 datasets: [
                     {
                         label: 'Members by Organisations',
                         backgroundColor: '#42A5F5',
                         data: reportValues
                     }
                 ]
             };
          },
          (err: any) => {
            console.log(err);
            let errorMsg = '';
            if (err.error && err.error.message) {
              errorMsg = err.error.message;
            }
            this.messageService.add({
              severity: 'error',
              summary: $localize`:@@MemberReportError:Report on Organisation Members Failed`,
              detail: $localize`:@@MemberReportErrorDetail:Report on Organisation Members. ${errorMsg} `,
              life: 6000
            });
          });
    */
      this.orgReportService.getBeneficiaryReport(this.authService.accessToken, this.bankid).subscribe(
          (response: OrgBeneficiaryReport[]) => {
              this.orgBeneficiaryReports = response;
              const reportLabels = [];
              this.orgBeneficiaryReports.map((item ) => { reportLabels.push( item.societe); });     // pluck('societe');
              const nNourValues = [];
              const nBabyValues = [];
              const nChildrenValues = [];
              const nAdoValues = [];
              const n1814Values = [];
              const nAdultValues = [];
              const nSeniorValues = [];
              this.orgBeneficiaryReports.map((item ) => {
                  const nbAdults = item.nPers - item.nNour - item.nBebe - item.nEnf - item.nAdo - item.n1824 - item.nSen;
                  nNourValues.push( item.nNour);
                  nBabyValues.push( item.nBebe);
                  nChildrenValues.push(item.nEnf);
                  nAdoValues.push(item.nAdo);
                  n1814Values.push(item.n1824);
                  nAdultValues.push( Math.max(nbAdults, 0));
                  nSeniorValues.push(item.nSen);
              });
              this.beneficiaryData = {
                  labels: reportLabels,
                  datasets: [
                      {
                          type: 'bar',
                          label: 'Infants',
                          backgroundColor: '#FF0000', // Red
                          data: nNourValues
                      },
                      {
                          type: 'bar',
                          label: 'Babies',
                          backgroundColor: '#FF7F00', // Orange
                          data: nBabyValues
                      },
                      {
                          type: 'bar',
                          label: 'Children',
                          backgroundColor: '#FFF101', // yellow
                          data: nChildrenValues
                      },
                      {
                          type: 'bar',
                          label: 'Ados',
                          backgroundColor: '#04F404', // green
                          data: nAdoValues
                      },
                      {
                          type: 'bar',
                          label: 'Young Adults(18-24)',
                          backgroundColor: '#99CCFF',  // light blue
                          data: n1814Values
                      },
                      {
                          type: 'bar',
                          label: 'Adults',
                          backgroundColor: '#5D6FD3', // indigo
                          data: nAdultValues
                      }, {
                          type: 'bar',
                          label: 'Seniors',
                          backgroundColor: '#000000', // black
                          data: nSeniorValues
                      }
                  ]
              };

              this.stackedOptions = {
                  tooltips: {
                      mode: 'index',
                      intersect: false
                  },
                  responsive: true,
                  scales: {
                      xAxes: [{
                          stacked: true,
                      }],
                      yAxes: [{
                          stacked: true
                      }]
                  }
              };

          },
          (err: any) => {
              console.log(err);
              let errorMsg = '';
              if (err.error && err.error.message) {
                  errorMsg = err.error.message;
              }
              this.messageService.add({
                  severity: 'error',
                  summary: $localize`:@@MemberReportError:Report on Organisation Members Failed`,
                  detail: $localize`:@@MemberReportErrorDetail:Report on Organisation Members. ${errorMsg} `,
                  life: 6000
              });
          });
  }
}
