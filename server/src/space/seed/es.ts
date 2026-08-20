import type { Seeder } from "./seeder.js";

/** English showcase workspace content. */
export function populateEs(s: Seeder): void {
  const home = s.page({ title: "Inicio", icon: "🏠" });
  s.blocks(home, [
    { type: "heading1", text: "Bienvenido de nuevo, Ed" },
    {
      type: "paragraph",
      text: "Este es tu espacio personal: notas, planes y listas, todo en un lugar tranquilo.",
    },
    {
      type: "callout",
      text: "Tip: press Enter for a new block, and type “/” anywhere to insert a different kind of block.",
    },
    { type: "divider" },
    { type: "heading3", text: "Esta semana" },
    { type: "todo", text: "Regar el jardín del balcón", checked: true },
    {
      type: "todo",
      text: "Reservar ryokan en Kioto antes de que suban los precios",
      checked: false,
    },
    {
      type: "todo",
      text: "Terminar el borrador de herramientas lentas",
      checked: false,
    },
    { type: "quote", text: "Lento es suave, suave es rápido." },
    { type: "divider" },
    { type: "heading3", text: "Dónde vive cada cosa" },
    {
      type: "bulleted",
      text: "Proyectos — cualquier cosa con un resultado y más de un paso",
    },
    {
      type: "bulleted",
      text: "Trabajo — plazos que puso otra persona y el tablero de tareas",
    },
    {
      type: "bulleted",
      text: "Viajes — viajes planeados, hechos y qué empacar",
    },
    {
      type: "bulleted",
      text: "Notas — todo lo que aún no tiene sitio",
    },
    {
      type: "bulleted",
      text: "Archivo — terminado o abandonado, guardado por el razonamiento",
    },
  ]);

  const projects = s.page({ title: "Proyectos", icon: "🗂️" });
  s.blocks(projects, [
    {
      type: "paragraph",
      text: "Aquí vive todo lo que tiene un resultado y más de un paso.",
    },
    { type: "bulleted", text: "Balcony Garden — summer crop underway" },
    { type: "bulleted", text: "Home Lab Rebuild — waiting on parts" },
    { type: "bulleted", text: "Writing — one essay at a time" },
  ]);

  const garden = s.page({
    parent: projects,
    title: "Jardín del balcón",
    icon: "🌱",
  });
  s.blocks(garden, [
    { type: "heading2", text: "The plan" },
    {
      type: "paragraph",
      text: "Six containers, southern exposure, drip line off the outside tap. Keep it low-effort: herbs plus two tomato plants.",
    },
    { type: "bulleted", text: "Cherry tomatoes — two grow bags" },
    {
      type: "bulleted",
      text: "Basil, thyme, mint (mint stays in its own pot, it spreads)",
    },
    { type: "bulleted", text: "Chillies against the warm wall" },
    { type: "heading3", text: "Watering" },
    {
      type: "paragraph",
      text: "Mornings only. If leaves droop by evening, the drip rate is too low — nudge it up a notch.",
    },
  ]);

  const calendar = s.page({
    parent: garden,
    title: "Planting Calendar",
    icon: "📅",
  });
  s.blocks(calendar, [
    { type: "heading3", text: "Sow" },
    {
      type: "bulleted",
      text: "March — basil and chillies indoors, on the sill",
    },
    { type: "bulleted", text: "April — tomatoes potted on, still inside" },
    {
      type: "bulleted",
      text: "Mid-May — everything out, after the last frost",
    },
    { type: "heading3", text: "Feed" },
    {
      type: "paragraph",
      text: "Tomato feed once a week from the first truss, half strength for the herbs.",
    },
    {
      type: "callout",
      text: "Last frost here is usually the second week of May. Going out early has cost two years running.",
    },
  ]);

  const homelab = s.page({
    parent: projects,
    title: "Home Lab Rebuild",
    icon: "🖥️",
  });
  s.blocks(homelab, [
    { type: "heading2", text: "Goal" },
    {
      type: "paragraph",
      text: "Replace the ageing tower with a quiet mini PC cluster that idles under 30 watts.",
    },
    { type: "numbered", text: "Back everything up twice, verify one restore" },
    { type: "numbered", text: "Flatten and reinstall the router" },
    { type: "numbered", text: "Migrate services one at a time, oldest first" },
    { type: "heading3", text: "Bootstrap script" },
    {
      type: "code",
      text: "#!/usr/bin/env bash\nset -euo pipefail\nhostnamectl set-hostname node-01\napt update && apt install -y docker.io\ndocker run -d --restart=always --name whoami traefik/whoami",
    },
    {
      type: "callout",
      text: "Do not touch DNS until the second node is up. Learned this the hard way.",
    },
  ]);

  const parts = s.page({
    parent: homelab,
    title: "Parts Inventory",
    icon: "📦",
  });
  s.blocks(parts, [
    {
      type: "paragraph",
      text: "What has actually arrived, not what was ordered.",
    },
    { type: "todo", text: "Mini PC #1 (arrived, tested)", checked: true },
    { type: "todo", text: "Mini PC #2", checked: false },
    { type: "todo", text: "2.5G switch", checked: true },
    { type: "todo", text: "Short patch cables x6", checked: false },
  ]);

  const network = s.page({
    parent: homelab,
    title: "Network Map",
    icon: "🕸️",
  });
  s.blocks(network, [
    {
      type: "paragraph",
      text: "One flat network was fine until the cameras arrived. Three VLANs now, and the rule is that anything cheap lives on 30.",
    },
    { type: "numbered", text: "10 — trusted: laptops, phones, the NAS" },
    { type: "numbered", text: "20 — services: the two nodes and the proxy" },
    { type: "numbered", text: "30 — untrusted: cameras, plugs, the doorbell" },
    {
      type: "code",
      text: "# router: only 10 may reach 20's admin ports\nallow from 10.0.10.0/24 to 10.0.20.0/24 port 22,443\nblock from 10.0.30.0/24 to 10.0.0.0/8\nallow from 10.0.30.0/24 to any port 123",
    },
    { type: "divider" },
    {
      type: "quote",
      text: "A network you cannot draw on one page is a network you do not understand.",
    },
  ]);

  const writing = s.page({ parent: projects, title: "Writing", icon: "✍️" });
  s.blocks(writing, [
    {
      type: "paragraph",
      text: "Drafts in progress. One piece at a time, shipped monthly.",
    },
  ]);

  const blog = s.page({
    parent: writing,
    title: "Blog: Slow Tools",
    icon: "📝",
  });
  s.blocks(blog, [
    { type: "heading2", text: "Thesis" },
    {
      type: "paragraph",
      text: "The best personal tools are boring: fast to open, obvious to use, and quiet about it. Speed of thought beats richness of feature.",
    },
    { type: "quote", text: "A tool is only yours once you stop noticing it." },
    { type: "heading3", text: "Outline" },
    { type: "numbered", text: "Why every note app eventually becomes a chore" },
    {
      type: "numbered",
      text: "The case for plain blocks over clever documents",
    },
    {
      type: "numbered",
      text: "What survives: search, lists, and a fast sidebar",
    },
    { type: "divider" },
    { type: "paragraph", text: "Target: 1,400 words. Draft due Friday." },
  ]);

  const essays = s.page({ parent: writing, title: "Essay Ideas", icon: "🗒️" });
  s.blocks(essays, [
    {
      type: "paragraph",
      text: "Nothing here is committed to. An idea earns its own page once it survives a month.",
    },
    { type: "bulleted", text: "The case against the second monitor" },
    { type: "bulleted", text: "What a home lab teaches you about production" },
    { type: "bulleted", text: "Why every list app becomes a calendar" },
    { type: "bulleted", text: "Cooking as the last unoptimised hobby" },
    { type: "todo", text: "Pick one for September", checked: false },
  ]);

  const bike = s.page({
    parent: projects,
    title: "Bike Restoration",
    icon: "🚲",
  });
  s.blocks(bike, [
    { type: "heading2", text: "1987 tourer, bought for parts money" },
    {
      type: "paragraph",
      text: "Frame is straight and the lugs are clean, which is the only part that cannot be bought later.",
    },
    { type: "todo", text: "Strip and degrease the frame", checked: true },
    { type: "todo", text: "Repack both hubs", checked: true },
    { type: "todo", text: "New cables, outers included", checked: false },
    {
      type: "todo",
      text: "Decide: keep the friction shifters",
      checked: false,
    },
    {
      type: "callout",
      text: "Do not repaint it. The patina is the reason it was affordable.",
    },
  ]);

  const travel = s.page({ title: "Viajes", icon: "✈️" });
  s.blocks(travel, [
    {
      type: "paragraph",
      text: "Viajes en planificación y notas de los ya hechos.",
    },
  ]);

  const japan = s.page({ parent: travel, title: "Japón 2026", icon: "🗾" });
  s.blocks(japan, [
    { type: "heading2", text: "Diez días, tres paradas" },
    {
      type: "paragraph",
      text: "Tokyo (4 nights) → Kyoto (4) → Osaka (2). Rail pass covers all of it; activate it on day 2, not day 1.",
    },
    {
      type: "bulleted",
      text: "Tokyo: old kissaten cafés, Meiji shrine at opening time",
    },
    {
      type: "bulleted",
      text: "Kyoto: Philosopher's Path early, before the crowds",
    },
    { type: "bulleted", text: "Osaka: eat until it stops being funny" },
    {
      type: "callout",
      text: "Book the ryokan with the cedar bath — the one Anna recommended. It sells out months ahead.",
    },
  ]);

  const tokyoFood = s.page({
    parent: japan,
    title: "Tokyo Food Shortlist",
    icon: "🍜",
  });
  s.blocks(tokyoFood, [
    {
      type: "bulleted",
      text: "Tsukemen at the place under the rail arches in Yūrakuchō",
    },
    {
      type: "bulleted",
      text: "7am tamago sando from any Lawson — not optional",
    },
    { type: "bulleted", text: "Depachika basement floor of Isetan, go hungry" },
    {
      type: "paragraph",
      text: "Rule: no queueing longer than 40 minutes for anything.",
    },
  ]);

  const kyoto = s.page({ parent: japan, title: "Kyoto Notes", icon: "⛩️" });
  s.blocks(kyoto, [
    { type: "heading3", text: "Mornings" },
    {
      type: "paragraph",
      text: "Everything worth seeing is worth seeing at seven. By ten the same place is a queue with a temple in it.",
    },
    { type: "bulleted", text: "Fushimi Inari before six, all the way up" },
    {
      type: "bulleted",
      text: "Nanzen-ji aqueduct, then coffee at the kissaten",
    },
    { type: "bulleted", text: "Nishiki market on a weekday only" },
    { type: "heading3", text: "Evenings" },
    {
      type: "paragraph",
      text: "Pontocho is fun once. The river bank on a warm night is fun every time and costs nothing.",
    },
    {
      type: "callout",
      text: "Buses take exact change and fill up after four. Walk, or take the subway two stops and walk.",
    },
  ]);

  const points = s.page({
    parent: travel,
    title: "Points and Miles",
    icon: "🎫",
  });
  s.blocks(points, [
    {
      type: "paragraph",
      text: "The only rule that has ever worked: earn on one alliance, burn on long haul, ignore everything else.",
    },
    { type: "numbered", text: "Balance sits at roughly 180,000" },
    { type: "numbered", text: "Two long-haul seats booked, one still open" },
    { type: "numbered", text: "Expiry rolls forward on any activity" },
    {
      type: "todo",
      text: "Move the hotel points before December",
      checked: false,
    },
    {
      type: "quote",
      text: "Points are a currency that only ever loses value.",
    },
  ]);

  const packing = s.page({
    parent: travel,
    title: "Packing Checklist",
    icon: "🧳",
  });
  s.blocks(packing, [
    { type: "heading3", text: "Carry-on only" },
    { type: "todo", text: "Passport + rail pass voucher", checked: true },
    { type: "todo", text: "Universal adapter", checked: true },
    { type: "todo", text: "Merino layers x3", checked: false },
    { type: "todo", text: "Kindle, loaded", checked: false },
    { type: "todo", text: "Spare battery", checked: false },
    {
      type: "paragraph",
      text: "If it doesn't fit in the 40L bag, it doesn't come.",
    },
  ]);

  const notes = s.page({ title: "Notas", icon: "🧠" });
  s.blocks(notes, [
    {
      type: "paragraph",
      text: "Los pensamientos sueltos caen aquí antes de merecer su propia página.",
    },
  ]);

  const recipes = s.page({ parent: notes, title: "Recipes", icon: "🍝" });
  s.blocks(recipes, [
    { type: "heading3", text: "Midweek ragù (45 min)" },
    { type: "numbered", text: "Brown 400g mince hard — don't crowd the pan" },
    {
      type: "numbered",
      text: "Soffritto in the same pan, 10 minutes, no shortcuts",
    },
    {
      type: "numbered",
      text: "Tomatoes, a bay leaf, splash of milk, simmer 25",
    },
    { type: "paragraph", text: "Freezes well. Double it or regret it." },
  ]);

  const sourdough = s.page({
    parent: recipes,
    title: "Sourdough, Slowly",
    icon: "🍞",
  });
  s.blocks(sourdough, [
    { type: "heading2", text: "The schedule that fits a working week" },
    {
      type: "paragraph",
      text: "Feed on Friday night, mix Saturday morning, bake Sunday. Everything else is waiting, which the fridge does for you.",
    },
    { type: "numbered", text: "Friday 21:00 — feed 1:5:5, leave out" },
    { type: "numbered", text: "Saturday 09:00 — mix, autolyse an hour" },
    { type: "numbered", text: "Saturday 10:00 — salt in, four sets of folds" },
    { type: "numbered", text: "Saturday 14:00 — shape, into the fridge" },
    {
      type: "numbered",
      text: "Sunday 08:00 — bake from cold, lid on 20, off 20",
    },
    { type: "divider" },
    { type: "heading3", text: "Ratios" },
    {
      type: "code",
      text: "flour 500g\nwater 350g   (70%)\nstarter 100g (20%)\nsalt 10g     (2%)",
    },
    {
      type: "callout",
      text: "If the crumb is tight, the dough was under-fermented, not under-proved. Give it another hour on the counter next time.",
    },
  ]);

  const quotes = s.page({ parent: notes, title: "Quotes", icon: "💬" });
  s.blocks(quotes, [
    {
      type: "paragraph",
      text: "Kept because they changed something, not because they sounded clever.",
    },
    {
      type: "quote",
      text: "Perfection is achieved when there is nothing left to take away.",
    },
    {
      type: "quote",
      text: "The work is the reward. Everything else is weather.",
    },
    { type: "quote", text: "You can have results or excuses, not both." },
    { type: "quote", text: "Any fool can write code a computer understands." },
  ]);

  const films = s.page({ parent: notes, title: "Films to Watch", icon: "🎬" });
  s.blocks(films, [
    { type: "heading3", text: "Queued" },
    {
      type: "todo",
      text: "Stalker — long, but the right kind",
      checked: false,
    },
    { type: "todo", text: "The Conversation", checked: false },
    { type: "todo", text: "Perfect Days", checked: true },
    { type: "heading3", text: "Rewatch when it rains" },
    { type: "bulleted", text: "Heat" },
    { type: "bulleted", text: "Paris, Texas" },
    { type: "bulleted", text: "Chungking Express" },
  ]);

  const ideas = s.page({ parent: notes, title: "Ideas Inbox", icon: "💡" });
  s.blocks(ideas, [
    {
      type: "bulleted",
      text: "A tiny e-ink dashboard for the hallway: weather, calendar, one todo",
    },
    { type: "bulleted", text: "Essay: why paper boarding passes feel better" },
    { type: "bulleted", text: "Teach the niblings to solder something silly" },
  ]);

  seedReadingList(s);
  seedTripPlanner(s, travel);
  seedProjectTracker(s, projects);

  const health = s.page({ title: "Salud y hábitos", icon: "💪" });
  s.blocks(health, [
    { type: "heading2", text: "Lo básico aburrido" },
    {
      type: "paragraph",
      text: "Nada ingenioso: dormir, caminar, pesas dos veces por semana. Racha, no récords.",
    },
    { type: "todo", text: "Zone 2 — 40 minutes", checked: true },
    { type: "todo", text: "Weights — push day", checked: false },
    { type: "todo", text: "In bed by 23:00", checked: false },
    { type: "divider" },
    {
      type: "quote",
      text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    },
  ]);

  const training = s.page({
    parent: health,
    title: "Training Plan",
    icon: "🏋️",
  });
  s.blocks(training, [
    { type: "heading3", text: "Week shape" },
    { type: "bulleted", text: "Monday — push, 45 minutes, no more" },
    { type: "bulleted", text: "Wednesday — pull, same" },
    { type: "bulleted", text: "Saturday — long walk or the hill loop" },
    { type: "heading3", text: "The lifts" },
    { type: "numbered", text: "Bench — 5x5, add 2.5kg when all sets clear" },
    { type: "numbered", text: "Row — 5x5, same rule" },
    { type: "numbered", text: "Squat — 3x8, never to failure" },
    {
      type: "callout",
      text: "Two sessions a week done for a year beats four sessions a week done for a month. It is not close.",
    },
  ]);

  const sleep = s.page({ parent: health, title: "Sleep Log", icon: "😴" });
  s.blocks(sleep, [
    {
      type: "paragraph",
      text: "Kept for a fortnight to find the pattern, not forever. The pattern was obvious by day four.",
    },
    { type: "bulleted", text: "Screens after 22:30 cost about forty minutes" },
    { type: "bulleted", text: "Coffee after 14:00 costs the same again" },
    {
      type: "bulleted",
      text: "A walk before dinner is worth more than either",
    },
    {
      type: "quote",
      text: "Sleep is the intervention. Everything else is a supplement.",
    },
  ]);

  seedWork(s);
  seedLearning(s);

  const archive = s.page({ title: "Archivo", icon: "🗄️" });
  s.blocks(archive, [
    {
      type: "paragraph",
      text: "Terminado, abandonado o simplemente acabado. Guardado porque borrarlo perdería el razonamiento.",
    },
  ]);

  const retro = s.page({
    parent: archive,
    title: "2025 en retrospectiva",
    icon: "🧾",
  });
  s.blocks(retro, [
    { type: "heading2", text: "Lo que funcionó" },
    { type: "bulleted", text: "Writing monthly instead of weekly" },
    {
      type: "bulleted",
      text: "One trip planned properly, not three planned badly",
    },
    { type: "heading2", text: "Lo que no funcionó" },
    { type: "bulleted", text: "Three note apps, none of them trusted" },
    {
      type: "bulleted",
      text: "Buying tools before finishing the last project",
    },
    { type: "divider" },
    {
      type: "callout",
      text: "The whole year in one line: fewer things, finished.",
    },
  ]);
}

