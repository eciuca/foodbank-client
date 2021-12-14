/* eslint-disable brace-style */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { OAuthErrorEvent, OAuthService, UserInfo } from 'angular-oauth2-oidc';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { catchError, defaultIfEmpty, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Banque } from '../banques/model/banque';
import { Organisation } from '../organisations/model/organisation';
import { AppState } from '../reducers';
import { User } from '../users/model/user';
import { UserEntityService } from '../users/services/user-entity.service';
import { AuthPrincipal, IAuthPrincipal } from './auth-principal';
import { login } from './auth.actions';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  private isDoneLoadingSubject$ = new ReplaySubject<boolean>();
  public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();


  private userInfoSubject$ = new BehaviorSubject<UserInfo>(null);
  public userInfo$ = this.userInfoSubject$.asObservable().pipe(filter(userInfo => !!userInfo));

  private userProfileSubject$ = new ReplaySubject<IAuthPrincipal>();
  public userProfile$ = this.userProfileSubject$.asObservable();

  /**
   * Publishes `true` if and only if (a) all the asynchronous initial
   * login calls have completed or errorred, and (b) the user ended up
   * being authenticated.
   *
   * In essence, it combines:
   *
   * - the latest known state of whether the user is authorized
   * - whether the ajax calls for initial log in have all been done
   */
  public canActivateProtectedRoutes$: Observable<boolean> = combineLatest([
    this.isAuthenticated$,
    this.isDoneLoading$
  ]).pipe(map(values => values.every(b => b)));

  private navigateToLoginPage() {
    // TODO: Remember current URL
    this.router.navigateByUrl('/should-login');
  }

  constructor(
    private http: HttpClient,
    private oauthService: OAuthService,
    private router: Router,
    private store: Store<AppState>
  ) {
    // Useful for debugging:
    this.oauthService.events.subscribe(event => {
      if (event instanceof OAuthErrorEvent) {
        console.error('OAuthErrorEvent Object:', event);
      } else {
        console.warn('OAuthEvent Object:', event);
      }
    });

    // This is tricky, as it might cause race conditions (where access_token is set in another
    // tab before everything is said and done there.
    // TODO: Improve this setup. See: https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/issues/2
    window.addEventListener('storage', (event) => {
      // The `key` is `null` if the event was caused by `.clear()`
      if (event.key !== 'access_token' && event.key !== null) {
        return;
      }

      console.warn('Noticed changes to access_token (most likely from another tab), updating isAuthenticated');
      this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());

      if (!this.oauthService.hasValidAccessToken()) {
        this.navigateToLoginPage();
      }
    });

    this.oauthService.events
      .subscribe(_ => {
        this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());
      });

    this.oauthService.events
      .pipe(filter(e => ['token_received'].includes(e.type)))
      .subscribe(e => this.oauthService.loadUserProfile().then(userInfo => this.userInfoSubject$.next(userInfo)));

    this.oauthService.events
      .pipe(filter(e => ['session_terminated', 'session_error'].includes(e.type)))
      .subscribe(e => this.navigateToLoginPage());

    this.oauthService.setupAutomaticSilentRefresh();

    console.log('subscribe to user info subject');
    combineLatest([this.canActivateProtectedRoutes$, this.userInfoSubject$])
    .pipe(filter((_, userInfo) => !userInfo))
    .subscribe(_ => this.oauthService.loadUserProfile()
        .then(newUserInfo => this.userInfoSubject$.next(newUserInfo))
    );

    this.userInfo$.pipe(
      mergeMap(userInfo => {
        const userId = userInfo.sub.split(':')[2];
        const groups = userInfo['groups'];
        const header = { headers: { 'Authorization': this.oauthService.authorizationHeader()  } };
        return this.http.get<User>(`/api/user/${userId}`, header).pipe(
          mergeMap(user => this.createAuthPrincipalFromUser(user, groups, header))
        );
      }),
      map(authState => login(authState))
    ).subscribe(authState => {
        this.store.dispatch(authState);
        const auditObj = {'user': authState.user.idUser, 'idDis': '0'};
        if (authState.organisation) {
            auditObj['idDis'] = authState.organisation.idDis.toString();
        }
        const headerlog = {headers: {Authorization:  'Bearer ' + this.accessToken}};
        this.http.get('http://api.ipify.org/?format=json').subscribe((res: any) => {
          auditObj['ipAddress'] = res.ip;
          console.log('audit object to log in', auditObj);
          this.http.post ('/api/audit/', auditObj, headerlog ).subscribe();
        });
     });
  }

  public runInitialLoginSequence(): Promise<void> {
    if (location.hash) {
      console.log('Encountered hash fragment, plotting as table...');
      console.table(location.hash.substr(1).split('&').map(kvp => kvp.split('=')));
    }

    // 0. LOAD CONFIG:
    // First we have to check to see how the IdServer is
    // currently configured:
    return this.oauthService.loadDiscoveryDocument()

      // For demo purposes, we pretend the previous call was very slow
      // .then(() => new Promise<void>(resolve => setTimeout(() => resolve(), 1000)))

      // 1. HASH LOGIN:
      // Try to log in via hash fragment after redirect back
      // from IdServer from initImplicitFlow:
      .then(() => this.oauthService.tryLogin())

      .then(() => {
        if (this.oauthService.hasValidAccessToken()) {
          return Promise.resolve();
        }

        // 2. SILENT LOGIN:
        // Try to log in via a refresh because then we can prevent
        // needing to redirect the user:
        // return this.oauthService.silentRefresh()
        //   .then(result => {
        //     console.log("result");
        //     Promise.resolve();
        //   })
        //   .catch(result => {
        //     // Subset of situations from https://openid.net/specs/openid-connect-core-1_0.html#AuthError
        //     // Only the ones where it's reasonably sure that sending the
        //     // user to the IdServer will help.
        //     const errorResponsesRequiringUserInteraction = [
        //       'interaction_required',
        //       'login_required',
        //       'account_selection_required',
        //       'consent_required',
        //     ];

        //     if (result
        //       && result.reason
        //       && errorResponsesRequiringUserInteraction.indexOf(result.params.error) >= 0) {

        //       // 3. ASK FOR LOGIN:
        //       // At this point we know for sure that we have to ask the
        //       // user to log in, so we redirect them to the IdServer to
        //       // enter credentials.
        //       //
        //       // Enable this to ALWAYS force a user to login.
        //       this.login();
        //       //
        //       // Instead, we'll now do this:
        //       console.warn('User interaction is needed to log in, we will wait for the user to manually log in.');
        //       return Promise.resolve();
        //     }

        //     // We can't handle the truth, just pass on the problem to the
        //     // next handler.
        //     return Promise.reject(result);
        //   });
      })

      .then(() => {
        this.isDoneLoadingSubject$.next(true);
        console.log('isDoneLoadingSubject');

        // Check for the strings 'undefined' and 'null' just to be sure. Our current
        // login(...) should never have this, but in case someone ever calls
        // initImplicitFlow(undefined | null) this could happen.
        if (this.oauthService.state && this.oauthService.state !== 'undefined' && this.oauthService.state !== 'null') {
          let stateUrl = this.oauthService.state;
          if (stateUrl.startsWith('/') === false) {
            stateUrl = decodeURIComponent(stateUrl);
          }
          console.log(`There was state of ${this.oauthService.state}, so we are sending you to: ${stateUrl}`);
          this.router.navigateByUrl(stateUrl);
        }
      })
      .catch(error => {
        console.log(error);
        this.isDoneLoadingSubject$.next(true);
      });
  }

  private createAuthPrincipalFromUser(user: User, groups: string[], header): Observable<IAuthPrincipal> {
      const authBanque$ = !user.idCompany
          ? of(undefined)
          : this.http.get<Banque>(`/api/banque/getByShortName/${user.idCompany}`, header).pipe(catchError(err => this.handleNotFound(err)));

      const authOrganisation$ = user.idOrg === 0
          ? of(undefined)
          : this.http.get<Organisation>(`/api/organisation/${user.idOrg}`, header).pipe(catchError(err => this.handleNotFound(err)));

      return forkJoin([of(user), authBanque$, authOrganisation$])
          .pipe(map(([user, banque, organisation]) => new AuthPrincipal(user, banque, organisation, groups)));
  }

  private handleNotFound(error: any) {
    if (error.status === 404) {
        return of(undefined);
    } else {
        // important to use the rxjs error here not the standard one
        return throwError(error);
    }
  }


  public login(targetUrl?: string) {
    // Note: before version 9.1.0 of the library you needed to
    // call encodeURIComponent on the argument to the method.
    this.oauthService.initLoginFlow(targetUrl || this.router.url);
  }

  public logout() { this.oauthService.logOut(); }
  public refresh() { this.oauthService.silentRefresh(); }
  public hasValidToken() { return this.oauthService.hasValidAccessToken(); }

  // These normally won't be exposed from a service like this, but
  // for debugging it makes sense.
  public get accessToken() { return this.oauthService.getAccessToken(); }
  public get refreshToken() { return this.oauthService.getRefreshToken(); }
  public get identityClaims() { return this.oauthService.getIdentityClaims(); }
  public get idToken() { return this.oauthService.getIdToken(); }
  public get logoutUrl() { return this.oauthService.logoutUrl; }
}
