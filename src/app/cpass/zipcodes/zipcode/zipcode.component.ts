import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {DefaultZipCode, ZipCode} from '../../model/zipCode';
import {EventEmitter} from '@angular/core';
import {Output} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {ZipcodeEntityService} from '../services/zipcode-entity.service';
import {map} from 'rxjs/operators';
import {DataServiceError, QueryParams} from '@ngrx/data';
import {NgForm} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AuditChangeEntityService} from '../../../audits/services/auditChange-entity.service';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../../auth/auth.selectors';
import {AppState} from '../../../reducers';
import {Cpas} from '../../model/cpas';
import {CpasEntityService} from '../../services/cpas-entity.service';
@Component({
  selector: 'app-zipcode',
  templateUrl: './zipcode.component.html',
  styleUrls: ['./zipcode.component.css']
})
export class ZipCodeComponent implements OnInit {
  @ViewChild('zipCodeForm') myform: NgForm;
  @Input() zipCode$: Observable<number>;
  @Output() onZipCodeUpdate = new EventEmitter<ZipCode>();
  @Output() onZipCodeCreate = new EventEmitter<ZipCode>();
  @Output() onZipCodeDelete = new EventEmitter<ZipCode>();
  @Output() onZipCodeQuit = new EventEmitter<ZipCode>();
  zipCode: ZipCode;
    userId: string;
    userName: string;
    lienBanque: number;
    selectedCpas: Cpas;
    filteredCpass: Cpas[];
  constructor(
      private zipCodesService: ZipcodeEntityService,
      private messageService: MessageService,
      private confirmationService: ConfirmationService,
      private auditChangeEntityService: AuditChangeEntityService,
      private cpassService: CpasEntityService,
      private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
    const zipCode$ = combineLatest([this.zipCode$, this.zipCodesService.entities$])
        .pipe(
            map(([zipCode, zipCodes]) => zipCodes.find(myzipCode => myzipCode['zipCode'] === zipCode))
        );

    zipCode$.subscribe(
        zipCode => {
            console.log('zipCode$ subscribe',zipCode);
          if (zipCode) {
            this.zipCode = zipCode;
              this.cpassService.getByKey(zipCode.lcpas)
                  .subscribe(
                      cpas => {
                          if (cpas !== null) {
                              this.selectedCpas = {...cpas};
                          }
                      })
          } else {
            console.log(' We have a new zipCode ');
            this.zipCode = new DefaultZipCode();
              if (this.myform) {
                  this.myform.reset(this.zipCode);
              }
          }
        });
      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  if (authState.user) {
                      this.userId = authState.user.idUser;
                      this.userName = authState.user.membreNom + ' ' + authState.user.membrePrenom;
                      this.lienBanque = authState.banque.bankId;
                  }
                  })
              )
              .subscribe();
  }
    delete(event: Event, zipCode: ZipCode) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success', summary: 'Delete',
                    detail: $localize`:@@messageZipCodeDeleted:The zipCode ${zipCode.zipCode} was deleted`};
                this.zipCodesService.delete(zipCode)
                    .subscribe( () => {
                            this.messageService.add(myMessage);
                            this.onZipCodeDelete.emit(zipCode);
                            this.auditChangeEntityService.logDbChange(this.userId,this.userName,this.lienBanque,0,'ZipCode',
                                zipCode.zipCode.toString() , 'Delete' );
                        },
                        (dataserviceerrorFn: () => DataServiceError) => {
                            const dataserviceerror = dataserviceerrorFn();
                            if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                            const  errMessage = {severity: 'error', summary: 'Delete',
                                // tslint:disable-next-line:max-line-length
                                detail: $localize`:@@messageZipCodeDeleteError:The zipCode ${zipCode.zipCode} could not be deleted: error: ${dataserviceerror.message}`,
                                life: 6000 };
                            this.messageService.add(errMessage) ;
                        }
                    );
            }

        });
    }

    save(oldZipCode: ZipCode, zipCodeForm: ZipCode) {
        const modifiedZipCode = Object.assign({}, oldZipCode, zipCodeForm);
        modifiedZipCode.lcpas = this.selectedCpas.cpasId;
        modifiedZipCode.zipCodeCpas = Number(this.selectedCpas.cpasZip);
        modifiedZipCode.cityCpas = this.selectedCpas.cpasName;
        modifiedZipCode.mailCpas = this.selectedCpas.cpasMail;
        modifiedZipCode.remCpas = this.selectedCpas.rem;

        if (!modifiedZipCode.hasOwnProperty('isNew')) {
            console.log('Update zipCode', modifiedZipCode);
            this.zipCodesService.update(modifiedZipCode)
                .subscribe((upDatedZipCode ) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Update',
                            detail: $localize`:@@messageZipCodeUpdated:The zipCode ${upDatedZipCode.zipCode}  was updated`
                        });
                        this.onZipCodeUpdate.emit(upDatedZipCode);
                        this.auditChangeEntityService.logDbChange(this.userId,this.userName,this.lienBanque,0,'ZipCode',
                            upDatedZipCode.zipCode.toString() , 'Update' );
                    },
                    (dataserviceerrorFn: () => DataServiceError) => {
                        const dataserviceerror = dataserviceerrorFn();
                        if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                        const  errMessage = {severity: 'error', summary: 'Update',
                            // tslint:disable-next-line:max-line-length
                            detail: $localize`:@@messageZipCodeUpdateError:The zipCode ${modifiedZipCode.zipCode} could not be updated: error: ${dataserviceerror.message}`,
                            life: 6000 };
                        this.messageService.add(errMessage) ;
                    }
                );
        } else {
            console.log('Create zipCode', modifiedZipCode);
            this.zipCodesService.add(modifiedZipCode)
                .subscribe((createdZipCode) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Creation',
                            detail: $localize`:@@messageZipCodeCreated:The zipCode ${createdZipCode.zipCode}   was created`
                        });
                        this.onZipCodeCreate.emit(createdZipCode);
                        this.auditChangeEntityService.logDbChange(this.userId,this.userName,this.lienBanque,0,'ZipCode',
                            createdZipCode.zipCode.toString(), 'Create' );
                    },
                    (dataserviceerrorFn: () => DataServiceError) => {
                        const dataserviceerror = dataserviceerrorFn();
                        if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                        const  errMessage = {severity: 'error', summary: 'Create',
                            // tslint:disable-next-line:max-line-length
                            detail: $localize`:@@messageZipCodeCreateError:The zipCode ${modifiedZipCode.zipCode} could not be created: error: ${dataserviceerror.message}`,
                            life: 6000 };
                        this.messageService.add(errMessage) ;
                    }
                );
        }
    }

    quit(event: Event, oldZipCode: ZipCode, zipCodeForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?` ,
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    zipCodeForm.reset(oldZipCode); // reset in-memory object for next open
                    this.onZipCodeQuit.emit();
                }
            });
        } else {
            this.onZipCodeQuit.emit();
        }
    }
    filterCpas(event ) {
        const  queryCpasParms: QueryParams = {};
        const query = event.query;
        queryCpasParms['offset'] = '0';
        queryCpasParms['rows'] = '10';
        queryCpasParms['sortField'] = 'cpasName';
        queryCpasParms['sortOrder'] = '1';
        queryCpasParms['searchField'] = 'cpasName';
        queryCpasParms['searchValue'] = query.toLowerCase();
        this.cpassService.getWithQuery(queryCpasParms)
            .subscribe(filteredCpass =>  this.filteredCpass = filteredCpass);
    }

    getZipCodeTitle() {
        return $localize`:@@ZipCodeLink:ZipCode link with CPAS`;
    }
}
