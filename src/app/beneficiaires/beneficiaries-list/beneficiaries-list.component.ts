import {Component, OnInit} from '@angular/core';
import {Beneficiaire} from '../model/beneficiaire';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {BeneficiaireHttpService} from '../services/beneficiaire-http.service';
import {AuthService} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {AppState} from '../../reducers';
import {Organisation} from '../../organisations/model/organisation';
import {OrganisationEntityService} from '../../organisations/services/organisation-entity.service';
import {QueryParams} from '@ngrx/data';
import {OrgSummaryEntityService} from '../../organisations/services/orgsummary-entity.service';
import {enmStatutFead} from '../../shared/enums';
import {OrganisationHttpService} from '../../organisations/services/organisation-http.service';

@Component({
    selector: 'app-beneficiaries-list',
    templateUrl: './beneficiaries-list.component.html',
    styleUrls: ['./beneficiaries-list.component.css']
})

export class BeneficiariesListComponent implements OnInit {
    beneficiaires: Beneficiaire[]; // liste des bénéficiaires
    lienBanque: number;
    lienCpas: number;
    bankShortName: string;
    idOrg: number; // id de l'organisation
    orgName: string; // nom de l'organisation
    booIsLoaded: boolean;
    organisations: any[];
    zipcodeOptions: any[];
    filteredOrganisation: any;
    filteredOrganisations: any[];
    currentOrganisation: Organisation;
    summaryMessage: string;
    totalNNour: number;
    totalBebe: number;
    totalEnfant: number;
    totalAdolescent: number;
    totalPers: number;
    totalFam: number;
    totalSenior: number;
    total1824: number;
    totalEq: number;
    orgParentsMale: number;
    orgParentsFemale: number;
    feadStatuses: any[];
    booShowSimpler: boolean;
    birbFilter: any;
    zipCodeFilter: any;


    constructor(
        private beneficiaireHttpService: BeneficiaireHttpService,
        private organisationHttpService: OrganisationHttpService,
        private organisationService: OrganisationEntityService,
        private orgsummaryService: OrgSummaryEntityService,

        private authService: AuthService,
        private http: HttpClient,
        private store: Store<AppState>
    ) {
        this.beneficiaires = [];
        this.booIsLoaded = false;
        this.booShowSimpler = false;
        this.lienCpas = 0;
        this.feadStatuses = enmStatutFead;
        this.feadStatuses.unshift({'value': null, 'label': 'Tous les Statuts'});
    }
    
