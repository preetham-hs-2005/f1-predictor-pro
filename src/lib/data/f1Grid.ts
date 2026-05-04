export interface F1Driver {
  id: string;
  name: string;
  shortName: string;
  number: number;
  team: string;
  country: string;
  countryCode: string;
  teamColor: string;
}

export interface F1Team {
  id: string;
  name: string;
  chassisName: string;
  base: string;
  powerUnit: string;
  teamColor: string;
  drivers: string[];
}

export const f1Teams: F1Team[] = [
  {
    id: "mclaren",
    name: "McLaren",
    chassisName: "McLaren",
    base: "Woking, United Kingdom",
    powerUnit: "Mercedes",
    teamColor: "#FF8700",
    drivers: ["Lando Norris", "Oscar Piastri"],
  },
  {
    id: "mercedes",
    name: "Mercedes",
    chassisName: "Mercedes",
    base: "Brackley, United Kingdom",
    powerUnit: "Mercedes",
    teamColor: "#00D2BE",
    drivers: ["George Russell", "Kimi Antonelli"],
  },
  {
    id: "red-bull",
    name: "Red Bull Racing",
    chassisName: "Red Bull Racing",
    base: "Milton Keynes, United Kingdom",
    powerUnit: "Red Bull Ford",
    teamColor: "#3671C6",
    drivers: ["Max Verstappen", "Isack Hadjar"],
  },
  {
    id: "ferrari",
    name: "Ferrari",
    chassisName: "Ferrari",
    base: "Maranello, Italy",
    powerUnit: "Ferrari",
    teamColor: "#E80020",
    drivers: ["Charles Leclerc", "Lewis Hamilton"],
  },
  {
    id: "williams",
    name: "Williams",
    chassisName: "Williams",
    base: "Grove, United Kingdom",
    powerUnit: "Mercedes",
    teamColor: "#64C4FF",
    drivers: ["Alex Albon", "Carlos Sainz"],
  },
  {
    id: "racing-bulls",
    name: "Racing Bulls",
    chassisName: "Racing Bulls",
    base: "Faenza, Italy",
    powerUnit: "Honda RBPT",
    teamColor: "#6692FF",
    drivers: ["Liam Lawson", "Arvid Lindblad"],
  },
  {
    id: "aston-martin",
    name: "Aston Martin",
    chassisName: "Aston Martin",
    base: "Silverstone, United Kingdom",
    powerUnit: "Honda",
    teamColor: "#229971",
    drivers: ["Fernando Alonso", "Lance Stroll"],
  },
  {
    id: "haas",
    name: "Haas F1 Team",
    chassisName: "Haas",
    base: "Kannapolis, United States",
    powerUnit: "Ferrari",
    teamColor: "#B6BABD",
    drivers: ["Esteban Ocon", "Oliver Bearman"],
  },
  {
    id: "audi",
    name: "Audi",
    chassisName: "Audi",
    base: "Hinwil, Switzerland",
    powerUnit: "Audi",
    teamColor: "#52E252",
    drivers: ["Nico Hulkenberg", "Gabriel Bortoleto"],
  },
  {
    id: "alpine",
    name: "Alpine",
    chassisName: "Alpine",
    base: "Enstone, United Kingdom",
    powerUnit: "Renault",
    teamColor: "#0090FF",
    drivers: ["Pierre Gasly", "Franco Colapinto"],
  },
  {
    id: "cadillac",
    name: "Cadillac",
    chassisName: "Cadillac",
    base: "Fishers, United States",
    powerUnit: "Ferrari",
    teamColor: "#C7A461",
    drivers: ["Valtteri Bottas", "Sergio Perez"],
  },
];

