import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB } from "../utils/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

const CALENDAR_URL =
  process.env.F1_CALENDAR_URL ||
  "https://ics.ecal.com/ecal-sub/69f5bd491fd9b300028fc9f6/Formula%201.ics";

const raceMatchers: Array<[RegExp, string]> = [
  [/MIAMI GRAND PRIX/, "miami-2026"],
  [/AZERBAIJAN GRAND PRIX/, "azerbaijan-2026"],
  [/QATAR GRAND PRIX/, "qatar-2026"],
  [/HUNGARIAN GRAND PRIX/, "hungary-2026"],
  [/DUTCH GRAND PRIX/, "dutch-2026"],
  [/AUSTRIAN GRAND PRIX/, "austria-2026"],
  [/BELGIAN GRAND PRIX/, "belgium-2026"],
  [/GRAND PRIX DU CANADA/, "canada-2026"],
  [/SINGAPORE GRAND PRIX/, "singapore-2026"],
  [/GRAND PRIX DE MONACO/, "monaco-2026"],
  [/UNITED STATES GRAND PRIX/, "usa-2026"],
  [/GRAN PREMIO D ITALIA/, "italy-2026"],
  [/BRITISH GRAND PRIX/, "britain-2026"],
  [/GRAN PREMIO DE BARCELONA CATALUNYA/, "spain-2026"],
  [/GRAN PREMIO DE ESPANA/, "madrid-2026"],
  [/GRAN PREMIO DE LA CIUDAD DE MEXICO/, "mexico-2026"],
  [/SPANISH GRAND PRIX/, "spain-2026"],
  [/MADRID GRAND PRIX/, "madrid-2026"],
  [/MEXICO CITY GRAND PRIX/, "mexico-2026"],
  [/SAO PAULO GRAND PRIX/, "brazil-2026"],
  [/LAS VEGAS GRAND PRIX/, "vegas-2026"],
  [/ABU DHABI GRAND PRIX/, "abudhabi-2026"],
];

interface CalendarEvent {
  summary: string;
  location: string;
  startsAt: string;
}

interface RaceUpdate {
  raceId: string;
  qualifyingStartTime?: string;
  sprintQualifyingStartTime?: string;
  raceStartTime?: string;
  sprintWeekend: boolean;
}

function unfoldIcs(content: string) {
  return content.replace(/\r?\n[ \t]/g, "");
}

function parseDate(value: string) {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) throw new Error(`Unsupported DTSTART format: ${value}`);
  const [, year, month, day, hour, minute, second] = match;
  return new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second)).toISOString();
}

function parseEvents(content: string): CalendarEvent[] {
  return unfoldIcs(content)
    .split("BEGIN:VEVENT")
    .slice(1)
    .map((block) => block.split("END:VEVENT")[0])
    .map((block) => {
      const field = (name: string) => block.match(new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, "m"))?.[1]?.trim() || "";
      return {
        summary: field("SUMMARY"),
        location: field("LOCATION"),
        startsAt: field("DTSTART"),
      };
    })
    .filter(
      (event) =>
        (event.summary.includes("GRAND PRIX") || event.summary.includes("GRAN PREMIO")) &&
        !!event.startsAt
    );
}

function getRaceId(summary: string) {
  const clean = summary
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .toUpperCase();

  for (const [matcher, raceId] of raceMatchers) {
    if (matcher.test(clean)) return raceId;
  }

  return null;
}

function buildUpdates(events: CalendarEvent[]): RaceUpdate[] {
  const updates = new Map<string, RaceUpdate>();

  for (const event of events) {
    const raceId = getRaceId(event.summary);
    if (!raceId) {
      console.warn(`Skipping unrecognized event: ${event.summary}`);
      continue;
    }

    const update = updates.get(raceId) || { raceId, sprintWeekend: false };
    const startsAt = parseDate(event.startsAt);

    if (/Sprint Qualification/i.test(event.summary)) {
      update.sprintQualifyingStartTime = startsAt;
      update.sprintWeekend = true;
    } else if (/Qualifying/i.test(event.summary)) {
      update.qualifyingStartTime = startsAt;
    } else if (/Sprint Race/i.test(event.summary)) {
      update.sprintWeekend = true;
    } else if (/\s-\sRace$/i.test(event.summary)) {
      update.raceStartTime = startsAt;
    }

    updates.set(raceId, update);
  }

  return [...updates.values()].filter((update) => update.qualifyingStartTime && update.raceStartTime);
}

async function main() {
  const response = await fetch(CALENDAR_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch calendar: ${response.status} ${response.statusText}`);
  }

  const content = await response.text();
  const events = parseEvents(content);
  const updates = buildUpdates(events);

  const db = await connectDB();
  const racesCollection = db.collection("races");

  for (const update of updates) {
    const result = await racesCollection.updateOne(
      { raceId: update.raceId },
      {
        $set: {
          qualifyingStartTime: update.qualifyingStartTime,
          raceStartTime: update.raceStartTime,
          sprintWeekend: update.sprintWeekend,
          sprintQualifyingStartTime: update.sprintQualifyingStartTime || null,
          updatedAt: new Date(),
        },
      }
    );

    console.log(
      `${result.matchedCount ? "Updated" : "Missing"} ${update.raceId}: quali=${update.qualifyingStartTime}, sprintQuali=${update.sprintQualifyingStartTime || "none"}, race=${update.raceStartTime}`
    );
  }

  console.log(`Imported ${updates.length} race timing updates from ECAL.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
