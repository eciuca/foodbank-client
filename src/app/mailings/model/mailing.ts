export interface Mailing {
    from: string;
    to: string;
    subject: string;
    bodyText: string;
    language: string;
    sentDate: string;
    attachmentFileNames: string;
    bccMode: boolean;
}
export function compareMailings(c1: Mailing, c2: Mailing) {

    const compare = c1.sentDate > c2.sentDate;

    if (compare) {
        return 1;
    } else if ( c1.sentDate < c2.sentDate) {
        return -1;
    } else { return 0; }
}
export class DefaultMailing implements Mailing {
    bodyText: string;
    from: string;
    subject: string;
    language: string;
    to: string;
    sentDate: string;
    attachmentFileNames: string;
    bccMode: boolean;
    constructor() {
        this.to = '';
        this.from = '';
        this.subject = '';
        this.language = 'en';
        this.bodyText = '';
        this.attachmentFileNames = '';
        this.sentDate = new Date().toISOString();
        this.bccMode = true;
    }
}
