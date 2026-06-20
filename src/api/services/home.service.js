const delay = (value, ms = 180) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });

const raceImages = [
  "/goldenhoof-hero.png",
  "/goldenhoof-hero.png",
  "/goldenhoof-hero.png",
  "/goldenhoof-hero.png",
];

const upcomingRaces = [
  {
    id: 4,
    status: "LIVE",
    time: null,
    name: "Emerald Stakes",
    venue: "Royal Turf Club",
    distance: "1,600m",
    surface: "Turf",
    image: raceImages[0],
  },
  {
    id: 5,
    status: null,
    time: "15:15",
    name: "Golden Mile Cup",
    venue: "Sunshine Racecourse",
    distance: "1,600m",
    surface: "Turf",
    image: raceImages[1],
  },
  {
    id: 6,
    status: null,
    time: "16:00",
    name: "Thunderbolt Sprint",
    venue: "Valley Racecourse",
    distance: "1,200m",
    surface: "Dirt",
    image: raceImages[2],
  },
  {
    id: 7,
    status: null,
    time: "16:45",
    name: "Champion's Cup",
    venue: "Royal Turf Club",
    distance: "2,400m",
    surface: "Turf",
    image: raceImages[3],
  },
  {
    id: 8,
    status: null,
    time: "17:30",
    name: "Victory Purse",
    venue: "Sunshine Racecourse",
    distance: "1,800m",
    surface: "Turf",
    image: raceImages[0],
  },
];

const topHorses = [
  {
    id: 1,
    rank: 1,
    name: "Silver Bullet",
    age: "6 yrs",
    breed: "Thoroughbred",
    owner: "Greenfield Stable",
    rating: 98,
    wins: 12,
    image: "/goldenhoof-hero.png",
  },
  {
    id: 2,
    rank: 2,
    name: "Emerald Dream",
    age: "5 yrs",
    breed: "Thoroughbred",
    owner: "Skyline Racing",
    rating: 96,
    wins: 10,
    image: "/goldenhoof-hero.png",
  },
  {
    id: 3,
    rank: 3,
    name: "Midnight Runner",
    age: "7 yrs",
    breed: "Thoroughbred",
    owner: "Victory Stables",
    rating: 95,
    wins: 14,
    image: "/goldenhoof-hero.png",
  },
  {
    id: 4,
    rank: 4,
    name: "Thunder King",
    age: "6 yrs",
    breed: "Thoroughbred",
    owner: "Royal Bloodstock",
    rating: 94,
    wins: 9,
    image: "/goldenhoof-hero.png",
  },
];

const topJockeys = [
  { id: 1, rank: 1, name: "Liam O'Connor", wins: 120, winRate: "24%" },
  { id: 2, rank: 2, name: "Sophia Martinez", wins: 98, winRate: "21%" },
  { id: 3, rank: 3, name: "Noah Henderson", wins: 87, winRate: "19%" },
  { id: 4, rank: 4, name: "Ava Thompson", wins: 76, winRate: "18%" },
  { id: 5, rank: 5, name: "Ethan Walker", wins: 65, winRate: "17%" },
];

const leaderboard = [
  { id: 1, horse: "Silver Bullet", rating: 98, wins: 12, places: 5, points: 1250 },
  { id: 2, horse: "Emerald Dream", rating: 96, wins: 10, places: 4, points: 1080 },
  { id: 3, horse: "Midnight Runner", rating: 95, wins: 14, places: 3, points: 1075 },
  { id: 4, horse: "Thunder King", rating: 94, wins: 9, places: 6, points: 980 },
  { id: 5, horse: "Royal Phantom", rating: 93, wins: 8, places: 4, points: 870 },
];

const latestResults = [
  {
    id: 1,
    status: "LIVE",
    race: "Race 4 - Emerald Stakes",
    venue: "Royal Turf Club",
    distance: "1,600m",
    surface: "Turf",
    winner: "Silver Bullet",
    jockey: "L. O'Connor",
    time: "1:34.25",
    image: "/goldenhoof-hero.png",
  },
  {
    id: 2,
    status: "Finished",
    race: "Race 3 - Sunshine Cup",
    venue: "Sunshine Racecourse",
    distance: "1,800m",
    surface: "Turf",
    winner: "Emerald Dream",
    jockey: "S. Martinez",
    time: "1:48.63",
    image: "/goldenhoof-hero.png",
  },
  {
    id: 3,
    status: "Finished",
    race: "Race 2 - Rapid Dash",
    venue: "Valley Racecourse",
    distance: "1,200m",
    surface: "Dirt",
    winner: "Thunder King",
    jockey: "N. Henderson",
    time: "1:12.45",
    image: "/goldenhoof-hero.png",
  },
  {
    id: 4,
    status: "Finished",
    race: "Race 1 - Morning Sprint",
    venue: "Royal Turf Club",
    distance: "1,000m",
    surface: "Turf",
    winner: "Speed Demon",
    jockey: "E. Walker",
    time: "0:58.34",
    image: "/goldenhoof-hero.png",
  },
];

const topPredictors = [
  { id: 1, name: "RacingFan88", points: 2450 },
  { id: 2, name: "TurfMaster", points: 2150 },
  { id: 3, name: "SpeedKing", points: 1980 },
];

export async function getUpcomingRaces() {
  return delay(upcomingRaces);
}

export async function getTopHorses() {
  return delay(topHorses);
}

export async function getTopJockeys() {
  return delay(topJockeys);
}

export async function getLeaderboard() {
  return delay(leaderboard);
}

export async function getLatestResults() {
  return delay(latestResults);
}

export async function getTopPredictors() {
  return delay(topPredictors);
}

export async function getHomePageData() {
  const [races, horses, jockeys, standings, results, predictors] =
    await Promise.all([
      getUpcomingRaces(),
      getTopHorses(),
      getTopJockeys(),
      getLeaderboard(),
      getLatestResults(),
      getTopPredictors(),
    ]);

  return {
    races,
    horses,
    jockeys,
    standings,
    results,
    predictors,
  };
}
