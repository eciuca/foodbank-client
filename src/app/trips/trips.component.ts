import {Component, OnInit} from '@angular/core';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {TripEntityService} from './services/trip-entity.service';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {globalAuthState} from '../auth/auth.selectors';
import {AuthState} from '../auth/reducers';
import {Trip} from './model/trip';
import {LazyLoadEvent} from 'primeng/api';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css']
})
export class TripsComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  selectedTripid$ = new BehaviorSubject(0);
  trips: Trip[];
  displayDialog: boolean;
  totalRecords: number;
  loading: boolean;
  queryBase: any;
  booCanCreate: boolean;
  author: string;
  first: number;
  constructor( private tripService: TripEntityService,
               private router: Router,
               private store: Store<AppState>) {
    this.booCanCreate = false;
    this.first = 0;
  }

  ngOnInit(): void {
    this.reload();
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.tripService.getWithQuery(queryParams))
        )
        .subscribe(loadedTrips => {
          console.log('Loaded trips from nextpage: ' + loadedTrips.length);
          if (loadedTrips.length > 0) {
            this.totalRecords = loadedTrips[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.trips  = loadedTrips;
          this.loading = false;
          this.tripService.setLoaded(true);
        });
  }
  reload() {
    this.loading = true;
    this.totalRecords = 0;
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.initializeDependingOnUserRights(authState);
            })
        )
        .subscribe();
  }
  private initializeDependingOnUserRights(authState: AuthState) {
    if (authState.user) {
      this.author = authState.user.membreNom + ' ' + authState.user.membrePrenom;
      this.queryBase = { 'batId': authState.user.lienBat};
    }
  }
  nextPage(event: LazyLoadEvent) {
    // Ignore first nextpage  by testing this.queryBase - initialization not finished and double i18n load side effect
    if (this.queryBase) {
      this.loading = true;
      const queryParms = {...this.queryBase};
      if (event) {
        queryParms['offset'] = event.first.toString();
        queryParms['rows'] = event.rows.toString();
      } else {
        queryParms['offset'] = 0;
        queryParms['rows'] = 3;
      }
       this.loadPageSubject$.next(queryParms);
    }
  }
  showDialogToAdd() {
    this.selectedTripid$.next(0);
    this.displayDialog = true;
  }
  handleSelect(trip) {
    if (trip.membreNom === this.author) {
      this.selectedTripid$.next(trip.tripId);
      this.displayDialog = true;
    } else {
      console.log( 'Trip update declined - trip different from author', trip, this.author);
    }
  }
  handleTripQuit() {
    this.displayDialog = false;
  }
  handleTripCreate(createdTrip: Trip) {
    this.trips.push({...createdTrip});
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }

  handleTripUpdate(updatedTrip) {
    const index = this.trips.findIndex(trip => trip.tripId === updatedTrip.tripId);
    this.trips[index] = updatedTrip;
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }

  handleTripDeleted(deletedTrip) {
    const index = this.trips.findIndex(trip => trip.tripId === deletedTrip.tripId);
    this.trips.splice(index, 1);
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }

}
