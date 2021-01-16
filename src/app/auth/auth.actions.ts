import {createAction, props} from '@ngrx/store';
import {User} from '../users/model/user';
import {Banque} from '../banques/model/banque';
import {Organisation} from '../organisations/model/organisation';
import { IAuthPrincipal } from './auth-principal';



export const login = createAction(
    '[Login Page] User Login',
    props<IAuthPrincipal>()
);



export const logout = createAction(
  '[Top Menu] Logout'
);