function seedWork(s: Seeder): void {
  const work = s.page({ title: "Trabajo", icon: "💼" });
  s.blocks(work, [
    { type: "heading1", text: "Work" },
    {
      type: "paragraph",
      text: "Everything that has a deadline someone else set. Tasks live in the database below; thinking lives on its own page.",
    },
    {
      type: "callout",
      text: "Rule: if it takes two minutes, it never becomes a task.",
    },
  ]);

  const review = s.page({ parent: work, title: "Weekly Review", icon: "🔁" });
  s.blocks(review, [
    { type: "heading2", text: "Friday, thirty minutes" },
    { type: "numbered", text: "Empty the inbox to zero, or to a task" },
    { type: "numbered", text: "Close anything that shipped" },
    { type: "numbered", text: "Move what slipped, and say why in one line" },
    { type: "numbered", text: "Pick the one thing that matters next week" },
    { type: "divider" },
    { type: "heading3", text: "Esta semana" },
    { type: "todo", text: "Rollout plan sent to the client", checked: true },
    { type: "todo", text: "Interview notes written up", checked: true },
    { type: "todo", text: "Borrador de presupuesto Q4", checked: false },
    {
      type: "quote",
      text: "A week reviewed is a week you can remember. The rest is a blur with meetings in it.",
    },
  ]);

  const directory = s.page({
    parent: work,
    title: "Who Does What",
    icon: "👥",
  });
  s.blocks(directory, [
    {
      type: "paragraph",
      text: "Written down because asking twice is worse than writing it once.",
    },
    { type: "bulleted", text: "Anna — platform, owns anything that pages" },
    { type: "bulleted", text: "Marcus — data, and the only one who likes SQL" },
    {
      type: "bulleted",
      text: "Priya — design, reviews every flow before build",
    },
    {
      type: "bulleted",
      text: "Tom — contracts and procurement, slow but exact",
    },
  ]);

  const meetings = s.page({
    parent: work,
    title: "Meeting Notes",
    icon: "📓",
  });
  s.blocks(meetings, [
    {
      type: "paragraph",
      text: "One page per meeting that mattered. Anything without a decision in it does not get a page.",
    },
    { type: "heading3", text: "Format" },
    { type: "bulleted", text: "Decision — one line, at the top" },
    { type: "bulleted", text: "Owner and date" },
    { type: "bulleted", text: "Everything else, if there is time" },
  ]);

  const kickoff = s.page({
    parent: meetings,
    title: "Platform Kickoff",
    icon: "🚀",
  });
  s.blocks(kickoff, [
    {
      type: "callout",
      text: "Decision: phased rollout, warehouse first. Anna owns it, review in four weeks.",
    },
    { type: "heading3", text: "Notes" },
    {
      type: "paragraph",
      text: "The warehouse team is the only group who will report a problem the day it happens, which is why they go first.",
    },
    { type: "todo", text: "Send the rollout plan", checked: true },
    { type: "todo", text: "Book the four-week review", checked: false },
  ]);

  seedTasks(s, work);
}

