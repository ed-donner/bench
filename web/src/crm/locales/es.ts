/**
 * The terms of art, chosen once and used across the four apps: deal = oportunidad,
 * pipeline = embudo, dashboard = panel, stage = etapa, activity = actividad,
 * check-in = seguimiento, circle = circulo.
 */
export default {
  brand: "CRM personal",
  nav: {
    dashboard: "Panel",
    organizations: "Organizaciones",
    contacts: "Contactos",
    deals: "Oportunidades",
    pipeline: "Embudo",
  },

  field: {
    name: "Nombre",
    email: "Correo",
    phone: "Teléfono",
    jobTitle: "Puesto",
    organization: "Organización",
    status: "Estado",
    website: "Sitio web",
    industry: "Sector",
    notes: "Notas",
    stage: "Etapa",
    value: "Valor",
    probability: "Probabilidad",
    expected: "Previsto",
    closeDate: "Fecha de cierre",
    contact: "Contacto",
    primaryContact: "Contacto principal",
    contacts: "Contactos",
    openDeals: "Oportunidades abiertas",
    pipeline: "Embudo",
    deal: "Oportunidad",
    deals: "Oportunidades",
    type: "Tipo",
    description: "Descripción",
    details: "Detalles",
    activity: "Actividad",
  },

  action: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    done: "Hecho",
    addOrganization: "Añadir organización",
    addContact: "Añadir contacto",
    addDeal: "Añadir oportunidad",
    logActivity: "Registrar actividad",
    editRow: "Editar {{name}}",
    deleteRow: "Eliminar {{name}}",
  },

  stage: {
    New: "Nueva",
    Qualified: "Cualificada",
    Proposal: "Propuesta",
    Negotiation: "Negociación",
    Won: "Ganada",
    Lost: "Perdida",
  },
  status: {
    lead: "candidato",
    qualified: "cualificado",
    customer: "cliente",
  },
  activityType: {
    note: "Nota",
    call: "Llamada",
    email: "Correo",
  },

  due: {
    overdue: "Vencido: ",
    due: "Para el ",
  },

  money: {
    compact: "{{value}} k$",
  },

  count: {
    organization_one: "{{count}} organización",
    organization_other: "{{count}} organizaciones",
    contact_one: "{{count}} contacto",
    contact_other: "{{count}} contactos",
    deal_one: "{{count}} oportunidad",
    deal_other: "{{count}} oportunidades",
  },

  empty: {
    noCloseDate: "Sin fecha de cierre",
    activity: "Sin actividad todavía.",
    deals: "Sin oportunidades todavía.",
    contacts: "Sin contactos todavía.",
    organizations: "Sin organizaciones todavía.",
    noOrganization: "Sin organización",
    contactFallback: "Contacto",
    organizationFallback: "Organización",
  },

  dashboard: {
    title: "Panel",
    sub: "Cómo van tus ventas de un vistazo",
    openDeals: "Oportunidades abiertas",
    orgsInPlay: "{{count}} organizaciones en juego",
    pipelineValue: "Valor del embudo",
    averageDeal: "{{value}} por oportunidad de media",
    expectedRevenue: "Ingresos previstos",
    weighting: "{{percent}}% del embudo abierto",
    dealsWon: "Oportunidades ganadas (6 meses)",
    ofClosed: "{{percent}}% de todo lo cerrado",
    revenueWon: "Ingresos ganados (6 meses)",
    perWin: "{{value}} por victoria",
    revenueAndVolume: "Ingresos y volumen de oportunidades",
    revenueAndVolumeSub:
      "Los ingresos ganados hasta hoy, el embudo ponderado por delante, y cuántas oportunidades se cierran cada mes.",
    funnel: "Embudo de ingresos",
    funnelSub:
      "El valor en cada etapa o más allá: el embudo abierto más los últimos seis meses de victorias. Las oportunidades perdidas quedan fuera.",
    winRate: "Tasa de éxito",
    winRateSub:
      "Oportunidades cerradas en los últimos seis meses, ganadas frente a perdidas.",
    nothingClosed: "No se ha cerrado nada en los últimos seis meses.",
    topOrganizations: "Principales organizaciones",
    topOrganizationsSub: "Dónde se concentra el embudo abierto.",
    noOpenDeals: "No hay oportunidades abiertas con una organización.",
    recentActivity: "Actividad reciente",
    followUps: "Seguimientos",
    nothingDue: "Nada pendiente. Buen trabajo.",
    markDone: "Marcar como hecho: {{description}}",
  },

  chart: {
    won: "Ganado",
    lost: "Perdido",
    expected: "Previsto",
    dealsClosing: "Oportunidades que cierran",
    forecast: "previsión",
    dealsAndValue: "{{count}} oportunidades · {{value}}",
    funnelTip:
      "{{value}} · {{reached}} en esta etapa o más allá, {{inStage}} en ella",
    orgTip: "{{value}} · {{count}} oportunidades abiertas",
  },

  organizations: {
    title: "Organizaciones",
    sub: "Las empresas con las que trabajas",
    search: "Buscar organizaciones…",
    noMatch: "Ninguna organización coincide con «{{query}}».",
    openPipeline: "Embudo abierto",
    confirmTitle: "Eliminar organización",
    confirmRow:
      "¿Eliminar {{name}}? Sus contactos y oportunidades se conservan, pero pierden el vínculo con ella.",
    confirmDetail:
      "¿Eliminar «{{name}}»? Sus contactos y oportunidades se conservan, pero quedan sin vincular.",
  },

  contacts: {
    title: "Contactos",
    sub: "Las personas con las que tratas",
    search: "Buscar contactos…",
    filterByStatus: "Filtrar por estado",
    allStatuses: "Todos los estados",
    noMatch: "Ningún contacto coincide con estos filtros.",
    confirmTitle: "Eliminar contacto",
    confirm: "¿Eliminar {{name}}? Esto no se puede deshacer.",
    confirmDetail: "¿Eliminar «{{name}}»? Esto no se puede deshacer.",
  },

  deals: {
    title: "Oportunidades",
    sub: "Las ventas posibles en las que estás trabajando",
    search: "Buscar oportunidades…",
    filterByStage: "Filtrar por etapa",
    allStages: "Todas las etapas",
    noMatch: "Ninguna oportunidad coincide con estos filtros.",
    confirmTitle: "Eliminar oportunidad",
    confirm: "¿Eliminar {{name}}? Esto no se puede deshacer.",
    confirmDetail: "¿Eliminar «{{name}}»? Esto no se puede deshacer.",
  },

  pipeline: {
    title: "Embudo",
    sub: "Arrastra una tarjeta a otra columna para cambiar su etapa, o arriba y abajo para ordenar la columna a tu manera",
    totalPipeline: "Embudo total",
    expectedRevenue: "Ingresos previstos",
    expectedSuffix: "previsto",
    dropHere: "Suelta aquí una oportunidad",
  },

  form: {
    editOrganization: "Editar organización",
    editContact: "Editar contacto",
    editDeal: "Editar oportunidad",
    valueUsd: "Valor (USD)",
    probabilityPct: "Probabilidad (%)",
    expectedValue: "Valor previsto",
    followUpDue: "Fecha de seguimiento (opcional)",
    none: "Ninguna",
  },
};
