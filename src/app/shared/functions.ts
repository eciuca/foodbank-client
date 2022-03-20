export function labelCivilite(civilite: number) {

    switch (civilite) {
        case 1:
            return $localize`:@@TitleMr:Mr`;
        case 2:
            return $localize`:@@TitleMrs:Mrs`;
        case 3:
            return $localize`:@@TitleMiss:Miss`;
        default:
            return ' ';
    }

}
export function  labelRights(rights: string) {
    switch (rights.toLowerCase()) {
        case 'admin_banq':
            return $localize`:@@RoleBankAdmin:Bank admin`;
        case 'bank':
            return $localize`:@@RoleBankUser:Bank User`;
        case 'admin_asso':
            return  $localize`:@@RoleOrgAdmin:Org Admin`;
        case 'asso':
            return $localize`:@@RoleOrgUser:Org User`;
        case 'admin':
            return $localize`:@@RoleAdmin:Global admin`;
        case 'admin_cpas':
            return $localize`:@@RoleCPASAdmin:CPAS Admin`;
        case 'admin_fead':
            return $localize`:@@RoleFEADAdmin:FEAD Admin`;
        case 'admin_fbba':
            return $localize`:@@RoleFBBAAdmin:FBBA Admin`;
        case 'bank_fbba':
            return  $localize`:@@RoleFBBAUser:FBBA User`;
        default:
            return rights;
    }
}
export function  labelLanguage(membreLangue: number) {
    switch (membreLangue) {
        case 1:
            return 'Fr';
        case 2:
            return 'Nl';
        case 3:
            return 'En';
        default:
            return '?';
    }


}

export function labelAgreed(agreed: boolean) {
    if (agreed) {
        return $localize`:@@Yes:Yes`;
    }
    else {
        return $localize`:@@No:No`;
    }
}
export function labelActive(active: boolean) {
    if (active) {
        return $localize`:@@Yes:Yes`;
    }
    else {
        return $localize`:@@No:No`;
    }
}

