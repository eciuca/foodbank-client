import {Component, OnInit} from '@angular/core';
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
    notifications: Notification[];
    displayDialog: boolean;
    totalRecords: number;
    loading: boolean;
    bankid: number;
    bankName: string;
    orgName: string; // if logging in with asso role we need to display the organisation
    queryBase: any;
    booCanCreate: boolean;
    author: string;
    first: number;
    languages: any[];
    selectedLanguage: number;
    isLoggedIn: boolean;
  constructor( private notificationService: NotificationEntityService,
               private router: Router,
               private store: Store<AppState>) {
      this.booCanCreate = false;
      this.bankid = 0;
      this.bankName = '';
      this.orgName = '';
      this.first = 0;
      this.languages =  [
          {label: 'Français', value: 1},
          {label: 'Nederlands', value: 2 },
          {label: 'All', value: 0 }
      ];
      this.isLoggedIn = false;
  }

  ngOnInit(): void {
      this.loading = true;
      this.totalRecords = 0;
      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  this.initializeDependingOnUserRights(authState);
                  this.isLoggedIn = authState.isLoggedIn;
                  this.loadPageSubject$
                 .pipe(
                    filter(queryParams => !!queryParams),
                     mergeMap(queryParams => this.notificationService.getWithQuery(queryParams))
                    )
                    .subscribe(loadedNotifications => {
                     console.log('Loaded notifications from nextpage: ' + loadedNotifications.length);
                    if (loadedNotifications.length > 0) {
                    this.totalRecords = loadedNotifications[0].totalRecords;
                    }  else {
                    this.totalRecords = 0;
                     }
                    this.notifications  = loadedNotifications;
                    this.loading = false;
                    this.notificationService.setLoaded(true);
                });
             })
          ).subscribe();

    }
    private initializeDependingOnUserRights(authState: AuthState) {
        console.log ('AuthState is at initialization:', authState);
        if (authState.banque) {
            this.bankid = authState.banque.bankId;
            this.bankName = authState.banque.bankName;
            this.author = authState.user.membrePrenom + ' ' + authState.user.membreNom;
            this.selectedLanguage = authState.user.membreLangue;
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.queryBase = { 'bankId': authState.banque.bankId};
                    if (authState.user.rights === 'Admin_Banq' ) {
                        this.booCanCreate = true;
                        this.queryBase['admin'] = 'Y';
                    }
                    break;
                case 'Asso':
                case 'Admin_Asso':
                    this.queryBase = { 'bankId': authState.banque.bankId, 'orgId': authState.organisation.idDis };
                    this.orgName = authState.organisation.societe;
                    if (authState.user.rights === 'Admin_Asso' ) {
                        this.queryBase['admin'] = 'Y';
                    }
                    break;
                case 'admin':
                case 'Admin_FBBA':
                    this.queryBase = {};
                    this.booCanCreate = true;
                    break;
                case 'Bank_FBBA':
                    this.queryBase = {};
                    break;
                default:
                    this.queryBase = {};
            }
            this.nextPage(null);
        }
        console.log('initialization sets query base to:', this.queryBase);

    }
    nextPage(event: LazyLoadEvent) {
     /*   if (!this.isLoggedIn) {
            setTimeout(() => {
                console.log('ignore notifications initial nextPage and delaying 250ms');
            }, 250);
            return;
        }
     */
        console.log('Initial Lazy Loaded Event', event, 'Query Base:', this.queryBase);
        // Ignore first nextpage  by testing this.queryBase - initialization not finished and double i18n load side effect
      if (this.queryBase) {
          this.loading = true;
          const queryParms = {...this.queryBase};
          if (event) {
              queryParms['offset'] = event.first.toString();
              queryParms['rows'] = event.rows.toString();
              if (event.filters) {
                  if (event.filters.language) {
                      switch (event.filters.language.value) {
                          case 1:
                              queryParms['language'] = 'fr';
                              break;
                          case 2:
                              queryParms['language'] = 'nl';
                              break;
                          default:
                      }
                  }
              }
          }   else {
              queryParms['offset'] = 0;
              queryParms['rows'] = 3;
              switch (this.selectedLanguage) {
                  case 1:
                      queryParms['language'] = 'fr';
                      break;
                  case 2:
                      queryParms['language'] = 'nl';
                      break;
                  default:
              }
          }
          this.loadPageSubject$.next(queryParms);
      }
    }
    showDialogToAdd() {
        this.selectedNotificationid$.next(0);
        this.displayDialog = true;
    }
    handleSelect(notification) {
        if (notification.author === this.author) {
            this.selectedNotificationid$.next(notification.notificationId);
            this.displayDialog = true;
        } else {
            console.log( 'Notification update declined - notification different from author', notification, this.author);
        }
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

    labelImportance(importance: number) {
        switch (importance) {
            case 1:
                return $localize`:@@low:Low`;
            case 2:
                return $localize`:@@medium:Medium`;
            case 3:
                return $localize`:@@high:High`;
            default:
                return '?';
        }
    }
    labelAudience(audience: string) {
        switch (audience) {
            case 'mybank_only':
                return $localize`:@@audienceBankOnly:Bank Users Only`;
            case 'mybank_orgadmin':
                return $localize`:@@audienceBankOrgAdminOnly:Organisation Admins Only`;
            case 'mybank_org':
                return $localize`:@@audienceBankOrgOnly:Organisation Users Only`;
            case 'mybank_all':
                return $localize`:@@audienceBankAll:Bank and Organisation Users`;
            case 'bank_admins':
                return $localize`:@@audienceBankAdmin:All Bank Admins`;
            case 'bank_users':
                return $localize`:@@audienceBankUsers:All Bank Users`;
            case 'org_admins':
                return $localize`:@@audienceOrgAdmin:All Org Admins`;
            case 'general':
                return 'general';
            default:
                return '?';
        }



        }

}
