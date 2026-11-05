// Hierarchy & System Constants for SalesTrack

export const ROLES = {
  ADMIN: 'ADMIN',
  NATIONAL_SALES_MANAGER: 'NATIONAL_SALES_MANAGER',
  REGIONAL_SALES_MANAGER: 'REGIONAL_SALES_MANAGER',
  AREA_SALES_MANAGER: 'AREA_SALES_MANAGER',
  TERRITORY_SALES_MANAGER: 'TERRITORY_SALES_MANAGER',
  SENIOR_SALES_EXECUTIVE: 'SENIOR_SALES_EXECUTIVE',
  SALES_EXECUTIVE: 'SALES_EXECUTIVE',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.NATIONAL_SALES_MANAGER]: 'National Sales Manager',
  [ROLES.REGIONAL_SALES_MANAGER]: 'Regional Sales Manager',
  [ROLES.AREA_SALES_MANAGER]: 'Area Sales Manager',
  [ROLES.TERRITORY_SALES_MANAGER]: 'Territory Sales Manager',
  [ROLES.SENIOR_SALES_EXECUTIVE]: 'Senior Sales Executive',
  [ROLES.SALES_EXECUTIVE]: 'Sales Executive',
};

export const ROLE_SHORT_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.NATIONAL_SALES_MANAGER]: 'NSM',
  [ROLES.REGIONAL_SALES_MANAGER]: 'RSM',
  [ROLES.AREA_SALES_MANAGER]: 'ASM',
  [ROLES.TERRITORY_SALES_MANAGER]: 'TSM',
  [ROLES.SENIOR_SALES_EXECUTIVE]: 'SSE',
  [ROLES.SALES_EXECUTIVE]: 'SE',
};

export const ROLE_HIERARCHY_LEVELS = {
  [ROLES.ADMIN]: 0,
  [ROLES.NATIONAL_SALES_MANAGER]: 1,
  [ROLES.REGIONAL_SALES_MANAGER]: 2,
  [ROLES.AREA_SALES_MANAGER]: 3,
  [ROLES.TERRITORY_SALES_MANAGER]: 4,
  [ROLES.SENIOR_SALES_EXECUTIVE]: 5,
  [ROLES.SALES_EXECUTIVE]: 6,
};

// Strict non-skipping parent requirements:
// Admin assigns each user their immediate parent strictly according to hierarchy
export const REQUIRED_PARENT_ROLE = {
  [ROLES.NATIONAL_SALES_MANAGER]: ROLES.ADMIN,
  [ROLES.REGIONAL_SALES_MANAGER]: ROLES.NATIONAL_SALES_MANAGER,
  [ROLES.AREA_SALES_MANAGER]: ROLES.REGIONAL_SALES_MANAGER,
  [ROLES.TERRITORY_SALES_MANAGER]: ROLES.AREA_SALES_MANAGER,
  [ROLES.SENIOR_SALES_EXECUTIVE]: ROLES.TERRITORY_SALES_MANAGER,
  [ROLES.SALES_EXECUTIVE]: ROLES.SENIOR_SALES_EXECUTIVE,
};

