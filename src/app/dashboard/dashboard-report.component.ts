import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {globalAuthState} from '../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {AuthState} from '../auth/reducers';
import {MovementReportHttpService} from '../movements/services/movement-report-http.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {MovementReport} from '../movements/model/movementReport';
import {ExcelService} from '../services/excel.service';
import {BanqueClientReport} from '../banques/model/banqueClientReport';
import {BanqueReportService} from '../banques/services/banque-report.service';
import {BanqueOrgCount} from '../banques/model/banqueOrgCount';
import {Depot} from '../depots/model/depot';
import {DepotHttpService} from '../depots/services/depot-http.service';
import {OrganisationHttpService} from '../organisations/services/organisation-http.service';
import {Organisation} from '../organisations/model/organisation';
import {enmStatusCompany} from '../shared/enums';

@Component({
    selector: 'app-dashboard-report',
    templateUrl: './dashboard-report.component.html',
    styleUrls: ['./dashboard-report.component.css']
})
export class DashboardReportComponent implements OnInit {
    
    days: string[];
    orgs: string[];
    selectedDay: string;
    selectedOrg: string;

    booIsLoaded: boolean;
    booIsLoadedMovements: boolean;
    category: string;
    bankOptions: any[];
    depotOptions: any[];
    categoryOptions: any[];
    bankShortName: string;
    bankId: number;
    dailyMovements: MovementReport[];
    selectedMovements: MovementReport[];

    banqueOrgReportRecords: BanqueClientReport[];
    clientNFam: number[];
    clientNpers: number[];
    clientNNour: number[];
    clientNBebe: number[];
    clientNEnf: number[];
    clientNAdo: number[];
    clientN1824: number[];
    clientNSen: number[];
    clientNAdults: number[];
    clientNFamAgreed: number[];
    clientNpersAgreed: number[];
    clientNNourAgreed: number[];
    clientNBebeAgreed: number[];
    clientNEnfAgreed: number[];
    clientNAdoAgreed: number[];
    clientN1824Agreed: number[];
    clientNSenAgreed: number[];
    clientNAdultsAgreed: number[];
    clientNFamGestBen: number[];
    clientNpersGestBen: number[];
    clientNNourGestBen: number[];
    clientNBebeGestBen: number[];
    clientNEnfGestBen: number[];
    clientNAdoGestBen: number[];
    clientN1824GestBen: number[];
    clientNSenGestBen: number[];
    clientNAdultsGestBen: number[];
    clientNbofOrgs: number[];
    clientNbofOrgsAgreed: number[];
    clientNbofOrgsGestBen: number[];
    totalClientNFam: number;
    totalClientNpers: number;
    totalClientNNour: number;
    totalClientNBebe: number;
    totalClientNEnf: number;
    totalClientNAdo: number;
    totalClientN1824: number;
    totalClientNSen: number;
    totalClientNAdults: number;
    totalClientNFamAgreed: number;
    totalClientNpersAgreed: number;
    totalClientNNourAgreed: number;
    totalClientNBebeAgreed: number;
    totalClientNEnfAgreed: number;
    totalClientNAdoAgreed: number;
    totalClientN1824Agreed: number;
    totalClientNSenAgreed: number;
    totalClientNAdultsAgreed: number;
    totalClientNFamGestBen: number;
    totalClientNpersGestBen: number;
    totalClientNNourGestBen: number;
    totalClientNBebeGestBen: number;
    totalClientNEnfGestBen: number;
    totalClientNAdoGestBen: number;
    totalClientN1824GestBen: number;
    totalClientNSenGestBen: number;
    totalClientNAdultsGestBen: number;
    totalClientNbofOrgs: number;
    totalClientNbofOrgsAgreed: number;
    totalClientNbofOrgsGestBen: number;
    orgCount: number;
    orgDepotCount: number;
    orgFeadCount: number;
    orgAgreedCount: number;
    orgFeadFromUsCount: number;
    orgGuestHouseCount: number;
    orgOCMWCpasCount: number;
    orgVZWSPRLCount:number;
    orgPublicAuxiliaryCount:number;
    orgOnePersonCount:number;
    orgUnregisteredCount: number;
    userBankCount: number;
    userOrgCount: number;
    memberBankCount: number;
    memberOrgCount: number;
    statuts: any[];
    totalFoodDeliveryFamiliesCurrent: number;
    totalFoodDeliveryPersonsCurrent: number;
    totalFoodDeliveryFamiliesPrevious: number;
    totalFoodDeliveryPersonsPrevious: number;
    totalFoodDeliveryFamiliesPrevious1: number;
    totalFoodDeliveryPersonsPrevious1: number;
    totalFoodDeliveriesCurrentOrganisations:number;
    totalFoodDeliveriesPreviousOrganisations:number;
    totalFoodDeliveriesPrevious1Organisations:number;
    totalFoodDeliveriesCurrent: number;
    totalFoodDeliveriesPrevious: number;
    totalFoodDeliveriesPrevious1: number;
    totalFoodDeliveriesCurrentPerFamily: number;
    totalFoodDeliveriesCurrentPerPerson: number;
    totalFoodDeliveriesPreviousPerFamily: number;
    totalFoodDeliveriesPreviousPerPerson: number;
    totalFoodDeliveriesPrevious1PerFamily: number;
    totalFoodDeliveriesPrevious1PerPerson: number;
    foodDeliveriesbyCategoryCurrent:number[];
    foodDeliveriesbyCategoryPrevious:number[];
    foodDeliveriesbyCategoryPrevious1:number[];
    foodDeliveriesbyCategoryCurrentPerFamily:number[];
    foodDeliveriesbyCategoryPreviousPerFamily:number[];
    foodDeliveriesbyCategoryPrevious1PerFamily:number[];
    foodDeliveriesbyCategoryCurrentPerPerson:number[];
    foodDeliveriesbyCategoryPreviousPerPerson:number[];
    foodDeliveriesbyCategoryPrevious1PerPerson:number[];

