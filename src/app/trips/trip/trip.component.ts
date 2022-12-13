import {combineLatest, Observable} from 'rxjs';
import {DataServiceError} from '@ngrx/data';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DefaultTrip, Trip} from '../model/trip';
import {TripEntityService} from '../services/trip-entity.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {map} from 'rxjs/operators';
import {NgForm} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';

@Component({
  selector: 'app-trip',
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.css']
})
export class TripComponent implements OnInit {
  @ViewChild('tripForm') myform: NgForm;
  @Input() tripId$: Observable<number>;
  @Output() onTripUpdate = new EventEmitter<Trip>();
  @Output() onTripCreate = new EventEmitter<Trip>();
  @Output() onTripDelete = new EventEmitter<Trip>();
  @Output() onTripQuit = new EventEmitter<Trip>();
  trip: Trip;
  batId: number;

  constructor(
      private tripsService: TripEntityService,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.batId = authState.user.lienBat;
        })
        ).subscribe();
     const trip$ = combineLatest([this.tripId$, this.tripsService.entities$])
        .pipe(
            map(([tripId, trips]) => trips.find(trip => trip['tripId'] === tripId))
        );
    trip$.subscribe(trip => {
      if (trip) {
        this.trip = trip;
      } else {
        this.trip = new DefaultTrip();
        if (this.myform) {
          this.myform.reset(this.trip);
        }
       }
    });

  }

  delete(event: Event, trip: Trip) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const myMessage = {
          severity: 'success',
          summary: 'Delete',
          detail: $localize`:@@messageTripDeleted:The trip for ${trip.membreNom}  has been deleted`
        };
        this.tripsService.delete(trip)
            .subscribe(() => {
                  this.messageService.add(myMessage);
                  this.onTripDelete.emit(trip);
                },
                (dataserviceerrorFn: () => DataServiceError) => { 
                    const dataserviceerror = dataserviceerrorFn();
                    if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                    const  errMessage = {severity: 'error', summary: 'Delete',
                        detail: $localize`:@@messageTripDeleteError:The trip  for ${trip.membreNom} could not be deleted: error: ${dataserviceerror.message}`,
                        life: 6000 };
                    this.messageService.add(errMessage) ;
                });
      }
    });
  }

  save(oldTrip: Trip, tripForm: Trip) {
    const modifiedTrip = Object.assign({}, oldTrip, tripForm);

    if (modifiedTrip.hasOwnProperty('tripId')) {
      modifiedTrip.dateEnreg = ''; // Date Enregistrement will be regenerated
      this.tripsService.update(modifiedTrip)
          .subscribe(() => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Update',
                  detail: $localize`:@@messageTripUpdated:The trip for ${modifiedTrip.membreNom}  was updated`
                });
                this.onTripUpdate.emit(modifiedTrip);
              },
              (dataserviceerrorFn: () => DataServiceError) => { 
                const dataserviceerror = dataserviceerrorFn();
                if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageTripUpdateError:The trip  for ${modifiedTrip.membreNom} could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    } else {
      modifiedTrip.batId = this.batId; // Trip created by the Logged In User
      this.tripsService.add(modifiedTrip)
          .subscribe((newTrip) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Creation',
                  detail: $localize`:@@messageTripCreated:The trip for ${newTrip.membreNom}   has been created`
                });
                this.onTripCreate.emit(newTrip);
              },
              (dataserviceerrorFn: () => DataServiceError) => { 
                const dataserviceerror = dataserviceerrorFn();
                if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                const  errMessage = {severity: 'error', summary: 'Create',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageTripCreateError:The trip for ${modifiedTrip.membreNom} could not be created: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    }

  }

  quit(event: Event, oldTrip: Trip, tripForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          tripForm.reset(oldTrip); // reset in-memory object for next open
          this.onTripQuit.emit();
        }
      });
    } else {
       this.onTripQuit.emit();
    }
  }
}


