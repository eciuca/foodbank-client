import {createAction, props} from '@ngrx/store';
import {User} from '../users/model/user';
import {Banque} from '../banques/model/banque';
import {Organisation} from '../organisations/model/organisation';



export const login = createAction(
    '[Login Page] User Login',
    props<{user: User, banque: Banque,organisation: Organisation}>()
);



export const logout = createAction(
  '[Top Menu] Logout'
);