function seedTasks(s: Seeder, workId: string): void {
  const dbId = s.page({
    parent: workId,
    title: "Tareas",
    icon: "📋",
    type: "database",
  });
  const status = s.property(dbId, "Estado", "select");
  const st = s.options(status, [
    ["Por hacer", "gray"],
    ["En curso", "blue"],
    ["En espera", "amber"],
    ["Hecho", "green"],
  ]);
  const priority = s.property(dbId, "Prioridad", "select");
  const pr = s.options(priority, [
    ["Alta", "red"],
    ["Media", "amber"],
    ["Baja", "gray"],
  ]);
  const area = s.property(dbId, "Área", "multi_select");
  const ar = s.options(area, [
    ["Cliente", "orange"],
    ["Trabajo profundo", "purple"],
    ["Admin", "teal"],
    ["Contratación", "pink"],
  ]);
  const due = s.property(dbId, "Vence", "date");
  const hours = s.property(dbId, "Estimación (h)", "number");
  const recurring = s.property(dbId, "Recurrente", "checkbox");
  const brief = s.property(dbId, "Enlace", "url");

  const rollout = s.row(dbId, "Plan de despliegue en almacén", {
    [status]: st["En curso"],
    [priority]: pr.Alta,
    [area]: [ar.Cliente, ar["Trabajo profundo"]],
    [due]: "2026-08-21",
    [hours]: 6,
    [recurring]: false,
    [brief]: "https://wiki.internal/rollout",
  });
  s.blocks(rollout, [
    { type: "heading3", text: "Shape" },
    { type: "numbered", text: "Warehouse, two weeks, watch the error rate" },
    { type: "numbered", text: "Stores, once warehouse is quiet" },
    { type: "numbered", text: "Everyone else, same day" },
    { type: "callout", text: "No rollout on a Friday. Ever." },
  ]);
  s.row(dbId, "Borrador de presupuesto Q4", {
    [status]: st["En curso"],
    [priority]: pr.Alta,
    [area]: [ar.Admin],
    [due]: "2026-08-28",
    [hours]: 4,
    [recurring]: false,
  });
  s.row(dbId, "Interview loop for the data role", {
    [status]: st["En espera"],
    [priority]: pr.Media,
    [area]: [ar.Contratación],
    [due]: "2026-09-04",
    [hours]: 3,
    [recurring]: false,
    [brief]: "https://wiki.internal/hiring-loop",
  });
  s.row(dbId, "Rewrite the onboarding doc", {
    [status]: st["Por hacer"],
    [priority]: pr.Media,
    [area]: [ar["Trabajo profundo"]],
    [hours]: 5,
    [recurring]: false,
  });
  s.row(dbId, "Renew the SSL certificate", {
    [status]: st["Por hacer"],
    [priority]: pr.Alta,
    [area]: [ar.Admin],
    [due]: "2026-09-12",
    [hours]: 1,
    [recurring]: true,
  });
  const invoices = s.row(dbId, "Chase the open invoices", {
    [status]: st["En espera"],
    [priority]: pr.Media,
    [area]: [ar.Admin, ar.Cliente],
    [due]: "2026-08-18",
    [hours]: 1,
    [recurring]: true,
  });
  s.blocks(invoices, [
    { type: "todo", text: "Northwind — 30 days over", checked: false },
    { type: "todo", text: "Cobalt — paid, close it", checked: true },
    {
      type: "paragraph",
      text: "Both were sent to the wrong address. Fix the template, not the invoices.",
    },
  ]);
  s.row(dbId, "Client review deck", {
    [status]: st["Por hacer"],
    [priority]: pr.Baja,
    [area]: [ar.Cliente],
    [due]: "2026-09-25",
    [hours]: 3,
    [recurring]: false,
  });
  s.row(dbId, "Archive the 2025 project folders", {
    [status]: st["Por hacer"],
    [priority]: pr.Baja,
    [area]: [ar.Admin],
    [hours]: 2,
    [recurring]: false,
  });
  s.row(dbId, "Revisión semanal", {
    [status]: st.Hecho,
    [priority]: pr.Media,
    [area]: [ar.Admin],
    [due]: "2026-08-14",
    [hours]: 0.5,
    [recurring]: true,
  });
  s.row(dbId, "Migrate the reporting job", {
    [status]: st.Hecho,
    [priority]: pr.Alta,
    [area]: [ar["Trabajo profundo"]],
    [due]: "2026-08-07",
    [hours]: 8,
    [recurring]: false,
  });
  s.row(dbId, "Pick the analytics vendor", {
    [status]: st.Hecho,
    [priority]: pr.Media,
    [area]: [ar.Cliente, ar.Admin],
    [due]: "2026-07-31",
    [hours]: 4,
    [recurring]: false,
    [brief]: "https://wiki.internal/analytics-shortlist",
  });

  s.view(dbId, "board", { groupBy: status });
  s.view(dbId, "table", { sort: { propertyId: due, direction: "asc" } });
  s.view(dbId, "list", {
    filters: [{ propertyId: status, operator: "is_not", value: st.Hecho }],
  });
}

