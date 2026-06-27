import { getRacesByTournament } from "./race.service";
import { getTournaments } from "./tournament.service";

const delay = (value, ms = 180) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });

function resolveList(response) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  for (const key of ["data", "items", "races", "content", "records", "result"]) {
    if (Array.isArray(response[key])) return response[key];
    const nested = resolveList(response[key]);
    if (nested.length) return nested;
  }

  return [];
}

function getId(item) {
  const value = item?._id || item?.id;
  return typeof value === "object" ? value?._id || value?.id : value;
}

function formatRaceTime(race) {
  const startTime =
    race?.startTime || race?.startAt || race?.scheduledAt || race?.date;
  if (!startTime) return "TBA";

  const date = new Date(startTime);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return String(startTime);
}

function normalizeHomeRace(race, tournament, index) {
  const status = String(race?.status || "");
  const isOngoing = ["ongoing", "live", "in progress", "in_progress"].includes(
    status.trim().toLowerCase(),
  );
  const course = race?.raceCourseId || race?.raceCourse || {};
  const distance = race?.distance ?? course?.distance;
  const distanceLabel = distance
    ? /(?:m|km)$/i.test(String(distance))
      ? String(distance)
      : `${distance}m`
    : "Distance TBA";

  return {
    id: getId(race),
    status: isOngoing ? "LIVE" : null,
    rawStatus: status,
    time: isOngoing ? null : formatRaceTime(race),
    name:
      race?.name ||
      race?.title ||
      `Race ${race?.raceOrder || race?.roundNumber || index + 1}`,
    venue:
      race?.raceCourseName ||
      race?.courseName ||
      course?.name ||
      tournament?.title ||
      tournament?.name ||
      "GoldenHoof Racecourse",
    distance: distanceLabel,
    surface: race?.surface || course?.surface || course?.trackType || "Track",
    image: race?.image || course?.image || "/goldenhoof-hero.png",
    tournament:
      race?.tournamentTitle ||
      race?.tournamentName ||
      tournament?.title ||
      tournament?.name ||
      "GoldenHoof Tournament",
    round: race?.roundNumber ?? "—",
    raceOrder: race?.raceOrder ?? "—",
    horseCount:
      race?.horseCount ??
      race?.totalHorses ??
      race?.filledSlots ??
      (Array.isArray(race?.horses) ? race.horses.length : 0),
    sortTime:
      race?.startAt ||
      race?.scheduledAt ||
      race?.startTime ||
      race?.date ||
      "",
  };
}

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

const topPredictors = [
  { id: 1, name: "RacingFan88", points: 2450 },
  { id: 2, name: "TurfMaster", points: 2150 },
  { id: 3, name: "SpeedKing", points: 1980 },
];

export async function getUpcomingRaces() {
  try {
    const tournaments = resolveList(await getTournaments());
    const statuses = ["Ongoing", "Scheduled", "Ready"];
    const requests = tournaments.flatMap((tournament) => {
      const tournamentId = getId(tournament);
      if (!tournamentId) return [];

      return statuses.map(async (status) => {
        const response = await getRacesByTournament(tournamentId, status);
        return resolveList(response).map((race, index) =>
          normalizeHomeRace(race, tournament, index),
        );
      });
    });
    const responses = await Promise.allSettled(requests);
    const races = responses
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
      .filter((race) => {
        const status = race.rawStatus.trim().toLowerCase();
        return (
          race.id &&
          [
            "ongoing",
            "live",
            "in progress",
            "in_progress",
            "scheduled",
            "ready",
          ].includes(status)
        );
      });
    const uniqueRaces = Array.from(
      new Map(races.map((race) => [race.id, race])).values(),
    );

    return uniqueRaces.sort((first, second) => {
      if (Boolean(first.status) !== Boolean(second.status)) {
        return first.status ? -1 : 1;
      }

      const firstTime = new Date(first.sortTime).getTime();
      const secondTime = new Date(second.sortTime).getTime();
      const safeFirstTime = Number.isNaN(firstTime)
        ? Number.MAX_SAFE_INTEGER
        : firstTime;
      const safeSecondTime = Number.isNaN(secondTime)
        ? Number.MAX_SAFE_INTEGER
        : secondTime;
      return safeFirstTime - safeSecondTime;
    }).slice(0, 5);
  } catch {
    // Keep the remaining Home sections usable when race APIs are unavailable.
    return [];
  }
}

