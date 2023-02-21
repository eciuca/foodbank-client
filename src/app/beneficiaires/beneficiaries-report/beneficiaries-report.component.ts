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
import {BanqueClientReport} from '../../banques/model/banqueClientReport';
import {BanqueReportService} from '../../banques/services/banque-report.service';
import {formatDate} from '@angular/common';
import {ExcelService} from '../../services/excel.service';
import {Depot} from '../../depots/model/depot';
import {DepotHttpService} from '../../depots/services/depot-http.service';

@Component({
  selector: 'app-beneficiaries-report',
  templateUrl: './beneficiaries-report.component.html',
  styleUrls: ['./beneficiaries-report.component.css']
})
export class BeneficiariesReportComponent implements OnInit {
    isAdmin: boolean;
    booIsLoaded: boolean;
    category: string;
    bankOptions: any[];
    depotOptions: any[];
    categoryOptions: any[];
    categoryOptionsAgreed: any[];
    categoryOptionsGestBen: any[];
    bankShortName: string;
    bankId: number;
    backgroundColors: any[];
    basicOptions: any;
    stackedOptions: any;
    titleBeneficiariesByAge: string;
    titleBeneficiariesByFamily: string;
    titleBeneficiariesByAgeAgreed: string;
    titleBeneficiariesByFamilyAgreed: string;
    titleBeneficiariesByAgeGestBen: string;
    titleBeneficiariesByFamilyGestBen: string;
    titleBeneficiariesEvolution: string;
    titleBeneficiariesFamilyEvolution: string;
    chartDataBeneficiaryByAge: any;
    chartDataBeneficiaryByFamily: any;
    chartDataBeneficiaryByAgeAgreed: any;
    chartDataBeneficiaryByFamilyAgreed: any;
    chartDataBeneficiaryByAgeGestBen: any;
    chartDataBeneficiaryByFamilyGestBen: any;
    chartDataBeneficiariesHistory: any;
    chartDataBeneficiariesFamilyHistory: any;
    populationRecords: Population[];


