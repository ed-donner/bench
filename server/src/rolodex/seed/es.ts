import type { Repo } from "../db/index.js";
import { addDaysISO } from "../dates.js";
import type { InteractionType } from "../types.js";
import { insertPeople, type PersonSeed, type Rand } from "./helpers.js";

const NOTE_POOLS: Record<InteractionType, string[]> = {
  call: [
    "Charla rápida por teléfono",
    "Llamada larga — nos reímos mucho",
    "Llamé para felicitarle el cumpleaños",
    "Llamada sobre planes del fin de semana",
    "Caught up while walking home",
    "Called for advice about the house move",
    "Rang to check in after the rough week they'd had",
  ],
  message: [
    "Exchanged a pile of messages",
    "Messaged back and forth about the trip",
    "Checked in over WhatsApp",
    "Sent them the photos from the hike",
    "Group chat about the reunion",
    "Texted congratulations about the new job",
    "Sent a voice note back and forth",
  ],
  email: [
    "Emailed a longer update",
    "Sent over the article I mentioned",
    "Emailed to arrange the weekend",
    "Replied to their newsletter",
    "Email chain about the wedding plans",
  ],
  met: [
    "Quedamos a tomar un café",
    "Cena en aquel italiano",
    "Went for a long walk on the Heath",
    "Met at the climbing gym",
    "Cycled to the coast together",
    "Lunch near their office",
    "BBQ at theirs",
    "Met at the exhibition opening",
    "Pint after work",
    "Sunday roast at mine",
    "Went to the match together",
  ],
  other: [
    "Sent a card and flowers",
    "Voicemail — playing phone tag",
    "Wrote a letter, actually on paper",
    "Sent a housewarming gift",
  ],
};

