import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {CpasEntityService} from '../services/cpas-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Cpas} from '../model/cpas';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmGender, enmLanguage} from '../../shared/enums';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-cpas',
  templateUrl: './cpas.component.html',
  styleUrls: ['./cpas.component.css']
})
export class CpasComponent implements OnInit {
    @Input() cpas : Cpas;
    @Output() onCpasUpdate = new EventEmitter<Cpas>();
    @Output() onCpasDelete = new EventEmitter<Cpas>();
    @Output() onCpasQuit = new EventEmitter<Cpas>();
    booCanDeleteAndQuit: boolean;
    genders: any[];
    languages: any[];
  constructor(
      private cpassService: CpasEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.genders = enmGender;
      this.languages =  enmLanguage;
      this.booCanDeleteAndQuit = true;
  }

  ngOnInit(): void {
      if (!this.cpas) {
          // we must come from the menu
          console.log('We initialize a new cpas object from the router!');
          this.booCanDeleteAndQuit = false;
          this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('cpasId')),
                  withLatestFrom(this.cpassService.entities$),
                  map(([cpasId, cpass]) => cpass.find(cpas => cpas['cpasId'].toString() === cpasId))
              )

              .subscribe(
                  cpas => this.cpas = cpas
              );
      }
  }

    delete(event: Event, cpas: Cpas) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success', summary: 'Destruction', detail: `Le cpas ${cpas.cpasName} a été détruit`};
                this.cpassService.delete(cpas)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onCpasDelete.emit(cpas);
                    });
            },
            reject: () => {
                console.log('We do nothing');
            }
        });
    }

  save(oldCpas: Cpas, cpasForm: Cpas) {
    const modifiedCpas = Object.assign({}, oldCpas, cpasForm);
    this.cpassService.update(modifiedCpas)
        .subscribe( ()  => {
          this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `Le cpas ${modifiedCpas.cpasName} a été modifié`});
          this.onCpasUpdate.emit(modifiedCpas);
        });
  }
    quit(event: Event, oldCpas: Cpas, cpasForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: 'Your changes may be lost. Are you sure that you want to proceed?',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    cpasForm.reset(oldCpas); // reset in-memory object for next open
                    console.log('We have reset the cpas form to its original value');
                    this.onCpasQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
            this.onCpasQuit.emit();
        }
    }
}

