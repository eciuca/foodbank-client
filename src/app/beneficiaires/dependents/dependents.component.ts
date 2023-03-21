import {Component, Input, OnInit} from '@angular/core';
import {Dependent} from '../model/dependent';
import {DependentEntityService} from '../services/dependent-entity.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {labelCivilite} from '../../shared/functions';
import {enmDepPercentages, enmDepTypes} from '../../shared/enums';


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
  depTypes: any[];
  depPercentages: any[];
  displayDialog: boolean;
  loading: boolean;
  booCanCreate: boolean;
  dependentQuery: any;
  booShowArchived: boolean;
  first: number;
  constructor(private dependentService: DependentEntityService,
              private store: Store
  ) {
    this.booCanCreate = false;
    this.dependentQuery = {};
    this.booShowArchived = false;
    this.first = 0;
    this.depTypes = enmDepTypes;
    this.depPercentages = enmDepPercentages;
  }
  ngOnInit() {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
                // Only organisations can create dependents
               if ( authState.user.rights === 'Admin_Asso' ||
                        (( authState.user.rights === 'Asso') && (authState.user.gestBen))
              )
             {
              this.booCanCreate = true;
             }
            })
        )
        .subscribe();
    this.masterId$.subscribe(masterId => {
    if (masterId) {
        this.loading = true;
        this.dependentQuery['lienMast'] = masterId;
        this.dependentQuery['actif'] = '1';
        this.dependentService.getWithQuery(this.dependentQuery)
            .subscribe(loadedDependents => {
              console.log('Initial Loaded dependents: ' + loadedDependents.length);
              this.dependents = loadedDependents;
              this.loading = false;
              this.dependentService.setLoaded(true);
        });
      } else {
        this.dependents = [];
      }
    });
  }
  handleSelect(dependent) {
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
    return labelCivilite(civilite);

  }
    changeArchiveFilter($event) {
        this.first = 0;
        this.booShowArchived = $event.checked;
        if (this.booShowArchived ) {
            this.dependentQuery['actif'] = '0';
        } else {
            this.dependentQuery['actif'] = '1';
        }
        this.dependentService.getWithQuery(this.dependentQuery)
            .subscribe(loadedDependents => {
                console.log('New Loaded dependents: ' + loadedDependents.length);
                this.dependents = loadedDependents;
                this.loading = false;
                this.dependentService.setLoaded(true);
            });
    }

    labelRelation(depTyp: number) {
        return this.depTypes.find(depType => depType.value === depTyp).label;
    }

    labelDepPercentage(eq: number) {
        return this.depPercentages.find(depPercentage => depPercentage.value === eq).label;
    }
}