function seedLearning(s: Seeder): void {
  const learning = s.page({ title: "Aprendizaje", icon: "🎓" });
  s.blocks(learning, [
    {
      type: "paragraph",
      text: "One thing at a time, finished before the next one starts. Notes here, progress in the course log.",
    },
    {
      type: "quote",
      text: "You do not know a subject until you can teach the awkward parts.",
    },
  ]);

  const rust = s.page({ parent: learning, title: "Rust Notes", icon: "🦀" });
  s.blocks(rust, [
    { type: "heading2", text: "Ownership, finally" },
    {
      type: "paragraph",
      text: "The borrow checker is not stopping you writing the program. It is stopping you writing the bug you were about to write.",
    },
    {
      type: "code",
      text: "fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {\n    if a.len() > b.len() { a } else { b }\n}",
    },
    { type: "heading3", text: "Things that keep catching me" },
    { type: "bulleted", text: "A move is not a copy, and Clone is not free" },
    { type: "bulleted", text: "&mut is exclusive, not just mutable" },
    {
      type: "bulleted",
      text: "Lifetimes describe the code, they do not change it",
    },
    {
      type: "callout",
      text: "When the compiler and I disagree, the compiler is right and the design is wrong.",
    },
  ]);

  const shortcuts = s.page({
    parent: learning,
    title: "Shortcuts Worth Learning",
    icon: "⌨️",
  });
  s.blocks(shortcuts, [
    { type: "heading3", text: "Terminal" },
    { type: "bulleted", text: "Ctrl-R — search the history, always" },
    { type: "bulleted", text: "Ctrl-A / Ctrl-E — line start and end" },
    { type: "heading3", text: "Editor" },
    {
      type: "bulleted",
      text: "Multi-cursor beats find and replace for structure",
    },
    { type: "bulleted", text: "Go to symbol, never scroll to find a function" },
    {
      type: "todo",
      text: "Stop reaching for the mouse to switch tabs",
      checked: false,
    },
  ]);

  seedCourseLog(s, learning);
}

