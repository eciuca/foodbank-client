import { Component, OnInit } from '@angular/core';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {NotificationEntityService} from '../services/notification-entity.service';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {AuthState} from '../../auth/reducers';
import {Notification} from './model/notification';
import {LazyLoadEvent} from 'primeng/api';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
    loadPageSubject$ = new BehaviorSubject(null);
    selectedNotificationid$ = new BehaviorSubject(0);
    notification: Notification = null;
    notifications: Notification[];
    displayDialog: boolean;
    totalRecords: number;
    loading: boolean;
    bankid: number;
    bankName: string;
    orgName: string; // if logging in with asso role we need to display the organisation
    queryParams: any;
    booCanCreate: boolean;
  constructor( private notificationService: NotificationEntityService,
               private router: Router,
               private store: Store<AppState>) {
      this.booCanCreate = false;
      this.bankid = 0;
      this.bankName = '';
      this.orgName = '';
  }

  ngOnInit(): void {
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
      this.loadPageSubject$
          .pipe(
              filter(queryParams => !!queryParams),
              mergeMap(queryParams => this.notificationService.getWithQuery(queryParams))
          )
          .subscribe(loadedNotifications => {
              console.log('Loaded notifications from nextpage: ' + loadedNotifications);
              if (loadedNotifications.length > 0) {
                  this.totalRecords = loadedNotifications[0].totalRecords;
              }  else {
                  this.totalRecords = 0;
              }
              this.notifications  = loadedNotifications;
              this.loading = false;
              this.notificationService.setLoaded(true);
          });
  }
    private initializeDependingOnUserRights(authState: AuthState) {
        if (authState.banque) {
            this.bankid = authState.banque.bankId;
            this.bankName = authState.banque.bankName;
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.queryParams = { 'audience': 'Bank' + authState.banque.bankId};
                    if (authState.user.rights === 'Admin_Banq' ) { this.booCanCreate = true; }
                    break;
                case 'Asso':
                case 'Admin_Asso':
                    this.queryParams = { 'audience': 'Org' + authState.organisation.idDis};
                    this.orgName = authState.organisation.societe;
                    if (authState.user.rights === 'Admin_Asso' ) { this.booCanCreate = true; }
                    break;
                default:
            }
        }
    }
    nextPage(event: LazyLoadEvent) {
        console.log('Lazy Loaded Event', event);
        this.loading = true;
        const queryParms = {};
        queryParms['offset'] = event.first.toString();
        queryParms['rows'] = event.rows.toString();

        if (event.filters) {
            if (event.filters.language && event.filters.language.value) {
                queryParms['language'] = event.filters.language.value;
            }
            if (event.filters.audience && event.filters.audience.value) {
                queryParms['audience'] = event.filters.audience.value;
            }

        }
        this.loadPageSubject$.next(queryParms);
    }
    showDialogToAdd() {
        this.selectedNotificationid$.next(0);
        this.displayDialog = true;
    }
    handleSelect(notification) {
        console.log( 'Notification was selected', notification);
        this.selectedNotificationid$.next(notification.notificationId);
        this.displayDialog = true;
    }
    handleNotificationQuit() {
        this.displayDialog = false;
    }
    handleNotificationCreate(createdNotification: Notification) {
        this.notifications.push({...createdNotification});
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

    handleNotificationUpdate(updatedNotification) {
        const index = this.notifications.findIndex(notification => notification.notificationId === updatedNotification.notificationId);
        this.notifications[index] = updatedNotification;
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

    handleNotificationDeleted(deletedNotification) {
        const index = this.notifications.findIndex(notification => notification.notificationId === deletedNotification.notificationId);
        this.notifications.splice(index, 1);
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

}
