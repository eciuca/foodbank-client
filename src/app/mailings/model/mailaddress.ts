export interface MailAddress {
    name: string;
    firstname: string;
    email: string;
}
export class DefaultMailAddress implements MailAddress {
    name: string;
    firstname: string;
    email: string;
    constructor() {
        this.name = '';
        this.email = '';
        this.firstname = '';
    }
}