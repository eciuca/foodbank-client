import {Component, OnInit} from '@angular/core';
import {MembreFunctionEntityService} from '../services/membreFunction-entity.service';
import {MembreFunction} from '../model/membreFunction';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {AppState} from '../../reducers';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-membre-functions',
  templateUrl: './membre-functions.component.html',
  styleUrls: ['./membre-functions.component.css']
})
export class MembreFunctionsComponent implements OnInit {
  membreFunctions : MembreFunction[];
  bankShortName: string;
  lienBanque: number;
  displayDialog: boolean;
  first: number;
  totalRecords: number;
  userLanguage: string;
  isGlobalAdmin: boolean;
  selectedMembreFunctionId$ = new BehaviorSubject(0);
  constructor(
      private membreFunctionEntityService: MembreFunctionEntityService,
      private store: Store<AppState>,
  ) {
    this.first = 0;
    this.totalRecords = 0;
    this.isGlobalAdmin = false;
    this.lienBanque = 0;
    this.bankShortName = '???';
}

  ngOnInit(): void {
  this.store
      .pipe(
          select(globalAuthState),
          map((authState) => {
              if (authState.user.rights == 'admin') {
                  this.isGlobalAdmin = true;
              }
              if (authState.user.rights == 'Admin_Banq') {
                  this.bankShortName = authState.banque.bankShortName;
                  this.lienBanque = authState.banque.bankId;
              }

            this.userLanguage = authState.user.idLanguage;
              this.reload();

          })
      )
      .subscribe();

  }
  reload() {
      const queryParms = { 'actif': '1' ,'lienBanque': this.lienBanque.toString(), 'language': this.userLanguage };
      this.membreFunctionEntityService.getWithQuery(queryParms)
          .subscribe((membreFunctions) => {
              console.log('Membre functions now loaded:', membreFunctions);
              this.membreFunctions = membreFunctions;
              this.totalRecords = membreFunctions.length;
              this.first = 0;
          });
  }

    handleSelect(membreFunction: MembreFunction) {
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
        this.reload();
        this.displayDialog = false;
    }

    handleMembreFunctionDeleted(deletedMembreFunction) {
        const index = this.membreFunctions.findIndex(membreFunction => membreFunction.funcId === deletedMembreFunction.funcId);
        this.membreFunctions.splice(index, 1);
        this.reload();
        this.displayDialog = false;
    }

    generateTooltipFunction() {
        return $localize`:@@TooltipFunction:Functions can be standard for all banks or specific for a food bank`;
    }

}
