import { User } from '../users/model/user';
import { Banque } from '../banques/model/banque';
import { Organisation } from '../organisations/model/organisation';

export interface IAuthPrincipal {
    user: User;
    banque: Banque;
    organisation: Organisation;
    groups: string[];
}

export class AuthPrincipal implements IAuthPrincipal {
    constructor(public user: User,
        public banque: Banque,
        public organisation: Organisation,
        public groups: string[]) { }
}