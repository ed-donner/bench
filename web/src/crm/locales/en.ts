export default {
  brand: "Personal CRM",
  nav: {
    dashboard: "Dashboard",
    organizations: "Organizations",
    contacts: "Contacts",
    deals: "Deals",
    pipeline: "Pipeline",
  },

  // Field names double as table headers and as the labels in a detail list, so they live in one
  // place rather than once per page.
  field: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    jobTitle: "Job title",
    organization: "Organization",
    status: "Status",
    website: "Website",
    industry: "Industry",
    notes: "Notes",
    stage: "Stage",
    value: "Value",
    probability: "Probability",
    expected: "Expected",
    closeDate: "Close date",
    contact: "Contact",
    primaryContact: "Primary contact",
    contacts: "Contacts",
    openDeals: "Open deals",
    pipeline: "Pipeline",
    deal: "Deal",
    deals: "Deals",
    type: "Type",
    description: "Description",
    details: "Details",
    activity: "Activity",
  },

  action: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    done: "Done",
    addOrganization: "Add organization",
    addContact: "Add contact",
    addDeal: "Add deal",
    logActivity: "Log activity",
    editRow: "Edit {{name}}",
    deleteRow: "Delete {{name}}",
  },

  // The stored values stay English - these are how they read on screen.
  stage: {
    New: "New",
    Qualified: "Qualified",
    Proposal: "Proposal",
    Negotiation: "Negotiation",
    Won: "Won",
    Lost: "Lost",
  },
  status: {
    lead: "lead",
    qualified: "qualified",
    customer: "customer",
  },
  activityType: {
    note: "Note",
    call: "Call",
    email: "Email",
  },

  due: {
    overdue: "Overdue: ",
    due: "Due ",
  },

  // The footer tally. Spanish does not always pluralise with a bare "s" - "organizacion" takes
  // "-es" and loses its accent - so these are i18next plural keys rather than a suffix.
  money: {
    compact: "${{value}}k",
  },

  count: {
    organization_one: "{{count}} organization",
    organization_other: "{{count}} organizations",
    contact_one: "{{count}} contact",
    contact_other: "{{count}} contacts",
    deal_one: "{{count}} deal",
    deal_other: "{{count}} deals",
  },

  empty: {
    noCloseDate: "No close date",
    activity: "No activity yet.",
    deals: "No deals yet.",
    contacts: "No contacts yet.",
    organizations: "No organizations yet.",
    noOrganization: "No organization",
    contactFallback: "Contact",
    organizationFallback: "Organization",
  },

  dashboard: {
    title: "Dashboard",
    sub: "How your sales are going at a glance",
    openDeals: "Open deals",
    orgsInPlay: "{{count}} organizations in play",
    pipelineValue: "Pipeline value",
    averageDeal: "{{value}} average deal",
    expectedRevenue: "Expected revenue",
    weighting: "{{percent}}% of the open pipeline",
    dealsWon: "Deals won (6 mo)",
    ofClosed: "{{percent}}% of everything closed",
    revenueWon: "Revenue won (6 mo)",
    perWin: "{{value}} a win",
    revenueAndVolume: "Revenue and deal volume",
    revenueAndVolumeSub:
      "Won revenue behind today, the weighted pipeline ahead of it, and the number of deals closing each month.",
    funnel: "Revenue funnel",
    funnelSub:
      "Value at or past each stage: the open pipeline plus the last six months of wins. Lost deals are excluded.",
    winRate: "Win rate",
    winRateSub: "Deals closed in the last six months, won against lost.",
    nothingClosed: "Nothing has closed in the last six months.",
    topOrganizations: "Top organizations",
    topOrganizationsSub: "Where the open pipeline is concentrated.",
    noOpenDeals: "No open deals against an organization.",
    recentActivity: "Recent activity",
    followUps: "Follow-ups",
    nothingDue: "Nothing due. Nice work.",
    markDone: "Mark done: {{description}}",
  },

  chart: {
    won: "Won",
    lost: "Lost",
    expected: "Expected",
    dealsClosing: "Deals closing",
    forecast: "forecast",
    dealsAndValue: "{{count}} deals · {{value}}",
    funnelTip:
      "{{value}} · {{reached}} at or past this stage, {{inStage}} in it",
    orgTip: "{{value}} · {{count}} open deals",
  },

  organizations: {
    title: "Organizations",
    sub: "The companies you do business with",
    search: "Search organizations…",
    noMatch: "No organizations match “{{query}}”.",
    openPipeline: "Open pipeline",
    confirmTitle: "Delete organization",
    confirmRow:
      "Delete {{name}}? Its contacts and deals stay, but lose their link to it.",
    confirmDetail:
      "Delete “{{name}}”? Its contacts and deals will be kept but unlinked.",
  },

  contacts: {
    title: "Contacts",
    sub: "The people you deal with",
    search: "Search contacts…",
    filterByStatus: "Filter by status",
    allStatuses: "All statuses",
    noMatch: "No contacts match these filters.",
    confirmTitle: "Delete contact",
    confirm: "Delete {{name}}? This cannot be undone.",
    confirmDetail: "Delete “{{name}}”? This cannot be undone.",
  },

  deals: {
    title: "Deals",
    sub: "The potential sales you're working on",
    search: "Search deals…",
    filterByStage: "Filter by stage",
    allStages: "All stages",
    noMatch: "No deals match these filters.",
    confirmTitle: "Delete deal",
    confirm: "Delete {{name}}? This cannot be undone.",
    confirmDetail: "Delete “{{name}}”? This cannot be undone.",
  },

  pipeline: {
    title: "Pipeline",
    sub: "Drag a card to another column to change its stage, or up and down to order a column your way",
    totalPipeline: "Total pipeline",
    expectedRevenue: "Expected revenue",
    expectedSuffix: "expected",
    dropHere: "Drop a deal here",
  },

  form: {
    editOrganization: "Edit organization",
    editContact: "Edit contact",
    editDeal: "Edit deal",
    valueUsd: "Value (USD)",
    probabilityPct: "Probability (%)",
    expectedValue: "Expected value",
    followUpDue: "Follow-up due date (optional)",
    none: "None",
  },
};
