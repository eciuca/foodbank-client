import {AuthConfig} from 'angular-oauth2-oidc';
import {environment} from '../../environments/environment';

export const authConfig: AuthConfig = {
    // Url of the Identity Provider
    issuer: environment.authServerIssuer,

    // URL of the SPA to redirect the user to after login
    redirectUri: window.location.origin + '/en-US',

    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',

    // The SPA's id. The SPA is registerd with this id at the auth-server
    // clientId: 'server.code',
    clientId: 'frontend',

    // Just needed if your auth server demands a secret. In general, this
    // is a sign that the auth server is not configured with SPAs in mind
    // and it might not enforce further best practices vital for security
    // such applications.
    // dummyClientSecret: 'secret',

    responseType: 'code',

    // set the scope for the permissions the client should request
    // The first four are defined by OIDC.
    // Important: Request offline_access to get a refresh token
    // The api scope is a usecase specific one
    scope: 'openid profile email',
    requireHttps: false,
    useSilentRefresh: false, // Needed for Code Flow to suggest using iframe-based refreshes
    // silentRefreshTimeout: 60000, // For faster testing
    // timeoutFactor: 0.25, // For faster testing
    sessionChecksEnabled: true,
    showDebugInformation: true, // Also requires enabling "Verbose" level in devtools
    clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
    nonceStateSeparator : 'semicolon' // Real semicolon gets mangled by IdentityServer's URI encoding
};