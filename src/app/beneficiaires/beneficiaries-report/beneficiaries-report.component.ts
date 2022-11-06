import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {AuthState} from '../../auth/reducers';
import {BeneficiaireHttpService} from '../services/beneficiaire-http.service';
import {BanqueEntityService} from '../../banques/services/banque-entity.service';
import {Population} from '../model/population';
import {BanqueOrgReport} from '../../banques/model/banqueOrgReport';
import {BanqueReportService} from '../../banques/services/banque-report.service';
import {formatDate} from '@angular/common';
import {ExcelService} from '../../services/excel.service';

@Component({
  selector: 'app-beneficiaries-report',
  templateUrl: './beneficiaries-report.component.html',
  styleUrls: ['./beneficiaries-report.component.css']
})
export class BeneficiariesReportComponent implements OnInit {
    booIsLoaded: boolean;
    bankOptions: any[];
    backgroundColors: any[];
    basicOptions: any;
    stackedOptions: any;
    titleBenefiariesByAge: string;
    titleBenefiariesByFamily: string;
    titleBeneficiariesEvolution: string;
    titleBeneficiariesFamilyEvolution: string;
    chartDataBeneficiaryByAge: any;
    chartDataBeneficiaryByFamily: any;
    chartDataBeneficiariesHistory: any;
    chartDataBeneficiariesFamilyHistory: any;
    populationRecords: Population[];