    ngOnInit(): void {
        this.store
            .pipe(
                select(globalAuthState),
                map((authState) => {

                    if (!this.booIsLoaded && authState.user) {
                        this.lienBanque = authState.banque.bankId;
                        switch (authState.user.rights) {
                            case 'Asso':
                            case 'Admin_Asso':
                                this.idOrg = authState.organisation.idDis;
                                this.orgName = authState.organisation.societe;
                                this.loadBeneficiaries();
                                break;
                            case 'Admin_Banq':
                            case 'Bank':
                            case 'Admin_CPAS':

                                this.bankShortName = authState.banque.bankShortName;
                                if (authState.user.rights === 'Admin_CPAS' ) {
                                    this.lienCpas = authState.user.lienCpas;
                                }
                                const  queryOrganisationParms = {'lienBanque': this.lienBanque.toString(), 'gestBen': '1'};
                               if (authState.user.rights === 'Admin_CPAS' ) {
                                   queryOrganisationParms['lienCpas'] = this.lienCpas.toString();
                               }
                               this.zipcodeOptions = [];
                                this.organisations = [];
                                this.totalFam = 0;
                                this.totalPers = 0;
                                this.totalNNour = 0;
                                this.totalBebe = 0;
                                this.totalEnfant = 0;
                                this.totalAdolescent = 0;
                                this.totalSenior = 0;
                                this.total1824 = 0;
                                this.totalEq = 0;

                                let params = new URLSearchParams();
                                for(let key in queryOrganisationParms) {
                                    params.set(key, queryOrganisationParms[key])
                                }
                                this.organisationHttpService.getOrganisationReport(this.authService.accessToken, params.toString())
                                    .subscribe(organisations => {
                                        this.organisations =organisations.map((organisation) => {
                                                Object.assign({}, organisation, {fullname: organisation.idDis + ' ' + organisation.societe})
                                                const indexLabel = this.zipcodeOptions.findIndex(obj => obj.value === organisation.cp);
                                                if (indexLabel === -1) {
                                                    this.zipcodeOptions.push({'value': organisation.cp, 'label': organisation.cp + ' ' + organisation.localite});
                                                }
                                                this.totalFam += organisation.nFam;
                                                this.totalPers += organisation.nPers;
                                                this.totalNNour += organisation.nNour;
                                                this.totalBebe += organisation.nBebe;
                                                this.totalEnfant += organisation.nEnf;
                                                this.totalAdolescent += organisation.nAdo;
                                                this.totalSenior += organisation.nSen;
                                                this.total1824 += organisation.n1824;
                                                this.totalEq += organisation.nEq;
                                            }
                                        )
                                        this.organisations.unshift({'idDis': null, 'fullname': 'Toutes les organisations'});
                                        this.zipcodeOptions.sort((a, b) => a.value < b.value ? -1 : 1);
                                        this.zipcodeOptions.unshift({'value': null, 'label': 'Toutes les localités'});
                                        this.loadBeneficiaries();

                                    });
                                break;
                            default:
                        }
                    }
                })
            )
            .subscribe();
    }
    filterOrganisation(event ) {
        console.log('filterOrganisation', event);
        const  queryOrganisationParms: QueryParams =  {'lienBanque': this.lienBanque.toString(), 'gestBen': '1'};
        if (this.lienCpas >0) {
            queryOrganisationParms['lienCpas'] = this.lienCpas.toString();
        }

        if (event && event.query && event.query.length > 0) {
            console.log('filter content', event.query.toLowerCase());
            queryOrganisationParms['societe'] = event.query.toLowerCase();
        }
        this.orgsummaryService.getWithQuery(queryOrganisationParms)
            .subscribe(filteredOrganisations => {
                this.filteredOrganisations = filteredOrganisations.map((organisation) =>
                    Object.assign({}, organisation, {fullname: organisation.idDis + ' ' + organisation.societe})
                );
                this.filteredOrganisations.unshift({'idDis': null, 'fullname': 'Toutes les organisations'});
            });
    }
    private loadBeneficiaries() {
        let params = new URLSearchParams();
        const benefQueryParams = { 'actif': '1', 'lienBanque': this.lienBanque.toString()};
        if (this.idOrg >0) {
            benefQueryParams['lienDis'] = this.idOrg.toString();
        }
        else if (this.lienCpas >0) {
            benefQueryParams['lienCpas'] = this.lienCpas.toString();
        }
        if (this.birbFilter !== null && this.birbFilter !== undefined) {
            benefQueryParams['birb'] = this.birbFilter.toString();
        }
        if (this.zipCodeFilter) {
            benefQueryParams['cp'] = this.zipCodeFilter;
        }

        for (let key in benefQueryParams) {
            params.set(key, benefQueryParams[key])
        }
        this.beneficiaireHttpService.getBeneficiaireReport( this.authService.accessToken,params.toString()).subscribe(
            (beneficiaires: any[]) => {
                this.beneficiaires = beneficiaires;
                this.booIsLoaded = true;
                let totalParents = 0;
                let totalDep = 0;
                let totalFamily = 0;
                this.orgParentsMale = 0;
                this.orgParentsFemale = 0;
                beneficiaires.map((item) => {
                    let nbParents = 1;
                    if (item.nomconj) {
                        nbParents = 2;
                        if (item.civiliteconj === 1) {
                            this.orgParentsMale++;
                        } else {
                            this.orgParentsFemale++;
                        }
                    }
                    item.nbParents = nbParents;
                    if (item.civilite === 1) {
                        this.orgParentsMale++;
                    } else {
                        this.orgParentsFemale++;
                    }
                    totalParents += nbParents;
                    totalDep += item.nbDep;
                    totalFamily += (item.nbDep +1);

                    item.nbFamily = item.nbDep +1;
                });
               this.createSummaryText(); // no need to show parents male or female
                this.booIsLoaded = true;
            });
       }
    createSummaryText()   {
        this.summaryMessage = '';
        const labelFamilies = $localize`:@@Family:Family`;
        const labelBeneficiaries = $localize`:@@Beneficiaries:Beneficiaries`;
        const labelInfants = $localize`:@@Infants:Infants`;
        const labelBabies = $localize`:@@Babies:Babies`;
        const labelChildren = $localize`:@@Children:Children`;
        const labelTeenAgers = $localize`:@@TeenAgers:TeenAgers`;
        const labelYoungAdults = $localize`:@@YoungAdults:YoungAdults`;
        const labelAdults = $localize`:@@Adults:Adults`;
        const labelSeniors = $localize`:@@Seniors:Seniors`;
        const labelEquivalents = $localize`:@@Equivalents:Equivalents`;
        const parentsLabelMale = $localize`:@@ParentsMale:Parents Male`;
        const parentsLabelFemale = $localize`:@@ParentsFemale:Parents Female`;
        if (this.idOrg >0) {
            this.summaryMessage  = this.orgName + ' - ';
            this.organisationService.getByKey(this.idOrg).subscribe(
            (org: Organisation) => {
                    this.currentOrganisation = org;

                    const nbOfAdtults = this.currentOrganisation.nPers - this.currentOrganisation.nNour - this.currentOrganisation.nBebe
                        - this.currentOrganisation.nEnf - this.currentOrganisation.nAdo - this.currentOrganisation.n1824
                        - this.currentOrganisation.nSen;
                    this.summaryMessage += `${labelFamilies} : ${this.currentOrganisation.nFam} `
                        + `${labelBeneficiaries} : ${this.currentOrganisation.nPers} `


                    this.summaryMessage += `${labelInfants} : ${this.currentOrganisation.nNour} `
                        + `${labelBabies} : ${this.currentOrganisation.nBebe} `
                        + `${labelChildren} : ${this.currentOrganisation.nEnf} `
                        + `${labelTeenAgers} : ${this.currentOrganisation.nAdo} `
                        + `${labelYoungAdults} : ${this.currentOrganisation.n1824} `
                        + `${labelAdults} : ${nbOfAdtults} `
                        + `${labelSeniors} : ${this.currentOrganisation.nSen} `
                        + `${labelEquivalents} : ${this.currentOrganisation.nEq}`
                    ;

                })
            }
        else {
            const nbOfAdtults = this.totalPers - this.totalNNour - this.totalBebe
                - this.totalEnfant - this.totalAdolescent - this.total1824
                - this.totalSenior;
            this.summaryMessage += `${labelFamilies} : ${this.totalFam} `
                + `${labelBeneficiaries} : ${this.totalPers} `


            this.summaryMessage += `${parentsLabelMale}: ${this.orgParentsMale}, ${parentsLabelFemale}: ${this.orgParentsFemale} `;

            this.summaryMessage += `${labelInfants} : ${this.totalNNour} `
                + `${labelBabies} : ${this.totalBebe} `
                + `${labelChildren} : ${this.totalEnfant} `
                + `${labelTeenAgers} : ${this.totalAdolescent} `
                + `${labelYoungAdults} : ${this.total1824} `
                + `${labelAdults} : ${nbOfAdtults} `
                + `${labelSeniors} : ${this.totalSenior} `
                + `${labelEquivalents} : ${this.totalEq}`
            ;
        }
        }

    getTitle() {
        let subtitle = '';
        if (this.orgName) {
            subtitle = ' ' + this.orgName;
        }
        return $localize`:@@BeneficiariesOrgHeader:Beneficiaries ${subtitle} at ${new Date().toLocaleDateString('fr-FR')}`;
    }

    loadOrganisationBeneficiaries(event) {
        this.idOrg = event.idDis;
        this.orgName = event.societe;
        this.loadBeneficiaries();
    }



    FilterBirb(birbValue: number) {
        console.log('FilterBirb', birbValue);
        this.birbFilter = birbValue;
        this.loadBeneficiaries();
    }
    labelBirb(birb: number) {
        let birbLabel = "?"

        const indexItem = enmStatutFead.map(e => e.value).indexOf(birb);
        if (indexItem > -1) {
            birbLabel = enmStatutFead[indexItem ].label;
        }
        return birbLabel;
    }

    FilterZipcode(zipCode: string) {
        console.log('FilterZipcode', zipCode);
        this.zipCodeFilter = zipCode;
        this.loadBeneficiaries();
    }
    getDependentsTooltip() {
        return $localize`:@@BenefDependentsTooltip:This includes the beneficiary himself, eventually his partner, and his children`;
    }

}