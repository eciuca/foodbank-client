import {combineLatest, Observable} from 'rxjs';
import {QueryParams} from '@ngrx/data';
import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {DefaultDependent, Dependent} from '../../model/dependent';
import {DependentEntityService} from '../../services/dependent-entity.service';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmGender} from '../../../shared/enums';
import {map} from 'rxjs/operators';
import {globalAuthState} from '../../../auth/auth.selectors';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-dependent',
  templateUrl: './dependent.component.html',
  styleUrls: ['./dependent.component.css']
})
export class DependentComponent implements OnInit {
  @Input() idDep$: Observable<number>;
  @Input() masterId$: Observable<number>;
  masterId: number;
  @Output() onDependentUpdate = new EventEmitter<Dependent>();
  @Output() onDependentCreate = new EventEmitter<Dependent>();
  @Output() onDependentDelete = new EventEmitter<Dependent>();
  @Output() onDependentQuit = new EventEmitter<Dependent>();
  dependent: Dependent;
  booCanSave: boolean;
  booCanDelete: boolean;
  booCanQuit: boolean;
  genders: any[];
  lienBanque: number;
  lienDis: number;

  constructor(
      private dependentsService: DependentEntityService,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.genders = enmGender;
    this.booCanDelete = false;
    this.booCanSave = false;
    this.booCanQuit = true;
    this.lienDis = 0;
    this.lienBanque = 0;
  }

  ngOnInit(): void {
    this.masterId$.subscribe(masterId => this.masterId = masterId);

    const dependent$ = combineLatest([this.idDep$, this.dependentsService.entities$])
        .pipe(
            map(([idDep, dependents]) => dependents.find(dependent => dependent['idDep'] === idDep))
        );
    dependent$.subscribe(dependent => {
      if (dependent) {
        this.dependent = dependent;
        console.log('our dependent:', this.dependent);
      } else {
        this.dependent = new DefaultDependent();
        console.log('we have a new default dependent');
      }
    });

    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                switch (authState.user.rights) {
                  case 'Asso':
                    this.lienBanque = authState.banque.bankId;
                    this.lienDis = authState.user.idOrg;
                    break;
                  case 'Admin_Asso':
                    this.lienBanque = authState.banque.bankId;
                    this.lienDis = authState.user.idOrg;
                    this.booCanSave = true;
                    this.booCanDelete = true;
                    break;
                  default:
                }
              }
            })
        )
        .subscribe();
  }

  delete(event: Event, dependent: Dependent) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const myMessage = {
          severity: 'success',
          summary: 'Destruction',
          detail: `The dependent ${dependent.nom} ${dependent.prenom} has been deleted`
        };
        this.dependentsService.delete(dependent)
            .subscribe(() => {
              this.messageService.add(myMessage);
              this.onDependentDelete.emit(dependent);
            });
      },
      reject: () => {
        console.log('We do nothing');
      }
    });
  }

  save(oldDependent: Dependent, dependentForm: Dependent) {
    const modifiedDependent = Object.assign({}, oldDependent, dependentForm);

    if (modifiedDependent.hasOwnProperty('idDep')) {
      this.dependentsService.update(modifiedDependent)
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Mise à jour',
              detail: `The dependent ${modifiedDependent.nom} ${modifiedDependent.prenom}  has been modified`
            });
            this.onDependentUpdate.emit(modifiedDependent);
          });
    } else {
      modifiedDependent.lienBanque = this.lienBanque;
      modifiedDependent.lienDis = this.lienDis;
      modifiedDependent.lienMast = this.masterId;
      console.log('Creating Dependent with content:', modifiedDependent);
      this.dependentsService.add(modifiedDependent)
          .subscribe((newDependent) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Création',
              detail: `Le dependent ${newDependent.nom} ${newDependent.prenom}  a été créé`
            });
            this.onDependentCreate.emit(newDependent);
          });
    }

  }

  quit(event: Event, oldDependent: Dependent, dependentForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: 'Your changes may be lost. Are you sure that you want to proceed?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          dependentForm.reset(oldDependent); // reset in-memory object for next open
          console.log('We have reset the dependent form to its original value');
          this.onDependentQuit.emit();
        },
        reject: () => {
          console.log('We do nothing');
        }
      });
    } else {
      console.log('Form is not dirty, closing');
      this.onDependentQuit.emit();
    }
  }
}
