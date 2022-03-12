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

@Component({
  selector: 'app-beneficiaries-report',
  templateUrl: './beneficiaries-report.component.html',
  styleUrls: ['./beneficiaries-report.component.css']
})
export class BeneficiariesReportComponent implements OnInit {
    booIsLoaded: boolean;
    bankOptions: any[];
    backgroundColors: any[];
    stackedOptions: any;
    titleBeneficiaries: string;
    chartDataBeneficiariesHistory: any;

  constructor(
      private beneficiaireHttpService: BeneficiaireHttpService,
      private banqueService: BanqueEntityService,
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>
  ) {
      this.backgroundColors = ['magenta','violet','indigo','blue','x0080ff','cyan','green','olive','yellow','orange','red','darkred', 'black','silver'];
      // x0080ff dodger blue
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
      this.titleBeneficiaries = '';
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
                  const bankShortName = this.bankOptions[ bankOptionIndex].label;

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
              this.titleBeneficiaries = $localize`:@@OrgStatBenefHistory:Evolution of Nb of Beneficiaries by Bank`;
              this.chartDataBeneficiariesHistory = {
                  labels: reportLabels,
                  datasets: reportDataSets
              }
          })
  }
}
