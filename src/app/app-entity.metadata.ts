import {EntityMetadataMap} from '@ngrx/data';
import {compareMembres, Membre} from './membres/model/membre';
import {Banque, compareBanques} from './banques/model/banque';
import {BanqProg, compareBanqProgs} from './banques/model/banqprog';
import {Beneficiaire, compareBeneficiaires} from './beneficiaires/model/beneficiaire';
import {compareCpass, Cpas} from './cpass/model/cpas';
import {compareDepots, Depot} from './depots/model/depot';
import {compareOrganisations, Organisation} from './organisations/model/organisation';
import {compareUsers, User} from './users/model/user';
import {compareDependents, Dependent} from './beneficiaires/model/dependent';
import {compareOrgcontacts, Orgcontact} from './organisations/model/orgcontact';
import {compareOrgSummaries, OrgSummary} from './organisations/model/orgsummary';
import {compareMembreMails, MembreMail} from './membres/model/membreMail';
import {compareMailings, Mailing} from './mailings/model/mailing';
import {Notification, compareNotifications} from './home/notifications/model/notification';
import {compareTrips, Trip} from './trips/model/trip';
import {compareDonateurs, Donateur} from './donations/model/donateur';
import {compareDons, Don} from './donations/model/don';
import {compareRegions, Region} from './organisations/model/region';
import {Audit, compareAudits} from './audits/model/audit';
import {compareOrgaudits, Orgaudit} from './organisations/model/orgaudit';
import {compareMailAddresses, MailAddress} from './mailings/model/mailaddress';
import {compareOrgPrograms, OrgProgram} from './organisations/model/orgprogram';


export const appEntityMetadata: EntityMetadataMap = {
    Audit: {
        sortComparer: compareAudits,
        selectId: (audit: Audit) => audit.auditId,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false}
    },
    Membre: {
        sortComparer: compareMembres,
        selectId: (membre: Membre) => membre.batId,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false},
    },
    MembreMail: {
        sortComparer: compareMembreMails,
        selectId: (membreMail: MembreMail) => membreMail.batId,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false},
    },
    MailAddress: {
        sortComparer: compareMailAddresses,
        selectId: (mailaddress: MailAddress) =>  mailaddress.email,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false},
    },
    Mailing: {
        sortComparer: compareMailings,
        selectId: (mailing: Mailing) => mailing.sentDate,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false},
    },
    Banque: {
        sortComparer: compareBanques,
        selectId: (banque: Banque) => banque.bankId,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false}
    },
    BanqProg: {
        sortComparer: compareBanqProgs,
        selectId: (banqProg: BanqProg) => banqProg.lienBanque,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false}
    },
    Beneficiaire: {
        sortComparer: compareBeneficiaires,
        selectId: (beneficiaire: Beneficiaire) => beneficiaire.idClient,
        entityDispatcherOptions: { optimisticUpdate: false, optimisticDelete: false}
    },
    Dependent: {
        sortComparer: compareDependents,
        selectId: (dependent: Dependent) => dependent.idDep,
        entityDispatcherOptions: { optimisticUpdate: false, optimisticDelete: false}
    },
    Cpas: {
        sortComparer: compareCpass,
        selectId: (cpas: Cpas) => cpas.cpasId,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false},
    },
    Depot: {
        sortComparer: compareDepots,
        selectId: (depot: Depot) => depot.idDepot,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false}
    },
    Donateur: {
        sortComparer: compareDonateurs,
        selectId: (donateur: Donateur) => donateur.donateurId,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false}
    },
    Don: {
        sortComparer: compareDons,
        selectId: (don: Don) => don.idDon,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false}
    },
    Organisation: {
        sortComparer: compareOrganisations,
        selectId: (organisation: Organisation) => organisation.idDis,
        entityDispatcherOptions: { optimisticUpdate: false, optimisticDelete: false}
    },
    OrgSummary: {
        sortComparer: compareOrgSummaries,
        selectId: (orgSummary: OrgSummary) => orgSummary.idDis,
        entityDispatcherOptions: { optimisticUpdate: false, optimisticDelete: false}
    },
    Orgcontact: {
        sortComparer: compareOrgcontacts,
        selectId: (orgcontact: Orgcontact) => orgcontact.orgPersId,
        entityDispatcherOptions: { optimisticUpdate: false, optimisticDelete: false}
    },
    OrgProgram: {
        sortComparer: compareOrgPrograms,
        selectId: (orgProgram: OrgProgram) => orgProgram.lienDis,
        entityDispatcherOptions: { optimisticUpdate: false, optimisticDelete: false}
    },
    Orgaudit: {
        sortComparer: compareOrgaudits,
        selectId: (orgaudit: Orgaudit) => orgaudit.auditId,
        entityDispatcherOptions: { optimisticUpdate: false, optimisticDelete: false}
    },
    Region: {
        sortComparer: compareRegions,
        selectId: (region: Region) => region.regId,
        entityDispatcherOptions: { optimisticUpdate: false, optimisticDelete: false}
    },

    User: {
        sortComparer: compareUsers,
        selectId: (user: User) => user.idUser,
        entityDispatcherOptions: { optimisticUpdate: false, optimisticDelete: false}
    },
    Notification: {
        sortComparer: compareNotifications,
        selectId: (notification: Notification) => notification.notificationId,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false},
    },
    Trip: {
        sortComparer: compareTrips,
        selectId: (trip: Trip) => trip.tripId,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false},
    },
};

