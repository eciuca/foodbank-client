import {Component, Input, OnInit} from '@angular/core';
import {Dependent} from '../model/dependent';
import {DependentEntityService} from '../services/dependent-entity.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {enmGender} from '../../shared/enums';



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
  totalRecords: number;
  loading: boolean;
  booCanCreate: boolean;
  constructor(private dependentService: DependentEntityService
  ) {
    this.booCanCreate = false;
  }
  ngOnInit() {
    this.cols = [
      { field: 'civilite', header: 'Gender' },
      { field: 'nom', header: 'Name' },
      { field: 'prenom', header: 'First Name' },
      { field: 'datenais', header: 'Birth Date' },
      { field: 'actif', header: 'Active' }
    ];
    this.masterId$.subscribe(masterId => {
    if (masterId) {
        console.log('initializing dependents of idClient', masterId);
        this.loading = true;
        this.totalRecords = 0;
        const queryParms = {};
        queryParms['lienMast'] = masterId;
        this.dependentService.getWithQuery(queryParms)
            .subscribe(loadedDependents => {
              console.log('Loaded dependents: ' + loadedDependents.length);
              this.totalRecords = loadedDependents.length;
              this.dependents = loadedDependents;
              this.loading = false;
              this.dependentService.setLoaded(true);
        });
      } else {
        console.log(' not yet initializing dependents of masterId');
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
    this.displayDialog = false;
  }
  handleDependentCreate(createdDependent: Dependent) {
    // this.dependents.push({...createdDependent});
    this.displayDialog = false;
  }

  handleDependentDeleted(deletedDependent) {
    // const index = this.dependents.findIndex(dependent => dependent.idDep === deletedDependent.idDep);
    // this.dependents.splice(index, 1);
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
        break;
      default:
        return 'Unspecified';
    }

  }
}
