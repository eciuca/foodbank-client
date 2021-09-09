import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {NotificationEntityService} from '../../services/notification-entity.service';
import {map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {DefaultNotification, Notification} from '../model/notification';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmLanguage, enmMailAudience} from '../../../shared/enums';
import {NgForm} from '@angular/forms';
import {DataServiceError} from '@ngrx/data';

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

  constructor(
      private notificationsService: NotificationEntityService,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.languages =  enmLanguage;
    this.audiences = enmMailAudience;
  }

  ngOnInit(): void {
    // comment: this component is sometimes called from his parent Component with idDepot @Input Decorator,
    // or sometimes via a router link via the Main Menu

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