    constructor(
      private beneficiaireHttpService: BeneficiaireHttpService,
      private banqueService: BanqueEntityService,
      private banqueReportService: BanqueReportService,
      private excelService: ExcelService,
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>
  ) {
      this.backgroundColors = ['magenta','violet','indigo','blue','x0080ff','cyan','green','olive','yellow','orange','red','darkred', 'black','silver'];
      // x0080ff dodger blue
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
      this.titleBeneficiariesEvolution = '';
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
          this.bankOptions = banquesEntities.map(({bankShortName,bankId}) => ({'label': bankShortName, 'value': bankId}));
          if (! this.booIsLoaded) {
            this.report();
          }
          this.booIsLoaded = true;
        });


  }
  report() {
      this.reportBeneficiaries();
      this.reportBeneficiariesHistory();
  }
    reportBeneficiaries() {
        this.banqueReportService.getOrgReport(this.authService.accessToken).subscribe(
            (response: BanqueOrgReport[]) => {
                const banqueOrgReportRecords:  BanqueOrgReport[] = response;

                let reportLabels = [];
                let reportDataSetsByFamily = [
                    {
                        type: 'bar',
                        label: $localize`:@@OrgStatFamilies:Families`,
                        backgroundColor: 'Red',
                        data: []
                    },
                    {
                        type: 'bar',
                        label: $localize`:@@OrgStatPersons:Persons`,
                        backgroundColor: 'Blue',
                        data: []
                    },
                ];

                let reportDataSetsByAge = [
                    {
                        type: 'bar',
                        label: $localize`:@@OrgStatInfants:Infants(0-6 months)`,
                        backgroundColor: 'Red',
                        data: []
                    },
                    {
                        type: 'bar',
                        label: $localize`:@@OrgStatBabies:Babies(6-24 months)`,
                        backgroundColor: 'Orange',
                        data: []
                    },
                    {
                        type: 'bar',
                        label: $localize`:@@OrgStatChildren:Children(2-14 years)`,
                        backgroundColor: 'Blue',
                        data: []
                    },
                    {
                        type: 'bar',
                        label:  $localize`:@@OrgStatTeenagers:Teenagers(14-18 years)`,
                        backgroundColor: '#ADD8E6', // light blue
                        data: []
                    },
                    {
                        type: 'bar',
                        label: $localize`:@@OrgStatYoungAdults:Young Adults(18-24 years)`,
                        backgroundColor: 'Green',
                        data: []
                    },
                    {
                        type: 'bar',
                        label: $localize`:@@OrgSeniors:Seniors(> 65 years)`,
                        backgroundColor: 'Yellow',
                        data: []
                    },

                ];

                this.bankOptions.map((option) => {
                    reportLabels.push(option.label);
                })
                reportDataSetsByAge.map((dataSetitem) => {
                    for (let i=0; i < this.bankOptions.length; i++ ) {
                        dataSetitem.data.push(0);
                    }
                })
                reportDataSetsByFamily.map((dataSetitem) => {
                    for (let i=0; i < this.bankOptions.length; i++ ) {
                        dataSetitem.data.push(0);
                    }
                })
                console.log( 'initialized chart data', reportLabels,  reportDataSetsByAge);
                for (let i=0; i < banqueOrgReportRecords.length; i++ ) {

                    const indexLabel = reportLabels.indexOf(banqueOrgReportRecords[i].bankShortName);
                    if (indexLabel === -1) continue;
                    reportDataSetsByFamily[0].data[indexLabel] += banqueOrgReportRecords[i].nFam;
                    reportDataSetsByFamily[1].data[indexLabel] += banqueOrgReportRecords[i].nPers;
                    reportDataSetsByAge[0].data[indexLabel] += banqueOrgReportRecords[i].nNour;
                    reportDataSetsByAge[1].data[indexLabel] += banqueOrgReportRecords[i].nBebe;
                    reportDataSetsByAge[2].data[indexLabel] += banqueOrgReportRecords[i].nEnf;
                    reportDataSetsByAge[3].data[indexLabel] += banqueOrgReportRecords[i].nAdo;
                    reportDataSetsByAge[4].data[indexLabel] += banqueOrgReportRecords[i].n1824;
                    reportDataSetsByAge[5].data[indexLabel] += banqueOrgReportRecords[i].nSen;

                }

                this.titleBenefiariesByFamily = $localize`:@@OrgStatBenefByFamily:Beneficiaries Statistics by Family`;
                this.chartDataBeneficiaryByFamily = {
                    labels: reportLabels,
                    datasets: reportDataSetsByFamily
                }

                this.titleBenefiariesByAge = $localize`:@@OrgStatBenefByAge:Beneficiaries Statistics by Age Group`;
                this.chartDataBeneficiaryByAge = {
                    labels: reportLabels,
                    datasets: reportDataSetsByAge
                }

            });
    }

    reportBeneficiariesHistory() {

    this.beneficiaireHttpService.getPopulationReport(this.authService.accessToken).subscribe(
          (response: Population[]) => {
              this.populationRecords = response;
              let reportLabels = [];
              let reportDataSetsPerson = [];
              let reportDataSetsFamily = [];
              let colorIndex =0;
              for (let i=0; i < this.bankOptions.length; i++ ) {
                  reportDataSetsPerson.push(
                      {
                          type: 'bar',
                          label: this.bankOptions[i].label,
                          backgroundColor: this.backgroundColors[colorIndex],
                          data: []
                      });
                  reportDataSetsFamily.push(
                      {
                          type: 'bar',
                          label: this.bankOptions[i].label,
                          backgroundColor: this.backgroundColors[colorIndex],
                          data: []
                      });
                  colorIndex++;
                  if (colorIndex >= this.backgroundColors.length) {
                      console.log('Not enough colors in backgroundColors array');
                      colorIndex=0;
                  }

              }

              for (let i = 0; i < this.populationRecords.length; i++) {
                  const bankOptionIndex = this.bankOptions.findIndex(obj => obj.value === this.populationRecords[i].lienBanque);
                  if (bankOptionIndex === -1) continue;
                  if (!reportLabels.includes(this.populationRecords[i].dateStat)) {
                      reportLabels.push(this.populationRecords[i].dateStat);
                      // console.log('New Date', this.populationRecords[i].dateStat);
                      for (let i=0; i < this.bankOptions.length; i++ ) {
                          reportDataSetsPerson[i].data.push(0);
                          reportDataSetsFamily[i].data.push(0);
                      }
                  }
                  const dataIndex = reportLabels.length;
                  reportDataSetsPerson[bankOptionIndex].data[dataIndex] = this.populationRecords[i].nPers;
                  reportDataSetsFamily[bankOptionIndex].data[dataIndex] = this.populationRecords[i].nFam;
              }
              this.titleBeneficiariesEvolution = $localize`:@@OrgStatBenefHistory:Evolution of Nb of Beneficiaries by Bank`;
              this.chartDataBeneficiariesHistory = {
                  labels: reportLabels,
                  datasets: reportDataSetsPerson
              }
              this.titleBeneficiariesFamilyEvolution = $localize`:@@OrgStatBenefFamilyHistory:Evolution of Nb of Beneficiary Families by Bank`;
              this.chartDataBeneficiariesFamilyHistory = {
                  labels: reportLabels,
                  datasets: reportDataSetsFamily
              }
          })
  }
    exportHistoryAsXLSX() {
        const exportListHistory = [];
        exportListHistory.push([$localize`:@@Date:Date`,$localize`:@@Bank:Bank`,$localize`:@@Families:Families`,$localize`:@@Persons:Persons`,
            $localize`:@@OrgStatInfants:Infants(0-6 months)` ,$localize`:@@OrgStatBabies:Babies(6-24 months)`,
            $localize`:@@OrgStatChildren:Children(2-14 years)`, $localize`:@@OrgStatTeenagers:Teenagers(14-18 years)`,
            $localize`:@@OrgStatYoungAdults:Young Adults(18-24 years)`, $localize`:@@OrgSeniors:Seniors(> 65 years)`]
        );
        for (let i=0; i < this.populationRecords.length; i++ ) {
            const bankOptionIndex = this.bankOptions.findIndex(obj => obj.value === this.populationRecords[i].lienBanque);
            if (bankOptionIndex === -1) continue;
            if(!this.populationRecords[i].n1824) {
                this.populationRecords[i].n1824 = 0;
            }
            const line = [this.populationRecords[i].dateStat];
            line.push(this.bankOptions[bankOptionIndex].label);
            line.push(this.populationRecords[i].nFam.toString());
            line.push(this.populationRecords[i].nPers.toString());
            line.push(this.populationRecords[i].nNour.toString());
            line.push(this.populationRecords[i].nBebe.toString());
            line.push(this.populationRecords[i].nEnf.toString());
            line.push(this.populationRecords[i].nAdo.toString());
            line.push(this.populationRecords[i].n1824.toString());
            line.push(this.populationRecords[i].nSen.toString());
            exportListHistory.push(line);
        }
        this.excelService.exportAsExcelFile( exportListHistory, 'foodit.beneficiaryHistoryStatistics.' + formatDate(new Date(),'ddMMyyyy.HHmm','en-US') + '.xlsx');

    }
    exportAsXLSX() {

        const exportListOrgs = [];
        exportListOrgs.push([$localize`:@@Bank:Bank`,$localize`:@@Families:Families`,$localize`:@@Persons:Persons`,
            $localize`:@@OrgStatInfants:Infants(0-6 months)` ,$localize`:@@OrgStatBabies:Babies(6-24 months)`,
            $localize`:@@OrgStatChildren:Children(2-14 years)`, $localize`:@@OrgStatTeenagers:Teenagers(14-18 years)`,
            $localize`:@@OrgStatYoungAdults:Young Adults(18-24 years)`, $localize`:@@OrgSeniors:Seniors(> 65 years)`]
        );
        for (let i=0; i < this.chartDataBeneficiaryByFamily.labels.length; i++ ) {
            const line = [this.chartDataBeneficiaryByFamily.labels[i]];
            line.push(this.chartDataBeneficiaryByFamily.datasets[0].data[i]);
            line.push(this.chartDataBeneficiaryByFamily.datasets[1].data[i]);
            line.push(this.chartDataBeneficiaryByAge.datasets[0].data[i]);
            line.push(this.chartDataBeneficiaryByAge.datasets[1].data[i]);
            line.push(this.chartDataBeneficiaryByAge.datasets[2].data[i]);
            line.push(this.chartDataBeneficiaryByAge.datasets[3].data[i]);
            line.push(this.chartDataBeneficiaryByAge.datasets[4].data[i]);
            line.push(this.chartDataBeneficiaryByAge.datasets[5].data[i]);
            exportListOrgs.push(line);
        }
        this.excelService.exportAsExcelFile(exportListOrgs, 'foodit.beneficiaryStatistics.' + formatDate(new Date(),'ddMMyyyy.HHmm','en-US') + '.xlsx');

      
    }
}
