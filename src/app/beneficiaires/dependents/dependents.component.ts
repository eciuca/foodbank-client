import {Component, Input, OnInit} from '@angular/core';
import {Dependent} from '../model/dependent';
import {DependentEntityService} from '../services/dependent-entity.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';



@Component({
  selector: 'app-dependents',
  templateUrl: './dependents.component.html',
  styleUrls: ['./dependents.component.css']
})

export class DependentsComponent implements OnInit {
  @Input() masterId$: Observable<number>;
  selectedIdDep$ = new BehaviorSubject(0);
  dependents: Dependent[];
  dependent: Dependent = null;
  cols: any[];
  displayDialog: boolean;
  loading: boolean;
  booCanCreate: boolean;
  booIsAdmin: boolean;
  constructor(private dependentService: DependentEntityService,
              private store: Store
  ) {
    this.booCanCreate = false;
    this.booIsAdmin = false;
  }
  ngOnInit() {
    this.cols = [
      { field: 'civilite', header: 'Gender' },
      { field: 'nom', header: 'Name' },
      { field: 'prenom', header: 'First Name' },
      { field: 'datenais', header: 'Birth Date' },
      { field: 'actif', header: 'Active' }
    ];
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
    this.masterId$.subscribe(masterId => {
    if (masterId) {
        console.log('initializing dependents of idClient', masterId);
        this.loading = true;
        const queryParms = {};
        queryParms['lienMast'] = masterId;
        this.dependentService.getWithQuery(queryParms)
            .subscribe(loadedDependents => {
              console.log('Loaded dependents: ' + loadedDependents.length);
              this.dependents = loadedDependents;
              if (this.booIsAdmin) {
                  this.booCanCreate = true;
              }
              this.loading = false;
              this.dependentService.setLoaded(true);
        });
      } else {
        this.dependents = [];
        this.booCanCreate = false;
        console.log(' not yet initializing dependents of masterId, we are creating a new beneficiary !!!');
      }
    });
  }
  handleSelect(dependent) {
    console.log( 'Dependent was selected', dependent);
    this.selectedIdDep$.next(dependent.idDep);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.selectedIdDep$.next(0);
    this.displayDialog = true;
  }

  handleDependentQuit() {
    this.displayDialog = false;
  }

  handleDependentUpdate(updatedDependent) {
   const index = this.dependents.findIndex(dependent => dependent.idDep === updatedDependent.idDep);
   this.dependents[index] = updatedDependent;
    this.displayDialog = false;
  }
  handleDependentCreate(createdDependent: Dependent) {
   this.dependents.push({...createdDependent});
    this.displayDialog = false;
  }

  handleDependentDeleted(deletedDependent) {
   const index = this.dependents.findIndex(dependent => dependent.idDep === deletedDependent.idDep);
   this.dependents.splice(index, 1);
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
