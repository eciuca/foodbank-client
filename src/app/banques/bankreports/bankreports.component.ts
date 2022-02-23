import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import { BanqueReportService} from '../services/banque-report.service';
import {AuthState} from '../../auth/reducers';
import {BanqueEntityService} from '../services/banque-entity.service';
import {BanqueOrgReport} from '../model/banqueOrgReport';
import {BanqueCount} from '../model/banqueCount';
@Component({
  selector: 'app-bankreports',
  templateUrl: './bankreports.component.html',
  styleUrls: ['./bankreports.component.css']
})
export class BankreportsComponent implements OnInit {

  banqueOrgReports: BanqueOrgReport[];

  basicOptions: any;
  stackedOptions: any;
  pieOptions: any;
  chartDataBeneficiaryByAge: any;
  chartDataBeneficiaryByFamily: any;
  chartDataOrgCount: any;
  bankOptions: any[];
  backgroundColors: any[];
  titleBenefiariesByAge: string;
  titleBenefiariesByFamily: string;
  titleOrganisations: string;
  constructor(
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>,
      private banqueReportService: BanqueReportService,
      private banqueService: BanqueEntityService,
  ) {
   this.backgroundColors = ['violet','indigo','blue','green','olive','yellow','orange','red'];

  }

  ngOnInit(): void {
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

      this.banqueService.getAll()
          .subscribe((banquesEntities) => {
            console.log('Banques now loaded:', banquesEntities);
            this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
              this.report();
          });


  }

  report() {
      this.reportBeneficiaries();
      this.reportOrganisations();
  }
  reportOrganisations() {
      this.banqueReportService.getOrgCountReport(this.authService.accessToken, false).subscribe(
          (response: BanqueCount[]) => {
              const banqueOrgCounts: BanqueCount[] = response;
              let reportLabels = [];
              this.bankOptions.map((option) => {
                  reportLabels.push(option.value);
              });
              let reportDataSets = [];
              reportDataSets.push(
                  {
                      data: [],
                      backgroundColor: []
                  }
              )
              let colorIndex=0;
              for (let i=0; i < banqueOrgCounts.length; i++ ) {

                      if (banqueOrgCounts[i].count < 5) continue;
                      reportLabels.push( banqueOrgCounts[i].bankShortName);
                      reportDataSets[0].data.push(banqueOrgCounts[i].count);
                      reportDataSets[0].backgroundColor.push(this.backgroundColors[colorIndex]) ;
                      colorIndex++;
                      if (colorIndex >= this.backgroundColors.length) {
                          console.log('Not enough colors in backgroundColors array');
                          break;
                      }
                  }

              this.titleOrganisations = $localize`:@@OrgStatOrganisations:Organisation Counts by Bank`;
              this.chartDataOrgCount = {
                  labels: reportLabels,
                  datasets: reportDataSets
              }

          })
  }
  reportBeneficiaries() {
    this.banqueReportService.getOrgReport(this.authService.accessToken).subscribe(
        (response: BanqueOrgReport[]) => {
          this.banqueOrgReports = response;

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
            reportLabels.push(option.value);
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
          for (let i=0; i < this.banqueOrgReports.length; i++ ) {

            const indexLabel = reportLabels.indexOf(this.banqueOrgReports[i].bankShortName);
            reportDataSetsByFamily[0].data[indexLabel] += this.banqueOrgReports[i].nFam;
            reportDataSetsByFamily[1].data[indexLabel] += this.banqueOrgReports[i].nPers;
            reportDataSetsByAge[0].data[indexLabel] += this.banqueOrgReports[i].nNour;
            reportDataSetsByAge[1].data[indexLabel] += this.banqueOrgReports[i].nBebe;
            reportDataSetsByAge[2].data[indexLabel] += this.banqueOrgReports[i].nEnf;
            reportDataSetsByAge[3].data[indexLabel] += this.banqueOrgReports[i].nAdo;
            reportDataSetsByAge[4].data[indexLabel] += this.banqueOrgReports[i].n1824;
            reportDataSetsByAge[5].data[indexLabel] += this.banqueOrgReports[i].nSen;

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





}
