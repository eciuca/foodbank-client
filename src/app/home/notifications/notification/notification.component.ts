import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {NotificationEntityService} from '../../services/notification-entity.service';
import {map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {DefaultNotification, Notification} from '../model/notification';
import {ConfirmationService, MessageService} from 'primeng/api';
import {NgForm} from '@angular/forms';
import {DataServiceError} from '@ngrx/data';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../../auth/auth.selectors';
import {AppState} from '../../../reducers';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  @ViewChild('notificationForm') myform: NgForm;
  @Input() notificationId$: Observable<number>;
  @Output() onNotificationUpdate = new EventEmitter<Notification>();
  @Output() onNotificationCreate = new EventEmitter<Notification>();
  @Output() onNotificationDelete = new EventEmitter<Notification>();
  @Output() onNotificationQuit = new EventEmitter<Notification>();
  notification: Notification;
  languages: any[];
  audiences: any[];
  importances: any[];
  author: string;
  bankId: number;
  orgId: number;


  constructor(
      private notificationsService: NotificationEntityService,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.languages =  [
        {label: 'Français', value: 'fr'},
        {label: 'Nederlands', value: 'nl' }
    ];
    this.importances =  [
        {label: $localize`:@@low:Low`, value: 1},
        {label: $localize`:@@medium:Medium`, value: 2},
        {label: $localize`:@@high:High`, value: 3},
    ];
    this.author = 'unknown';
  }

  ngOnInit(): void {
      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  console.log('Notification authstate:', authState);
                  if (authState.user) {
                      this.author = authState.user.membrePrenom + ' ' + authState.user.membreNom;
                      switch (authState.user.rights) {
                          case 'Bank':
                          case 'Admin_Banq':
                              this.bankId = authState.banque.bankId;
                              this.audiences = [
                                  {label: 'Organisation Members', value: 'Organisation Members'},
                                  {label: 'Organisation Admins', value: 'Organisation Admins'},
                                  {label: 'Bank Members', value:  'Bank Members'},
                                  {label: 'Bank Admins', value: 'Bank Admins' }
                              ];
                              break;
                          case 'Asso':
                          case 'Admin_Asso':
                              this.bankId = authState.banque.bankId;
                              this.orgId = authState.user.idOrg;
                              this.audiences = [
                                  {label: 'Organisation Members', value: 'Organisation Members'},
                                  {label: 'Organisation Admins', value: 'Organisation Admins'},
                              ];
                              break;
                          case 'admin':
                                  this.audiences = [
                                      {label: 'General', value: 'General'},
                                      {label: 'Organisation Members', value: 'Organisation Members'},
                                      {label: 'Organisation Admins', value: 'Organisation Admins'},
                                      {label: 'Bank Members', value:  'Bank Members'},
                                      {label: 'Bank Admins', value: 'Bank Admins' }
                                  ];
                      }
                  }
              })
          ).subscribe();
    const notification$ = combineLatest([this.notificationId$, this.notificationsService.entities$])
        .pipe(
            map(([notificationId, notifications]) => notifications.find(notification => notification['notificationId'] === notificationId))
        );

    notification$.subscribe(
        notification => {
          if (notification) {
            console.log('Existing Notification : ', notification);
            this.notification = notification;
          } else {
            console.log('New Notification ! ');
            this.notification = new DefaultNotification();
            this.notification.author = this.author;
            if (this.myform) {
              this.myform.reset(this.notification);
            }

          }
        });

  }
  delete(event: Event, notification: Notification) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const  myMessage = {severity: 'success', summary: 'Delete',
          detail: $localize`:@@messageNotificationDeleted:The notification was deleted`};
        this.notificationsService.delete(notification)
            .subscribe( () => {
                  console.log('successfully deleted notification');
                  this.messageService.add(myMessage);
                  this.onNotificationDelete.emit(notification);
                },
                (dataserviceerror: DataServiceError) => {
                  console.log('Error deleting notification', dataserviceerror.message);
                  const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: $localize`:@@messageNotificationDeleteError:The notification  could not be deleted: error: ${dataserviceerror.message}`,
                    life: 6000 };
                  this.messageService.add(errMessage) ;
                }
            );
      },
      reject: () => {
        console.log('We do nothing');
      }
    });
  }

  save(oldNotification: Notification, notificationForm: Notification) {
      console.log('Notification form:', notificationForm);
    const modifiedNotification = Object.assign({}, oldNotification, notificationForm);
    if (modifiedNotification.hasOwnProperty('notificationId')) {
      console.log('Updating Notification with content:', modifiedNotification);
      this.notificationsService.update(modifiedNotification)
          .subscribe(() => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Update',
                  detail: $localize`:@@messageNotificationUpdated:The notification  was updated`
                });
                this.onNotificationUpdate.emit(modifiedNotification);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error updating notification', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageNotificationUpdateError:The notification could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              }
          );
    } else {

      console.log('Creating Notification with content:', modifiedNotification);
      modifiedNotification.author = this.author;
      modifiedNotification.bankId = this.bankId;
      modifiedNotification.orgId = this.orgId;
      if (!modifiedNotification.audience) {
          modifiedNotification.audience = this.audiences[0].value;
      }
      this.notificationsService.add(modifiedNotification)
          .subscribe(() => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Creation',
                  detail: $localize`:@@messageNotificationCreated:The notification  was created`
                });
                this.onNotificationCreate.emit(modifiedNotification);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error creating notification', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Create',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageNotificationCreateError:The notification could not be created: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              }
          );
    }
  }

  quit(event: Event, oldNotification: Notification, notificationForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?` ,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          notificationForm.reset(oldNotification); // reset in-memory object for next open
          console.log('We have reset the notification form to its original value');
          this.onNotificationQuit.emit();
        },
        reject: () => {
          console.log('We do nothing');
        }
      });
    } else {
      console.log('Form is not dirty, closing');
      this.onNotificationQuit.emit();
    }
  }
}


