import {Component,  OnInit} from '@angular/core';
import { Region } from '../model/region';
import {RegionEntityService} from '../services/region-entity.service';
import {map} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';


@Component({
  selector: 'app-regions',
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.css']
})

export class RegionsComponent implements OnInit {
  selectedIdRegion$ = new BehaviorSubject(0);
  region: Region = null;
  regions$: Observable<Region[]>;
 displayDialog: boolean;
  booCanCreate: boolean;
  filterBase: any;

  constructor(
      private regionService: RegionEntityService,
      private store: Store
  ) {
    this.booCanCreate = false;
  }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
                  if (authState.banque) {
                    if (authState.user.rights === 'Admin_Banq') {
                      this.booCanCreate = true;
                    }
                    this.filterBase = {'lienBanque': authState.banque.bankId};
                    this.regions$ = this.regionService.getWithQuery(this.filterBase);
                  }
            })
        )
        .subscribe();
  }

  handleSelect(region: Region) {
    console.log('Region was selected', region);
    this.selectedIdRegion$.next(region.regId);
    this.displayDialog = true;
  }


  handleRegionQuit() {
    this.displayDialog = false;
  }

  handleRegionUpdate(updatedRegion) {
    this.reload();
    this.displayDialog = false;
  }
  handleRegionCreated(createdRegion: Region) {
    // this.organisations.push({...createdOrganisation});
    this.reload();
    this.displayDialog = false;
  }
  handleRegionDeleted(deletedRegion) {
    this.reload();
    this.displayDialog = false;
  }
  showDialogToAdd() {
    this.selectedIdRegion$.next(0);
    this.displayDialog = true;
  }


}