function seedCourseLog(s: Seeder, learningId: string): void {
  const dbId = s.page({
    parent: learningId,
    title: "Registro de cursos",
    icon: "🎧",
    type: "database",
  });
  const status = s.property(dbId, "Estado", "select");
  const st = s.options(status, [
    ["Wishlist", "gray"],
    ["Watching", "blue"],
    ["Finished", "green"],
    ["Abandoned", "red"],
  ]);
  const source = s.property(dbId, "Source", "text");
  const topics = s.property(dbId, "Topics", "multi_select");
  const tp = s.options(topics, [
    ["Systems", "teal"],
    ["Language", "purple"],
    ["Design", "pink"],
    ["Music", "orange"],
  ]);
  const hours = s.property(dbId, "Hours", "number");
  const started = s.property(dbId, "Started", "date");
  const finished = s.property(dbId, "Certificate", "checkbox");
  const link = s.property(dbId, "Link", "url");

  const rustCourse = s.row(dbId, "Rust in Practice", {
    [source]: "Recorded lectures",
    [status]: st.Watching,
    [topics]: [tp.Language, tp.Systems],
    [hours]: 18,
    [started]: "2026-07-06",
    [finished]: false,
    [link]: "https://doc.rust-lang.org/book/",
  });
  s.blocks(rustCourse, [
    {
      type: "paragraph",
      text: "Two chapters a week, exercises done properly. Notes go to the Rust page rather than in here.",
    },
    { type: "todo", text: "Chapter 10 — generics and traits", checked: true },
    {
      type: "todo",
      text: "Chapter 13 — closures and iterators",
      checked: false,
    },
  ]);
  s.row(dbId, "Designing Data-Intensive Systems", {
    [source]: "University series",
    [status]: st.Watching,
    [topics]: [tp.Systems],
    [hours]: 24,
    [started]: "2026-06-01",
    [finished]: false,
  });
  s.row(dbId, "Typography for Screens", {
    [source]: "Workshop, two days",
    [status]: st.Finished,
    [topics]: [tp.Design],
    [hours]: 12,
    [started]: "2026-03-10",
    [finished]: true,
    [link]: "https://practicaltypography.com",
  });
  s.row(dbId, "Jazz Piano Fundamentals", {
    [source]: "Weekly lesson",
    [status]: st.Watching,
    [topics]: [tp.Music],
    [hours]: 40,
    [started]: "2026-01-08",
    [finished]: false,
  });
  s.row(dbId, "Kubernetes the Hard Way", {
    [source]: "Self-paced",
    [status]: st.Abandoned,
    [topics]: [tp.Systems],
    [hours]: 6,
    [started]: "2026-02-14",
    [finished]: false,
  });
  s.row(dbId, "Colour and Contrast", {
    [source]: "Reading group",
    [status]: st.Wishlist,
    [topics]: [tp.Design],
    [finished]: false,
  });
  s.row(dbId, "Compilers, from Scratch", {
    [source]: "Book plus exercises",
    [status]: st.Wishlist,
    [topics]: [tp.Language, tp.Systems],
    [hours]: 30,
    [finished]: false,
  });

  s.view(dbId, "table", { sort: { propertyId: hours, direction: "desc" } });
  s.view(dbId, "board", { groupBy: status });
  s.view(dbId, "list", {
    filters: [{ propertyId: status, operator: "is", value: st.Watching }],
  });
}

