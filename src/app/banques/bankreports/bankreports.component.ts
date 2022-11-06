import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {BanqueReportService} from '../services/banque-report.service';
import {AuthState} from '../../auth/reducers';
import {BanqueEntityService} from '../services/banque-entity.service';
import {BanqueCount} from '../model/banqueCount';
import {BanqueOrgCount} from '../model/banqueOrgCount';
import {formatDate} from '@angular/common';
import {ExcelService} from '../../services/excel.service';

@Component({
  selector: 'app-bankreports',
  templateUrl: './bankreports.component.html',
  styleUrls: ['./bankreports.component.css']
})
export class BankreportsComponent implements OnInit {
  booIsLoaded: boolean;
  basicOptions: any;
  stackedOptions: any;
  pieOptions: any;

  chartDataOrgCount: any;
  chartDataMembreCount: any;
  chartDataUserCount: any;
  bankOptions: any[];
  backgroundColors: any[];

  titleOrganisations: string;
  titleMembres: string;
  titleUsers: string;
  constructor(
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>,
      private banqueReportService: BanqueReportService,
      private banqueService: BanqueEntityService,
      private excelService: ExcelService,
  ) {
   this.backgroundColors = ['magenta','violet','indigo','blue','x0080ff','cyan','green','olive','yellow','orange','red','darkred', 'black','silver'];
    // x0080ff dodger blue
  }