    currentOrganisationsByCategory:number[] = [];
    previousOrganisationsByCategory:number[]= [];
    previous1OrganisationsByCategory:number[]= [];
    currentFamiliesByCategory :number[] = [];
    currentPersonsByCategory :number[] = [];
    previousFamiliesByCategory :number[] = [];
    previousPersonsByCategory :number[] = [];
    previous1FamiliesByCategory :number[] = [];
    previous1PersonsByCategory :number[] = [];

    currentPeriod:number;
    previousPeriod: number;
    previousPeriod1: number;

    constructor(
        private movementReportHttpService: MovementReportHttpService,
        private banqueReportService: BanqueReportService,
        private organisationHttpService: OrganisationHttpService,
        private depotHttpService: DepotHttpService,
        private banqueService: BanqueEntityService,
        private excelService: ExcelService,
        private authService: AuthService,
        private http: HttpClient,
        private store: Store<AppState>
    ) {
    this.bankShortName = '';
    this.booIsLoaded = false;
    this.booIsLoadedMovements = false;
    this.dailyMovements = [];
    this.selectedMovements = [];
    this.statuts = enmStatusCompany;
    this.currentPeriod = new Date().getFullYear();
    this.previousPeriod = this.currentPeriod - 1;
    this.previousPeriod1 = this.currentPeriod - 2;
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
    }