// 6 Managed hierarchy roles for dedicated sidebar navigation and role management
export const MANAGED_ROLES = [
  {
    slug: 'nsm',
    role: ROLES.NATIONAL_SALES_MANAGER,
    label: 'National Sales Manager',
    pluralLabel: 'National Sales Managers',
    short: 'NSM',
    level: 1,
    parentRole: ROLES.ADMIN,
    parentLabel: 'Admin',
    childRole: ROLES.REGIONAL_SALES_MANAGER,
    childLabel: 'Regional Sales Manager (RSM)',
    color: 'blue',
    description: 'Oversees countrywide sales distribution and regional managers.',
  },
  {
    slug: 'rsm',
    role: ROLES.REGIONAL_SALES_MANAGER,
    label: 'Regional Sales Manager',
    pluralLabel: 'Regional Sales Managers',
    short: 'RSM',
    level: 2,
    parentRole: ROLES.NATIONAL_SALES_MANAGER,
    parentLabel: 'National Sales Manager (NSM)',
    childRole: ROLES.AREA_SALES_MANAGER,
    childLabel: 'Area Sales Manager (ASM)',
    color: 'indigo',
    description: 'Manages sales operations across large regional divisions (e.g. Dhaka, Chittagong).',
  },
  {
    slug: 'asm',
    role: ROLES.AREA_SALES_MANAGER,
    label: 'Area Sales Manager',
    pluralLabel: 'Area Sales Managers',
    short: 'ASM',
    level: 3,
    parentRole: ROLES.REGIONAL_SALES_MANAGER,
    parentLabel: 'Regional Sales Manager (RSM)',
    childRole: ROLES.TERRITORY_SALES_MANAGER,
    childLabel: 'Territory Sales Manager (TSM)',
    color: 'teal',
    description: 'Supervises specific territory clusters and Territory Sales Managers.',
  },
  {
    slug: 'tsm',
    role: ROLES.TERRITORY_SALES_MANAGER,
    label: 'Territory Sales Manager',
    pluralLabel: 'Territory Sales Managers',
    short: 'TSM',
    level: 4,
    parentRole: ROLES.AREA_SALES_MANAGER,
    parentLabel: 'Area Sales Manager (ASM)',
    childRole: ROLES.SENIOR_SALES_EXECUTIVE,
    childLabel: 'Senior Sales Executive (SSE)',
    color: 'cyan',
    description: 'Leads territory zones and manages Senior Sales Executives.',
  },
  {
    slug: 'sse',
    role: ROLES.SENIOR_SALES_EXECUTIVE,
    label: 'Senior Sales Executive',
    pluralLabel: 'Senior Sales Executives',
    short: 'SSE',
    level: 5,
    parentRole: ROLES.TERRITORY_SALES_MANAGER,
    parentLabel: 'Territory Sales Manager (TSM)',
    childRole: ROLES.SALES_EXECUTIVE,
    childLabel: 'Sales Executive (SE)',
    color: 'amber',
    description: 'Supervisory role in charge of field route teams. Does not submit daily reports.',
  },
  {
    slug: 'se',
    role: ROLES.SALES_EXECUTIVE,
    label: 'Sales Executive',
    pluralLabel: 'Sales Executives',
    short: 'SE',
    level: 6,
    parentRole: ROLES.SENIOR_SALES_EXECUTIVE,
    parentLabel: 'Senior Sales Executive (SSE)',
    childRole: null,
    childLabel: 'None (Field Submitter)',
    color: 'emerald',
    description: 'Frontline field force. Directly visits dealers and submits daily sales reports.',
  },
];

export const SLUG_TO_ROLE_CONFIG = Object.fromEntries(
  MANAGED_ROLES.map((r) => [r.slug, r])
);

// Exact client-provided report columns
export const REPORT_COLUMNS = [
  { key: 'routeToday', label: 'Route today', type: 'text', required: true },
  { key: 'dealerVisit', label: 'Dealer visit', type: 'number', min: 0 },
  { key: 'retailVisit', label: 'Retail visit', type: 'number', min: 0 },
  { key: 'masonVisit', label: 'Mason visit', type: 'number', min: 0 },
  { key: 'painterVisit', label: 'Painter visit', type: 'number', min: 0 },
  { key: 'siteVisit', label: 'Site visit', type: 'number', min: 0 },
  { key: 'totalVisit', label: 'Total visit', type: 'number', autoCalculated: true },
  { key: 'orderAdmixture', label: 'Order Admixture (lit)', type: 'number', min: 0 },
  { key: 'orderSealer', label: 'Order Sealer (lit)', type: 'number', min: 0 },
  { key: 'totalOrder', label: 'Total order (lit)', type: 'number', autoCalculated: true },
  { key: 'deliveryAdmixture', label: 'Delivery Admixture (lit)', type: 'number', min: 0 },
  { key: 'deliverySealer', label: 'Delivery Sealer (lit)', type: 'number', min: 0 },
  { key: 'totalDelivery', label: 'Total delivery (lit)', type: 'number', autoCalculated: true },
  { key: 'deliveryValue', label: 'Delivery value (Tk)', type: 'number', min: 0 },
  { key: 'collectionFrom', label: '17. Collection From', type: 'text' },
  { key: 'collectedAmount', label: '18. Collected Amount (Tk)', type: 'number', min: 0 },
  { key: 'problemSupport', label: 'Problem / support needed', type: 'textarea' },
];

export const STORAGE_KEYS = {
  USERS: 'salestrack_users',
  REPORTS: 'salestrack_reports',
  SESSION: 'salestrack_session',
  INITIALIZED: 'salestrack_v2_initialized',
};