function seedReadingList(s: Seeder): void {
  const dbId = s.page({
    title: "Lista de lectura",
    icon: "📚",
    type: "database",
  });
  const author = s.property(dbId, "Author", "text");
  const status = s.property(dbId, "Estado", "select");
  const st = s.options(status, [
    ["To read", "amber"],
    ["Reading", "blue"],
    ["Finished", "green"],
  ]);
  const genre = s.property(dbId, "Genre", "multi_select");
  const g = s.options(genre, [
    ["Sci-fi", "purple"],
    ["Non-fiction", "teal"],
    ["Classic", "brown"],
    ["Fantasy", "pink"],
    ["Essays", "orange"],
  ]);
  const rating = s.property(dbId, "Rating", "number");
  const finished = s.property(dbId, "Finished on", "date");
  const owned = s.property(dbId, "Owned", "checkbox");
  const link = s.property(dbId, "Link", "url");

  const dune = s.row(dbId, "Dune", {
    [author]: "Frank Herbert",
    [status]: st.Finished,
    [genre]: [g["Sci-fi"], g.Classic],
    [rating]: 4.5,
    [finished]: "2026-03-02",
    [owned]: true,
    [link]: "https://en.wikipedia.org/wiki/Dune_(novel)",
  });
  s.blocks(dune, [
    { type: "quote", text: "Fear is the mind-killer." },
    {
      type: "paragraph",
      text: "Slower than remembered, better than expected. The dinner-party politics land harder at forty than they did at twenty.",
    },
  ]);

  s.row(dbId, "Project Hail Mary", {
    [author]: "Andy Weir",
    [status]: st.Finished,
    [genre]: [g["Sci-fi"]],
    [rating]: 4,
    [finished]: "2026-05-11",
    [owned]: false,
    [link]: "https://en.wikipedia.org/wiki/Project_Hail_Mary",
  });
  s.row(dbId, "The Making of the Atomic Bomb", {
    [author]: "Richard Rhodes",
    [status]: st.Reading,
    [genre]: [g["Non-fiction"]],
    [owned]: true,
    [link]: "https://en.wikipedia.org/wiki/The_Making_of_the_Atomic_Bomb",
  });
  const weeks = s.row(dbId, "Four Thousand Weeks", {
    [author]: "Oliver Burkeman",
    [status]: st.Finished,
    [genre]: [g["Non-fiction"], g.Essays],
    [rating]: 5,
    [finished]: "2026-01-20",
    [owned]: true,
  });
  s.blocks(weeks, [
    {
      type: "callout",
      text: "Re-read every January. The chapter on settling is the whole book.",
    },
  ]);
  s.row(dbId, "Piranesi", {
    [author]: "Susanna Clarke",
    [status]: st["To read"],
    [genre]: [g.Fantasy],
    [owned]: false,
  });
  s.row(dbId, "The Left Hand of Darkness", {
    [author]: "Ursula K. Le Guin",
    [status]: st["To read"],
    [genre]: [g["Sci-fi"], g.Classic],
    [owned]: true,
  });
  s.row(dbId, "Middlemarch", {
    [author]: "George Eliot",
    [status]: st["To read"],
    [genre]: [g.Classic],
    [owned]: false,
  });
  s.row(dbId, "Slow Productivity", {
    [author]: "Cal Newport",
    [status]: st.Reading,
    [genre]: [g["Non-fiction"]],
    [rating]: 3.5,
    [owned]: false,
    [link]: "https://calnewport.com/books/slow-productivity/",
  });

  const wolf = s.row(dbId, "Wolf Hall", {
    [author]: "Hilary Mantel",
    [status]: st.Finished,
    [genre]: [g.Classic],
    [rating]: 4.5,
    [finished]: "2026-02-14",
    [owned]: true,
  });
  s.blocks(wolf, [
    {
      type: "paragraph",
      text: "Took eighty pages to work out who 'he' is, and then it was the best thing read all year.",
    },
  ]);
  s.row(dbId, "The Dispossessed", {
    [author]: "Ursula K. Le Guin",
    [status]: st.Reading,
    [genre]: [g["Sci-fi"], g.Classic],
    [owned]: true,
  });
  s.row(dbId, "Thinking in Systems", {
    [author]: "Donella Meadows",
    [status]: st.Finished,
    [genre]: [g["Non-fiction"]],
    [rating]: 4,
    [finished]: "2026-04-08",
    [owned]: false,
    [link]: "https://en.wikipedia.org/wiki/Donella_Meadows",
  });
  s.row(dbId, "A Wizard of Earthsea", {
    [author]: "Ursula K. Le Guin",
    [status]: st["To read"],
    [genre]: [g.Fantasy, g.Classic],
    [owned]: true,
  });
  s.row(dbId, "The Idea Factory", {
    [author]: "Jon Gertner",
    [status]: st["To read"],
    [genre]: [g["Non-fiction"]],
    [owned]: false,
  });
  s.row(dbId, "Consider the Lobster", {
    [author]: "David Foster Wallace",
    [status]: st.Reading,
    [genre]: [g.Essays],
    [rating]: 4,
    [owned]: true,
  });
  s.row(dbId, "Station Eleven", {
    [author]: "Emily St. John Mandel",
    [status]: st.Finished,
    [genre]: [g["Sci-fi"]],
    [rating]: 4.5,
    [finished]: "2025-12-29",
    [owned]: false,
  });

  s.view(dbId, "table", { sort: { propertyId: rating, direction: "desc" } });
  s.view(dbId, "list", {
    filters: [{ propertyId: status, operator: "is", value: st["To read"] }],
  });
  s.view(dbId, "board", { groupBy: status });
}