    private initializeDependingOnUserRights(authState: AuthState) {
        switch (authState.user.rights) {

            case 'Admin_Banq':
            case 'Bank':
                this.bankShortName = authState.banque.bankShortName;
                this.bankId = authState.banque.bankId;
                this.category = 'Depot';
                this.depotHttpService.getDepotReport(this.authService.accessToken,this.bankShortName)
                    .subscribe((depots:Depot[]) => {
                        this.depotOptions = depots.map(({idDepot, nom}) => ({'value': idDepot, 'label': nom}));
                        this.categoryOptions =[...this.depotOptions];
                        this.categoryOptions.push({label: 'OTHER', value: null});
                        this.depotOptions.unshift({'value': null, 'label': ' '});
                        if (!this.booIsLoaded) {
                            this.report();
                        }
                        this.booIsLoaded = true;
                    });
                break;
            case 'admin':
            case 'Admin_FBBA':
                const classicBanks = {'classicBanks': '1'};
                this.banqueService.getWithQuery(classicBanks)
                    .subscribe((banquesEntities) => {
                        this.bankOptions = banquesEntities.map(({bankShortName,bankId}) => ({
                            'label': bankShortName,
                            'value': bankId
                        }));
                        this.categoryOptions =[...this.bankOptions];
                        this.categoryOptions.push({label: 'OTHER', value: null});
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
initializeClientsArrays() {
    this.clientNFam= [];
    this.clientNpers= [];
    this.clientNNour= [];
    this.clientNBebe= [];
    this.clientNEnf= [];
    this.clientNAdo= [];
    this.clientN1824= [];
    this.clientNSen= [];
    this.clientNAdults= [];
    this.clientNFamAgreed= [];
    this.clientNpersAgreed= [];
    this.clientNNourAgreed= [];
    this.clientNBebeAgreed= [];
    this.clientNEnfAgreed= [];
    this.clientNAdoAgreed= [];
    this.clientN1824Agreed= [];
    this.clientNSenAgreed= [];
    this.clientNAdultsAgreed= [];
    this.clientNFamGestBen= [];
    this.clientNpersGestBen= [];
    this.clientNNourGestBen= [];
    this.clientNBebeGestBen= [];
    this.clientNEnfGestBen= [];
    this.clientNAdoGestBen= [];
    this.clientN1824GestBen= [];
    this.clientNSenGestBen= [];
    this.clientNAdultsGestBen= [];
    this.clientNbofOrgs= [];
    this.clientNbofOrgsAgreed= [];
    this.clientNbofOrgsGestBen= [];

    for (let i = 0; i < this.categoryOptions.length; i++) {
        this.clientNFam.push(0);
        this.clientNpers.push(0);
        this.clientNNour.push(0);
        this.clientNBebe.push(0);
        this.clientNEnf.push(0);
        this.clientNAdo.push(0);
        this.clientN1824.push(0);
        this.clientNSen.push(0);
        this.clientNAdults.push(0);
        this.clientNFamAgreed.push(0);
        this.clientNpersAgreed.push(0);
        this.clientNNourAgreed.push(0);
        this.clientNBebeAgreed.push(0);
        this.clientNEnfAgreed.push(0);
        this.clientNAdoAgreed.push(0);
        this.clientN1824Agreed.push(0);
        this.clientNSenAgreed.push(0);
        this.clientNAdultsAgreed.push(0);
        this.clientNFamGestBen.push(0);
        this.clientNpersGestBen.push(0);
        this.clientNNourGestBen.push(0);
        this.clientNBebeGestBen.push(0);
        this.clientNEnfGestBen.push(0);
        this.clientNAdoGestBen.push(0);
        this.clientN1824GestBen.push(0);
        this.clientNSenGestBen.push(0);
        this.clientNAdultsGestBen.push(0);
        this.clientNbofOrgs.push(0);
        this.clientNbofOrgsAgreed.push(0);
        this.clientNbofOrgsGestBen.push(0);
    }
}
    report() {
        this.totalFoodDeliveryFamiliesCurrent = 0;
        this.totalFoodDeliveryPersonsCurrent = 0;
        this.totalFoodDeliveryFamiliesPrevious = 0;
        this.totalFoodDeliveryPersonsPrevious = 0;
        this.totalFoodDeliveryFamiliesPrevious1 = 0;
        this.totalFoodDeliveryPersonsPrevious1 = 0;
        this.totalFoodDeliveriesCurrentOrganisations = 0;
        this.totalFoodDeliveriesPreviousOrganisations = 0;
        this.totalFoodDeliveriesPrevious1Organisations = 0;
        this.totalFoodDeliveriesCurrent = 0;
        this.totalFoodDeliveriesPrevious = 0;
        this.totalFoodDeliveriesPrevious1 = 0;
        this.totalFoodDeliveriesCurrentPerFamily = 0;
        this.totalFoodDeliveriesCurrentPerPerson = 0;
        this.totalFoodDeliveriesPreviousPerFamily = 0;
        this.totalFoodDeliveriesPreviousPerPerson = 0;
        this.totalFoodDeliveriesPrevious1PerFamily = 0;
        this.totalFoodDeliveriesPrevious1PerPerson = 0;
        this.foodDeliveriesbyCategoryCurrent = [];
        this.foodDeliveriesbyCategoryPrevious = [];
        this.foodDeliveriesbyCategoryPrevious1 = [];
        this.foodDeliveriesbyCategoryCurrentPerFamily = [];
        this.foodDeliveriesbyCategoryPreviousPerFamily = [];
        this.foodDeliveriesbyCategoryPrevious1PerFamily = [];
        this.foodDeliveriesbyCategoryCurrentPerPerson = [];
        this.foodDeliveriesbyCategoryPreviousPerPerson = [];
        this.foodDeliveriesbyCategoryPrevious1PerPerson = [];

        this.movementReportHttpService.getMovementMonthlyReport(this.authService.accessToken,
            this.bankShortName).subscribe(
            (response: MovementReport[]) => {
                const movementReports = response;
                let previousOrganisationData :{idOrg: number,categoryIndex: number,nfamilies: number,npersons: number}[] = [];
                let currentOrganisationData :{idOrg: number,categoryIndex: number, nfamilies: number,npersons: number}[]= [];
                let previous1OrganisationData :{idOrg: number,categoryIndex: number,nfamilies: number,npersons: number}[] = [];

                for (let i = 0; i < this.categoryOptions.length; i++) {
                    this.foodDeliveriesbyCategoryCurrent.push(0);
                    this.foodDeliveriesbyCategoryPrevious.push(0);
                    this.foodDeliveriesbyCategoryPrevious1.push(0);
                    this.foodDeliveriesbyCategoryCurrentPerFamily.push(0);
                    this.foodDeliveriesbyCategoryPreviousPerFamily.push(0);
                    this.foodDeliveriesbyCategoryPrevious1PerFamily.push(0);
                    this.foodDeliveriesbyCategoryCurrentPerPerson.push(0);
                    this.foodDeliveriesbyCategoryPreviousPerPerson.push(0);
                    this.foodDeliveriesbyCategoryPrevious1PerPerson.push(0);
                    this.currentFamiliesByCategory.push(0);
                    this.currentPersonsByCategory.push(0);
                    this.currentOrganisationsByCategory.push(0);
                    this.previousFamiliesByCategory.push(0);
                    this.previousPersonsByCategory.push(0);
                    this.previousOrganisationsByCategory.push(0);
                    this.previous1FamiliesByCategory.push(0);
                    this.previous1PersonsByCategory.push(0);
                    this.previous1OrganisationsByCategory.push(0);

                }


                for (let i = 0; i < movementReports.length; i++) {
                    if (movementReports[i].orgname) {
                        movementReports[i].orgname = movementReports[i].orgname.replace(/[^0-9a-z]/gi, '');
                    }

                    let categoryOptionIndex = -1;
                    if (this.category == 'Depot') {
                        categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.value === movementReports[i].lienDepot.toString());
                    } else {
                        categoryOptionIndex = this.categoryOptions.findIndex(obj => obj.label === movementReports[i].bankShortName);
                    }
                    if (categoryOptionIndex === -1) {
                        categoryOptionIndex = this.categoryOptions.length - 1;
                    }
                    const movementYear = String(movementReports[i].month).substring(0, 4);
                    if (parseInt(movementYear, 10) < this.previousPeriod1) continue;
                    switch (movementYear) {
                        case this.currentPeriod.toString():
                            const currentOrganisationDataItem = currentOrganisationData.find(item => item.idOrg === movementReports[i].idOrg && item.categoryIndex === categoryOptionIndex)
                            if (!currentOrganisationDataItem) {
                                currentOrganisationData.push({idOrg: movementReports[i].idOrg, categoryIndex: categoryOptionIndex,
                                    nfamilies:movementReports[i].nfamilies, npersons :movementReports[i].npersons});
                            }
                            this.foodDeliveriesbyCategoryCurrent[categoryOptionIndex] += movementReports[i].quantity;
                            this.totalFoodDeliveriesCurrent += movementReports[i].quantity;

                            break;
                        case this.previousPeriod.toString():

                            const previousOrganisationDataItem = previousOrganisationData.find(item => item.idOrg === movementReports[i].idOrg && item.categoryIndex === categoryOptionIndex)
                            if (!previousOrganisationDataItem) {
                                previousOrganisationData.push({idOrg: movementReports[i].idOrg,categoryIndex: categoryOptionIndex,
                                    nfamilies:movementReports[i].nfamilies, npersons :movementReports[i].npersons});
                            }
                            this.foodDeliveriesbyCategoryPrevious[categoryOptionIndex] += movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious += movementReports[i].quantity;
                            break;
                        case this.previousPeriod1.toString():
                            const previous1OrganisationDataItem = previous1OrganisationData.find(item => item.idOrg === movementReports[i].idOrg && item.categoryIndex === categoryOptionIndex)
                            if (!previous1OrganisationDataItem) {
                                previous1OrganisationData.push({idOrg: movementReports[i].idOrg,categoryIndex: categoryOptionIndex,
                                    nfamilies:movementReports[i].nfamilies, npersons :movementReports[i].npersons});
                            }
                            this.foodDeliveriesbyCategoryPrevious1[categoryOptionIndex] += movementReports[i].quantity;
                            this.totalFoodDeliveriesPrevious1 += movementReports[i].quantity;
                            break;

                        default:

                    }
                }
                currentOrganisationData.forEach(item => {
                    this.totalFoodDeliveryFamiliesCurrent += item.nfamilies;
                    this.totalFoodDeliveryPersonsCurrent += item.npersons;
                });
                this.totalFoodDeliveriesCurrentOrganisations = currentOrganisationData.length;
                previousOrganisationData.forEach(item => {
                    this.totalFoodDeliveryFamiliesPrevious += item.nfamilies;
                    this.totalFoodDeliveryPersonsPrevious += item.npersons;
                });
                this.totalFoodDeliveriesPreviousOrganisations = previousOrganisationData.length;
                previous1OrganisationData.forEach(item => {
                    this.totalFoodDeliveryFamiliesPrevious1 += item.nfamilies;
                    this.totalFoodDeliveryPersonsPrevious1 += item.npersons;
                });
                this.totalFoodDeliveriesPrevious1Organisations = previous1OrganisationData.length;
                if (this.totalFoodDeliveryFamiliesCurrent >0) {
                    this.totalFoodDeliveriesCurrentPerFamily =
                        this.totalFoodDeliveriesCurrent / this.totalFoodDeliveryFamiliesCurrent;
                }
                if (this.totalFoodDeliveryFamiliesPrevious >0) {
                    this.totalFoodDeliveriesPreviousPerFamily =
                        this.totalFoodDeliveriesPrevious / this.totalFoodDeliveryFamiliesPrevious;
                }
                if (this.totalFoodDeliveryFamiliesPrevious1 >0) {
                    this.totalFoodDeliveriesPrevious1PerFamily =
                        this.totalFoodDeliveriesPrevious1 / this.totalFoodDeliveryFamiliesPrevious1;
                }
                if (this.totalFoodDeliveryPersonsCurrent >0) {
                    this.totalFoodDeliveriesCurrentPerPerson =
                        this.totalFoodDeliveriesCurrent / this.totalFoodDeliveryPersonsCurrent;
                }
                if (this.totalFoodDeliveryPersonsPrevious >0) {
                    this.totalFoodDeliveriesPreviousPerPerson =
                        this.totalFoodDeliveriesPrevious / this.totalFoodDeliveryPersonsPrevious;
                }
                if (this.totalFoodDeliveryPersonsPrevious1 >0) {
                    this.totalFoodDeliveriesPrevious1PerPerson =
                        this.totalFoodDeliveriesPrevious1 / this.totalFoodDeliveryPersonsPrevious1;
                }
                for (let i = 0; i < this.categoryOptions.length; i++) {
                    currentOrganisationData.filter(item => item.categoryIndex ===i)
                        .map(item => {
                            this.currentFamiliesByCategory[i] += item.nfamilies;
                            this.currentPersonsByCategory[i] += item.npersons;
                            this.currentOrganisationsByCategory[i] ++;
                        });
                    previousOrganisationData.filter(item => item.categoryIndex ===i)
                        .map(item => {
                            this.previousFamiliesByCategory[i] += item.nfamilies;
                            this.previousPersonsByCategory[i] += item.npersons;
                            this.previousOrganisationsByCategory[i] ++;
                        });
                    previous1OrganisationData.filter(item => item.categoryIndex ===i)
                        .map(item => {
                            this.previous1FamiliesByCategory[i] += item.nfamilies;
                            this.previous1PersonsByCategory[i]  += item.npersons;
                            this.previous1OrganisationsByCategory[i] ++;
                        });
                    if (this.currentFamiliesByCategory[i] >0) {
                        this.foodDeliveriesbyCategoryCurrentPerFamily[i] =
                            this.foodDeliveriesbyCategoryCurrent[i] / this.currentFamiliesByCategory[i];
                    }
                    if (this.currentPersonsByCategory[i] >0) {
                        this.foodDeliveriesbyCategoryCurrentPerPerson[i] =
                            this.foodDeliveriesbyCategoryCurrent[i] / this.currentPersonsByCategory[i];
                    }
                    if (this.previousFamiliesByCategory[i] >0) {
                        this.foodDeliveriesbyCategoryPreviousPerFamily[i] =
                            this.foodDeliveriesbyCategoryPrevious[i] / this.previousFamiliesByCategory[i];
                    }
                    if (this.previousPersonsByCategory[i] >0) {
                        this.foodDeliveriesbyCategoryPreviousPerPerson[i] =
                            this.foodDeliveriesbyCategoryPrevious[i] / this.previousPersonsByCategory[i];
                    }
                    if (this.previous1FamiliesByCategory[i] >0) {
                        this.foodDeliveriesbyCategoryPrevious1PerFamily[i] =
                            this.foodDeliveriesbyCategoryPrevious1[i] / this.previous1FamiliesByCategory[i];
                    }
                    if (this.previous1PersonsByCategory[i] >0) {
                        this.foodDeliveriesbyCategoryPrevious1PerPerson[i] =
                            this.foodDeliveriesbyCategoryPrevious1[i] / this.previous1PersonsByCategory[i];
                    }

                }

            })

        const lastDays = '10';

        this.movementReportHttpService.getMovementDailyReport(this.authService.accessToken,
            this.bankShortName, null,null,null,lastDays).subscribe(
            (response: MovementReport[]) => {
                const movementsRecords = response;
                this.dailyMovements = [];
                for (let i = 0; i < movementsRecords.length; i++) {
                    this.dailyMovements.push(movementsRecords[i]);
                }
                this.selectedMovements = this.dailyMovements;
                if (!this.booIsLoadedMovements)  {
                    this.setDropdownDays();
                    this.setDropdownOrgs();
                    this.booIsLoadedMovements = true;
                }


            });

        this.totalClientNFam=0
        this.totalClientNpers=0;
        this.totalClientNNour=0;
        this.totalClientNBebe=0;
        this.totalClientNEnf=0;
        this.totalClientNAdo=0;
        this.totalClientN1824=0;
        this.totalClientNSen=0;
        this.totalClientNAdults=0;
        this.totalClientNFamAgreed=0
        this.totalClientNpersAgreed=0;
        this.totalClientNNourAgreed=0;
        this.totalClientNBebeAgreed=0;
        this.totalClientNEnfAgreed=0;
        this.totalClientNAdoAgreed=0;
        this.totalClientN1824Agreed=0;
        this.totalClientNSenAgreed=0;
        this.totalClientNAdultsAgreed=0;
        this.totalClientNFamGestBen=0
        this.totalClientNpersGestBen=0;
        this.totalClientNNourGestBen=0;
        this.totalClientNBebeGestBen=0;
        this.totalClientNEnfGestBen=0;
        this.totalClientNAdoGestBen=0;
        this.totalClientN1824GestBen=0;
        this.totalClientNSenGestBen=0;
        this.totalClientNAdultsGestBen=0;
        this.totalClientNbofOrgs=0;
        this.totalClientNbofOrgsAgreed=0;
        this.totalClientNbofOrgsGestBen=0;
        this.initializeClientsArrays();
        this.banqueReportService.getOrgClientReport(this.authService.accessToken,this.bankShortName).subscribe(
            (response: BanqueClientReport[]) => {
                const banqueOrgReportRecords: BanqueClientReport[] = response;
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

                    this.totalClientNbofOrgs+=  banqueOrgReportRecords[i].orgCount;
                    this.totalClientNFam += banqueOrgReportRecords[i].nFam;
                    this.totalClientNpers += banqueOrgReportRecords[i].nPers;
                    this.totalClientNNour += banqueOrgReportRecords[i].nNour;
                    this.totalClientNBebe += banqueOrgReportRecords[i].nBebe;
                    this.totalClientNEnf += banqueOrgReportRecords[i].nEnf;
                    this.totalClientNAdo += banqueOrgReportRecords[i].nAdo;
                    this.totalClientN1824 += banqueOrgReportRecords[i].n1824;
                    this.totalClientNSen += banqueOrgReportRecords[i].nSen;
                    this.clientNbofOrgs[indexLabel] += banqueOrgReportRecords[i].orgCount;
                    this.clientNFam[indexLabel] += banqueOrgReportRecords[i].nFam;
                    this.clientNpers[indexLabel] += banqueOrgReportRecords[i].nPers;
                    this.clientNNour[indexLabel] += banqueOrgReportRecords[i].nNour;
                    this.clientNBebe[indexLabel] += banqueOrgReportRecords[i].nBebe;
                    this.clientNEnf[indexLabel] += banqueOrgReportRecords[i].nEnf;
                    this.clientNAdo[indexLabel] += banqueOrgReportRecords[i].nAdo;
                    this.clientN1824[indexLabel] += banqueOrgReportRecords[i].n1824;
                    this.clientNSen[indexLabel] += banqueOrgReportRecords[i].nSen;
                    this.clientNAdults[indexLabel] += banqueOrgReportRecords[i].nPers - banqueOrgReportRecords[i].nBebe - banqueOrgReportRecords[i].nEnf - banqueOrgReportRecords[i].nAdo - banqueOrgReportRecords[i].n1824 - banqueOrgReportRecords[i].nSen;


                    if (banqueOrgReportRecords[i].nonAgreed == 0) {
                        this.totalClientNbofOrgsAgreed+=  banqueOrgReportRecords[i].orgCount;
                        this.totalClientNFamAgreed += banqueOrgReportRecords[i].nFam;
                        this.totalClientNpersAgreed += banqueOrgReportRecords[i].nPers;
                        this.totalClientNNourAgreed += banqueOrgReportRecords[i].nNour;
                        this.totalClientNBebeAgreed += banqueOrgReportRecords[i].nBebe;
                        this.totalClientNEnfAgreed += banqueOrgReportRecords[i].nEnf;
                        this.totalClientNAdoAgreed += banqueOrgReportRecords[i].nAdo;
                        this.totalClientN1824Agreed += banqueOrgReportRecords[i].n1824;
                        this.totalClientNSenAgreed += banqueOrgReportRecords[i].nSen;
                        this.clientNbofOrgsAgreed[indexLabel] += banqueOrgReportRecords[i].orgCount;
                        this.clientNFamAgreed[indexLabel] += banqueOrgReportRecords[i].nFam;
                        this.clientNpersAgreed[indexLabel] += banqueOrgReportRecords[i].nPers;
                        this.clientNNourAgreed[indexLabel] += banqueOrgReportRecords[i].nNour;
                        this.clientNBebeAgreed[indexLabel] += banqueOrgReportRecords[i].nBebe;
                        this.clientNEnfAgreed[indexLabel] += banqueOrgReportRecords[i].nEnf;
                        this.clientNAdoAgreed[indexLabel] += banqueOrgReportRecords[i].nAdo;
                        this.clientN1824Agreed[indexLabel] += banqueOrgReportRecords[i].n1824;
                        this.clientNSenAgreed[indexLabel] += banqueOrgReportRecords[i].nSen;
                        this.clientNAdultsAgreed[indexLabel] += banqueOrgReportRecords[i].nPers - banqueOrgReportRecords[i].nBebe - banqueOrgReportRecords[i].nEnf - banqueOrgReportRecords[i].nAdo - banqueOrgReportRecords[i].n1824 - banqueOrgReportRecords[i].nSen;

                    }
                    if (banqueOrgReportRecords[i].gestBen == 1) {
                        this.totalClientNbofOrgsGestBen+=  banqueOrgReportRecords[i].orgCount;
                        this.totalClientNFamGestBen += banqueOrgReportRecords[i].nFam;
                        this.totalClientNpersGestBen += banqueOrgReportRecords[i].nPers;
                        this.totalClientNNourGestBen += banqueOrgReportRecords[i].nNour;
                        this.totalClientNBebeGestBen += banqueOrgReportRecords[i].nBebe;
                        this.totalClientNEnfGestBen += banqueOrgReportRecords[i].nEnf;
                        this.totalClientNAdoGestBen += banqueOrgReportRecords[i].nAdo;
                        this.totalClientN1824GestBen += banqueOrgReportRecords[i].n1824;
                        this.totalClientNSenGestBen += banqueOrgReportRecords[i].nSen;
                        this.clientNbofOrgsGestBen[indexLabel] += banqueOrgReportRecords[i].orgCount;
                        this.clientNFamGestBen[indexLabel] += banqueOrgReportRecords[i].nFam;
                        this.clientNpersGestBen[indexLabel] += banqueOrgReportRecords[i].nPers;
                        this.clientNNourGestBen[indexLabel] += banqueOrgReportRecords[i].nNour;
                        this.clientNBebeGestBen[indexLabel] += banqueOrgReportRecords[i].nBebe;
                        this.clientNEnfGestBen[indexLabel] += banqueOrgReportRecords[i].nEnf;
                        this.clientNAdoGestBen[indexLabel] += banqueOrgReportRecords[i].nAdo;
                        this.clientN1824GestBen[indexLabel] += banqueOrgReportRecords[i].n1824;
                        this.clientNSenGestBen[indexLabel] += banqueOrgReportRecords[i].nSen;
                        this.clientNAdultsGestBen[indexLabel] += banqueOrgReportRecords[i].nPers - banqueOrgReportRecords[i].nBebe - banqueOrgReportRecords[i].nEnf - banqueOrgReportRecords[i].nAdo - banqueOrgReportRecords[i].n1824 - banqueOrgReportRecords[i].nSen;

                    }
                }
                this.totalClientNAdults = this.totalClientNpers - this.totalClientNNour - this.totalClientNBebe - this.totalClientNEnf - this.totalClientNAdo - this.totalClientN1824 - this.totalClientNSen;
                this.totalClientNAdultsAgreed = this.totalClientNpersAgreed - this.totalClientNNourAgreed - this.totalClientNBebeAgreed - this.totalClientNEnfAgreed - this.totalClientNAdoAgreed - this.totalClientN1824Agreed - this.totalClientNSenAgreed;
                this.totalClientNAdultsGestBen = this.totalClientNpersGestBen - this.totalClientNNourGestBen - this.totalClientNBebeGestBen - this.totalClientNEnfGestBen - this.totalClientNAdoGestBen - this.totalClientN1824GestBen - this.totalClientNSenGestBen;
            });
        const queryParams = {'actif': '1'};
        if (this.bankId) {
            queryParams['lienBanque'] = this.bankId;
        }
        let params = new URLSearchParams();
        for(let key in queryParams){
            params.set(key, queryParams[key])
        }
        this.orgCount= 0;
        this.orgDepotCount = 0;
        this.orgFeadCount=0;
        this.orgAgreedCount = 0;
        this.orgFeadFromUsCount = 0;
        this.orgGuestHouseCount = 0;
        this.orgOCMWCpasCount = 0;
        this.orgVZWSPRLCount = 0;
        this.orgUnregisteredCount =0;
        this.orgPublicAuxiliaryCount = 0;
        this.orgOnePersonCount = 0;

        this.organisationHttpService.getOrganisationReport(this.authService.accessToken, params.toString()).subscribe(
            (organisations: Organisation[]) => {
               organisations.map((org) => {
                   if (org.depyN) {
                       this.orgDepotCount++;
                   }
                   else {
                       this.orgCount++;
                       if (org.agreed) {
                           this.orgAgreedCount++;
                       }
                       if (org.birbCode > "0") {
                           this.orgFeadCount++;
                       }
                       if (org.feadN) {
                           this.orgFeadFromUsCount++;
                       }
                       if (org.msonac) {
                           this.orgGuestHouseCount++;
                       }
                       switch (org.statut) {
                           case '1':
                               this.orgVZWSPRLCount++;
                               break;
                           case '2':
                               this.orgUnregisteredCount++;
                               break;
                           case '3':
                               this.orgOCMWCpasCount++;
                               break;
                           case '4':
                               this.orgPublicAuxiliaryCount++;
                               break;
                           case '0':
                               this.orgOnePersonCount++;
                               break;
                           default:
                       }

                   }


                })
            })
        this.memberBankCount= 0;
        this.memberOrgCount= 0;
        this.userBankCount= 0;
        this.userOrgCount= 0;
            this.banqueReportService.getMembreCountReport(this.authService.accessToken,this.bankShortName).subscribe(
            (counts: BanqueOrgCount[]) => {
                counts.map( count => {
                    this.memberBankCount += count.bankCount;
                    this.memberOrgCount += count.orgCount;
                })
           });
        this.banqueReportService.getUserCountReport(this.authService.accessToken,this.bankShortName).subscribe(
            (counts: BanqueOrgCount[]) => {
                counts.map( count => {
                    this.userBankCount += count.bankCount;
                    this.userOrgCount += count.orgCount;
                })
            });

    }
    formatQuantity(quantity: number) {
        return `${quantity.toFixed(0)} kg`;
    }
    setDropdownDays() {
        const days = this.dailyMovements.map(x => x.day);
        const allDays = days.filter((value, index) => days.indexOf(value) === index);
        this.days = allDays.sort().reverse();
        this.filterDay(allDays[0]);
    }
    setDropdownOrgs() {
        this.orgs = this.dailyMovements.sort(({idOrg:a}, {idOrg:b}) => a-b).map(x => x.idOrg + ' ' + x.orgname).filter((v, i, a) => a.indexOf(v) === i);
        this.orgs.unshift(" ");
    }
    filterDay(myDay: string) {
        this.selectedDay = myDay;
        this.selectedOrg = " ";
        this.selectedMovements = this.dailyMovements.filter(x => x.day === myDay);
    }
    filterOrg(myOrg: string) {
        this.selectedOrg = myOrg;
        this.selectedDay = " ";
        this.selectedMovements = this.dailyMovements.filter(x => (x.idOrg + ' ' + x.orgname) === myOrg);
    }
    labelClientNbOfOrgs() {
        return $localize`:@@ClientNbOfOrgs:Number of Organisations(including Depots)`;
    }
    labelClientNFam() {
        return $localize`:@@ClientNFam:Families`;
    }
    labelClientNpers() {
        return $localize`:@@ClientNpers:Persons`;
    }
    labelClientAdults() {
        return $localize`:@@ClientAdults:Adults`;
    }
    labelClientNNour() {
        return $localize`:@@ClientNNour:Infants`;
    }
    labelClientNBebe() {
        return $localize`:@@ClientNBebe:Babies`;
    }
    labelClientNEnf() {
        return $localize`:@@ClientChild:Children`;
    }
    labelClientNAdo() {
        return $localize`:@@ClientNAdo:Adolescents`;
    }
    labelClientN1824() {
        return $localize`:@@ClientN1824:Young Adults`;
    }
    labelClientNSen() {
        return $localize`:@@ClientSeniors:Seniors`;
    }
    labelOrgsTotal() {
        return $localize`:@@OrgsTotal:All Organisations`;
    }
    labelOrgsAgreed() {
        return $localize`:@@OrgsAgreed:Agreed Organisations`;
    }
    labelOrgsGestBen() {
        return $localize`:@@OrgsGestBen:Organisations Recording Beneficiaries`;
    }
    labelOrgCount() {
        return $localize`:@@OrgCount:Number of Organisations`;
    }
    labelOrgFeadCount() {
        return $localize`:@@OrgFeadCount:Number of FEAD Organisations`;
    }
    labelOrgAgreedCount() {
        return $localize`:@@OrgAgreedCount:Number of Agreed Organisations`;
    }
    labelOrgFeadFromUsCount() {
        return $localize`:@@OrgFeadFromUsCount:Number of FEAD Organisations receiving food from us`;
    }
    labelMemberBankCount() {
        return $localize`:@@MemberBankCount:Number of Bank Members`;
    }
    labelMemberOrgCount() {
        return $localize`:@@MemberOrgCount:Number of Organisation Members`;
    }
    labelUserBankCount() {
        return $localize`:@@UserBankCount:Number of Bank Users`;
    }
    labelUserOrgCount() {
        return $localize`:@@UserorgCount:Number of Organisation Users`;
    }
    labelGuestHouseCount() {
        return $localize`:@@OrgGuestHousesCount:Number of Guest Houses`;
    }

    labelDepotCount() {
        return $localize`:@@OrgDepots:Number of Depots`;
    }
    labelStatus(status: string) {
        return this.statuts.find(statut => statut.value === status).label;
    }

    labelFoodDeliveries() {
        return $localize`:@@FoodDeliveries:Food Deliveries`;
    }

    labelPeriod() {
        return $localize`:@@Period:Period`;
    }

    labelFoodDelivered() {
        return $localize`:@@FoodDelivered:Food Delivered`;
    }

    labelPerFamily() {
        return $localize`:@@PerFamily:Per Family`;
    }

    labelPerPerson() {
        return $localize`:@@PerPerson:Per Person`;
    }

    labelRecentActivity() {
        return $localize`:@@DistributionRecentActivity:Recent Activity`;
    }
}