import {createFeatureSelector, createSelector} from '@ngrx/store';
import {AuthState} from './reducers';


export const selectAuthState =
    createFeatureSelector<AuthState>("auth");


export const isLoggedIn = createSelector(
    selectAuthState,
    auth => auth.isLoggedIn

);

export const loggedInUser = createSelector(
    selectAuthState,
    auth => auth.user

);

export const globalAuthState = createSelector(
    selectAuthState,
    auth => auth

);


export const isLoggedOut = createSelector(
    isLoggedIn,
    loggedIn => !loggedIn
);
