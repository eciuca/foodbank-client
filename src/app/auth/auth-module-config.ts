import { OAuthModuleConfig } from 'angular-oauth2-oidc';

export const authModuleConfig: OAuthModuleConfig = {
  resourceServer: {
    // allowedUrls: ['http://localhost:4200/api', 'http://localhost:8081/api'],
    allowedUrls: ['https://dev.foodbankit.org/api'],
    sendAccessToken: true,
  }
};