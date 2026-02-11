export interface Driver {
  id: string;
  name: string;
  team: string;
  number: number;
  country: string;
  countryFlag: string;
  teamColor: string;
}

export const drivers: Driver[] = [
  { id: "ver", name: "Max Verstappen", team: "Red Bull Racing", number: 1, country: "Netherlands", countryFlag: "🇳🇱", teamColor: "#1E41FF" },
  { id: "per", name: "Sergio Pérez", team: "Red Bull Racing", number: 11, country: "Mexico", countryFlag: "🇲🇽", teamColor: "#1E41FF" },
  { id: "lec", name: "Charles Leclerc", team: "Ferrari", number: 16, country: "Monaco", countryFlag: "🇲🇨", teamColor: "#DC0000" },
  { id: "ham", name: "Lewis Hamilton", team: "Ferrari", number: 44, country: "Great Britain", countryFlag: "🇬🇧", teamColor: "#DC0000" },
  { id: "nor", name: "Lando Norris", team: "McLaren", number: 4, country: "Great Britain", countryFlag: "🇬🇧", teamColor: "#FF8700" },
  { id: "pia", name: "Oscar Piastri", team: "McLaren", number: 81, country: "Australia", countryFlag: "🇦🇺", teamColor: "#FF8700" },
  { id: "rus", name: "George Russell", team: "Mercedes", number: 63, country: "Great Britain", countryFlag: "🇬🇧", teamColor: "#00D2BE" },
  { id: "ant", name: "Kimi Antonelli", team: "Mercedes", number: 12, country: "Italy", countryFlag: "🇮🇹", teamColor: "#00D2BE" },
  { id: "alo", name: "Fernando Alonso", team: "Aston Martin", number: 14, country: "Spain", countryFlag: "🇪🇸", teamColor: "#006F62" },
  { id: "str", name: "Lance Stroll", team: "Aston Martin", number: 18, country: "Canada", countryFlag: "🇨🇦", teamColor: "#006F62" },
  { id: "gas", name: "Pierre Gasly", team: "Alpine", number: 10, country: "France", countryFlag: "🇫🇷", teamColor: "#0090FF" },
  { id: "doo", name: "Jack Doohan", team: "Alpine", number: 7, country: "Australia", countryFlag: "🇦🇺", teamColor: "#0090FF" },
  { id: "tsu", name: "Yuki Tsunoda", team: "RB", number: 22, country: "Japan", countryFlag: "🇯🇵", teamColor: "#6692FF" },
  { id: "had", name: "Isack Hadjar", team: "RB", number: 21, country: "France", countryFlag: "🇫🇷", teamColor: "#6692FF" },
  { id: "hul", name: "Nico Hülkenberg", team: "Sauber", number: 27, country: "Germany", countryFlag: "🇩🇪", teamColor: "#52E252" },
  { id: "bor", name: "Gabriel Bortoleto", team: "Sauber", number: 5, country: "Brazil", countryFlag: "🇧🇷", teamColor: "#52E252" },
  { id: "alb", name: "Alexander Albon", team: "Williams", number: 23, country: "Thailand", countryFlag: "🇹🇭", teamColor: "#005AFF" },
  { id: "sai", name: "Carlos Sainz", team: "Williams", number: 55, country: "Spain", countryFlag: "🇪🇸", teamColor: "#005AFF" },
  { id: "oco", name: "Esteban Ocon", team: "Haas", number: 31, country: "France", countryFlag: "🇫🇷", teamColor: "#B6BABD" },
  { id: "bea", name: "Oliver Bearman", team: "Haas", number: 87, country: "Great Britain", countryFlag: "🇬🇧", teamColor: "#B6BABD" },
];

export const getDriverById = (id: string) => drivers.find((d) => d.id === id);
export const getDriverByName = (name: string) => drivers.find((d) => d.name === name);
