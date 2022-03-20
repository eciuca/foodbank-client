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
                      data: [],
                      backgroundColor: []
                  }
              )
              let colorIndex=0;
              let totalCount =0;
              for (let i=0; i < banqueOrgCounts.length; i++ ) {

                      if (banqueOrgCounts[i].count < 1) continue;
                      totalCount += banqueOrgCounts[i].count
                      reportLabels.push( banqueOrgCounts[i].bankShortName);
                      reportDataSets[0].data.push(banqueOrgCounts[i].count);
                      reportDataSets[0].backgroundColor.push(this.backgroundColors[colorIndex]) ;
                      colorIndex++;
                      if (colorIndex >= this.backgroundColors.length) {
                          console.log('Not enough colors in backgroundColors array');
                          colorIndex=0;
                      }
                  }

              this.titleOrganisations = $localize`:@@OrgStatOrganisations:Organisation Counts by Bank - total Organisations: ${totalCount}`;
              this.chartDataOrgCount = {
                  labels: reportLabels,
                  datasets: reportDataSets
              }

          })
  }
    reportMembres() {
        this.banqueReportService.getMembreCountReport(this.authService.accessToken).subscribe(
            (response: BanqueCount[]) => {
                const banqueMembreCounts: BanqueCount[] = response;
                let reportLabels = [];
                let reportDataSets = [];
                reportDataSets.push(
                    {
                        data: [],
                        backgroundColor: []
                    }
                )
                let colorIndex=0;
                let totalCount =0;
                for (let i=0; i < banqueMembreCounts.length; i++ ) {

                    if (banqueMembreCounts[i].count < 1) continue;
                    totalCount += banqueMembreCounts[i].count
                    reportLabels.push( banqueMembreCounts[i].bankShortName);
                    reportDataSets[0].data.push(banqueMembreCounts[i].count);
                    reportDataSets[0].backgroundColor.push(this.backgroundColors[colorIndex]) ;
                    colorIndex++;
                    if (colorIndex >= this.backgroundColors.length) {
                        console.log('Not enough colors in backgroundColors array');
                        colorIndex=0;
                    }
                }

                this.titleMembres = $localize`:@@MembreStatMembres:Members Counts by Bank - total Members: ${totalCount}`;
                this.chartDataMembreCount = {
                    labels: reportLabels,
                    datasets: reportDataSets
                }

            })
    }
    reportUsers() {
        this.banqueReportService.getUserCountReport(this.authService.accessToken).subscribe(
            (response: BanqueCount[]) => {
                const banqueUserCounts: BanqueCount[] = response;
                let reportLabels = [];
                let reportDataSets = [];
                reportDataSets.push(
                    {
                        data: [],
                        backgroundColor: []
                    }
                )
                let colorIndex=0;
                let totalCount =0;
                for (let i=0; i < banqueUserCounts.length; i++ ) {
                    if( !banqueUserCounts[i].bankShortName ) continue;
                    if (banqueUserCounts[i].count < 1) continue;
                    totalCount += banqueUserCounts[i].count;
                    reportLabels.push( banqueUserCounts[i].bankShortName);
                    reportDataSets[0].data.push(banqueUserCounts[i].count);
                    reportDataSets[0].backgroundColor.push(this.backgroundColors[colorIndex]) ;
                    colorIndex++;
                    if (colorIndex >= this.backgroundColors.length) {
                        console.log('Not enough colors in backgroundColors array');
                        colorIndex=0;
                    }
                }

                this.titleUsers = $localize`:@@UserStatUsers:Users Counts by Bank - total Users: ${totalCount}`;
                this.chartDataUserCount = {
                    labels: reportLabels,
                    datasets: reportDataSets
                }

            })
    }





}
