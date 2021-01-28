import { Component, OnInit } from '@angular/core';
import { Beneficiaire } from './model/beneficiaire';
import {BeneficiaireEntityService} from './services/beneficiaire-entity.service';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {Router} from '@angular/router';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'beneficiaires',
  templateUrl: './beneficiaires.component.html',
  styleUrls: ['./beneficiaires.component.css']
})

export class BeneficiairesComponent implements OnInit {
  beneficiaire: Beneficiaire = null;
  beneficiaires$: Observable<Beneficiaire[]>;
  title: string;
  cols: any[];

  constructor(private beneficiaireService: BeneficiaireEntityService,
              private router: Router,
              private store: Store
  ) { }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.banque) {
                switch (authState.user.rights) {
                  case 'Bank':
                  case 'Admin_Banq':
                    this.title = 'Beneficiaires de la ' + authState.banque.bankName;
                    break;
                  case 'Asso':
                  case 'Admin_Asso':
                    this.title = `Banque ${authState.banque.bankName} ${authState.organisation.societe}` ;
                    break;
                  default:
                    this.title = 'Beneficiaires de toutes les banques';
                }

              } else {
                this.title = 'Beneficiaires de toutes les banques';
              }
            })
        )
        .subscribe();


    this.beneficiaires$  = this.beneficiaireService.entities$
        .pipe(
            tap( (beneficiairesEntities) => {
              console.log('Beneficiaires now loaded:', beneficiairesEntities); }),
        )
    ;
    this.cols = [
      { field: 'idClient', header: 'Identifiant' },
      { field: 'bankShortName', header: 'Banque' },
      { field: 'nom', header: 'Nom' },
      { field: 'prenom', header: 'Prenom' },
      { field: 'adresse', header: 'Adresse' },
      { field: 'cp', header: 'Code Postal' },
      { field: 'localite', header: 'Commune' }
    ];

  }
  handleSelect(beneficiaire) {
    console.log( 'Beneficiaire was selected', beneficiaire);
    this.router.navigateByUrl(`/beneficiaires/${beneficiaire.idDis}`);
  }
}
