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

export function seedEn(db: DB) {
  const orgs = [
    {
      name: "Northwind Logistics",
      website: "northwindlogistics.com",
      industry: "Transportation",
      notes: "Regional freight carrier, expanding into cold chain.",
    },
    {
      name: "Bluepeak Software",
      website: "bluepeak.io",
      industry: "Software",
      notes: "B2B SaaS, ~200 employees. Renewal-driven culture.",
    },
    {
      name: "Harbor & Lane",
      website: "harborlane.com",
      industry: "Retail",
      notes: "Boutique retail chain, 14 locations.",
    },
    {
      name: "Veldt Energy",
      website: "veldtenergy.com",
      industry: "Energy",
      notes: "Solar installer. Procurement is slow but loyal.",
    },
    {
      name: "Cobalt Health",
      website: "cobalthealth.org",
      industry: "Healthcare",
      notes: "Clinic network. Compliance questions on every call.",
    },
    {
      name: "Marlowe Media",
      website: "marlowemedia.com",
      industry: "Media",
      notes: "Podcast and video studio. Fast decisions, small budgets.",
    },
    {
      name: "Quarry Analytics",
      website: "quarryanalytics.com",
      industry: "Data & Analytics",
      notes: "Data consultancy; strong referral source.",
    },
    {
      name: "Fernwood Estates",
      website: "fernwoodestates.com",
      industry: "Real Estate",
      notes: "Commercial property manager across three states.",
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
      "VP Operations",
      northwind.id,
      "customer",
    ],
    [
      "Tom Ferris",
      "tom.ferris@northwindlogistics.com",
      "(312) 555-0177",
      "Procurement Manager",
      northwind.id,
      "qualified",
    ],
    [
      "Priya Raman",
      "priya@bluepeak.io",
      "(415) 555-0122",
      "Head of Platform",
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
      "Director of Stores",
      harbor.id,
      "customer",
    ],
    [
      "Marcus Bell",
      "marcus.bell@harborlane.com",
      "(206) 555-0166",
      "IT Manager",
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
      "Field Operations Lead",
      veldt.id,
      "lead",
    ],
    [
      "Dr. Alice Chen",
      "achen@cobalthealth.org",
      "(617) 555-0147",
      "Chief Medical Officer",
      cobalt.id,
      "qualified",
    ],
    [
      "Robert Osei",
      "rosei@cobalthealth.org",
      "(617) 555-0173",
      "Director of IT",
      cobalt.id,
      "customer",
    ],
    [
      "Nina Marlowe",
      "nina@marlowemedia.com",
      "(310) 555-0119",
      "Founder",
      marlowe.id,
      "customer",
    ],
    [
      "Jack Torres",
      "jack@marlowemedia.com",
      "(310) 555-0152",
      "Producer",
      marlowe.id,
      "lead",
    ],
    [
      "Helen Zhou",
      "helen@quarryanalytics.com",
      "(646) 555-0128",
      "Managing Partner",
      quarry.id,
      "qualified",
    ],
    [
      "Sam Okafor",
      "sam@quarryanalytics.com",
      "(646) 555-0183",
      "Engagement Lead",
      quarry.id,
      "lead",
    ],
    [
      "Grace Whitman",
      "grace@fernwoodestates.com",
      "(303) 555-0136",
      "Portfolio Director",
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
    // Won deals spread over recent months so the dashboard chart has history.
    [
      "Fleet telematics rollout",
      northwind.id,
      maria.id,
      "Won",
      48000,
      daysFromNow(-152),
    ],
    [
      "Bluepeak platform license",
      bluepeak.id,
      priya.id,
      "Won",
      66000,
      daysFromNow(-118),
    ],
    [
      "Store analytics pilot",
      harbor.id,
      elaine.id,
      "Won",
      21000,
      daysFromNow(-87),
    ],
    [
      "Clinic scheduling suite",
      cobalt.id,
      robert.id,
      "Won",
      54000,
      daysFromNow(-55),
    ],
    [
      "Studio asset management",
      marlowe.id,
      nina.id,
      "Won",
      18500,
      daysFromNow(-31),
    ],
    [
      "Northwind cold-chain module",
      northwind.id,
      tom.id,
      "Won",
      32000,
      daysFromNow(-12),
    ],
    // Lost.
    [
      "Warehouse robotics pilot",
      northwind.id,
      tom.id,
      "Lost",
      75000,
      daysFromNow(-64),
    ],
    [
      "Podcast ad platform",
      marlowe.id,
      jack.id,
      "Lost",
      12000,
      daysFromNow(-20),
    ],
    // Open pipeline.
    [
      "Fernwood tenant portal",
      fernwood.id,
      grace.id,
      "New",
      45000,
      daysFromNow(45),
    ],
    [
      "Quarry embedded dashboards",
      quarry.id,
      sam.id,
      "New",
      27000,
      daysFromNow(60),
    ],
    [
      "Harbor loyalty program",
      harbor.id,
      marcusB.id,
      "Qualified",
      38000,
      daysFromNow(30),
    ],
    [
      "Veldt field service app",
      veldt.id,
      sofia.id,
      "Qualified",
      52000,
      daysFromNow(40),
    ],
    [
      "Cobalt patient portal",
      cobalt.id,
      alice.id,
      "Proposal",
      88000,
      daysFromNow(21),
    ],
    [
      "Quarry partner integration",
      quarry.id,
      helen.id,
      "Proposal",
      34000,
      daysFromNow(28),
    ],
    [
      "Bluepeak enterprise upgrade",
      bluepeak.id,
      jonas.id,
      "Negotiation",
      120000,
      daysFromNow(14),
    ],
    [
      "Marlowe production suite",
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
    "Kickoff call for the cold-chain module. Maria wants phased rollout starting with the Chicago hub.",
    { contact: maria, deal: "Northwind cold-chain module", daysAgo: 14 },
  );
  act("email", "Sent signed order form and onboarding schedule.", {
    contact: tom,
    deal: "Northwind cold-chain module",
    daysAgo: 11,
  });
  act(
    "note",
    "Jonas pushing legal for redlines on the enterprise upgrade. Target signature mid-month.",
    { contact: jonas, deal: "Bluepeak enterprise upgrade", daysAgo: 6 },
  );
  act(
    "call",
    "Pricing call went well. They want a 3-year term with a cap on uplift.",
    { contact: jonas, deal: "Bluepeak enterprise upgrade", daysAgo: 3, due: 2 },
  );
  act("email", "Proposal v2 sent to Dr. Chen with the compliance appendix.", {
    contact: alice,
    deal: "Cobalt patient portal",
    daysAgo: 8,
  });
  act("call", "Walked through the security questionnaire with Robert.", {
    contact: robert,
    deal: "Cobalt patient portal",
    daysAgo: 5,
    due: -2,
  });
  act(
    "note",
    "Elaine happy with the analytics pilot results; upsell path is the loyalty program.",
    { contact: elaine, daysAgo: 9 },
  );
  act("email", "Intro email to Marcus about the loyalty program scope.", {
    contact: marcusB,
    deal: "Harbor loyalty program",
    daysAgo: 7,
    due: 5,
  });
  act(
    "call",
    "Discovery with Sofia — field techs need offline mode. Demo scheduled.",
    { contact: sofia, deal: "Veldt field service app", daysAgo: 4, due: 7 },
  );
  act("note", "Nina confirmed budget for the production suite next quarter.", {
    contact: nina,
    deal: "Marlowe production suite",
    daysAgo: 2,
  });
  act("email", "Sent Helen the partner integration statement of work.", {
    contact: helen,
    deal: "Quarry partner integration",
    daysAgo: 1,
    due: 4,
  });
  act("call", "Left voicemail for Grace about the tenant portal timeline.", {
    contact: grace,
    deal: "Fernwood tenant portal",
    daysAgo: 3,
    due: -1,
  });
  act(
    "note",
    "Sam mentioned two more consultancies asking about embedded dashboards — referral potential.",
    { contact: sam, daysAgo: 5 },
  );
  act("email", "Quarterly check-in with Priya. Platform usage up 22%.", {
    contact: priya,
    daysAgo: 12,
    done: true,
    due: -10,
  });
  act(
    "call",
    "Renewal call with Maria — telematics rollout fully deployed across the fleet.",
    { contact: maria, daysAgo: 18, done: true, due: -16 },
  );
  act("note", "Robotics pilot lost to incumbent on price. Revisit in Q1.", {
    deal: "Warehouse robotics pilot",
    daysAgo: 60,
  });
  act("email", "Follow up with Jack about smaller ad-platform scope.", {
    contact: jack,
    daysAgo: 15,
    due: 12,
  });
}
