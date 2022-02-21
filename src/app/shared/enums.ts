export let enmYn = [
    {label: $localize`:@@Any:Any` , value: null},
    {label: $localize`:@@Yes:Yes` , value: 1},
    {label: $localize`:@@No:No` , value: 0 },
];
export let enmApp = [
    {label: $localize`:@@Any:Any` , value: null},
    {label: 'PHP' , value: 0},
    {label: 'FBIT' , value: 1 },
];
export let enmStatusCompany =  [
    {label: '', value: ''},
    {label: $localize`:@@CompanyNonProfit:Non Profit`, value: '1'},
    {label: $localize`:@@CompanyUnRegistered:UnRegistered`, value: '2'},
    {label: $localize`:@@CompanyCPAS:Social`, value: '3' },
    {label: $localize`:@@CompanyPublicAuxiliary:Public Auxiliary`, value: '4'},
    {label: $localize`:@@CompanyOnePerson:One Person`, value: '0'}
];

export let enmGender = [
    {label: $localize`:@@PersonTitleMister:Mr.` , value: 1},
    {label: $localize`:@@PersonTitleLady:Mrs.` , value: 2 },
    {label: $localize`:@@PersonTitleMiss:Miss` , value: 3}
];
export let enmLanguage = [
    {label: '', value: null},
    {label: 'Français', value: 1},
    {label: 'Nederlands', value: 2 },
    {label: 'English', value: 3},
    {label: 'Deutsch', value: 4}
];
export let enmLanguageLegacy = [
    {label: '', value: ''},
    {label: 'Français', value: 'fr'},
    {label: 'Nederlands', value: 'nl' },
    {label: 'English', value: 'en'},
    {label: 'Deutsch', value: 'ge'}
];
export let enmCountry = [
    {label: 'Belgium', value: 1},
    {label: 'France', value: 2 },
    {label: 'Deutschland', value: 3},
    {label: 'Nederland', value: 4},
    {label: 'Luxembourg', value: 5}
];
export let enmUserRoles = [
    {label: $localize`:@@RoleAdmin:Global admin`, value: 'admin'},
    {label: $localize`:@@RoleBankAdmin:Bank admin`, value: 'Admin_Banq' },
    {label: $localize`:@@RoleOrgAdmin:Org Admin`, value: 'Admin_Asso'},
    {label: $localize`:@@RoleCPASAdmin:CPAS Admin`, value: 'Admin_CPAS' },
    {label: $localize`:@@RoleFEADAdmin:FEAD Admin`, value: 'Admin_FEAD'},
    {label: $localize`:@@RoleEXTAdmin:EXT Admin`, value: 'Admin_EXT'},
    {label: $localize`:@@RoleFBBAAdmin:FBBA Admin`, value: 'Admin_FBBA' },
    {label: $localize`:@@RoleOrgUser:Org User`, value: 'Asso'},
    {label: $localize`:@@RoleBankUser:Bank User`, value: 'Bank'},
    {label: $localize`:@@RoleFBBAUser:FBBA User`, value: 'Bank_FBBA'},
];
export let enmUserRolesBankAsso = [
    {label: $localize`:@@RoleBankAdmin:Bank admin`, value: 'Admin_Banq' },
    {label: $localize`:@@RoleBankUser:Bank User`, value: 'Bank'},
    {label: $localize`:@@RoleOrgAdmin:Org Admin`, value: 'Admin_Asso'},
    {label: $localize`:@@RoleOrgUser:Org User`, value: 'Asso'},
];
export let enmUserRolesBank = [
    {label: $localize`:@@RoleBankAdmin:Bank admin`, value: 'Admin_Banq' },
    {label: $localize`:@@RoleBankUser:Bank User`, value: 'Bank'},
    {label: $localize`:@@RoleEXTAdmin:EXT Admin`, value: 'Admin_EXT'}
];
export let enmUserRolesAsso = [
    {label: $localize`:@@RoleOrgAdmin:Org Admin`, value: 'Admin_Asso'},
    {label: $localize`:@@RoleOrgUser:Org User`, value: 'Asso'},
];
export let enmStatutFead = [
    {label: $localize`:@@FeadStatusRefused:Refused`, value: 0},
    {label: $localize`:@@FeadStatusAccepted:Accepted`, value: 1},
    {label: $localize`:@@FeadStatusUnderStudy:Under Study`, value: 2},
];
export let enmOrgActivities = [
    {label: '', value: 0},
    {label: $localize`:@@OrgActivity2ndHandClothes:2nd hand Clothes Collect & Sell`, value: 1},
    {label: $localize`:@@OrgActivitySocialGrocery:Social Grocery`, value: 2},
    {label: $localize`:@@OrgActivity2ndHandFurniture:2nd hand Furniture Collect & Sell`, value: 3},
    {label: $localize`:@@OrgActivityHomeworkClub:Homework Club`, value: 4},
    {label: $localize`:@@OrgActivitySocialRestaurant:Social Restaurant`, value: 5},
    {label: $localize`:@@OrgActivityCommunityKitchen:Community Kitchen`, value: 6}
];
export let enmOrgCategories = [
    {label: '', value: 999 },
    {label: $localize`:@@OrgCategoryUnassigned:Unassigned`, value: 0 },
    {label: $localize`:@@OrgCategoryShelterYoung:Shelter for Youngsters and Children` , value: 1 },
    {label: $localize`:@@OrgCategoryShelterHandicapped:Shelter for Handicapped People` , value: 2 },
    {label: $localize`:@@OrgCategoryShelterWomen:Shelter for Women` , value: 3 },
    {label: $localize`:@@OrgCategoryShelterMen:Shelter for Men` , value: 4 },
    {label: $localize`:@@OrgCategorySocialCenter:Approved Social Center` , value: 5 },
    {label: $localize`:@@OrgCategoryCommunity:Community` , value: 6 },
    {label: $localize`:@@OrgCategoryNeighbourhood:Neighbourhood Mutual Help` , value: 7 },
    {label: $localize`:@@OrgCategoryUrban:Urban Mutual Help` , value: 8 },
    {label: $localize`:@@OrgCategoryRural:Rural Mutual Help` , value: 9 },
    {label: $localize`:@@OrgCategoryRegional:Regional Mutual Help` , value: 10 },
    {label: $localize`:@@OrgCategoryHoliday:Holiday Center for Needy` , value: 11 },
    {label: $localize`:@@OrgCategoryRestaurant:Restaurant for Needy` , value: 12 },
    {label: $localize`:@@OrgCategoryElderly:Elderly Help` , value: 13 },
    {label: $localize`:@@OrgCategoryPrison:Prisoner Support` , value: 14 },
    {label: $localize`:@@OrgCategoryRefugee:Shelter for Refugees` , value: 15 },
];
export let enmMailGroupsBank = [
    {label: $localize`:@@OrgMailGroupContacts:Org Contacts` , value: null },
    {label: $localize`:@@OrgMailGroupOrgItMgrs:Org It Mgrs` , value: 1 },
    {label: $localize`:@@OrgMailGroupOrgItUsers:Org Users` , value: 2 },
    {label: $localize`:@@BankMailGroupItMgrs:Bank It Mgrs` , value: 3 },
    {label: $localize`:@@BankMailGroupItUsers:Bank Users` , value: 4 },
];
export let enmMailGroupsOrg = [
    {label: $localize`:@@OrgMailGroupOrgItUsers:Org Users` , value: 2 },
    {label: $localize`:@@BankMailGroupItMgrs:Bank It Mgrs` , value: 3 },
];






