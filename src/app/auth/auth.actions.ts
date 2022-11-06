import {createAction, props} from '@ngrx/store';
import {IAuthPrincipal} from './auth-principal';


export const login = createAction(
    '[Login Page] User Login',
    props<IAuthPrincipal>()
);



export const logout = createAction(
  '[Top Menu] Logout'
);
