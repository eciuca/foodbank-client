export interface Notification {
    notificationId: number;
    creationdate: string;
    author: string;
    subject: string;
    audience: string;
    importance: number;
    language: string;
    content: string;
    totalRecords: number;
}
export function compareNotifications(c1: Notification, c2: Notification) {

    const compare = c1.notificationId - c2.notificationId;

    if (compare > 0) {
        return 1;
    } else if (compare < 0) {
        return -1;
    } else {
        return 0;
    }
}
export class DefaultNotification implements Notification {
    audience: string;
    author: string;
    content: string;
    creationdate: string;
    importance: number;
    language: string;
    notificationId: number;
    subject: string;
    totalRecords: number;
    constructor() {
        this.audience = '';
        this.author = '';
        this.content = '';
        this.creationdate = '';
        this.importance = 0;
        this.language = 'en';
        this.subject = '';
        this.totalRecords = 0;
    }

}