function seedTripPlanner(s: Seeder, travelId: string): void {
  const dbId = s.page({
    parent: travelId,
    title: "Planificador de viajes",
    icon: "🧭",
    type: "database",
  });
  const status = s.property(dbId, "Estado", "select");
  const st = s.options(status, [
    ["Dreaming", "gray"],
    ["Planning", "blue"],
    ["Booked", "green"],
    ["Done", "purple"],
  ]);
  const region = s.property(dbId, "Region", "select");
  const rg = s.options(region, [
    ["Europe", "teal"],
    ["Asia", "pink"],
    ["Americas", "orange"],
  ]);
  const vibes = s.property(dbId, "Vibes", "multi_select");
  const vb = s.options(vibes, [
    ["Food", "amber"],
    ["Hiking", "green"],
    ["Culture", "purple"],
    ["Beach", "blue"],
  ]);
  const budget = s.property(dbId, "Budget", "number");
  const depart = s.property(dbId, "Depart", "date");
  const flights = s.property(dbId, "Flights booked", "checkbox");
  const guide = s.property(dbId, "Guide", "url");

  const japan = s.row(dbId, "Japan, ten days", {
    [status]: st.Booked,
    [region]: rg.Asia,
    [vibes]: [vb.Food, vb.Culture],
    [budget]: 4800,
    [depart]: "2026-10-14",
    [flights]: true,
    [guide]: "https://japan-guide.com",
  });
  s.blocks(japan, [
    {
      type: "paragraph",
      text: "Flights on points, ryokan paid. Ground plan lives in the Japón 2026 page.",
    },
    { type: "todo", text: "Reserve the cedar-bath ryokan", checked: true },
    { type: "todo", text: "Activate rail pass on day 2", checked: false },
  ]);
  s.row(dbId, "Lisbon long weekend", {
    [status]: st.Planning,
    [region]: rg.Europe,
    [vibes]: [vb.Food, vb.Beach],
    [budget]: 900,
    [depart]: "2026-09-05",
    [flights]: false,
  });
  s.row(dbId, "Dolomites hut to hut", {
    [status]: st.Dreaming,
    [region]: rg.Europe,
    [vibes]: [vb.Hiking],
    [budget]: 1500,
    [flights]: false,
    [guide]: "https://www.alta-badia.org",
  });
  s.row(dbId, "Mexico City", {
    [status]: st.Dreaming,
    [region]: rg.Americas,
    [vibes]: [vb.Food, vb.Culture],
    [budget]: 1700,
    [flights]: false,
  });
  s.row(dbId, "Scottish Highlands", {
    [status]: st.Hecho,
    [region]: rg.Europe,
    [vibes]: [vb.Hiking],
    [budget]: 700,
    [depart]: "2026-04-18",
    [flights]: true,
  });

  s.view(dbId, "board", { groupBy: status });
  s.view(dbId, "table", { sort: { propertyId: depart, direction: "asc" } });
}

