import {Component, OnInit} from '@angular/core';
import {map} from 'rxjs/operators';
import {Organisation} from '../model/organisation';
import {globalAuthState} from '../../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {AuthState} from '../../auth/reducers';
import {AuthService} from '../../auth/auth.service';
import {OrganisationHttpService} from '../services/organisation-http.service';
import {QueryParams} from '@ngrx/data';
import {DepotEntityService} from '../../depots/services/depot-entity.service';

@Component({
    selector: 'app-orgBeneflist',
    templateUrl: './orgbeneflist.component.html',
    styleUrls: ['./orgbeneflist.component.css']
})

export class OrgBenefListComponent implements OnInit {

    organisations: Organisation[];
    totalRecords: number;
    totalFamilies: number;
    totalPersons: number;
    totalInfants: number;
    totalBabies: number;
    totalChildren: number;
    totalTeens: number;
    totalYoungAdults: number;
    totalSeniors: number;
    totalEq: number;
    totalAdults: number;
    totalStatistics: string;
    title: string;


    bankName: string;
    lienBanque: number;
    bankShortName: string;

    depots: any[];
    depotName: string;
    depotSelected: string;

    orgQueryParams: any;

    constructor( private organisationHttpService: OrganisationHttpService,
                 private depotService: DepotEntityService,
                private authService: AuthService,
                private store: Store<AppState>
    ) {


        this.lienBanque = 0;
        this.bankName = '';
        this.bankShortName = '';


    }

    ngOnInit() {

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
        if (authState.banque) {
            this.lienBanque = authState.banque.bankId;
            this.orgQueryParams= {'actif': '1','lienBanque': authState.banque.bankId.toString(),'agreed': '1','isDepot': '0'};
            if (authState.user.rights === 'Admin_CPAS' ) {
                this.orgQueryParams['cp'] = authState.organisation.cp;
            }
            this.bankName = authState.banque.bankName;
            this.bankShortName = authState.banque.bankShortName;
            const  queryDepotParms: QueryParams = {};
            queryDepotParms['offset'] = '0';
            queryDepotParms['rows'] = '999';
            queryDepotParms['sortField'] = 'idDepot';
            queryDepotParms['sortOrder'] = '1';
            queryDepotParms['idCompany'] = this.bankShortName;
            queryDepotParms['actif'] = '1';
            this.depotService.getWithQuery(queryDepotParms)
                .subscribe(depots => {
                    this.depots = [{ value: null, label: ' '}];
                    depots.map((depot) =>
                        this.depots.push({value: depot.idDepot, label: depot.nom})
                    );
                });
            this.loadOrganisations();
        }
    }
    filterDepot(event) {
        this.depotSelected = event.value;

        if (this.depotSelected) {
            this.depotName = this.depots.find((depot) => depot.value === this.depotSelected).label;
            this.orgQueryParams['lienDepot'] = this.depotSelected;
        } else {
            this.depotName = null;
            // delete idDepot entry
            if (this.orgQueryParams.hasOwnProperty('lienDepot')) {
                delete this.orgQueryParams['lienDepot'];
            }
        }
        this.loadOrganisations();
    }

    loadOrganisations(): void {

        let params = new URLSearchParams();
        for(let key in this.orgQueryParams){
            params.set(key, this.orgQueryParams[key])
        }
        this.totalFamilies = 0;
        this.totalPersons = 0;
        this.totalEq = 0;
        this.totalInfants = 0;
        this.totalBabies = 0;
        this.totalChildren = 0;
        this.totalTeens = 0;
        this.totalYoungAdults = 0;
        this.totalSeniors = 0;
        this.totalAdults = 0;
        this.organisationHttpService.getOrganisationReport(this.authService.accessToken, params.toString()).subscribe(
            (loadedOrganisations: any[]) => {



                loadedOrganisations.forEach((org) => {
                    this.totalFamilies += org.nFam;
                    this.totalPersons += org.nPers;
                    this.totalEq += org.nEq;
                    this.totalInfants += org.nNour;
                    this.totalBabies += org.nBebe;
                    this.totalChildren += org.nEnf;
                    this.totalTeens += org.nAdo;
                    this.totalYoungAdults += org.n1824;
                    this.totalSeniors += org.nSen;
                }
                );
                this.organisations= loadedOrganisations;
                this.totalAdults = this.totalPersons - this.totalInfants - this.totalBabies - this.totalChildren - this.totalTeens - this.totalYoungAdults - this.totalSeniors;
               this.totalStatistics = this.getTotalStatistics();
                this.title = this.getTitle();

              
                
            });
    }

    getTotalStatistics() {
        return $localize`:@@OrgTotalAgreedStatistics:Total ${this.totalFamilies} families, ${this.totalPersons} persons,${this.totalEq} equivalents,${this.totalInfants} infants,${this.totalBabies} babies,${this.totalChildren} children,${this.totalTeens} teenagers,${this.totalYoungAdults} young adults,${this.totalAdults} adults,${this.totalSeniors} seniors`;
    }



    getTitle() {
        if (this.depotSelected) {
            return $localize`:@@BankOrgsTitleBeneficiariesDepot:Beneficiaries of ${this.depotName} at ${new Date().toLocaleDateString('fr-FR')}`;
        }
         return $localize`:@@BankOrgsTitleBeneficiariesBank:Beneficiaries of the bank at ${new Date().toLocaleDateString('fr-FR')}`;
    }
}


