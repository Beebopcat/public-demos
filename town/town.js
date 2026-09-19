/* Sample-only Town data. No live agents, IDs, or private tasks. */
const residents = [
  { name: "Mayor Rowan", role: "Orchestrator", status: "ok", blurb: "Splits goals into missions and checks handoffs." },
  { name: "Archivist Quill", role: "Context librarian", status: "ok", blurb: "Keeps sample lore cards short and source-backed." },
  { name: "Smithy Byte", role: "Builder", status: "busy", blurb: "Turns accepted plans into small, reviewable patches." },
  { name: "Scout Lantern", role: "Researcher", status: "ok", blurb: "Fetches public docs and marks uncertainty clearly." },
  { name: "Warden Gate", role: "Reviewer", status: "ok", blurb: "Challenges overlap with the fixed stack before merge." }
];

const missionPool = [
  ["Document sample permission exercise outcomes", "Archivist Quill", "ready"],
  ["Draft Town UI layout for public demo", "Smithy Byte", "in progress"],
  ["Verify public README links resolve", "Scout Lantern", "ready"],
  ["Reject live-data leaks in showcase copy", "Warden Gate", "done"],
  ["Schedule next sample mission board refresh", "Mayor Rowan", "queued"],
  ["Write fictional lore card: Greenhouse Archive", "Archivist Quill", "queued"],
  ["Compare sample tools without replacing fixed stack", "Warden Gate", "ready"]
];

function chip(status) {
  const cls = status === "busy" || status === "in progress" ? "busy" : status === "done" || status === "ok" ? "ok" : "";
  return `<span class="chip ${cls}">${status}</span>`;
}

function renderResidents() {
  const root = document.getElementById("residents");
  root.innerHTML = residents.map(r => `
    <article class="card" style="cursor:default">
      <h2>${r.name}</h2>
      <p><span class="chip">${r.role}</span> ${chip(r.status)}</p>
      <p>${r.blurb}</p>
    </article>`).join("");
}

function pickMissions() {
  const shuffled = [...missionPool].sort(() => Math.random() - 0.5).slice(0, 5);
  const body = document.getElementById("missions");
  body.innerHTML = shuffled.map(([m, o, s]) =>
    `<tr><td>${m}</td><td>${o}</td><td>${chip(s)}</td></tr>`
  ).join("");
  const log = document.getElementById("log");
  const stamp = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  log.textContent = `[${stamp} CT] Sample board refreshed.\nResidents: ${residents.length} fictional.\nNo connection to live agent runtimes.`;
}

document.getElementById("shuffle").addEventListener("click", pickMissions);
renderResidents();
pickMissions();
