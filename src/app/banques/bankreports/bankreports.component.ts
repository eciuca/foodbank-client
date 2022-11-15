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
import {BanqueOrgCount} from '../model/banqueOrgCount';
import {formatDate} from '@angular/common';
import {ExcelService} from '../../services/excel.service';
import {BanqueFeadReport} from '../model/banqueFeadReport';

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
  titleOrganisations: string;
  titleMembres: string;
  titleUsers: string;
  reportLabels: string[];
  constructor(
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>,
      private banqueReportService: BanqueReportService,
      private banqueService: BanqueEntityService,
      private excelService: ExcelService,
  ) {
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
     this.reportLabels = [];
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

  }
  private initializeDependingOnUserRights(authState: AuthState) {

      const classicBanks = { 'classicBanks': '1' };
      this.banqueService.getWithQuery(classicBanks)
          .subscribe((banquesEntities) => {
            console.log('Banques now loaded:', banquesEntities);
            if (! this.booIsLoaded) {
                this.reportLabels = banquesEntities.map(({bankShortName}) => bankShortName);
                this.report();
            }
              this.booIsLoaded = true;
          });


  }

  report() {
      this.reportFead();
      this.reportMembres();
      this.reportUsers();

  }
    reportFead() {
        this.banqueReportService.getOrgFeadReport(this.authService.accessToken).subscribe(
            (response: BanqueFeadReport[]) => {
                const banqueOrgFeadRecords:  BanqueFeadReport[] = response;


                let reportDataSetsByCategory = [
                    {
                        type: 'bar',
                        label: $localize`:@@organisations:Organisations`,
                        backgroundColor: 'Red',
                        data: []
                    },
                    {
                        type: 'bar',
                        label: $localize`:@@OrgStatAgreed:Agreed`,
                        backgroundColor: 'Blue',
                        data: []
                    },
                    {
                        type: 'bar',
                        label: $localize`:@@OrgStatFead:Fead`,
                        backgroundColor: 'Green',
                        data: []
                    },
                    {
                        type: 'bar',
                        label: $localize`:@@OrgStatFromUs:FromUs`,
                        backgroundColor: 'Yellow',
                        data: []
                    },
                ];

                reportDataSetsByCategory.map((dataSetitem) => {
                    for (let i=0; i < this.reportLabels.length; i++ ) {
                        dataSetitem.data.push(0);
                    }
                })
                let totalCount = 0;
                let totalAgreedCount = 0;
                let totalFeadCount = 0;
                let totalFeadFromUsCount = 0;
                for (let i=0; i < banqueOrgFeadRecords.length; i++ ) {

                    const indexLabel = this.reportLabels.indexOf(banqueOrgFeadRecords[i].bankShortName);
                    if (indexLabel === -1) continue;
                    totalCount += banqueOrgFeadRecords[i].orgCount;
                    totalAgreedCount += banqueOrgFeadRecords[i].orgAgreedCount;
                    totalFeadCount += banqueOrgFeadRecords[i].orgFeadCount;
                    totalFeadFromUsCount += banqueOrgFeadRecords[i].orgFeadFromUsCount;
                    reportDataSetsByCategory[0].data[indexLabel] += banqueOrgFeadRecords[i].orgCount;
                    reportDataSetsByCategory[1].data[indexLabel] += banqueOrgFeadRecords[i].orgAgreedCount;
                    reportDataSetsByCategory[2].data[indexLabel] += banqueOrgFeadRecords[i].orgFeadCount;
                    reportDataSetsByCategory[3].data[indexLabel] += banqueOrgFeadRecords[i].orgFeadFromUsCount;

                }
                this.titleOrganisations = $localize`:@@OrgStatOrganisations:Organisations: ${totalCount} Agreed: ${totalAgreedCount} Fead: ${totalFeadCount} From Us ${totalFeadFromUsCount}`;
                this.chartDataOrgCount = {
                    labels: this.reportLabels,
                    datasets: reportDataSetsByCategory
              }
          })
  }
    reportMembres() {
        this.banqueReportService.getMembreCountReport(this.authService.accessToken).subscribe(
            (response: BanqueOrgCount[]) => {
                const bankMemberCounts: BanqueOrgCount[] = response;
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
                reportDataSets.map((dataSetitem) => {
                    for (let i=0; i < this.reportLabels.length; i++ ) {
                        dataSetitem.data.push(0);
                    }
                })

                let totalBankMembers=0;
                let totalOrgMembers=0;
                for (let i=0; i < bankMemberCounts.length; i++ ) {
                    const bankOptionIndex = this.reportLabels.indexOf(bankMemberCounts[i].bankShortName );
                    if (bankOptionIndex === -1) continue;
                    totalBankMembers += bankMemberCounts[i].bankCount
                    totalOrgMembers += bankMemberCounts[i].orgCount
                    reportDataSets[0].data[bankOptionIndex] = bankMemberCounts[i].bankCount;
                    reportDataSets[1].data[bankOptionIndex] = bankMemberCounts[i].orgCount;
                }

                this.titleMembres = $localize`:@@MembreStatMembres:Members - Bank : ${totalBankMembers} - Orgs: ${totalOrgMembers}`;
                this.chartDataMembreCount = {
                    labels: this.reportLabels,
                    datasets: reportDataSets
                }

            })
    }
    reportUsers() {
        this.banqueReportService.getUserCountReport(this.authService.accessToken).subscribe(
            (response: BanqueOrgCount[]) => {
                const bankUserCounts: BanqueOrgCount[] = response;
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
                reportDataSets.map((dataSetitem) => {
                    for (let i=0; i < this.reportLabels.length; i++ ) {
                        dataSetitem.data.push(0);
                    }
                })
                let totalBankUsers=0;
                let totalOrgUsers=0;
                for (let i=0; i < bankUserCounts.length; i++ ) {
                    const bankOptionIndex = this.reportLabels.indexOf(bankUserCounts[i].bankShortName );
                    if (bankOptionIndex === -1) continue;
                    totalBankUsers += bankUserCounts[i].bankCount
                    totalOrgUsers += bankUserCounts[i].orgCount
                    reportDataSets[0].data[bankOptionIndex] = bankUserCounts[i].bankCount;
                    reportDataSets[1].data[bankOptionIndex] =bankUserCounts[i].orgCount;
                }

                this.titleUsers = $localize`:@@UserStatUsers:Users - Bank : ${totalBankUsers} - Orgs: ${totalOrgUsers}`;
                this.chartDataUserCount = {
                    labels: this.reportLabels,
                    datasets: reportDataSets
                }



            })
    }


    exportAsXLSX() {

        const exportListOrgs = [];
        exportListOrgs.push([$localize`:@@Bank:Bank`,$localize`:@@Organisations:Organisations`,$localize`:@@OrgStatAgreed:Agreed`,
            $localize`:@@OrgStatFead:Fead`, $localize`:@@OrgStatFromUs:FromUs`,
            $localize`:@@UsersBank:Bank Users` ,$localize`:@@UsersOrg:Org Users`,  $localize`:@@MembersBank:Bank Members`,  $localize`:@@MembersOrg:Org Members`]);
        for (let i=0; i < this.chartDataOrgCount.labels.length; i++ ) {
            const line = [this.chartDataOrgCount.labels[i]];
            line.push(this.chartDataOrgCount.datasets[0].data[i]);
            line.push(this.chartDataOrgCount.datasets[1].data[i]);
            line.push(this.chartDataOrgCount.datasets[2].data[i]);
            line.push(this.chartDataOrgCount.datasets[3].data[i]);
            line.push(this.chartDataUserCount.datasets[0].data[i]);
            line.push(this.chartDataUserCount.datasets[1].data[i]);
            line.push(this.chartDataMembreCount.datasets[0].data[i]);
            line.push(this.chartDataMembreCount.datasets[1].data[i]);
            exportListOrgs.push(line);
        }
        this.excelService.exportAsExcelFile(exportListOrgs, 'foodit.organisationStatistics.' + formatDate(new Date(),'ddMMyyyy.HHmm','en-US') + '.xlsx');

    }
}