export const f1Drivers: F1Driver[] = [
  { id: "nor", name: "Lando Norris", shortName: "NOR", number: 4, team: "McLaren", country: "Great Britain", countryCode: "GBR", teamColor: "#FF8700" },
  { id: "pia", name: "Oscar Piastri", shortName: "PIA", number: 81, team: "McLaren", country: "Australia", countryCode: "AUS", teamColor: "#FF8700" },
  { id: "rus", name: "George Russell", shortName: "RUS", number: 63, team: "Mercedes", country: "Great Britain", countryCode: "GBR", teamColor: "#00D2BE" },
  { id: "ant", name: "Kimi Antonelli", shortName: "ANT", number: 12, team: "Mercedes", country: "Italy", countryCode: "ITA", teamColor: "#00D2BE" },
  { id: "ver", name: "Max Verstappen", shortName: "VER", number: 1, team: "Red Bull Racing", country: "Netherlands", countryCode: "NED", teamColor: "#3671C6" },
  { id: "had", name: "Isack Hadjar", shortName: "HAD", number: 21, team: "Red Bull Racing", country: "France", countryCode: "FRA", teamColor: "#3671C6" },
  { id: "lec", name: "Charles Leclerc", shortName: "LEC", number: 16, team: "Ferrari", country: "Monaco", countryCode: "MON", teamColor: "#E80020" },
  { id: "ham", name: "Lewis Hamilton", shortName: "HAM", number: 44, team: "Ferrari", country: "Great Britain", countryCode: "GBR", teamColor: "#E80020" },
  { id: "alb", name: "Alex Albon", shortName: "ALB", number: 23, team: "Williams", country: "Thailand", countryCode: "THA", teamColor: "#64C4FF" },
  { id: "sai", name: "Carlos Sainz", shortName: "SAI", number: 55, team: "Williams", country: "Spain", countryCode: "ESP", teamColor: "#64C4FF" },
  { id: "law", name: "Liam Lawson", shortName: "LAW", number: 30, team: "Racing Bulls", country: "New Zealand", countryCode: "NZL", teamColor: "#6692FF" },
  { id: "lin", name: "Arvid Lindblad", shortName: "LIN", number: 41, team: "Racing Bulls", country: "Great Britain", countryCode: "GBR", teamColor: "#6692FF" },
  { id: "alo", name: "Fernando Alonso", shortName: "ALO", number: 14, team: "Aston Martin", country: "Spain", countryCode: "ESP", teamColor: "#229971" },
  { id: "str", name: "Lance Stroll", shortName: "STR", number: 18, team: "Aston Martin", country: "Canada", countryCode: "CAN", teamColor: "#229971" },
  { id: "oco", name: "Esteban Ocon", shortName: "OCO", number: 31, team: "Haas F1 Team", country: "France", countryCode: "FRA", teamColor: "#B6BABD" },
  { id: "bea", name: "Oliver Bearman", shortName: "BEA", number: 87, team: "Haas F1 Team", country: "Great Britain", countryCode: "GBR", teamColor: "#B6BABD" },
  { id: "hul", name: "Nico Hulkenberg", shortName: "HUL", number: 27, team: "Audi", country: "Germany", countryCode: "GER", teamColor: "#52E252" },
  { id: "bor", name: "Gabriel Bortoleto", shortName: "BOR", number: 5, team: "Audi", country: "Brazil", countryCode: "BRA", teamColor: "#52E252" },
  { id: "gas", name: "Pierre Gasly", shortName: "GAS", number: 10, team: "Alpine", country: "France", countryCode: "FRA", teamColor: "#0090FF" },
  { id: "col", name: "Franco Colapinto", shortName: "COL", number: 43, team: "Alpine", country: "Argentina", countryCode: "ARG", teamColor: "#0090FF" },
  { id: "bot", name: "Valtteri Bottas", shortName: "BOT", number: 77, team: "Cadillac", country: "Finland", countryCode: "FIN", teamColor: "#C7A461" },
  { id: "per", name: "Sergio Perez", shortName: "PER", number: 11, team: "Cadillac", country: "Mexico", countryCode: "MEX", teamColor: "#C7A461" },
];
