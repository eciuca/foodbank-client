import {EntityMetadataMap} from '@ngrx/data';
import {compareMembres, Membre} from './membres/model/membre';
import {Banque, compareBanques} from './banques/model/banque';
import {Beneficiaire, compareBeneficiaires} from './beneficiaires/model/beneficiaire';
import {compareCpass, Cpas} from './cpass/model/cpas';
import {compareDepots, Depot} from './depots/model/depot';
import {compareOrganisations, Organisation} from './organisations/model/organisation';
import {compareUsers, User} from './users/model/user';

export const appEntityMetadata: EntityMetadataMap = {
    Membre: {
        sortComparer: compareMembres,
        selectId: (membre: Membre) => membre.batId,
        entityDispatcherOptions: {optimisticUpdate: false},
    },
    Banque: {
        sortComparer: compareBanques,
        selectId: (banque: Banque) => banque.bankId,
        entityDispatcherOptions: {optimisticUpdate: false}
    },
    Beneficiaire: {
        sortComparer: compareBeneficiaires,
        selectId: (beneficiaire: Beneficiaire) => beneficiaire.idClient,
        entityDispatcherOptions: { optimisticUpdate: false}
    },
    Cpas: {
        sortComparer: compareCpass,
        selectId: (cpas: Cpas) => cpas.cpasId,
        entityDispatcherOptions: {optimisticUpdate: false},
    },
    Depot: {
        sortComparer: compareDepots,
        selectId: (depot: Depot) => depot.idDepot,
        entityDispatcherOptions: {optimisticUpdate: false}
    },
    Organisation: {
        sortComparer: compareOrganisations,
        selectId: (organisation: Organisation) => organisation.idDis,
        entityDispatcherOptions: { optimisticUpdate: false}
    },
    User: {
        sortComparer: compareUsers,
        selectId: (user: User) => user.idUser,
        entityDispatcherOptions: { optimisticUpdate: false}
    },
};

