import { apiClient } from "../client";
import { JOCKEY_INVITATION_ENDPOINTS } from "../endpoints/jockeyInvitation.endpoint";
import { HORSE_ENDPOINTS } from "../endpoints/horse.endpoint";
import { getAvailableJockeys } from "./user.service";

const delay = (value, ms = 180) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(value)), ms);
  });

function unwrapData(response) {
  const data = response?.data;

  return data?.data || data?.result || data?.horse || data;
}

function unwrapCollection(response) {
  const data = unwrapData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.horses)) return data.horses;
  if (Array.isArray(data?.invitations)) return data.invitations;
  if (Array.isArray(data?.jockeyInvitations)) return data.jockeyInvitations;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.records)) return data.records;

  return [];
}

let jockeyWorkspace = {
  contracts: [
    {
      id: 501,
      invitationId: 101,
      horseId: 1,
      jockeyId: 11,
      raceId: 201,
      horse: "Thunder",
      jockey: "Liam O'Connor",
      race: "Emerald Stakes",
      status: "Active",
      ownerConfirmed: false,
      tournamentRegistered: false,
    },
  ],
  schedules: [
    {
      id: 201,
      race: "Emerald Stakes",
      tournament: "Summer Turf Championship",
      horseId: 1,
      horse: "Thunder",
      venue: "Royal Turf Club",
      date: "2026-06-18",
      time: "15:00",
      distance: "1,600m",
      surface: "Turf",
      horseConfirmed: false,
      jockeyConfirmed: false,
      tournamentRegistered: false,
    },
    {
      id: 202,
      race: "Golden Mile Cup",
      tournament: "Summer Turf Championship",
      horseId: 2,
      horse: "Storm",
      venue: "Sunshine Racecourse",
      date: "2026-06-22",
      time: "16:30",
      distance: "1,600m",
      surface: "Turf",
      horseConfirmed: false,
      jockeyConfirmed: false,
      tournamentRegistered: false,
    },
    {
      id: 203,
      race: "Thunderbolt Sprint",
      tournament: "National Sprint Series",
      horseId: 3,
      horse: "Midnight Arrow",
      venue: "Valley Racecourse",
      date: "2026-06-28",
      time: "14:15",
      distance: "1,200m",
      surface: "Dirt",
      horseConfirmed: true,
      jockeyConfirmed: false,
      tournamentRegistered: false,
    },
  ],
};

const raceCenter = {
  races: [
    {
      id: 301,
      name: "Emerald Stakes",
      tournament: "Summer Turf Championship",
      venue: "Royal Turf Club",
      date: "2026-06-18",
      time: "15:00",
      distance: "1,600m",
      surface: "Turf",
      purse: 50000,
      status: "Upcoming",
      myHorse: "Thunder",
      jockey: "Liam O'Connor",
      result: null,
    },
    {
      id: 302,
      name: "Sunshine Cup",
      tournament: "Spring Classic",
      venue: "Sunshine Racecourse",
      date: "2026-05-26",
      time: "16:00",
      distance: "1,800m",
      surface: "Turf",
      purse: 42000,
      status: "Finished",
      myHorse: "Storm",
      jockey: "Sophia Martinez",
      result: { rank: 2, time: "1:48.63", prize: 9000, points: 32 },
    },
    {
      id: 303,
      name: "Rookie Sprint",
      tournament: "Young Horse League",
      venue: "Valley Racecourse",
      date: "2026-05-12",
      time: "13:30",
      distance: "1,000m",
      surface: "Dirt",
      purse: 18000,
      status: "Finished",
      myHorse: "Midnight Arrow",
      jockey: "Noah Henderson",
      result: { rank: 1, time: "0:58.34", prize: 12000, points: 40 },
    },
  ],
  standings: [
    { rank: 1, horse: "Silver Bullet", owner: "Greenfield Stable", wins: 12, points: 1250, prize: 88000 },
    { rank: 2, horse: "Thunder", owner: "Golden Hoof Stable", wins: 12, points: 1180, prize: 76000 },
    { rank: 3, horse: "Emerald Dream", owner: "Skyline Racing", wins: 10, points: 1080, prize: 69000 },
    { rank: 8, horse: "Storm", owner: "Golden Hoof Stable", wins: 7, points: 730, prize: 41000 },
    { rank: 14, horse: "Midnight Arrow", owner: "Golden Hoof Stable", wins: 4, points: 430, prize: 18000 },
  ],
};

export async function getOwnerJockeyWorkspace() {
  const [horsesResponse, jockeys] = await Promise.all([
    apiClient.get(HORSE_ENDPOINTS.MY_HORSES, { includeAuth: true }),
    getAvailableJockeys(),
  ]);

  return {
    ...jockeyWorkspace,
    horses: unwrapCollection(horsesResponse),
    jockeys,
  };
}

export async function sendJockeyInvitation(payload) {
  const response = await apiClient.post(
    JOCKEY_INVITATION_ENDPOINTS.ROOT,
    payload,
    { includeAuth: true },
  );

  return unwrapData(response);
}

export async function getSentJockeyInvitations() {
  const response = await apiClient.get(JOCKEY_INVITATION_ENDPOINTS.SENT, {
    includeAuth: true,
  });

  return unwrapCollection(response);
}

export async function getJockeyInvitationContract(invitationId) {
  const response = await apiClient.get(
    JOCKEY_INVITATION_ENDPOINTS.CONTRACT(invitationId),
    {
      includeAuth: true,
    },
  );

  return unwrapData(response);
}

export async function confirmJockeyForRace(contractId) {
  jockeyWorkspace = {
    ...jockeyWorkspace,
    contracts: jockeyWorkspace.contracts.map((contract) =>
      contract.id === contractId ? { ...contract, ownerConfirmed: true } : contract,
    ),
    schedules: jockeyWorkspace.schedules.map((schedule) =>
      jockeyWorkspace.contracts.some(
        (contract) => contract.id === contractId && contract.raceId === schedule.id,
      )
        ? { ...schedule, jockeyConfirmed: true }
        : schedule,
    ),
  };

  return delay({ success: true });
}

export async function confirmHorseRaceEntry(scheduleId) {
  jockeyWorkspace = {
    ...jockeyWorkspace,
    schedules: jockeyWorkspace.schedules.map((schedule) =>
      schedule.id === scheduleId ? { ...schedule, horseConfirmed: true } : schedule,
    ),
  };

  return delay({ success: true });
}

export async function registerContractToTournament(contractId) {
  const contract = jockeyWorkspace.contracts.find((item) => item.id === contractId);

  if (!contract?.ownerConfirmed) {
    throw new Error("Confirm the jockey contract before tournament registration.");
  }

  jockeyWorkspace = {
    ...jockeyWorkspace,
    contracts: jockeyWorkspace.contracts.map((item) =>
      item.id === contractId ? { ...item, tournamentRegistered: true } : item,
    ),
    schedules: jockeyWorkspace.schedules.map((schedule) =>
      schedule.id === contract.raceId ? { ...schedule, tournamentRegistered: true } : schedule,
    ),
  };

  return delay({ success: true });
}

export async function getOwnerRaceCenter() {
  return delay(raceCenter);
}