    constructor(
      private beneficiaireHttpService: BeneficiaireHttpService,
      private depotHttpService: DepotHttpService,
      private banqueService: BanqueEntityService,
      private banqueReportService: BanqueReportService,
      private excelService: ExcelService,
      private authService: AuthService,
      private http: HttpClient,
      private store: Store<AppState>
  ) {
        this.isAdmin = false;
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
        if (authState.user) {
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.bankShortName = authState.banque.bankShortName;
                    this.bankId = authState.banque.bankId;
                    this.category = 'Depot';
                    this.depotHttpService.getDepotReport(this.authService.accessToken,this.bankShortName)
                        .subscribe((depots:Depot[]) => {
                            this.depotOptions = depots.map(({idDepot, nom}) => ({'value': idDepot, 'label': nom}));
                            this.categoryOptions =[...this.depotOptions];
                            this.categoryOptions.push({label: 'OTHER', value: null});
                            this.categoryOptionsAgreed = [...this.categoryOptions];
                            this.categoryOptionsGestBen = [...this.categoryOptions];
                            this.depotOptions.unshift({'value': null, 'label': ' '});
                            if (!this.booIsLoaded) {
                                this.report();
                            }
                            this.booIsLoaded = true;
                        });
                    break;
                case 'admin':
                case 'Admin_FBBA':
                    this.isAdmin = true;
                    this.category = 'Bank';
                    const classicBanks = {'classicBanks': '1'};
                    this.banqueService.getWithQuery(classicBanks)
                        .subscribe((banquesEntities) => {
                            this.bankOptions = banquesEntities.map(({bankShortName,bankId}) => ({
                                'label': bankShortName,
                                'value': bankId
                            }));
                            this.categoryOptions =[...this.bankOptions];
                            this.categoryOptions.push({label: 'OTHER', value: null});
                            this.categoryOptionsAgreed = [...this.categoryOptions];
                            this.categoryOptionsGestBen = [...this.categoryOptions];
                            this.bankOptions.unshift({'value': null, 'label': ' '});
                            if (!this.booIsLoaded) {
                                this.report();
                            }
                            this.booIsLoaded = true;
                        });
                    break;
                default:
            }
        }



  }
    filterBank(bankId: any) {
        console.log('change event vale',bankId);

        if (bankId) {
            this.bankId = bankId;
            this.bankShortName = this.bankOptions.find(({value}) => value === bankId).label;
            this.category = 'Depot'
            this.depotHttpService.getDepotReport(this.authService.accessToken,this.bankShortName)
                .subscribe((depots:Depot[]) => {
                    this.depotOptions = depots.map(({idDepot, nom}) => ({'value': idDepot, 'label': nom}));
                    this.categoryOptions =[...this.depotOptions];
                    this.categoryOptions.push({label: 'OTHER', value: null});
                    this.categoryOptionsAgreed = [...this.categoryOptions];
                    this.categoryOptionsGestBen = [...this.categoryOptions];
                    this.depotOptions.unshift({'value': null, 'label': ' '});
                    this.category='Depot';
                    this.report();
                });

        }
        else {
            this.bankId = null;
            this.bankShortName = null;
            this.category = 'Bank';
            this.categoryOptions =[...this.bankOptions];
            this.categoryOptions.shift();
            this.categoryOptions.push({label: 'OTHER', value: null});
            this.categoryOptionsAgreed = [...this.categoryOptions];
            this.categoryOptionsGestBen = [...this.categoryOptions];
            this.report();

        }
    }
  report() {
      this.reportBeneficiaries();
      this.reportBeneficiariesHistory();
  }
    reportBeneficiaries() {

        this.banqueReportService.getOrgClientReport(this.authService.accessToken,this.bankShortName).subscribe(
            (response: BanqueClientReport[]) => {
                const banqueOrgReportRecords: BanqueClientReport[] = response;

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
                    let reportDataSetsByFamilyAgreed = [
                        { type: 'bar',
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
                    let reportDataSetsByFamilyGestBen = [
                        {   type: 'bar',
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
                            label: $localize`:@@OrgStatTeenagers:Teenagers(14-18 years)`,
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
                        {
                            type: 'bar',
                            label: $localize`:@@OrgAdults:Adults`,
                            backgroundColor: 'Brown',
                            data: []
                        },

                    ];
                    let reportDataSetsByAgeAgreed = [
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
                            label: $localize`:@@OrgStatTeenagers:Teenagers(14-18 years)`,
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
                        {
                            type: 'bar',
                            label: $localize`:@@OrgAdults:Adults`,
                            backgroundColor: 'Brown',
                            data: []
                        },

                    ];
                    let reportDataSetsByAgeGestBen = [
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
                            label: $localize`:@@OrgStatTeenagers:Teenagers(14-18 years)`,
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
                        {
                            type: 'bar',
                            label: $localize`:@@OrgAdults:Adults`,
                            backgroundColor: 'Brown',
                            data: []
                        },
                    ];



                    this.categoryOptions.map((option) => {
                        reportLabels.push(option.label);
                    })
                    reportDataSetsByAge.map((dataSetitem) => {
                        for (let i = 0; i < this.categoryOptions.length; i++) {
                            dataSetitem.data.push(0);
                        }
                    })
                    reportDataSetsByAgeAgreed.map((dataSetitem) => {
                        for (let i = 0; i < this.categoryOptions.length; i++) {
                            dataSetitem.data.push(0);
                        }
                    })
                    reportDataSetsByAgeGestBen.map((dataSetitem) => {
                        for (let i = 0; i < this.categoryOptions.length; i++) {
                            dataSetitem.data.push(0);
                        }
                    })

                    reportDataSetsByFamily.map((dataSetitem) => {
                        for (let i = 0; i < this.categoryOptions.length; i++) {
                            dataSetitem.data.push(0);
                        }
                    })
                    reportDataSetsByFamilyAgreed.map((dataSetitem) => {
                        for (let i = 0; i < this.categoryOptions.length; i++) {
                            dataSetitem.data.push(0);
                        }
                    })
                    reportDataSetsByFamilyGestBen.map((dataSetitem) => {
                        for (let i = 0; i < this.categoryOptions.length; i++) {
                            dataSetitem.data.push(0);
                        }
                    })
                    let totalOrganisations = 0;
                    let totalOrganisationsAgreed = 0;
                    let totalOrganisationsGestBen = 0;
                    let totalFamilies = 0;
                    let totalFamiliesAgreed = 0;
                    let totalFamiliesGestBen = 0;
                    let totalPersons = 0;
                    let totalPersonsAgreed = 0;
                    let totalPersonsGestBen = 0;
                    let totalNour = 0;
                    let totalNourAgreed = 0;
                    let totalNourGestBen = 0;
                    let totalBabies = 0;
                    let totalBabiesAgreed = 0;
                    let totalBabiesGestBen = 0;
                    let totalChildren = 0;
                    let totalChildrenAgreed = 0;
                    let totalChildrenGestBen = 0;
                    let totalTeenagers = 0;
                    let totalTeenagersAgreed = 0;
                    let totalTeenagersGestBen = 0;
                    let totalYoungAdults = 0;
                    let totalYoungAdultsAgreed = 0;
                    let totalYoungAdultsGestBen = 0;
                    let totalAdults = 0;
                    let totalAdultsAgreed = 0;
                    let totalAdultsGestBen = 0;
                    let totalSeniors = 0;
                    let totalSeniorsAgreed = 0;
                    let totalSeniorsGestBen = 0;



                    for (let i = 0; i < banqueOrgReportRecords.length; i++) {
                        let indexLabel = -1;
                        if (this.category == 'Depot') {
                            indexLabel = this.categoryOptions.findIndex(obj => obj.value === banqueOrgReportRecords[i].lienDepot.toString());
                        }
                        else {
                            indexLabel = this.categoryOptions.findIndex(obj => obj.label === banqueOrgReportRecords[i].bankShortName);
                        }
                        if (indexLabel === -1) {
                            indexLabel = this.categoryOptions.length - 1;
                        }
                        reportDataSetsByFamily[0].data[indexLabel] += banqueOrgReportRecords[i].nFam;
                        reportDataSetsByFamily[1].data[indexLabel] += banqueOrgReportRecords[i].nPers;
                        reportDataSetsByAge[0].data[indexLabel] += banqueOrgReportRecords[i].nNour;
                        reportDataSetsByAge[1].data[indexLabel] += banqueOrgReportRecords[i].nBebe;
                        reportDataSetsByAge[2].data[indexLabel] += banqueOrgReportRecords[i].nEnf;
                        reportDataSetsByAge[3].data[indexLabel] += banqueOrgReportRecords[i].nAdo;
                        reportDataSetsByAge[4].data[indexLabel] += banqueOrgReportRecords[i].n1824;
                        reportDataSetsByAge[5].data[indexLabel] += banqueOrgReportRecords[i].nSen;
                        reportDataSetsByAge[6].data[indexLabel] += banqueOrgReportRecords[i].nPers - banqueOrgReportRecords[i].nNour - banqueOrgReportRecords[i].nBebe - banqueOrgReportRecords[i].nEnf - banqueOrgReportRecords[i].nAdo - banqueOrgReportRecords[i].n1824 - banqueOrgReportRecords[i].nSen;
                        totalOrganisations += banqueOrgReportRecords[i].orgCount;
                        totalFamilies += banqueOrgReportRecords[i].nFam;
                        totalPersons += banqueOrgReportRecords[i].nPers;
                        totalNour += banqueOrgReportRecords[i].nNour;
                        totalBabies += banqueOrgReportRecords[i].nBebe;
                        totalChildren += banqueOrgReportRecords[i].nEnf;
                        totalTeenagers += banqueOrgReportRecords[i].nAdo;
                        totalYoungAdults += banqueOrgReportRecords[i].n1824;
                        totalSeniors+= banqueOrgReportRecords[i].nSen;
                        totalAdults += banqueOrgReportRecords[i].nPers - banqueOrgReportRecords[i].nNour - banqueOrgReportRecords[i].nBebe - banqueOrgReportRecords[i].nEnf - banqueOrgReportRecords[i].nAdo - banqueOrgReportRecords[i].n1824 - banqueOrgReportRecords[i].nSen;
                        if (banqueOrgReportRecords[i].nonAgreed == 0) {
                            reportDataSetsByFamilyAgreed[0].data[indexLabel] += banqueOrgReportRecords[i].nFam;
                            reportDataSetsByFamilyAgreed[1].data[indexLabel] += banqueOrgReportRecords[i].nPers;
                            reportDataSetsByAgeAgreed[0].data[indexLabel] += banqueOrgReportRecords[i].nNour;
                            reportDataSetsByAgeAgreed[1].data[indexLabel] += banqueOrgReportRecords[i].nBebe;
                            reportDataSetsByAgeAgreed[2].data[indexLabel] += banqueOrgReportRecords[i].nEnf;
                            reportDataSetsByAgeAgreed[3].data[indexLabel] += banqueOrgReportRecords[i].nAdo;
                            reportDataSetsByAgeAgreed[4].data[indexLabel] += banqueOrgReportRecords[i].n1824;
                            reportDataSetsByAgeAgreed[5].data[indexLabel] += banqueOrgReportRecords[i].nSen;
                            reportDataSetsByAgeAgreed[6].data[indexLabel] += banqueOrgReportRecords[i].nPers - banqueOrgReportRecords[i].nNour - banqueOrgReportRecords[i].nBebe - banqueOrgReportRecords[i].nEnf - banqueOrgReportRecords[i].nAdo - banqueOrgReportRecords[i].n1824 - banqueOrgReportRecords[i].nSen;
                            totalOrganisationsAgreed += banqueOrgReportRecords[i].orgCount;
                            totalFamiliesAgreed += banqueOrgReportRecords[i].nFam;
                            totalPersonsAgreed += banqueOrgReportRecords[i].nPers;
                            totalNourAgreed += banqueOrgReportRecords[i].nNour;
                            totalBabiesAgreed += banqueOrgReportRecords[i].nBebe;
                            totalChildrenAgreed += banqueOrgReportRecords[i].nEnf;
                            totalTeenagersAgreed += banqueOrgReportRecords[i].nAdo;
                            totalYoungAdultsAgreed += banqueOrgReportRecords[i].n1824;
                            totalSeniorsAgreed += banqueOrgReportRecords[i].nSen;
                            totalAdultsAgreed += banqueOrgReportRecords[i].nPers - banqueOrgReportRecords[i].nNour - banqueOrgReportRecords[i].nBebe - banqueOrgReportRecords[i].nEnf - banqueOrgReportRecords[i].nAdo - banqueOrgReportRecords[i].n1824 - banqueOrgReportRecords[i].nSen;
                        }
                        if (banqueOrgReportRecords[i].gestBen == 1) {
                            reportDataSetsByFamilyGestBen[0].data[indexLabel] += banqueOrgReportRecords[i].nFam;
                            reportDataSetsByFamilyGestBen[1].data[indexLabel] += banqueOrgReportRecords[i].nPers;
                            reportDataSetsByAgeGestBen[0].data[indexLabel] += banqueOrgReportRecords[i].nNour;
                            reportDataSetsByAgeGestBen[1].data[indexLabel] += banqueOrgReportRecords[i].nBebe;
                            reportDataSetsByAgeGestBen[2].data[indexLabel] += banqueOrgReportRecords[i].nEnf;
                            reportDataSetsByAgeGestBen[3].data[indexLabel] += banqueOrgReportRecords[i].nAdo;
                            reportDataSetsByAgeGestBen[4].data[indexLabel] += banqueOrgReportRecords[i].n1824;
                            reportDataSetsByAgeGestBen[5].data[indexLabel] += banqueOrgReportRecords[i].nSen;
                            reportDataSetsByAgeGestBen[6].data[indexLabel] += banqueOrgReportRecords[i].nPers - banqueOrgReportRecords[i].nNour - banqueOrgReportRecords[i].nBebe - banqueOrgReportRecords[i].nEnf - banqueOrgReportRecords[i].nAdo - banqueOrgReportRecords[i].n1824 - banqueOrgReportRecords[i].nSen;
                            totalOrganisationsGestBen += banqueOrgReportRecords[i].orgCount;
                            totalFamiliesGestBen += banqueOrgReportRecords[i].nFam;
                            totalPersonsGestBen += banqueOrgReportRecords[i].nPers;
                            totalNourGestBen += banqueOrgReportRecords[i].nNour;
                            totalBabiesGestBen += banqueOrgReportRecords[i].nBebe;
                            totalChildrenGestBen += banqueOrgReportRecords[i].nEnf;
                            totalTeenagersGestBen += banqueOrgReportRecords[i].nAdo;
                            totalYoungAdultsGestBen += banqueOrgReportRecords[i].n1824;
                            totalSeniorsGestBen += banqueOrgReportRecords[i].nSen;
                            totalAdultsGestBen += banqueOrgReportRecords[i].nPers - banqueOrgReportRecords[i].nNour - banqueOrgReportRecords[i].nBebe - banqueOrgReportRecords[i].nEnf - banqueOrgReportRecords[i].nAdo - banqueOrgReportRecords[i].n1824 - banqueOrgReportRecords[i].nSen;
                        }

                    }

                    this.titleBeneficiariesByFamily = $localize`:@@OrgStatBenefByFamily:Orgs: ${totalOrganisations} Families: ${totalFamilies} Persons: ${totalPersons}`;
                    this.chartDataBeneficiaryByFamily = {
                        labels: reportLabels,
                        datasets: reportDataSetsByFamily
                    }
                    this.titleBeneficiariesByFamilyAgreed = $localize`:@@OrgStatBenefByFamilyAgreed:Agreed Orgs: ${totalOrganisationsAgreed} Families: ${totalFamiliesAgreed} Persons: ${totalPersonsAgreed}`;
                    this.chartDataBeneficiaryByFamilyAgreed = {
                        labels: reportLabels,
                        datasets: reportDataSetsByFamilyAgreed
                    }
                    this.titleBeneficiariesByFamilyGestBen = $localize`:@@OrgStatBenefByFamilyGestBen:GestBen Orgs: ${totalOrganisationsGestBen} Families: ${totalFamiliesGestBen} Persons: ${totalPersonsGestBen}`
                    this.chartDataBeneficiaryByFamilyGestBen = {
                        labels: reportLabels,
                        datasets: reportDataSetsByFamilyGestBen
                    }

                    this.titleBeneficiariesByAge = $localize`:@@OrgStatBenefByAge:Orgs: ${totalOrganisations} Persons: ${totalPersons} Nour: ${totalNour} Babies: ${totalBabies} Children: ${totalChildren} Teenagers: ${totalTeenagers} Young Adults: ${totalYoungAdults} Adults: ${totalAdults} Seniors: ${totalSeniors}`;
                    this.chartDataBeneficiaryByAge = {
                        labels: reportLabels,
                        datasets: reportDataSetsByAge
                    }
                    this.titleBeneficiariesByAgeAgreed = $localize`:@@OrgStatBenefByAgeAgreed:Agreed Orgs: ${totalOrganisationsAgreed} Persons: ${totalPersonsAgreed} Nour: ${totalNourAgreed} Babies: ${totalBabiesAgreed} Children: ${totalChildrenAgreed} Teenagers: ${totalTeenagersAgreed} Young Adults: ${totalYoungAdultsAgreed} Adults: ${totalAdultsAgreed} Seniors: ${totalSeniorsAgreed}`;
                    this.chartDataBeneficiaryByAgeAgreed = {
                        labels: reportLabels,
                        datasets: reportDataSetsByAgeAgreed
                    }
                    this.titleBeneficiariesByAgeGestBen = $localize`:@@OrgStatBenefByAgeGestBen:GestBen Orgs: ${totalOrganisationsGestBen} Persons: ${totalPersonsGestBen} Nour: ${totalNourGestBen} Babies: ${totalBabiesGestBen} Children: ${totalChildrenGestBen} Teenagers: ${totalTeenagersGestBen} Young Adults: ${totalYoungAdultsGestBen} Adults: ${totalAdultsGestBen} Seniors: ${totalSeniorsGestBen}`;
                    this.chartDataBeneficiaryByAgeGestBen = {
                        labels: reportLabels,
                        datasets: reportDataSetsByAgeGestBen
                    }
            });
    }

    reportBeneficiariesHistory() {

    this.beneficiaireHttpService.getPopulationReport(this.authService.accessToken,this.bankId).subscribe(
          (response: Population[]) => {
              this.populationRecords = response;
              let reportLabels = [];
              let reportDataSetsPerson = [];
              let reportDataSetsFamily = [];
              let colorIndex =0;
              if (this.category == 'Bank') {
                  for (let i = 0; i < this.categoryOptions.length; i++) {
                      reportDataSetsPerson.push(
                          {
                              type: 'bar',
                              label: this.categoryOptions[i].label,
                              backgroundColor: this.backgroundColors[colorIndex],
                              data: []
                          });
                      reportDataSetsFamily.push(
                          {
                              type: 'bar',
                              label: this.categoryOptions[i].label,
                              backgroundColor: this.backgroundColors[colorIndex],
                              data: []
                          });
                      colorIndex++;
                      if (colorIndex >= this.backgroundColors.length) {
                          console.log('Not enough colors in backgroundColors array');
                          colorIndex = 0;
                      }

                  }
              }
              else {
                    reportDataSetsPerson.push(
                        {
                            type: 'bar',
                            label: this.bankShortName,
                            backgroundColor: 'blue',
                            data: []
                        });
                    reportDataSetsFamily.push(
                        {
                            type: 'bar',
                            label: this.bankShortName,
                            backgroundColor: 'blue',
                            data: []
                        });
              }
              for (let i = 0; i < this.populationRecords.length; i++) {
                  let bankOptionIndex = 0;
                  if (this.category == 'Bank') {
                      bankOptionIndex = this.categoryOptions.findIndex(obj => obj.value === this.populationRecords[i].lienBanque);
                      if (bankOptionIndex === -1) {
                          bankOptionIndex = this.categoryOptions.length - 1;
                      }
                  }
                  if (!reportLabels.includes(this.populationRecords[i].dateStat)) {
                      reportLabels.push(this.populationRecords[i].dateStat);
                      if (this.category == 'Bank') {
                          for (let i = 0; i < this.categoryOptions.length; i++) {
                              reportDataSetsPerson[i].data.push(0);
                              reportDataSetsFamily[i].data.push(0);
                          }
                      }
                      else {
                          reportDataSetsPerson[0].data.push(0);
                          reportDataSetsFamily[0].data.push(0);
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
            let bankOptionIndex = 0;
             if (this.category == 'Bank') {
                bankOptionIndex = this.categoryOptions.findIndex(obj => obj.value === this.populationRecords[i].lienBanque);
                 if (bankOptionIndex === -1) {
                     bankOptionIndex = this.categoryOptions.length - 1;
                 }
             }

            if(!this.populationRecords[i].n1824) {
                this.populationRecords[i].n1824 = 0;
            }
            const line:any[] =[] ;
            line.push(this.populationRecords[i].dateStat);
            if (this.category == 'Bank') {
            line.push(this.categoryOptions[bankOptionIndex].label);
            }
            else {
                line.push(this.bankShortName);
            }
            line.push(this.populationRecords[i].nFam);
            line.push(this.populationRecords[i].nPers);
            line.push(this.populationRecords[i].nNour);
            line.push(this.populationRecords[i].nBebe);
            line.push(this.populationRecords[i].nEnf);
            line.push(this.populationRecords[i].nAdo);
            line.push(this.populationRecords[i].n1824);
            line.push(this.populationRecords[i].nSen);
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
