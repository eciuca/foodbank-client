import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {Store} from '@ngrx/store';

import {AuthService} from '../auth.service';
import {mergeMap, tap} from 'rxjs/operators';
import {noop} from 'rxjs';
import {Router} from '@angular/router';
import {AppState} from '../../reducers';
import {login} from '../auth.actions';
import {AuthActions} from '../action-types';
import { IAuthPrincipal } from '../auth-principal';
import { MessageService } from '../../message.service';

@Component({
    // tslint:disable-next-line:component-selector
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;

  constructor(
      private fb: FormBuilder,
      private auth: AuthService,
      private router: Router,
      private store: Store<AppState>,
      private messageService: MessageService) {

      this.form = fb.group({
          idUser: ['rvdmbat', [Validators.required]],
          password: ['f00dBank', [Validators.required]]
      });

  }

  ngOnInit() {

  }

  login() {

      const val = this.form.value;

      this.auth.login(val.idUser, val.password)
          .pipe(
              tap(principal => console.log(principal.user))
          )
          .subscribe(
              principal => {
                const loginAction = login(principal);
                this.store.dispatch(loginAction);

                this.router.navigateByUrl('/users');
              },
              error => {
                  console.log(error);
                  alert('Login Failed');
                  this.messageService.add('Login has failed');
              }
          );



  }

}