  ngOnInit(): void {
     this.booIsLoaded = false;
     this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.initializeDependingOnUserRights(authState);
            })
        )
        .subscribe();
      this.basicOptions = {
          tooltips: {
              mode: 'index',
              intersect: false
          },
          responsive: true,
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
    this.pieOptions = {
        tooltips: {
            mode: 'index',
            intersect: false
        },
        responsive: true,
    }
  }
  private initializeDependingOnUserRights(authState: AuthState) {

      const classicBanks = { 'classicBanks': '1' };
      this.banqueService.getWithQuery(classicBanks)
          .subscribe((banquesEntities) => {
            console.log('Banques now loaded:', banquesEntities);
            this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
            if (! this.booIsLoaded) {
                this.report();
            }
              this.booIsLoaded = true;
          });


  }

  report() {
      this.reportOrganisations();
      this.reportMembres();
      this.reportUsers();

  }
  reportOrganisations() {
      this.banqueReportService.getOrgCountReport(this.authService.accessToken, false).subscribe(
          (response: BanqueCount[]) => {
              const banqueOrgCounts: BanqueCount[] = response;
              let reportLabels = [];
              let reportDataSets = [];
              reportDataSets.push(
                  {
                      label:  $localize`:@@organisations:Organisations`,
                      data: [],
                      backgroundColor: []
                  }
              )
              let colorIndex=0;
              let totalCount =0;
              for (let i=0; i < banqueOrgCounts.length; i++ ) {
                  const bankOptionIndex = this.bankOptions.findIndex(obj => obj.label === banqueOrgCounts[i].bankShortName );
                  if (bankOptionIndex === -1) continue;
                      totalCount += banqueOrgCounts[i].count;
                      reportLabels.push( banqueOrgCounts[i].bankShortName);
                      reportDataSets[0].data.push(banqueOrgCounts[i].count);
                      reportDataSets[0].backgroundColor.push(this.backgroundColors[colorIndex]) ;
                      colorIndex++;
                      if (colorIndex >= this.backgroundColors.length) {
                          console.log('Not enough colors in backgroundColors array');
                          colorIndex=0;
                      }
                  }

              this.titleOrganisations = $localize`:@@OrgStatOrganisations:Total Organisations: ${totalCount}`;
              this.chartDataOrgCount = {
                  labels: reportLabels,
                  datasets: reportDataSets
              }

          })
  }
    reportMembres() {
        this.banqueReportService.getMembreCountReport(this.authService.accessToken).subscribe(
            (response: BanqueOrgCount[]) => {
                const bankMemberCounts: BanqueOrgCount[] = response;
                let reportLabels = [];
                let reportDataSets = [];
                reportDataSets.push(
                    {
                        type: 'bar',
                        label: $localize`:@@BankMembers:Bank Members`,
                        backgroundColor: 'Red',
                        data: []
                    },
                    {
                        type: 'bar',
                        label: $localize`:@@OrgMembers:Org Members`,
                        backgroundColor: 'Blue',
                        data: []
                    },
                )

                let totalBankMembers=0;
                let totalOrgMembers=0;
                for (let i=0; i < bankMemberCounts.length; i++ ) {
                    const bankOptionIndex = this.bankOptions.findIndex(obj => obj.label === bankMemberCounts[i].bankShortName );
                    if (bankOptionIndex === -1) continue;
                    totalBankMembers += bankMemberCounts[i].bankCount
                    totalOrgMembers += bankMemberCounts[i].orgCount
                    reportLabels.push( bankMemberCounts[i].bankShortName);
                    reportDataSets[0].data.push(bankMemberCounts[i].bankCount);
                    reportDataSets[1].data.push(bankMemberCounts[i].orgCount);
                }

                this.titleMembres = $localize`:@@MembreStatMembres:Total Members - Bank : ${totalBankMembers} - Orgs: ${totalOrgMembers}`;
                this.chartDataMembreCount = {
                    labels: reportLabels,
                    datasets: reportDataSets
                }

            })
    }
    reportUsers() {
        this.banqueReportService.getUserCountReport(this.authService.accessToken).subscribe(
            (response: BanqueOrgCount[]) => {
                const bankUserCounts: BanqueOrgCount[] = response;
                let reportLabels = [];
                let reportDataSets = [];
                reportDataSets.push(
                    {
                        type: 'bar',
                        label: $localize`:@@BankUsers:Bank Users`,
                        backgroundColor: 'Red',
                        data: []
                    },
                    {
                        type: 'bar',
                        label: $localize`:@@OrgUsers:Org Users`,
                        backgroundColor: 'Blue',
                        data: []
                    },
                )

                let totalBankUsers=0;
                let totalOrgUsers=0;
                for (let i=0; i < bankUserCounts.length; i++ ) {
                    const bankOptionIndex = this.bankOptions.findIndex(obj => obj.label === bankUserCounts[i].bankShortName );
                    if (bankOptionIndex === -1) continue;
                    totalBankUsers += bankUserCounts[i].bankCount
                    totalOrgUsers += bankUserCounts[i].orgCount
                    reportLabels.push( bankUserCounts[i].bankShortName);
                    reportDataSets[0].data.push(bankUserCounts[i].bankCount);
                    reportDataSets[1].data.push(bankUserCounts[i].orgCount);
                }

                this.titleUsers = $localize`:@@UserStatUsers:Total Users - Bank : ${totalBankUsers} - Orgs: ${totalOrgUsers}`;
                this.chartDataUserCount = {
                    labels: reportLabels,
                    datasets: reportDataSets
                }



            })
    }


    exportAsXLSX() {

        const exportListOrgs = [];
        exportListOrgs.push([$localize`:@@Bank:Bank`,$localize`:@@Organisations:Organisations`,
            $localize`:@@UsersBank:Bank Users` ,$localize`:@@UsersOrg:Org Users`,  $localize`:@@MembersBank:Bank Members`,  $localize`:@@MembersOrg:Org Members`]);
        for (let i=0; i < this.chartDataOrgCount.labels.length; i++ ) {
            const line = [this.chartDataOrgCount.labels[i]];
            line.push(this.chartDataOrgCount.datasets[0].data[i]);
            line.push(this.chartDataUserCount.datasets[0].data[i]);
            line.push(this.chartDataUserCount.datasets[1].data[i]);
            line.push(this.chartDataMembreCount.datasets[0].data[i]);
            line.push(this.chartDataMembreCount.datasets[1].data[i]);
            exportListOrgs.push(line);
        }
        this.excelService.exportAsExcelFile(exportListOrgs, 'foodit.organisationStatistics.' + formatDate(new Date(),'ddMMyyyy.HHmm','en-US') + '.xlsx');

    }
}
