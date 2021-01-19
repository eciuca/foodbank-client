import { Component, OnInit } from '@angular/core';
import { Organisation } from './model/organisation';
import {OrganisationEntityService} from './services/organisation-entity.service';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'organisations',
  templateUrl: './organisations.component.html',
  styleUrls: ['./organisations.component.css']
})

export class OrganisationsComponent implements OnInit {
  organisation: Organisation = null;
  organisations$: Observable<Organisation[]>;
  title: string;
  cols: any[];
  displayDialog: boolean;

  constructor(private organisationService: OrganisationEntityService,
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
                            this.title = 'Organisations de la ' + authState.banque.bankName;
                            break;
                        case 'Asso':
                        case 'Admin_Asso':
                            this.title = `Banque ${authState.banque.bankName} ${authState.organisation.societe}` ;
                            break;
                        default:
                            this.title = 'Organisations de toutes les banques';
                    }

                } else {
                    this.title = 'Organisations de toutes les banques';
                }
            })
        )
       .subscribe();


    this.organisations$  = this.organisationService.entities$
        .pipe(
            tap( (organisationsEntities) => {
              console.log('Organisations now loaded:', organisationsEntities); }),
        )
    ;
    this.cols = [
      { field: 'idDis', header: 'Identifiant' },
      { field: 'bankShortName', header: 'Banque' },
      { field: 'societe', header: 'Nom' },
      { field: 'adresse', header: 'Adresse' },
      { field: 'cp', header: 'Code Postal' },
      { field: 'localite', header: 'Commune' }
    ];

  }
  handleSelect(organisation) {
    console.log( 'Organisation was selected', organisation);
    this.organisation = {...organisation};
    this.displayDialog = true;
  }

  delete() {
    console.log( 'Delete Called with Organisation:', this.organisation);
    this.organisationService.delete(this.organisation);
    this.organisation = null;
    this.displayDialog = false;
  }

  save() {
    console.log( 'Save Called with Organisation:', this.organisation);
    this.organisationService.update(this.organisation);
    this.organisation = null;
    this.displayDialog = false;
  }
}

