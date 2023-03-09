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

@Component({
    selector: 'app-beneficiaries-list',
    templateUrl: './beneficiaries-list.component.html',
    styleUrls: ['./beneficiaries-list.component.css']
})

export class BeneficiariesListComponent implements OnInit {
    beneficiaires: Beneficiaire[]; // liste des bénéficiaires
    lienBanque: number;
    bankShortName: string;
    idOrg: number; // id de l'organisation
    orgName: string; // nom de l'organisation
    booIsLoaded: boolean;
    organisations: any[];
    filteredOrganisation: any;
    filteredOrganisations: any[];
    currentOrganisation: Organisation;
    summaryMessage: string;
    totalParentsMale: number;
    totalParentsFemale: number;
    booShowSimpler: boolean;
    constructor(
        private beneficiaireHttpService: BeneficiaireHttpService,
        private organisationsService: OrganisationEntityService,
        private orgsummaryService: OrgSummaryEntityService,
        private authService: AuthService,
        private http: HttpClient,
        private store: Store<AppState>
    ) {
        this.beneficiaires = [];
        this.booIsLoaded = false;
        this.booShowSimpler = false;
    }
    
    ngOnInit(): void {
        this.store
            .pipe(
                select(globalAuthState),
                map((authState) => {
                    if (!this.booIsLoaded && authState.user) {
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
                                this.lienBanque = authState.banque.bankId;
                                this.bankShortName = authState.banque.bankShortName;
                                const  queryOrganisationParms: QueryParams = {'lienBanque': this.lienBanque.toString(), 'gestBen': '1'};
                               if (authState.user.rights === 'Admin_CPAS' ) {
                                   queryOrganisationParms['cp'] = authState.organisation.cp;
                               }
                                this.orgsummaryService.getWithQuery(queryOrganisationParms)
                                    .subscribe(organisations => {
                                        this.organisations =organisations.map((organisation) =>
                                            Object.assign({}, organisation, {fullname: organisation.idDis + ' ' + organisation.societe})
                                        )
                                        if (this.organisations.length > 0) {
                                            this.idOrg = this.organisations[0].idDis;
                                            this.orgName = this.organisations[0].societe;
                                            this.loadBeneficiaries();
                                        }
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
        if (event && event.query && event.query.length > 0) {
            console.log('filter content', event.query.toLowerCase());
            queryOrganisationParms['societe'] = event.query.toLowerCase();
        }
        this.orgsummaryService.getWithQuery(queryOrganisationParms)
            .subscribe(filteredOrganisations => {
                this.filteredOrganisations = filteredOrganisations.map((organisation) =>
                    Object.assign({}, organisation, {fullname: organisation.idDis + ' ' + organisation.societe})
                );
            });
    }
    private loadBeneficiaries() {

        this.organisationsService.getByKey(this.idOrg).subscribe(
        (org: Organisation) => {
            if (org) {
                this.currentOrganisation = org;
                let params = new URLSearchParams();
                const benefQueryParams = {'lienDis': this.idOrg.toString(), 'actif': '1'};
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
                        this.totalParentsMale = 0;
                        this.totalParentsFemale = 0;
                        beneficiaires.map((item) => {
                            let nbParents = 1;
                            if (item.nomconj) {
                                nbParents = 2;
                                if (item.civiliteconj === 1) {
                                    this.totalParentsMale++;
                                } else {
                                    this.totalParentsFemale++;
                                }
                            }
                            item.nbParents = nbParents;
                            if (item.civilite === 1) {
                                this.totalParentsMale++;
                            } else {
                                this.totalParentsFemale++;
                            }
                            totalParents += nbParents;
                            totalDep += item.nbDep;
                            totalFamily += (item.nbDep +1);

                            item.nbFamily = item.nbDep +1;
                        });
                        this.summaryMessage = this.createSummaryText(); // no need to show parents male or female
                        this.booIsLoaded = true;
                    });
            }

        });

    }
    createSummaryText(): string
    { let summaryText = '';
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
        const nbOfAdtults = this.currentOrganisation.nPers - this.currentOrganisation.nNour - this.currentOrganisation.nBebe
            - this.currentOrganisation.nEnf - this.currentOrganisation.nAdo - this.currentOrganisation.n1824
            - this.currentOrganisation.nSen;
        summaryText = `${labelFamilies} : ${this.currentOrganisation.nFam} `
            + `${labelBeneficiaries} : ${this.currentOrganisation.nPers} `
   
        const parentsLabelMale = $localize`:@@ParentsMale:Parents Male`;
        const parentsLabelFemale = $localize`:@@ParentsFemale:Parents Female`;
        summaryText += `${parentsLabelMale}: ${this.totalParentsMale}, ${parentsLabelFemale}: ${this.totalParentsFemale} `;
       
        summaryText += `${labelInfants} : ${this.currentOrganisation.nNour} `
            + `${labelBabies} : ${this.currentOrganisation.nBebe} `
            + `${labelChildren} : ${this.currentOrganisation.nEnf} `
            + `${labelTeenAgers} : ${this.currentOrganisation.nAdo} `
            + `${labelYoungAdults} : ${this.currentOrganisation.n1824} `
            + `${labelAdults} : ${nbOfAdtults} `
            + `${labelSeniors} : ${this.currentOrganisation.nSen} `
            + `${labelEquivalents} : ${this.currentOrganisation.nEq}`
        ;

        return summaryText;
    }


    getTitle() {
        return $localize`:@@BeneficiariesOrgHeader:Beneficiaries of ${this.orgName} at ${new Date().toLocaleDateString('fr-FR')}`;
    }

    loadOrganisationBeneficiaries(event) {
        this.idOrg = event.idDis;
        this.orgName = event.societe;
        this.loadBeneficiaries();
    }
}