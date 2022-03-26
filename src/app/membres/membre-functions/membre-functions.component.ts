import { Component, OnInit } from '@angular/core';
import {MembreFunctionEntityService} from '../services/membreFunction-entity.service';
import {MembreFunction} from '../model/membreFunction';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {AppState} from '../../reducers';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'membre-functions',
  templateUrl: './membre-functions.component.html',
  styleUrls: ['./membre-functions.component.css']
})
export class MembreFunctionsComponent implements OnInit {
  membreFunctions : MembreFunction[];
  bankShortName: string;
  displayDialog: boolean;
  first: number;
  totalRecords: number;
  userLanguage: string;
  loading: boolean;
  selectedMembreFunctionId$ = new BehaviorSubject(0);
  constructor(
      private membreFunctionEntityService: MembreFunctionEntityService,
      private store: Store<AppState>,
  ) {
    this.first = 0;
    this.totalRecords = 0;
    this.loading = true;
}

  ngOnInit(): void {
  this.store
      .pipe(
          select(globalAuthState),
          map((authState) => {
            this.bankShortName = authState.banque.bankShortName;
            this.userLanguage = authState.user.idLanguage;
            const queryParms = { 'actif': '1' ,'lienBanque': authState.banque.bankId.toString(), 'language': this.userLanguage };
              this.membreFunctionEntityService.getWithQuery(queryParms)
                  .subscribe((membreFunctions) => {
                    console.log('Membre functions now loaded:', membreFunctions);
                    this.membreFunctions = membreFunctions;
                    this.totalRecords = membreFunctions.length;
                    this.loading = false;
                  });
          })
      )
      .subscribe();

  }

    handleSelect(membreFunction: MembreFunction) {
        console.log('MembreFunction was selected',membreFunction );
        this.selectedMembreFunctionId$.next(membreFunction.funcId);
        this.displayDialog = true;
    }
    showDialogToAdd() {
        this.selectedMembreFunctionId$.next(0);
        this.displayDialog = true;
    }

    handleMembreFunctionQuit() {
        this.displayDialog = false;
    }

    handleMembreFunctionUpdate(updatedMembreFunction) {
        const index = this.membreFunctions.findIndex(membreFunction => membreFunction.funcId === updatedMembreFunction.funcId);
        this.membreFunctions[index] = updatedMembreFunction;
        this.displayDialog = false;
    }
    handleMembreFunctionCreate(createdMembreFunction: MembreFunction) {
        this.membreFunctions.push({...createdMembreFunction});
        this.displayDialog = false;
    }

    handleMembreFunctionDeleted(deletedMembreFunction) {
        const index = this.membreFunctions.findIndex(membreFunction => membreFunction.funcId === deletedMembreFunction.funcId);
        this.membreFunctions.splice(index, 1);
        this.displayDialog = false;
    }
}