function seedProjectTracker(s: Seeder, projectsId: string): void {
  const dbId = s.page({
    parent: projectsId,
    title: "Seguimiento de proyectos",
    icon: "🎯",
    type: "database",
  });
  const status = s.property(dbId, "Estado", "select");
  const st = s.options(status, [
    ["Backlog", "gray"],
    ["In progress", "blue"],
    ["Blocked", "red"],
    ["Shipped", "green"],
  ]);
  const owner = s.property(dbId, "Owner", "text");
  const tags = s.property(dbId, "Tags", "multi_select");
  const tg = s.options(tags, [
    ["hardware", "orange"],
    ["software", "blue"],
    ["writing", "purple"],
    ["home", "teal"],
  ]);
  const effort = s.property(dbId, "Effort (days)", "number");
  const due = s.property(dbId, "Vence", "date");
  const funded = s.property(dbId, "Budgeted", "checkbox");
  const spec = s.property(dbId, "Spec", "url");

  const migrate = s.row(dbId, "Migrate home lab services", {
    [status]: st["In progress"],
    [owner]: "Ed",
    [tags]: [tg.hardware, tg.software],
    [effort]: 6,
    [due]: "2026-08-30",
    [funded]: true,
    [spec]: "https://wiki.internal/homelab-plan",
  });
  s.blocks(migrate, [
    { type: "heading3", text: "Order of operations" },
    { type: "numbered", text: "DNS and reverse proxy last" },
    { type: "numbered", text: "Media server first, nobody notices downtime" },
    { type: "callout", text: "Snapshot before every move." },
  ]);
  s.row(dbId, "Drip irrigation for the balcony", {
    [status]: st.Shipped,
    [owner]: "Ed",
    [tags]: [tg.home],
    [effort]: 2,
    [due]: "2026-05-15",
    [funded]: true,
  });
  s.row(dbId, "Slow tools essay", {
    [status]: st["In progress"],
    [owner]: "Ed",
    [tags]: [tg.writing],
    [effort]: 3,
    [due]: "2026-07-31",
    [funded]: false,
  });
  s.row(dbId, "E-ink hallway dashboard", {
    [status]: st.Backlog,
    [owner]: "Ed",
    [tags]: [tg.hardware, tg.software],
    [effort]: 5,
    [funded]: false,
  });
  s.row(dbId, "Fix the wobbly bookshelf", {
    [status]: st.Blocked,
    [owner]: "Anna",
    [tags]: [tg.home],
    [effort]: 1,
    [funded]: false,
  });
  const restore = s.row(dbId, "Bike restoration", {
    [status]: st["In progress"],
    [owner]: "Ed",
    [tags]: [tg.hardware, tg.home],
    [effort]: 8,
    [due]: "2026-10-04",
    [funded]: true,
  });
  s.blocks(restore, [
    {
      type: "paragraph",
      text: "Frame and hubs done. Cables next, then a decision about the shifters.",
    },
  ]);
  s.row(dbId, "Sourdough schedule that survives a work week", {
    [status]: st.Shipped,
    [owner]: "Ed",
    [tags]: [tg.home, tg.writing],
    [effort]: 2,
    [due]: "2026-06-20",
    [funded]: false,
  });
  s.row(dbId, "Photo backup, offsite copy", {
    [status]: st.Backlog,
    [owner]: "Ed",
    [tags]: [tg.software],
    [effort]: 3,
    [funded]: false,
  });
  s.row(dbId, "Replace the hallway light switch", {
    [status]: st.Blocked,
    [owner]: "Ed",
    [tags]: [tg.home],
    [effort]: 1,
    [due]: "2026-09-06",
    [funded]: true,
  });

  s.view(dbId, "board", { groupBy: status });
  s.view(dbId, "table", { sort: { propertyId: due, direction: "asc" } });
  s.view(dbId, "list", {
    filters: [{ propertyId: status, operator: "is_not", value: st.Shipped }],
  });
}
