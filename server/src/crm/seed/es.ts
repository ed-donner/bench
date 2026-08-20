import {
  DB,
  createOrganization,
  createContact,
  createDeal,
  createActivity,
  ContactStatus,
  DealStage,
  ActivityType,
  Contact,
} from "../db.js";
import { daysFromNow, timestampDaysAgo } from "./helpers.js";

export function seedEs(db: DB) {
  const orgs = [
    {
      name: "Northwind Logística",
      website: "northwindlogistics.com",
      industry: "Transporte",
      notes: "Transportista regional de carga, expandiéndose a cadena de frío.",
    },
    {
      name: "Bluepeak Software",
      website: "bluepeak.io",
      industry: "Software",
      notes: "SaaS B2B, ~200 empleados. Cultura orientada a renovaciones.",
    },
    {
      name: "Harbor & Lane",
      website: "harborlane.com",
      industry: "Retail",
      notes: "Cadena boutique, 14 ubicaciones.",
    },
    {
      name: "Veldt Energía",
      website: "veldtenergy.com",
      industry: "Energía",
      notes: "Instalador solar. Compras lentas pero leales.",
    },
    {
      name: "Cobalt Salud",
      website: "cobalthealth.org",
      industry: "Salud",
      notes: "Red de clínicas. Preguntas de cumplimiento en cada llamada.",
    },
    {
      name: "Marlowe Media",
      website: "marlowemedia.com",
      industry: "Medios",
      notes:
        "Estudio de podcast y video. Decisiones rápidas, presupuestos pequeños.",
    },
    {
      name: "Quarry Analytics",
      website: "quarryanalytics.com",
      industry: "Datos y analítica",
      notes: "Consultoría de datos; fuerte fuente de referidos.",
    },
    {
      name: "Fernwood Estates",
      website: "fernwoodestates.com",
      industry: "Inmobiliaria",
      notes: "Administrador de propiedades comerciales en tres estados.",
    },
  ].map((o) => createOrganization(db, o));

  const [
    northwind,
    bluepeak,
    harbor,
    veldt,
    cobalt,
    marlowe,
    quarry,
    fernwood,
  ] = orgs;

  const contactRows: [
    string,
    string,
    string,
    string,
    number | null,
    ContactStatus,
  ][] = [
    [
      "Maria Delgado",
      "maria.delgado@northwindlogistics.com",
      "(312) 555-0141",
      "VP de Operaciones",
      northwind.id,
      "customer",
    ],
    [
      "Tom Ferris",
      "tom.ferris@northwindlogistics.com",
      "(312) 555-0177",
      "Gerente de Compras",
      northwind.id,
      "qualified",
    ],
    [
      "Priya Raman",
      "priya@bluepeak.io",
      "(415) 555-0122",
      "Directora de Plataforma",
      bluepeak.id,
      "customer",
    ],
    [
      "Jonas Lindqvist",
      "jonas@bluepeak.io",
      "(415) 555-0189",
      "CTO",
      bluepeak.id,
      "qualified",
    ],
    [
      "Elaine Harper",
      "elaine@harborlane.com",
      "(206) 555-0133",
      "Directora de Tiendas",
      harbor.id,
      "customer",
    ],
    [
      "Marcus Bell",
      "marcus.bell@harborlane.com",
      "(206) 555-0166",
      "Gerente de TI",
      harbor.id,
      "lead",
    ],
    [
      "Sofia Nkemelu",
      "sofia@veldtenergy.com",
      "(602) 555-0158",
      "COO",
      veldt.id,
      "qualified",
    ],
    [
      "Dan Whitfield",
      "dan.whitfield@veldtenergy.com",
      "(602) 555-0104",
      "Líder de Operaciones de Campo",
      veldt.id,
      "lead",
    ],
    [
      "Dra. Alice Chen",
      "achen@cobalthealth.org",
      "(617) 555-0147",
      "Directora Médica",
      cobalt.id,
      "qualified",
    ],
    [
      "Robert Osei",
      "rosei@cobalthealth.org",
      "(617) 555-0173",
      "Director de TI",
      cobalt.id,
      "customer",
    ],
    [
      "Nina Marlowe",
      "nina@marlowemedia.com",
      "(310) 555-0119",
      "Fundadora",
      marlowe.id,
      "customer",
    ],
    [
      "Jack Torres",
      "jack@marlowemedia.com",
      "(310) 555-0152",
      "Productor",
      marlowe.id,
      "lead",
    ],
    [
      "Helen Zhou",
      "helen@quarryanalytics.com",
      "(646) 555-0128",
      "Socia Directora",
      quarry.id,
      "qualified",
    ],
    [
      "Sam Okafor",
      "sam@quarryanalytics.com",
      "(646) 555-0183",
      "Líder de Proyectos",
      quarry.id,
      "lead",
    ],
    [
      "Grace Whitman",
      "grace@fernwoodestates.com",
      "(303) 555-0136",
      "Directora de Cartera",
      fernwood.id,
      "lead",
    ],
  ];
  const contacts = contactRows.map(
    ([name, email, phone, job_title, organization_id, status]) =>
      createContact(db, {
        name,
        email,
        phone,
        job_title,
        organization_id,
        status,
      }),
  );

  const [
    maria,
    tom,
    priya,
    jonas,
    elaine,
    marcusB,
    sofia,
    ,
    alice,
    robert,
    nina,
    jack,
    helen,
    sam,
    grace,
  ] = contacts;

  const dealRows: [
    string,
    number | null,
    number | null,
    DealStage,
    number,
    string,
  ][] = [
    [
      "Despliegue de telemática de flota",
      northwind.id,
      maria.id,
      "Won",
      48000,
      daysFromNow(-152),
    ],
    [
      "Licencia de plataforma Bluepeak",
      bluepeak.id,
      priya.id,
      "Won",
      66000,
      daysFromNow(-118),
    ],
    [
      "Piloto de analítica en tiendas",
      harbor.id,
      elaine.id,
      "Won",
      21000,
      daysFromNow(-87),
    ],
    [
      "Suite de agenda clínica",
      cobalt.id,
      robert.id,
      "Won",
      54000,
      daysFromNow(-55),
    ],
    [
      "Gestión de activos del estudio",
      marlowe.id,
      nina.id,
      "Won",
      18500,
      daysFromNow(-31),
    ],
    [
      "Módulo de cadena de frío Northwind",
      northwind.id,
      tom.id,
      "Won",
      32000,
      daysFromNow(-12),
    ],
    [
      "Piloto de robótica en almacén",
      northwind.id,
      tom.id,
      "Lost",
      75000,
      daysFromNow(-64),
    ],
    [
      "Plataforma de anuncios para podcast",
      marlowe.id,
      jack.id,
      "Lost",
      12000,
      daysFromNow(-20),
    ],
    [
      "Portal de inquilinos Fernwood",
      fernwood.id,
      grace.id,
      "New",
      45000,
      daysFromNow(45),
    ],
    [
      "Paneles embebidos Quarry",
      quarry.id,
      sam.id,
      "New",
      27000,
      daysFromNow(60),
    ],
    [
      "Programa de fidelidad Harbor",
      harbor.id,
      marcusB.id,
      "Qualified",
      38000,
      daysFromNow(30),
    ],
    [
      "App de servicio de campo Veldt",
      veldt.id,
      sofia.id,
      "Qualified",
      52000,
      daysFromNow(40),
    ],
    [
      "Portal de pacientes Cobalt",
      cobalt.id,
      alice.id,
      "Proposal",
      88000,
      daysFromNow(21),
    ],
    [
      "Integración de socios Quarry",
      quarry.id,
      helen.id,
      "Proposal",
      34000,
      daysFromNow(28),
    ],
    [
      "Actualización enterprise Bluepeak",
      bluepeak.id,
      jonas.id,
      "Negotiation",
      120000,
      daysFromNow(14),
    ],
    [
      "Suite de producción Marlowe",
      marlowe.id,
      nina.id,
      "Negotiation",
      26000,
      daysFromNow(10),
    ],
  ];
  const deals = dealRows.map(
    ([name, organization_id, contact_id, stage, value, close_date]) =>
      createDeal(db, {
        name,
        organization_id,
        contact_id,
        stage,
        value,
        close_date,
      }),
  );

  const dealByName = new Map(deals.map((d) => [d.name, d]));
  const act = (
    type: ActivityType,
    description: string,
    opts: {
      contact?: Contact;
      deal?: string;
      daysAgo?: number;
      due?: number;
      done?: boolean;
    } = {},
  ) =>
    createActivity(db, {
      type,
      description,
      contact_id: opts.contact?.id ?? null,
      deal_id: opts.deal ? dealByName.get(opts.deal)!.id : null,
      occurred_at: timestampDaysAgo(opts.daysAgo ?? 0),
      due_date: opts.due !== undefined ? daysFromNow(opts.due) : null,
      done: opts.done ?? false,
    });

  act(
    "call",
    "Llamada de inicio del módulo de cadena de frío. Maria quiere un despliegue por fases empezando por el hub de Chicago.",
    { contact: maria, deal: "Módulo de cadena de frío Northwind", daysAgo: 14 },
  );
  act(
    "email",
    "Enviado formulario de pedido firmado y calendario de incorporación.",
    {
      contact: tom,
      deal: "Módulo de cadena de frío Northwind",
      daysAgo: 11,
    },
  );
  act(
    "note",
    "Jonas presionando a legal por cambios en la actualización enterprise. Firma prevista a mediados de mes.",
    { contact: jonas, deal: "Actualización enterprise Bluepeak", daysAgo: 6 },
  );
  act(
    "call",
    "La llamada de precios fue bien. Quieren contrato de 3 años con tope de incremento.",
    {
      contact: jonas,
      deal: "Actualización enterprise Bluepeak",
      daysAgo: 3,
      due: 2,
    },
  );
  act(
    "email",
    "Propuesta v2 enviada a la Dra. Chen con el anexo de cumplimiento.",
    {
      contact: alice,
      deal: "Portal de pacientes Cobalt",
      daysAgo: 8,
    },
  );
  act("call", "Revisamos el cuestionario de seguridad con Robert.", {
    contact: robert,
    deal: "Portal de pacientes Cobalt",
    daysAgo: 5,
    due: -2,
  });
  act(
    "note",
    "Elaine contenta con los resultados del piloto de analítica; el upsell es el programa de fidelidad.",
    { contact: elaine, daysAgo: 9 },
  );
  act(
    "email",
    "Email de presentación a Marcus sobre el alcance del programa de fidelidad.",
    {
      contact: marcusB,
      deal: "Programa de fidelidad Harbor",
      daysAgo: 7,
      due: 5,
    },
  );
  act(
    "call",
    "Descubrimiento con Sofia — los técnicos de campo necesitan modo offline. Demo programada.",
    {
      contact: sofia,
      deal: "App de servicio de campo Veldt",
      daysAgo: 4,
      due: 7,
    },
  );
  act(
    "note",
    "Nina confirmó presupuesto para la suite de producción el próximo trimestre.",
    {
      contact: nina,
      deal: "Suite de producción Marlowe",
      daysAgo: 2,
    },
  );
  act(
    "email",
    "Enviado a Helen el statement of work de integración de socios.",
    {
      contact: helen,
      deal: "Integración de socios Quarry",
      daysAgo: 1,
      due: 4,
    },
  );
  act(
    "call",
    "Dejé un mensaje de voz a Grace sobre el calendario del portal de inquilinos.",
    {
      contact: grace,
      deal: "Portal de inquilinos Fernwood",
      daysAgo: 3,
      due: -1,
    },
  );
  act(
    "note",
    "Sam mencionó dos consultoras más interesadas en paneles embebidos — potencial de referidos.",
    { contact: sam, daysAgo: 5 },
  );
  act("email", "Revisión trimestral con Priya. Uso de plataforma subió 22%.", {
    contact: priya,
    daysAgo: 12,
    done: true,
    due: -10,
  });
  act(
    "call",
    "Llamada de renovación con Maria — despliegue de telemática completado en toda la flota.",
    { contact: maria, daysAgo: 18, done: true, due: -16 },
  );
  act(
    "note",
    "Piloto de robótica perdido por precio del incumbente. Retomar en Q1.",
    {
      deal: "Piloto de robótica en almacén",
      daysAgo: 60,
    },
  );
  act(
    "email",
    "Seguimiento con Jack sobre un alcance más pequeño de la plataforma de anuncios.",
    {
      contact: jack,
      daysAgo: 15,
      due: 12,
    },
  );
}
