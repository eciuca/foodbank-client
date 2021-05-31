import {Component, Input, OnInit} from '@angular/core';
import {Orgcontact} from '../model/orgcontact';
import {OrgcontactEntityService} from '../services/orgcontact-entity.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';



@Component({
  selector: 'app-orgcontacts',
  templateUrl: './orgcontacts.component.html',
  styleUrls: ['./orgcontacts.component.css']
})

export class OrgcontactsComponent implements OnInit {
  @Input() lienAsso$: Observable<number>;
  selectedOrgPersId$ = new BehaviorSubject(0);
  orgcontacts: Orgcontact[];
  orgcontact: Orgcontact = null;
  displayDialog: boolean;
  loading: boolean;
  booCanCreate: boolean;
  booIsAdmin: boolean;
  constructor(private orgcontactService: OrgcontactEntityService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store
  ) {
    this.booCanCreate = false;
    this.booIsAdmin = false;
  }
  ngOnInit() {
     this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user && ( authState.user.rights === 'Admin_Asso' ) ) {
                this.booIsAdmin = true;
              }
            })
        )
        .subscribe();
    if (!this.lienAsso$ ) {
      this.lienAsso$ = this.route.paramMap
          .pipe(
              map(paramMap => paramMap.get('idDis')),
              map(idDisString => Number(idDisString))
          );
    }
    this.lienAsso$.subscribe(lienAsso => {
      if (lienAsso) {
        console.log('initializing orgcontacts of id of Association', lienAsso);
        this.loading = true;
        const queryParms = {};
        queryParms['lienAsso'] = lienAsso;
        this.orgcontactService.getWithQuery(queryParms)
            .subscribe(loadedOrgcontacts => {
              console.log('Loaded orgcontacts: ' + loadedOrgcontacts.length);
              this.orgcontacts = loadedOrgcontacts;
              if (this.booIsAdmin) {
                this.booCanCreate = true;
              }
              this.loading = false;
              this.orgcontactService.setLoaded(true);
            });
      } else {
        this.orgcontacts = [];
        this.booCanCreate = false;
        console.log(' not yet initializing orgcontacts of lienAsso, we are creating a new beneficiary !!!');
      }
    });
  }
  handleSelect(orgcontact) {
    console.log( 'Orgcontact was selected', orgcontact);
    this.selectedOrgPersId$.next(orgcontact.orgPersId);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.selectedOrgPersId$.next(0);
    this.displayDialog = true;
  }

  handleOrgcontactQuit() {
    this.displayDialog = false;
  }

  handleOrgcontactUpdate(updatedOrgcontact) {
    const index = this.orgcontacts.findIndex(orgcontact => orgcontact.orgPersId === updatedOrgcontact.orgPersId);
    this.orgcontacts[index] = updatedOrgcontact;
    this.displayDialog = false;
  }
  handleOrgcontactCreate(createdOrgcontact: Orgcontact) {
    this.orgcontacts.push({...createdOrgcontact});
    this.displayDialog = false;
  }

  handleOrgcontactDeleted(deletedOrgcontact) {
    const index = this.orgcontacts.findIndex(orgcontact => orgcontact.orgPersId === deletedOrgcontact.orgPersId);
    this.orgcontacts.splice(index, 1);
    this.displayDialog = false;
  }

  labelCivilite(civilite: number) {
    switch (civilite) {
      case 1:
        return 'Mr';
      case 2:
        return 'Mrs.';
      case 3:
        return 'Miss';
      default:
        return 'Unspecified';
    }

  }
}

