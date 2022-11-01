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
export let enmSupplyDay = [
    {label: $localize`:@@Everyday:Everyday` , value: 0},
    {label: $localize`:@@Monday:Monday` , value: 1},
    {label: $localize`:@@Tuesday:Tuesday` , value: 2},
    {label: $localize`:@@Wednesday:Wednesday` , value: 3},
    {label: $localize`:@@Thursday:Thursday` , value: 4},
    {label: $localize`:@@Friday:Friday` , value: 5},
    {label: $localize`:@@Saturday:Saturday` , value: 6},
    {label: $localize`:@@Sunday:Sunday` , value: 7}
];
export let enmSupplyWeek = [
    {label: $localize`:@@WeekEvery:Every Week` , value: 5},
    {label: $localize`:@@Week1:Week 1` , value: 1},
    {label: $localize`:@@Week2:Week 2` , value: 2},
    {label: $localize`:@@Week3:Week 3` , value: 3},
    {label: $localize`:@@Week4:Week 4` , value: 4},
    {label: $localize`:@@Week13:Week 1 and 3` , value: 6},
    {label: $localize`:@@Week24:Week 2 and 4` , value: 7},
    {label: $localize`:@@Week12:Week 1 and 2` , value: 8},
    {label: $localize`:@@Week34:Week 3 and 4` , value: 9},
    {label: $localize`:@@Week23:Week 2 and 3` , value: 10},
    {label: $localize`:@@Week14:Week 1 and 4` , value: 13},
    {label: $localize`:@@WeeksEven: Even Weeks` , value: 11},
    {label: $localize`:@@WeeksUneven: Uneven Weeks` , value: 12},

];
export let enmSupplyMonth = [
    {label: $localize`:@@TourneeUnevenMonth:Uneven Month` , value: 1},
    {label: $localize`:@@TourneeEvenMonth:Even Month` , value: 2},
    {label: $localize`:@@TourneeEveryMonth:Every Month` , value: 3},
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
export let enmUserRolesFBBA = [
    {label: $localize`:@@RoleFBBAAdmin:FBBA Admin`, value: 'Admin_FBBA'},
    {label: $localize`:@@RoleFBBAUser:FBBA User`, value: 'Bank_FBBA'},
    {label: $localize`:@@RoleAdmin:Global admin`, value: 'admin'},
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
    {label: $localize`:@@OrgMailGroupOrganisations:Organisations` , value: 0 },
    {label: $localize`:@@BankMailGroupBankMgrs:Bank Food-IT Mgrs` , value: 4 },
    {label: $localize`:@@BankMailGroupBankUsers:Bank Users` , value: 5 },
    {label: $localize`:@@BankMailGroupBankMembers:Bank Members` , value: 6 },
    {label: $localize`:@@BankMailGroupOrgMgrs:Org Mgrs` , value: 1 },
    {label: $localize`:@@BankMailGroupOrgUsers:Org Users` , value: 2 },
    {label: $localize`:@@BankMailGroupOrgMembers:Org Members` , value: 3 },

];
export let enmMailGroupsFBBA = [
    {label: $localize`:@@OrgMailGroupOrganisations:Organisations` , value: 0 },
    {label: $localize`:@@BankMailGroupBankMgrs:Bank Food-IT Mgrs` , value: 4 },
    {label: $localize`:@@BankMailGroupOrgMgrs:Org Mgrs` , value: 1 },
];
export let enmMailGroupsOrg = [
    {label: $localize`:@@OrgMailGroupOrganisations:Organisations` , value: 0 },
    {label: $localize`:@@OrgMailGroupOrgMgrs:My Org Mgrs` , value: 1 },
    {label: $localize`:@@OrgMailGroupOrgUsers:My Org Users` , value: 2 },
    {label: $localize`:@@OrgMailGroupOrgMembers:My Org Members` , value: 3 },
];
export let enmAudienceBank = [
    {label: $localize`:@@audienceBankOnly:Bank Users Only`, value: 'mybank_only'},
    {label: $localize`:@@audienceBankOrgAdminOnly:Organisation Admins Only`, value: 'mybank_orgadmin'},
    {label: $localize`:@@audienceBankOrgOnly:Organisation Users Only`, value: 'mybank_org'},
    {label: $localize`:@@audienceBankAll:Bank and Organisation Users`, value: 'mybank_all'}
];
export let enmAudienceAdmin = [
    {label: 'general', value: 'general'},
    {label: $localize`:@@audienceBankAdmin:All Bank Admins`, value: 'bank_admins'},
    {label: $localize`:@@audienceBankUsers:All Bank Users`, value: 'bank_users'},
    {label: $localize`:@@audienceOrgAdmin:All Org Admins`, value: 'org_admins'}
];
export let enmDbChangeEntities = [
    {label: $localize`:@@DbChangeEntityUser:User` , value: 'User'},
    {label: $localize`:@@DbChangeEntityMember:Member` , value: 'Member'},
    {label: $localize`:@@DbChangeEntityOrg:Organisation` , value: 'Org'},
    {label: $localize`:@@DbChangeEntityOrgBeneficiaries:OrgBeneficiaries` , value: 'OrgBenefiaries'},
    {label: $localize`:@@DbChangeEntityBank:Bank` , value: 'Bank'},
    {label: $localize`:@@DbChangeEntityDepot:Depot` , value: 'Depot'},
    {label: $localize`:@@DbChangeEntityClient:Client` , value: 'Client'},
    {label: 'Email' , value: 'Email'},

];
export let enmDbChangeActions = [
    {label: $localize`:@@DbChangeActionUpdate:Update` , value: 'Update'},
    {label: $localize`:@@DbChangeActionCreate:Create` , value: 'Create'},
    {label: $localize`:@@DbChangeActionDelete:Delete` , value: 'Delete'},

];





