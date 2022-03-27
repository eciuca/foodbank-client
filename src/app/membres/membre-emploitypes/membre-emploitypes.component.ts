import { Component, OnInit } from '@angular/core';
import {MembreEmploiTypeEntityService} from '../services/membreEmploiType-entity.service';
import {MembreEmploiType} from '../model/membreEmploiType';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {AppState} from '../../reducers';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-membre-emploitypes',
  templateUrl: './membre-emploitypes.component.html',
  styleUrls: ['./membre-emploitypes.component.css']
})
export class MembreEmploiTypesComponent implements OnInit {
  membreEmploiTypes : MembreEmploiType[];
  bankShortName: string;
  lienBanque: number;
  displayDialog: boolean;
  first: number;
  totalRecords: number;
  userLanguage: string;
  selectedMembreEmploiTypeId$ = new BehaviorSubject(0);
  constructor(
      private membreEmploiTypeEntityService: MembreEmploiTypeEntityService,
      private store: Store<AppState>,
  ) {
    this.first = 0;
    this.totalRecords = 0;

  }

  ngOnInit(): void {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.bankShortName = authState.banque.bankShortName;
              this.lienBanque = authState.banque.bankId;
              this.userLanguage = authState.user.idLanguage;
              this.reload();
            })
        )
        .subscribe();

  }
  reload() {
    const queryParms = { 'actif': '1' ,'lienBanque': this.lienBanque.toString(), 'language': this.userLanguage };
    this.membreEmploiTypeEntityService.getWithQuery(queryParms)
        .subscribe((membreEmploiTypes) => {
          console.log('Membre emploitypes now loaded:', membreEmploiTypes);
          this.membreEmploiTypes = membreEmploiTypes;
          this.totalRecords = membreEmploiTypes.length;
          this.first = 0;
        })
  }

  handleSelect(membreEmploiType: MembreEmploiType) {
    console.log('MembreEmploiType was selected',membreEmploiType );
    this.selectedMembreEmploiTypeId$.next(membreEmploiType.jobNr);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.selectedMembreEmploiTypeId$.next(0);
    this.displayDialog = true;
  }

  handleMembreEmploiTypeQuit() {
    this.displayDialog = false;
  }

  handleMembreEmploiTypeUpdate(updatedMembreEmploiType) {
    const index = this.membreEmploiTypes.findIndex(membreEmploiType => membreEmploiType.jobNr === updatedMembreEmploiType.jobNr);
    this.membreEmploiTypes[index] = updatedMembreEmploiType;
    this.displayDialog = false;
  }
  handleMembreEmploiTypeCreate(createdMembreEmploiType: MembreEmploiType) {
    this.membreEmploiTypes.push({...createdMembreEmploiType});
    this.reload();
    this.displayDialog = false;
  }

  handleMembreEmploiTypeDeleted(deletedMembreEmploiType) {
    const index = this.membreEmploiTypes.findIndex(membreEmploiType => membreEmploiType.jobNr === deletedMembreEmploiType.jobNr);
    this.membreEmploiTypes.splice(index, 1);
    this.reload();
    this.displayDialog = false;
  }
}

