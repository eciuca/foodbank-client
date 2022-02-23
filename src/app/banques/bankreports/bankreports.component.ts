import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import { BanqueOrgReportService} from '../services/banque-orgreport.service';
import {AuthState} from '../../auth/reducers';
import {BanqueEntityService} from '../services/banque-entity.service';
import {BanqueOrgReport} from '../model/banqueOrgReport';
@Component({
  selector: 'app-bankreports',
  templateUrl: './bankreports.component.html',
  styleUrls: ['./bankreports.component.css']
})
export class BankreportsComponent implements OnInit {

  banqueOrgReports: BanqueOrgReport[];

  basicOptions: any;
  stackedOptions: any;
  chartDataBeneficiaryByAge: any;
  chartDataBeneficiaryByFamily: any;
  bankOptions: any[];
  titleBenefiariesByAge: string;
  titleBenefiariesByFamily: string;
  constructor(
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>,
      private banqueOrgReportService: BanqueOrgReportService,
      private banqueService: BanqueEntityService,
  ) {

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
  }
  private initializeDependingOnUserRights(authState: AuthState) {


    if (['Admin_FBBA','admin'].includes(authState.user.rights)) {

      this.banqueService.getAll()
          .subscribe((banquesEntities) => {
            console.log('Banques now loaded:', banquesEntities);
            this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
              this.report();
          });

    }
  }

  report() {
    console.log('Bank  Report Started ');

    this.banqueOrgReportService.getOrgReport(this.authService.accessToken).subscribe(
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