export function populateEs(repo: Repo, today: string, rand: Rand): void {
  // A birthday in each of the next three months, whatever today is
  const inDays = (d: number) => {
    const iso = addDaysISO(today, d);
    const [y, m, day] = iso.split("-").map(Number);
    return [m, day, y - 35] as [number, number, number | null];
  };
  const birthdayThisMonth = inDays(6);
  const birthdayNextMonth = inDays(34);
  const birthdayMonthAfter = inDays(65);

  const PEOPLE: PersonSeed[] = [
    // INNER
    {
      name: "Maya Chen",
      circle: "inner",
      company: "Figma",
      job_title: "Diseñadora de producto senior",
      city: "San Francisco",
      timezone: "America/Los_Angeles",
      email: "maya.chen@example.com",
      phone: "+1 415 555 0132",
      tags: ["family", "design"],
      lastContactedDaysAgo: 5,
      interactionCount: 12,
      birthday: [3, 15, 1990],
      how_met: "She’s my sister — she has been there since day one (hers)",
      met_where: "Reading",
      met_on: "1990-03-15",
      notes:
        "Prefiere videollamadas a llamadas. Suele estar libre los domingos por la mañana, hora nuestra.",
    },
    {
      name: "Sam Okafor",
      circle: "inner",
      company: "Stripe",
      job_title: "Ingeniero de datos",
      city: "London",
      timezone: "Europe/London",
      email: "sam.okafor@stripe-example.com",
      phone: "+44 7700 900123",
      tags: ["university", "cycling", "close-friends"],
      lastContactedDaysAgo: 12,
      interactionCount: 10,
      birthday: [11, 12, 1986], // turns 40 — milestone
      how_met: "Compañeros de piso en segundo curso",
      met_where: "Manchester",
      met_on: "2008-09-20",
      notes:
        "Siempre dispuesto a pedalear si termina en una panadería. Le interesa la media maratón de Berlín en primavera.",
    },
    {
      name: "Priya Sharma",
      circle: "inner",
      company: "Guy's and St Thomas' NHS Trust",
      job_title: "Médico adjunto de urgencias",
      city: "London",
      timezone: "Europe/London",
      email: "priya.sharma@nhs-example.co.uk",
      phone: "+44 7700 900456",
      tags: ["university", "close-friends"],
      lastContactedDaysAgo: 20,
      interactionCount: 7,
      birthday: [6, 21, 1989],
      how_met: "Sam nos presentó en su cena de cumpleaños",
      met_where: "London",
      met_on: "2012-11-12",
      notes:
        "Trabaja de noche, mejor mensaje que llamada. Lleva postre si visitas.",
    },
    {
      name: "Daniel Rousseau",
      circle: "inner",
      company: "Restaurant Le Garet",
      job_title: "Chef ejecutivo",
      city: "Lyon",
      timezone: "Europe/Paris",
      email: "daniel.rousseau72@example.com",
      phone: "+33 6 12 34 56 78",
      tags: ["cycling", "close-friends"],
      lastContactedDaysAgo: 15,
      interactionCount: 6,
      birthday: [1, 8, null],
      how_met: "Pedaleando el mismo puerto una mañana; esperó cuando pinché",
      met_where: "Col de la Luère, France",
      met_on: "2016-07-02",
    },
    {
      name: "Alex Kim",
      circle: "inner",
      company: "Spotify",
      job_title: "Product Manager",
      city: "Stockholm",
      timezone: "Europe/Stockholm",
      email: "alex.kim@spotify-example.com",
      phone: "+46 70 123 45 67",
      tags: ["ex-colleague", "close-friends"],
      lastContactedDaysAgo: 47, // overdue (inner = 30)
      interactionCount: 5,
      birthday: [4, 2, 1991],
      how_met: "Nos sentamos juntos mi primer día en Northwind",
      met_where: "Northwind office, London",
      met_on: "2017-05-01",
    },
    {
      name: "Inês Baptista",
      circle: "inner",
      company: "Atelier Baptista",
      job_title: "Architect",
      city: "Lisbon",
      timezone: "Europe/Lisbon",
      email: "ines@atelierbaptista.pt",
      phone: "+351 91 234 56 78",
      tags: ["close-friends", "design"],
      lastContactedDaysAgo: 26, // due soon (4 days)
      interactionCount: 6,
      birthday: [2, 29, 1996], // leap-day birthday
      how_met: "Compañeros de piso durante mi año en Lisboa",
      met_where: "Lisbon",
      met_on: "2019-02-01",
    },
    {
      name: "Joseph Kelly",
      circle: "inner",
      company: "",
      job_title: "Profesor jubilado",
      city: "Cork",
      timezone: "Europe/Dublin",
      email: "grandpajoe@example.com",
      phone: "+353 86 123 4567",
      tags: ["family"],
      lastContactedDaysAgo: 60,
      interactionCount: 5,
      birthday: [5, 30, 1948],
      snoozed_until: addDaysISO(today, 45), // travelling together soon
      how_met: "He’s my grandfather",
      met_where: "Cork",
      met_on: "1988-06-11",
      notes: "Pospuesto mientras está fuera — nos vemos a finales de mes.",
    },
    {
      name: "Nadia Haddad",
      circle: "inner",
      company: "The Guardian",
      job_title: "Periodista de la sección internacional",
      city: "Berlin",
      timezone: "Europe/Berlin",
      email: "nadia.haddad@example.com",
      phone: "+49 151 23456789",
      tags: ["close-friends", "journalism"],
      lastContactedDaysAgo: 8,
      interactionCount: 7,
      birthday: [9, 3, 1987],
      how_met: "Compañeros en el periódico universitario",
      met_where: "University of Manchester",
      met_on: "2009-10-05",
    },
    {
      name: "Ruth Kelly",
      circle: "inner",
      company: "",
      job_title: "Enfermera jubilada",
      city: "Cork",
      timezone: "Europe/Dublin",
      email: "ruth.kelly@example.com",
      phone: "+353 86 987 6543",
      tags: ["family"],
      lastContactedDaysAgo: 10,
      interactionCount: 9,
      birthday: [9, 9, 1958],
      how_met: "She’s my mother",
      met_where: "Reading",
      met_on: "1960-04-02",
      notes:
        "Llama los domingos, sobre las siete hora suya. Prefiere las fotos a las palabras.",
    },

    // CLOSE
    {
      name: "Tom Becker",
      circle: "close",
      company: "Chorlton High School",
      job_title: "Profesor de historia",
      city: "Manchester",
      timezone: "Europe/London",
      email: "t.becker@example.com",
      phone: "+44 7700 900888",
      tags: ["university"],
      lastContactedDaysAgo: 40,
      interactionCount: 5,
      birthday: [2, 18, 1988],
      how_met: "University coursemates",
      met_where: "Manchester",
      met_on: "2007-09-24",
    },
    {
      name: "Sofia Marino",
      circle: "close",
      company: "Northwind Analytics",
      job_title: "Directora de marketing",
      city: "Milan",
      timezone: "Europe/Rome",
      email: "sofia.marino@northwind-example.com",
      phone: "+39 333 123 4567",
      tags: ["colleagues"],
      lastContactedDaysAgo: 50,
      interactionCount: 6,
      birthday: birthdayNextMonth,
      how_met: "Worked together on the relaunch",
      met_where: "Northwind office, London",
      met_on: "2019-03-11",
    },
    {
      name: "James Whitfield",
      circle: "close",
      company: "Monzo",
      job_title: "Gerente de ingeniería",
      city: "London",
      timezone: "Europe/London",
      email: "james.whitfield@example.com",
      phone: "+44 7700 900999",
      tags: ["ex-colleague", "tech"],
      lastContactedDaysAgo: 130, // overdue (close = 91)
      interactionCount: 4,
      birthday: [8, 25, 1984],
      how_met: "My tech lead on the payments team",
      met_where: "Northwind office, London",
      met_on: "2018-01-15",
      notes: "Twin girls born last spring — sleep is thin on the ground.",
    },
    {
      name: "Grace Liu",
      circle: "close",
      company: "Kitsilano Physio",
      job_title: "Fisioterapeuta",
      city: "Vancouver",
      timezone: "America/Vancouver",
      email: "grace.liu@example.ca",
      phone: "+1 604 555 0199",
      tags: ["cycling"],
      lastContactedDaysAgo: 30,
      interactionCount: 5,
      cadence_override_days: 60, // more often than the circle default
      birthday: [7, 19, 1992],
      how_met: "Saturday club rides",
      met_where: "Stanley Park, Vancouver",
      met_on: "2022-06-18",
    },
    {
      name: "Marco Petrelli",
      circle: "close",
      company: "Fattoria Petrelli",
      job_title: "Enólogo",
      city: "Florence",
      timezone: "Europe/Rome",
      email: "marco@fattoriapetrelli.it",
      phone: "+39 348 555 0123",
      tags: ["cycling", "food"],
      lastContactedDaysAgo: 100, // overdue
      interactionCount: 4,
      birthday: [10, 6, 1983],
      how_met: "Daniel’s brother; hosted us after the ride through Chianti",
      met_where: "Chianti",
      met_on: "2018-09-08",
    },
    {
      name: "Hannah Cohen",
      circle: "close",
      company: "Tel Aviv Sourasky Medical Center",
      job_title: "Enfermera pediátrica",
      city: "Tel Aviv",
      timezone: "Asia/Jerusalem",
      email: "hannah.cohen@example.com",
      phone: "+972 50 123 4567",
      tags: ["family"],
      lastContactedDaysAgo: 110, // overdue
      interactionCount: 3,
      birthday: [12, 2, 1991],
      how_met: "Cousin — she taught me to swim",
      met_where: "Reading",
      met_on: "1996-08-01",
    },
    {
      name: "Rob Ashworth",
      circle: "close",
      company: "Automattic",
      job_title: "Desarrollador de software",
      city: "Leeds",
      timezone: "Europe/London",
      email: "rob.ashworth@example.com",
      phone: "+44 7700 900777",
      tags: ["climbing", "tech"],
      lastContactedDaysAgo: 170, // badly overdue
      interactionCount: 4,
      birthday: [3, 28, 1989],
      how_met: "Belayer at the climbing wall who caught my fall",
      met_where: "The Depot, Manchester",
      met_on: "2020-01-09",
    },
    {
      name: "Yuki Tanaka",
      circle: "close",
      company: "Freelance",
      job_title: "Traductora literaria",
      city: "Tokyo",
      timezone: "Asia/Tokyo",
      email: "yuki.tanaka@example.jp",
      phone: "+81 90 1234 5678",
      tags: ["ex-colleague", "books"],
      lastContactedDaysAgo: 70,
      interactionCount: 4,
      birthday: birthdayMonthAfter,
      how_met: "Localisation partner on the Northwind launch",
      met_where: "Tokyo",
      met_on: "2020-02-14",
    },
    {
      name: "Clara Dubois",
      circle: "close",
      company: "Studio Dubois",
      job_title: "Ilustradora",
      city: "Paris",
      timezone: "Europe/Paris",
      email: "clara@studiodubois.fr",
      phone: "+33 6 98 76 54 32",
      tags: ["design", "close-friends"],
      lastContactedDaysAgo: 88, // due soon (3 days)
      interactionCount: 5,
      birthday: [5, 11, 1993],
      how_met: "Illustrated the children’s book I worked on",
      met_where: "Paris",
      met_on: "2021-04-19",
    },
    {
      name: "Ben Foster",
      circle: "close",
      company: "Foster & Co",
      job_title: "Contable",
      city: "Bristol",
      timezone: "Europe/London",
      email: "ben.foster@example.com",
      phone: "+44 7700 900666",
      tags: ["university"],
      lastContactedDaysAgo: 200, // badly overdue
      interactionCount: 3,
      birthday: [11, 30, 1987],
      how_met: "University — he ran the film society",
      met_where: "Manchester",
      met_on: "2007-10-02",
    },
    {
      name: "Aisha Mbelu",
      circle: "close",
      company: "Adyen",
      job_title: "Directora de ingeniería",
      city: "Amsterdam",
      timezone: "Europe/Amsterdam",
      email: "aisha.mbelu@example.com",
      phone: "+31 6 12345678",
      tags: ["ex-colleague", "tech"],
      lastContactedDaysAgo: 85, // due soon (6 days)
      interactionCount: 4,
      birthday: [1, 23, 1982],
      how_met: "My manager for two years at Northwind",
      met_where: "Northwind office, London",
      met_on: "2019-06-03",
    },

    // WIDER
    {
      name: "Lena Weber",
      circle: "wider",
      company: "Fabrikam GmbH",
      job_title: "Controladora",
      city: "Munich",
      timezone: "Europe/Berlin",
      email: "lena.weber@fabrikam-example.de",
      phone: "+49 89 123456",
      tags: ["ex-colleague"],
      lastContactedDaysAgo: 90,
      interactionCount: 3,
      birthday: [10, 1, 1979],
      how_met: "Sat across from me at Fabrikam for three years",
      met_where: "Fabrikam, Munich",
      met_on: "2014-09-01",
    },
    {
      name: "Chris Donovan",
      circle: "wider",
      company: "Donovan & Sons",
      job_title: "Librero",
      city: "Dublin",
      timezone: "Europe/Dublin",
      email: "chris@donovanbooks.ie",
      phone: "+353 1 555 0123",
      tags: ["books"],
      lastContactedDaysAgo: 250, // overdue
      interactionCount: 2,
      birthday: [6, 7, 1975],
      how_met: "Was my neighbour for four years",
      met_where: "Dublin",
      met_on: "2015-03-01",
    },
    {
      name: "Peter Novak",
      circle: "wider",
      company: "Prague Tech Summit",
      job_title: "Organizador de conferencias",
      city: "Prague",
      timezone: "Europe/Prague",
      email: "peter.novak@example.cz",
      phone: "+420 601 123 456",
      tags: ["tech"],
      lastContactedDaysAgo: 60,
      interactionCount: 2,
      checkins_off: true, // opted out of check-ins
      birthday: [4, 19, 1980],
      how_met: "Speaker liaison at the summit",
      met_where: "Prague",
      met_on: "2023-05-16",
      notes:
        "Happy to hear from me anytime, but no nudges — check-ins are off for him.",
    },
    {
      name: "Elena Petrova",
      circle: "wider",
      company: "Freelance",
      job_title: "Profesora de idiomas",
      city: "Barcelona",
      timezone: "Europe/Madrid",
      email: "elena.petrova@example.es",
      phone: "+34 612 345 678",
      tags: ["spanish", "language-exchange"],
      lastContactedDaysAgo: 60,
      interactionCount: 3,
      birthday: [8, 30, 1994],
      how_met: "Weekly Spanish intercambio",
      met_where: "Barcelona",
      met_on: "2023-02-07",
    },
    {
      name: "Michael Byrne",
      circle: "wider",
      company: "NUI Galway",
      job_title: "Profesor universitario",
      city: "Galway",
      timezone: "Europe/Dublin",
      email: "michael.byrne@example.ie",
      phone: "+353 91 555 012",
      tags: ["university"],
      lastContactedDaysAgo: 410, // most overdue in the book
      interactionCount: 3,
      birthday: [8, 14, 1979], // birthday today!
      how_met: "My dissertation supervisor",
      met_where: "Galway",
      met_on: "2011-10-04",
      notes:
        "Owes me a reply about the reunion panel. Cumpleaños is today — write to him.",
    },
    {
      name: "Fatima Zahra",
      circle: "wider",
      company: "Casablanca School of Art",
      job_title: "Profesora de cerámica",
      city: "Casablanca",
      timezone: "Africa/Casablanca",
      email: "fatima.zahra@example.ma",
      phone: "+212 661 234567",
      tags: ["craft"],
      lastContactedDaysAgo: 150,
      interactionCount: 2,
      birthday: [3, 2, 1986],
      how_met: "Maya’s friend from her Lisbon years",
      met_where: "Lisbon",
      met_on: "2020-06-20",
    },
    {
      name: "Oliver Grant",
      circle: "wider",
      company: "Grant Legal",
      job_title: "Abogado",
      city: "Edinburgh",
      timezone: "Europe/London",
      email: "oliver@grantlegal.example.co.uk",
      phone: "+44 131 555 0199",
      tags: ["work"],
      lastContactedDaysAgo: 210, // overdue
      interactionCount: 2,
      birthday: [9, 15, 1972],
      how_met: "Handled the conveyancing on my flat",
      met_where: "Edinburgh",
      met_on: "2021-08-30",
    },
    {
      name: "Georgia Papadaki",
      circle: "wider",
      company: "Aegean Tours",
      job_title: "Guía turística",
      city: "Athens",
      timezone: "Europe/Athens",
      email: "georgia@aegeantours.gr",
      phone: "+30 69 1234 5678",
      tags: ["travel"],
      // never contacted — brand new in the book
      birthday: [7, 7, null],
      how_met: "We got talking for hours at Kostas & Lena’s wedding",
      met_where: "Athens",
      met_on: "2026-07-25",
      notes:
        "Swapped details at the wedding — said to look her up next time I’m in Athens.",
    },
    {
      name: "Nina Sørensen",
      circle: "wider",
      company: "",
      job_title: "Bibliotecaria jubilada",
      city: "Copenhagen",
      timezone: "Europe/Copenhagen",
      email: "nina.sorensen@example.dk",
      phone: "+45 40 12 34 56",
      tags: ["books"],
      lastContactedDaysAgo: 178, // due soon (4 days)
      interactionCount: 3,
      birthday: [2, 6, 1955],
      how_met: "Pen pal since the nineties, through a books-and-letters column",
      met_where: "By post",
      met_on: "1997-01-01",
    },

    // DISTANT
    {
      name: "Victor Almeida",
      circle: "distant",
      company: "Galeria Almeida",
      job_title: "Fotógrafo",
      city: "São Paulo",
      timezone: "America/Sao_Paulo",
      email: "victor@galeriaalmeida.example.br",
      phone: "+55 11 91234 5678",
      tags: ["photography"],
      lastContactedDaysAgo: 420, // overdue
      interactionCount: 2,
      birthday: birthdayThisMonth,
      how_met: "Shared a hostel dorm for a month in Patagonia",
      met_where: "El Chaltén, Argentina",
      met_on: "2013-11-05",
    },
    {
      name: "Rachel Weiss",
      circle: "distant",
      company: "Toronto District School Board",
      job_title: "Orientadora escolar",
      city: "Toronto",
      timezone: "America/Toronto",
      email: "rachel.weiss@example.ca",
      phone: "+1 416 555 0177",
      tags: ["school"],
      lastContactedDaysAgo: 430, // overdue
      interactionCount: 2,
      birthday: [5, 22, 1986],
      how_met: "School friends — inseparable until we were sixteen",
      met_where: "Reading",
      met_on: "1996-09-01",
    },
    {
      name: "Kwame Mensah",
      circle: "distant",
      company: "Accra Academy",
      job_title: "Profesor jubilado",
      city: "Accra",
      timezone: "Africa/Accra",
      email: "kwame.mensah@example.gh",
      phone: "+233 24 123 4567",
      tags: ["school"],
      lastContactedDaysAgo: 360, // due soon (5 days)
      interactionCount: 2,
      birthday: [12, 1, 1961],
      how_met: "My teacher in the year we lived abroad",
      met_where: "Accra",
      met_on: "2003-09-08",
    },
    {
      name: "Lucia Ferrari",
      circle: "distant",
      company: "Café de las Flores",
      job_title: "Propietaria",
      city: "Buenos Aires",
      timezone: "America/Argentina/Buenos_Aires",
      email: "lucia@cafedelasflores.example.ar",
      phone: "+54 11 5555 0123",
      tags: ["travel"],
      lastContactedDaysAgo: 500, // overdue
      interactionCount: 2,
      birthday: [7, 25, 1988],
      how_met: "Her café was my morning stop for a summer",
      met_where: "Buenos Aires",
      met_on: "2015-12-03",
    },
    {
      name: "David Park",
      circle: "distant",
      company: "Naver",
      job_title: "Directora de ingeniería",
      city: "Seoul",
      timezone: "Asia/Seoul",
      email: "david.park@example.kr",
      phone: "+82 10 1234 5678",
      tags: ["ex-colleague", "tech"],
      lastContactedDaysAgo: 380, // overdue
      interactionCount: 2,
      birthday: [10, 19, 1978],
      how_met: "Ran the Seoul office when we partnered with them",
      met_where: "Seoul",
      met_on: "2021-11-11",
    },
    {
      name: "Amelia Hart",
      circle: "distant",
      company: "Sydney Harbour Clinic",
      job_title: "Fisioterapeuta",
      city: "Sydney",
      timezone: "Australia/Sydney",
      email: "amelia.hart@example.au",
      phone: "+61 412 345 678",
      tags: ["school"],
      lastContactedDaysAgo: 300,
      interactionCount: 2,
      birthday: [4, 8, 1987],
      how_met: "School friends who emigrated",
      met_where: "Reading",
      met_on: "1997-09-01",
    },
  ];

  const ids = insertPeople(repo, PEOPLE, NOTE_POOLS, rand, today);

  // Extra important dates beyond birthdays
  const date = (
    name: string,
    type: Parameters<Repo["createDate"]>[1],
    label: string | null,
    mdY: [number, number, number | null],
  ) => {
    const id = ids.get(name);
    if (id)
      repo.createDate(id, type, label, {
        month: mdY[0],
        day: mdY[1],
        year: mdY[2],
      });
  };
  date("James Whitfield", "anniversary", "Aniversario de boda", [6, 14, 2018]);
  date("Maya Chen", "work_anniversary", "Se unió a Figma", [3, 15, 2021]);
  date("Lena Weber", "work_anniversary", "At Fabrikam", [10, 1, 2015]);
  date("Clara Dubois", "child_birthday", "Louise", [4, 17, 2019]);
  date("Ruth Kelly", "anniversary", "Mum and Dad’s anniversary", [6, 26, 1983]);
  date(
    "Michael Byrne",
    "other",
    "Dissertation deadline (the one I missed)",
    [4, 30, 2012],
  );

  // Facts
  const fact = (name: string, text: string) => {
    const id = ids.get(name);
    if (id) repo.createFact(id, text);
  };
  fact("Maya Chen", "Alérgica al marisco — revisar el menú antes de reservar");
  fact("Maya Chen", "Runs a life-drawing class on Tuesday evenings");
  fact("Maya Chen", "Hates surprise parties");
  fact("Sam Okafor", "Partner is Priya");
  fact("Sam Okafor", "Es del Arsenal, lamentablemente");
  fact("Sam Okafor", "Allergic to penicillin");
  fact(
    "Priya Sharma",
    "Vegetarian, but makes an exception for her mum’s biryani",
  );
  fact("Priya Sharma", "Collects first editions of travel writing");
  fact("Daniel Rousseau", "Allergic to cats");
  fact(
    "Daniel Rousseau",
    "Speaks French, Portuguese, English and a little Basque",
  );
  fact("Joseph Kelly", "Deaf in his left ear — sit on his right");
  fact("Joseph Kelly", "Loves Munster rugby; hates the referee, whoever it is");
  fact("Ruth Kelly", "Prefers letters to email. Print the photos.");
  fact("Grace Liu", "Avoids caffeine — order her a rooibos");
  fact("James Whitfield", "Twin girls, born spring 2024");
  fact("Alex Kim", "Learning the cello; it is going… slowly");
  fact(
    "Nadia Haddad",
    "Files copy late on Fridays — don’t call before noon Saturday",
  );
  fact("Clara Dubois", "Daughter is Louise, born 2019");
  fact("Marco Petrelli", "Sends wine at Christmas; always send something back");
  fact("Hannah Cohen", "Fluent in Hebrew, English and French");

  // News (dated; newest is the person's latest news)
  const news = (name: string, text: string, daysAgo: number) => {
    const id = ids.get(name);
    if (id) repo.createNews(id, text, addDaysISO(today, -daysAgo));
  };
  news("Maya Chen", "Promoted to Diseñadora de producto senior at Figma", 21);
  news(
    "Maya Chen",
    "Se mudó a un piso en el Mission con terraza en la azotea",
    120,
  );
  news(
    "Sam Okafor",
    "Se mudó a Londres — la oficina de Stripe abrió en marzo",
    60,
  );
  news("Sam Okafor", "Entrenando para la media maratón de Berlín", 12);
  news("Priya Sharma", "Aprobó los exámenes FRCEM — ahora es adjunta", 90);
  news("James Whitfield", "Nacieron las gemelas — Eleanor e Iris", 420);
  news("James Whitfield", "Promoted to Gerente de ingeniería at Monzo", 150);
  news("Clara Dubois", "Segundo bebé previsto para marzo", 40);
  news("Clara Dubois", "Moved the studio to the eleventh arrondissement", 200);
  news("Inês Baptista", "Her practice won the Cais do Sodré competition", 75);
  news("Nadia Haddad", "Posted to Berlin for the Guardian for two years", 55);
  news(
    "Daniel Rousseau",
    "Restaurant got its second toque in the Gault & Millau",
    30,
  );
  news("Alex Kim", "Moved to Stockholm for the Spotify job", 200);
  news("Hannah Cohen", "Started a paediatric nursing degree in Tel Aviv", 340);
  news(
    "Yuki Tanaka",
    "Her translation of “The Woman in the Dunes” was shortlisted",
    110,
  );
  news("Marco Petrelli", "The 2025 Sangiovese won a regional medal", 55);
  news("Michael Byrne", "Stepping down as head of department next summer", 400);
  news(
    "Victor Almeida",
    "Exhibition of Patagonia work opening in São Paulo",
    8,
  );
  news("Elena Petrova", "Started teaching evening Catalan classes", 260);
  news("Grace Liu", "Opening a second clinic in North Vancouver", 150);

  // Reminders
  const reminder = (
    name: string,
    text: string,
    dueInDays: number,
    done = false,
  ) => {
    const id = ids.get(name);
    if (!id) return;
    const r = repo.createReminder(id, text, addDaysISO(today, dueInDays));
    if (done) repo.setReminderDone(r.id, true);
  };
  reminder("Maya Chen", `Reservar mesa para la cena de cumpleaños de Maya`, 5);
  reminder(
    "Joseph Kelly",
    "Post the birthday parcel to Cork (before he leaves)",
    3,
  );
  reminder("James Whitfield", "Ask about the twins’ christening plans", -2); // overdue
  reminder("Grace Liu", "Send the physio referral letter Grace offered", -9); // overdue
  reminder("Michael Byrne", "Escribir a Michael por su cumpleaños — ¡hoy!", 0);
  reminder("Inês Baptista", "Find out Inês’s actual exhibition dates", 14);
  reminder("Sam Okafor", "Send Berlin half-marathon training plan", 8);
  reminder("Victor Almeida", "Reply about the exhibition opening", -1, true); // done
  reminder("Sofia Marino", "Add Sofia’s birthday to the calendar", 2, true); // done

  // Gifts
  const gift = (
    name: string,
    gname: string,
    kind: "idea" | "given" | "received",
    occasion: string | null,
    daysAgo: number,
  ) => {
    const id = ids.get(name);
    if (id)
      repo.createGift(id, gname, kind, occasion, addDaysISO(today, -daysAgo));
  };
  gift(
    "Maya Chen",
    "Ceramic ramen bowl set from the Lisbon potters",
    "idea",
    "Cumpleaños",
    30,
  );
  gift(
    "Maya Chen",
    "Charcoal sketch of her old flat",
    "given",
    "Cumpleaños",
    165,
  );
  gift(
    "Maya Chen",
    "Hand-knitted scarf (slightly wonky)",
    "received",
    "Christmas",
    230,
  );
  gift("Sam Okafor", "Cycling GPS computer", "idea", "Cumpleaños", 45);
  gift(
    "Sam Okafor",
    "Vintage Arsenal programme from 1971",
    "given",
    "Cumpleaños",
    300,
  );
  gift(
    "Priya Sharma",
    "Box of Turkish delight from Istanbul",
    "given",
    "No reason",
    80,
  );
  gift(
    "Joseph Kelly",
    "Large-print Wodehouse collection",
    "idea",
    "Cumpleaños",
    60,
  );
  gift(
    "Yuki Tanaka",
    "Ukiyo-e print from the flea market",
    "given",
    "New flat",
    150,
  );
  gift(
    "Clara Dubois",
    "The Very Hungry Caterpillar, French edition",
    "given",
    "Louise’s birthday",
    140,
  );
  gift(
    "Inês Baptista",
    "Tile-painted nameplate",
    "received",
    "Housewarming",
    260,
  );

  // Connections between people
  const connect = (
    a: string,
    b: string,
    kind: "partner" | "parent_child" | "sibling" | "colleague" | "other",
    opts: {
      aIsParent?: boolean;
      label?: string;
      inverseLabel?: string;
      note?: string;
    } = {},
  ) => {
    const aid = ids.get(a);
    const bid = ids.get(b);
    if (aid && bid) {
      repo.createConnection(aid, bid, {
        kind,
        a_is_parent: opts.aIsParent === true,
        label: opts.label ?? null,
        inverse_label: opts.inverseLabel ?? null,
        note: opts.note ?? null,
      });
    }
  };
  connect("Ruth Kelly", "Maya Chen", "parent_child", { aIsParent: true });
  connect("Joseph Kelly", "Ruth Kelly", "parent_child", { aIsParent: true });
  connect("Sam Okafor", "Priya Sharma", "partner");
  connect("James Whitfield", "Aisha Mbelu", "colleague", {
    note: "at Fabrikam, years ago",
  });
  connect("Daniel Rousseau", "Marco Petrelli", "sibling");
  connect("Maya Chen", "Hannah Cohen", "other", {
    label: "Cousin of Hannah",
    inverseLabel: "Cousin of Maya",
  });
  connect("Peter Novak", "Elena Petrova", "other", {
    label: "Introduced me to Elena",
    inverseLabel: "Introduced me to Peter",
  });
  connect("Sam Okafor", "Tom Becker", "other", {
    label: "University friends with Tom",
    inverseLabel: "University friends with Sam",
  });
  connect("Maya Chen", "Fatima Zahra", "other", {
    label: "Friends with Fatima",
    inverseLabel: "Friends with Maya",
  });
  connect("Daniel Rousseau", "Grace Liu", "other", {
    label: "Met on the Lyon ride with Grace",
    inverseLabel: "Met Daniel on the Lyon ride",
  });

  // A hand-crafted recent interaction so Today's feed looks alive
  const mayaId = ids.get("Maya Chen")!;
  repo.createInteraction(
    mayaId,
    "met",
    addDaysISO(today, -5),
    "Videollamada que acabó en tres horas de charla — me enseñó la terraza",
  );
  const samId = ids.get("Sam Okafor")!;
  repo.createInteraction(
    samId,
    "call",
    addDaysISO(today, -12),
    "Llamé para hablar del viaje a Berlín — él y Priya van al fin de semana de la media maratón",
  );
}
