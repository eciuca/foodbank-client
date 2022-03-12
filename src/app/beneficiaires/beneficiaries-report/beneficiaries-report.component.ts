import { Component, OnInit } from '@angular/core';
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
    chartDataBeneficiaryByAge: any;
    chartDataBeneficiaryByFamily: any;
    chartDataBeneficiariesHistory: any;

  constructor(
      private beneficiaireHttpService: BeneficiaireHttpService,
      private banqueService: BanqueEntityService,
      private banqueReportService: BanqueReportService,
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

    this.banqueService.getAll()
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
              const populationRecords: Population[] = response;
              let reportLabels = [];
              let reportDataSets = [];
              let colorIndex =0;
              for (let i=0; i < this.bankOptions.length; i++ ) {
                  reportDataSets.push(
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

              for (let i = 0; i < populationRecords.length; i++) {
                  const bankOptionIndex = this.bankOptions.findIndex(obj => obj.value === populationRecords[i].lienBanque);
                  if (bankOptionIndex === -1) continue;
                  if (!reportLabels.includes(populationRecords[i].dateStat)) {
                      reportLabels.push(populationRecords[i].dateStat);
                      console.log('New Date', populationRecords[i].dateStat);
                      for (let i=0; i < this.bankOptions.length; i++ ) {
                          reportDataSets[i].data.push(0);
                      }
                  }
                  const dataIndex = reportLabels.length;
                  reportDataSets[bankOptionIndex].data[dataIndex] = populationRecords[i].nPers;
              }
              this.titleBeneficiariesEvolution = $localize`:@@OrgStatBenefHistory:Evolution of Nb of Beneficiaries by Bank`;
              this.chartDataBeneficiariesHistory = {
                  labels: reportLabels,
                  datasets: reportDataSets
              }
          })
  }
}
