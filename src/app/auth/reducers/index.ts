import {createReducer, on} from '@ngrx/store';

import {AuthActions} from '../action-types';
import {User} from '../../users/model/user';
import {Banque} from '../../banques/model/banque';
import {Organisation} from '../../organisations/model/organisation';

export interface AuthState {
    user: User;
    banque: Banque;
    organisation: Organisation;
    groups: string[],
    isLoggedIn: boolean
}

export const initialAuthState: AuthState = {
    user: undefined,
    banque: undefined,
    organisation: undefined,
    groups: [],
    isLoggedIn: false
};

export const authReducer = createReducer(

    initialAuthState,

    on(AuthActions.login, (state, action) => {
        return {
            user: action.user,
            banque: action.banque,
            organisation: action.organisation,
            groups: action.groups,
            isLoggedIn: true
        };
    }),

    on(AuthActions.logout, (state, action) => {
        return {
            user: undefined,
            banque: undefined,
            organisation: undefined,
            groups: [],
            isLoggedIn: false
        };
    })
);

