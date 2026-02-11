export interface RaceWeekend {
  id: string;
  raceName: string;
  circuitName: string;
  country: string;
  countryFlag: string;
  round: number;
  qualifyingStartTime: string;
  raceStartTime: string;
  sprintWeekend: boolean;
  isLocked: boolean;
  isComplete: boolean;
  officialResults: null | { p1: string; p2: string; p3: string; pole: string };
}

export const raceCalendar: RaceWeekend[] = [
  { id: "australia-2026", raceName: "Australian Grand Prix", circuitName: "Albert Park Circuit", country: "Australia", countryFlag: "🇦🇺", round: 1, qualifyingStartTime: "2026-03-07T05:00:00Z", raceStartTime: "2026-03-08T04:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "china-2026", raceName: "Chinese Grand Prix", circuitName: "Shanghai International Circuit", country: "China", countryFlag: "🇨🇳", round: 2, qualifyingStartTime: "2026-03-14T07:00:00Z", raceStartTime: "2026-03-15T07:00:00Z", sprintWeekend: true, isLocked: false, isComplete: false, officialResults: null },
  { id: "japan-2026", raceName: "Japanese Grand Prix", circuitName: "Suzuka Circuit", country: "Japan", countryFlag: "🇯🇵", round: 3, qualifyingStartTime: "2026-03-28T06:00:00Z", raceStartTime: "2026-03-29T05:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "bahrain-2026", raceName: "Bahrain Grand Prix", circuitName: "Bahrain International Circuit", country: "Bahrain", countryFlag: "🇧🇭", round: 4, qualifyingStartTime: "2026-04-11T16:00:00Z", raceStartTime: "2026-04-12T15:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "saudi-2026", raceName: "Saudi Arabian Grand Prix", circuitName: "Jeddah Corniche Circuit", country: "Saudi Arabia", countryFlag: "🇸🇦", round: 5, qualifyingStartTime: "2026-04-18T17:00:00Z", raceStartTime: "2026-04-19T17:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "miami-2026", raceName: "Miami Grand Prix", circuitName: "Miami International Autodrome", country: "USA", countryFlag: "🇺🇸", round: 6, qualifyingStartTime: "2026-05-02T20:00:00Z", raceStartTime: "2026-05-03T20:00:00Z", sprintWeekend: true, isLocked: false, isComplete: false, officialResults: null },
  { id: "canada-2026", raceName: "Canadian Grand Prix", circuitName: "Circuit Gilles Villeneuve", country: "Canada", countryFlag: "🇨🇦", round: 7, qualifyingStartTime: "2026-05-23T20:00:00Z", raceStartTime: "2026-05-24T20:00:00Z", sprintWeekend: true, isLocked: false, isComplete: false, officialResults: null },
  { id: "monaco-2026", raceName: "Monaco Grand Prix", circuitName: "Circuit de Monaco", country: "Monaco", countryFlag: "🇲🇨", round: 8, qualifyingStartTime: "2026-06-06T14:00:00Z", raceStartTime: "2026-06-07T13:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "spain-2026", raceName: "Spanish Grand Prix", circuitName: "Circuit de Barcelona-Catalunya", country: "Spain", countryFlag: "🇪🇸", round: 9, qualifyingStartTime: "2026-06-13T14:00:00Z", raceStartTime: "2026-06-14T13:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "austria-2026", raceName: "Austrian Grand Prix", circuitName: "Red Bull Ring", country: "Austria", countryFlag: "🇦🇹", round: 10, qualifyingStartTime: "2026-06-27T14:00:00Z", raceStartTime: "2026-06-28T13:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "britain-2026", raceName: "British Grand Prix", circuitName: "Silverstone Circuit", country: "Great Britain", countryFlag: "🇬🇧", round: 11, qualifyingStartTime: "2026-07-04T15:00:00Z", raceStartTime: "2026-07-05T14:00:00Z", sprintWeekend: true, isLocked: false, isComplete: false, officialResults: null },
  { id: "belgium-2026", raceName: "Belgian Grand Prix", circuitName: "Spa-Francorchamps", country: "Belgium", countryFlag: "🇧🇪", round: 12, qualifyingStartTime: "2026-07-18T14:00:00Z", raceStartTime: "2026-07-19T13:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "hungary-2026", raceName: "Hungarian Grand Prix", circuitName: "Hungaroring", country: "Hungary", countryFlag: "🇭🇺", round: 13, qualifyingStartTime: "2026-07-25T14:00:00Z", raceStartTime: "2026-07-26T13:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "dutch-2026", raceName: "Dutch Grand Prix", circuitName: "Circuit Zandvoort", country: "Netherlands", countryFlag: "🇳🇱", round: 14, qualifyingStartTime: "2026-08-22T14:00:00Z", raceStartTime: "2026-08-23T13:00:00Z", sprintWeekend: true, isLocked: false, isComplete: false, officialResults: null },
  { id: "italy-2026", raceName: "Italian Grand Prix", circuitName: "Monza Circuit", country: "Italy", countryFlag: "🇮🇹", round: 15, qualifyingStartTime: "2026-09-05T14:00:00Z", raceStartTime: "2026-09-06T13:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "madrid-2026", raceName: "Madrid Grand Prix", circuitName: "Madrid Circuit", country: "Spain", countryFlag: "🇪🇸", round: 16, qualifyingStartTime: "2026-09-12T14:00:00Z", raceStartTime: "2026-09-13T13:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "azerbaijan-2026", raceName: "Azerbaijan Grand Prix", circuitName: "Baku City Circuit", country: "Azerbaijan", countryFlag: "🇦🇿", round: 17, qualifyingStartTime: "2026-09-25T12:00:00Z", raceStartTime: "2026-09-26T11:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "singapore-2026", raceName: "Singapore Grand Prix", circuitName: "Marina Bay Street Circuit", country: "Singapore", countryFlag: "🇸🇬", round: 18, qualifyingStartTime: "2026-10-10T13:00:00Z", raceStartTime: "2026-10-11T12:00:00Z", sprintWeekend: true, isLocked: false, isComplete: false, officialResults: null },
  { id: "usa-2026", raceName: "United States Grand Prix", circuitName: "Circuit of the Americas", country: "USA", countryFlag: "🇺🇸", round: 19, qualifyingStartTime: "2026-10-24T21:00:00Z", raceStartTime: "2026-10-25T20:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "mexico-2026", raceName: "Mexico City Grand Prix", circuitName: "Autódromo Hermanos Rodríguez", country: "Mexico", countryFlag: "🇲🇽", round: 20, qualifyingStartTime: "2026-10-31T21:00:00Z", raceStartTime: "2026-11-01T20:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "brazil-2026", raceName: "São Paulo Grand Prix", circuitName: "Interlagos Circuit", country: "Brazil", countryFlag: "🇧🇷", round: 21, qualifyingStartTime: "2026-11-07T18:00:00Z", raceStartTime: "2026-11-08T17:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "vegas-2026", raceName: "Las Vegas Grand Prix", circuitName: "Las Vegas Street Circuit", country: "USA", countryFlag: "🇺🇸", round: 22, qualifyingStartTime: "2026-11-21T04:00:00Z", raceStartTime: "2026-11-22T04:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "qatar-2026", raceName: "Qatar Grand Prix", circuitName: "Losail International Circuit", country: "Qatar", countryFlag: "🇶🇦", round: 23, qualifyingStartTime: "2026-11-28T18:00:00Z", raceStartTime: "2026-11-29T16:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
  { id: "abudhabi-2026", raceName: "Abu Dhabi Grand Prix", circuitName: "Yas Marina Circuit", country: "Abu Dhabi", countryFlag: "🇦🇪", round: 24, qualifyingStartTime: "2026-12-05T14:00:00Z", raceStartTime: "2026-12-06T13:00:00Z", sprintWeekend: false, isLocked: false, isComplete: false, officialResults: null },
];

export const getUpcomingRaces = () => {
  const now = new Date();
  return raceCalendar
    .filter((r) => !r.isComplete && new Date(r.raceStartTime) > now)
    .sort((a, b) => a.round - b.round);
};

export const getRaceById = (id: string) => raceCalendar.find((r) => r.id === id);

export const isRaceLocked = (race: RaceWeekend) => {
  const deadline = new Date(race.qualifyingStartTime);
  deadline.setMinutes(deadline.getMinutes() - 1);
  return new Date() >= deadline || race.isLocked;
};
