import {EntityMetadataMap} from '@ngrx/data';
import {compareMembres, Membre} from './membres/model/membre';
import {Banque, compareBanques} from './banques/model/banque';
import {Beneficiaire, compareBeneficiaires} from './beneficiaires/model/beneficiaire';
import {compareCpass, Cpas} from './cpass/model/cpas';
import {compareDepots, Depot} from './depots/model/depot';
import {compareOrganisations, Organisation} from './organisations/model/organisation';
import {compareUsers, User} from './users/model/user';
import {compareDependents, Dependent} from './beneficiaires/model/dependent';
import {compareOrgcontacts, Orgcontact} from './organisations/model/orgcontact';
import {compareOrgSummaries, OrgSummary} from './organisations/model/orgsummary';

export const appEntityMetadata: EntityMetadataMap = {
    Membre: {
        sortComparer: compareMembres,
        selectId: (membre: Membre) => membre.batId,
        entityDispatcherOptions: {optimisticUpdate: false, optimisticDelete: false},
    },
    Banque: {
        sortComparer: compareBanques,
        selectId: (banque: Banque) => banque.bankId,
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

    User: {
        sortComparer: compareUsers,
        selectId: (user: User) => user.idUser,
        entityDispatcherOptions: { optimisticUpdate: false, optimisticDelete: false}
    },
};