export async function getTopHorses() {
  return delay(topHorses);
}

export async function getTopJockeys() {
  return delay(topJockeys);
}

function normalizeFinishedRace(race, tournament, index) {
  const course = race?.raceCourseId || race?.raceCourse || {};
  const results =
    race?.results ||
    race?.rankings ||
    race?.officialResults ||
    (Array.isArray(race?.result) ? race.result : []);
  const winnerResult = Array.isArray(results)
    ? [...results].sort(
        (first, second) =>
          Number(first.finalRank ?? first.rawRank ?? first.rank ?? 999) -
          Number(second.finalRank ?? second.rawRank ?? second.rank ?? 999),
      )[0]
    : null;
  const winnerHorse = winnerResult?.horseId || winnerResult?.horse || {};
  const winnerJockey = winnerResult?.jockeyId || winnerResult?.jockey || {};
  const distance = race?.distance ?? course?.distance;
  const date =
    race?.finishedAt ||
    race?.completedAt ||
    race?.startAt ||
    race?.scheduledAt ||
    race?.date ||
    race?.updatedAt ||
    "";

  return {
    id: getId(race),
    status: "Finished",
    race:
      race?.name ||
      race?.title ||
      `Race ${race?.raceOrder || race?.roundNumber || index + 1}`,
    tournament:
      race?.tournamentTitle ||
      race?.tournamentName ||
      tournament?.title ||
      tournament?.name ||
      "GoldenHoof Tournament",
    venue:
      race?.raceCourseName ||
      race?.courseName ||
      course?.name ||
      "GoldenHoof Racecourse",
    distance: distance
      ? /(?:m|km)$/i.test(String(distance))
        ? String(distance)
        : `${distance}m`
      : "Distance TBA",
    surface: race?.surface || course?.surface || course?.trackType || "Track",
    winner:
      race?.winnerName ||
      race?.winner?.name ||
      race?.winner?.horseName ||
      winnerResult?.horseName ||
      winnerHorse?.name ||
      winnerHorse?.horseName ||
      "Awaiting confirmation",
    jockey:
      race?.winnerJockeyName ||
      race?.winnerJockey?.fullName ||
      race?.winnerJockey?.name ||
      winnerResult?.jockeyName ||
      winnerJockey?.fullName ||
      winnerJockey?.name ||
      "—",
    time:
      race?.winningTime ||
      winnerResult?.elapsedTime ||
      winnerResult?.finishedTime ||
      winnerResult?.finishTime ||
      "—",
    date,
    image: race?.image || course?.image || "/goldenhoof-hero.png",
  };
}

export async function getFinishedRaceResults() {
  try {
    const tournaments = resolveList(await getTournaments());
    const responses = await Promise.allSettled(
      tournaments.map(async (tournament) => {
        const tournamentId = getId(tournament);
        if (!tournamentId) return [];
        const response = await getRacesByTournament(tournamentId, "Finished");
        return resolveList(response)
          .filter((race) =>
            ["finished", "completed"].includes(
              String(race?.status || "").toLowerCase(),
            ),
          )
          .map((race, index) =>
            normalizeFinishedRace(race, tournament, index),
          );
      }),
    );

    return Array.from(
      new Map(
        responses
          .flatMap((result) =>
            result.status === "fulfilled" ? result.value : [],
          )
          .filter((race) => race.id)
          .map((race) => [race.id, race]),
      ).values(),
    ).sort(
      (first, second) =>
        (new Date(second.date).getTime() || 0) -
        (new Date(first.date).getTime() || 0),
    );
  } catch {
    return [];
  }
}

export async function getLatestResults() {
  return (await getFinishedRaceResults()).slice(0, 4);
}

export async function getTopPredictors() {
  return delay(topPredictors);
}

export async function getHomePageData() {
  const [races, horses, jockeys, results, predictors] =
    await Promise.all([
      getUpcomingRaces(),
      getTopHorses(),
      getTopJockeys(),
      getLatestResults(),
      getTopPredictors(),
    ]);

  return {
    races,
    horses,
    jockeys,
    results,
    predictors,
  };
}
