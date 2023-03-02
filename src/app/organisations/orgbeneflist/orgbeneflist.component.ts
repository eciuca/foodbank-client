import {Component, OnInit} from '@angular/core';
import {map} from 'rxjs/operators';
import {Organisation} from '../model/organisation';
import {globalAuthState} from '../../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {AuthState} from '../../auth/reducers';
import {AuthService} from '../../auth/auth.service';
import {OrganisationHttpService} from '../services/organisation-http.service';

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
    totalStatistics: string;


    bankName: string;
    lienBanque: number;
    bankShortName: string;

    orgQueryParams: any;

    constructor( private organisationHttpService: OrganisationHttpService,
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
            this.orgQueryParams= {'actif': '1','lienBanque': authState.banque.bankId.toString(),'agreed': '1'};
            this.bankName = authState.banque.bankName;
            this.bankShortName = authState.banque.bankShortName;
            this.loadOrganisations();
        }
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
               this.totalStatistics = this.getTotalStatistics();

              
                
            });
    }

    getTotalStatistics() {
        return $localize`:@@OrgTotalAgreedStatistics:Total ${this.totalFamilies} families, ${this.totalPersons} persons,${this.totalEq} equivalents,${this.totalInfants} infants,${this.totalBabies} babies,${this.totalChildren} children,${this.totalTeens} teenagers,${this.totalYoungAdults} young adults,${this.totalSeniors} seniors`;
    }



    getTitle() {
         return $localize`:@@BankOrgsTitleBeneficiaries:Beneficiaries of Agreed Organisations at ${new Date().toLocaleDateString('fr-FR')}`;
    }
}


