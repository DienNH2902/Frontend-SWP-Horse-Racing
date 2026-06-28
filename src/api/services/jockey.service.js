import { apiClient } from "../client";
import { JOCKEY_INVITATION_ENDPOINTS } from "../endpoints/jockeyInvitation.endpoint";

const delay = (value, ms = 180) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(value)), ms);
  });

function unwrapData(response) {
  const data = response?.data;

  return data?.data || data?.result || data?.invitation || data?.contract || data;
}

function unwrapCollection(response) {
  const data = unwrapData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.invitations)) return data.invitations;
  if (Array.isArray(data?.jockeyInvitations)) return data.jockeyInvitations;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.records)) return data.records;

  return [];
}

let jockeyData = {
  profile: {
    name: "Demo Jockey",
    rank: 7,
    rating: 96.8,
    winRate: 24,
    careerWins: 120,
    seasonPrize: 420000,
  },
  invitations: [
    {
      id: 1001,
      owner: "Golden Hoof Stable",
      horse: "Thunder",
      race: "Emerald Stakes",
      tournament: "Summer Turf Championship",
      venue: "Royal Turf Club",
      date: "2026-06-18",
      time: "15:00",
      distance: "1,600m",
      surface: "Turf",
      fee: 3200,
      status: "Pending",
      horseInfo: {
        age: 4,
        breed: "Arabian",
        rating: 94,
        winRate: 65,
      },
    },
    {
      id: 1002,
      owner: "Greenfield Stable",
      horse: "Silver Bullet",
      race: "Champion's Cup",
      tournament: "National Racing League",
      venue: "Royal Turf Club",
      date: "2026-06-24",
      time: "16:45",
      distance: "2,400m",
      surface: "Turf",
      fee: 5200,
      status: "Pending",
      horseInfo: {
        age: 6,
        breed: "Thoroughbred",
        rating: 98,
        winRate: 71,
      },
    },
    {
      id: 1003,
      owner: "Skyline Racing",
      horse: "Emerald Dream",
      race: "Sunshine Cup",
      tournament: "Spring Classic",
      venue: "Sunshine Racecourse",
      date: "2026-05-26",
      time: "16:00",
      distance: "1,800m",
      surface: "Turf",
      fee: 2800,
      status: "Accepted",
      horseInfo: {
        age: 5,
        breed: "Thoroughbred",
        rating: 96,
        winRate: 62,
      },
    },
  ],
  schedules: [
    {
      id: 2001,
      assignmentStatus: "Confirmed",
      race: "Emerald Stakes",
      tournament: "Summer Turf Championship",
      horse: "Thunder",
      owner: "Golden Hoof Stable",
      venue: "Royal Turf Club",
      date: "2026-06-18",
      time: "15:00",
      gate: 4,
      distance: "1,600m",
      surface: "Turf",
      purse: 50000,
      horseInfo: {
        age: 4,
        breed: "Arabian",
        color: "Black",
        rating: 94,
        winRate: 65,
        starts: 21,
        podiums: 16,
      },
      result: null,
    },
    {
      id: 2002,
      assignmentStatus: "Confirmed",
      race: "Golden Mile Cup",
      tournament: "Summer Turf Championship",
      horse: "Storm",
      owner: "Golden Hoof Stable",
      venue: "Sunshine Racecourse",
      date: "2026-06-22",
      time: "16:30",
      gate: 2,
      distance: "1,600m",
      surface: "Turf",
      purse: 42000,
      horseInfo: {
        age: 5,
        breed: "Thoroughbred",
        color: "Bay",
        rating: 88,
        winRate: 48,
        starts: 18,
        podiums: 11,
      },
      result: null,
    },
    {
      id: 2003,
      assignmentStatus: "Finished",
      race: "Sunshine Cup",
      tournament: "Spring Classic",
      horse: "Emerald Dream",
      owner: "Skyline Racing",
      venue: "Sunshine Racecourse",
      date: "2026-05-26",
      time: "16:00",
      gate: 6,
      distance: "1,800m",
      surface: "Turf",
      purse: 42000,
      horseInfo: {
        age: 5,
        breed: "Thoroughbred",
        color: "Chestnut",
        rating: 96,
        winRate: 62,
        starts: 24,
        podiums: 18,
      },
      result: { rank: 2, time: "1:48.63", prize: 9000, points: 32 },
    },
    {
      id: 2004,
      assignmentStatus: "Finished",
      race: "Morning Sprint",
      tournament: "City Sprint Series",
      horse: "Rapid Crown",
      owner: "Royal Bloodstock",
      venue: "Valley Racecourse",
      date: "2026-05-12",
      time: "13:30",
      gate: 1,
      distance: "1,000m",
      surface: "Dirt",
      purse: 18000,
      horseInfo: {
        age: 4,
        breed: "Thoroughbred",
        color: "Bay",
        rating: 90,
        winRate: 58,
        starts: 16,
        podiums: 10,
      },
      result: { rank: 1, time: "0:58.34", prize: 12000, points: 40 },
    },
  ],
  standings: [
    { rank: 1, jockey: "Liam O'Connor", wins: 120, points: 1420, prize: 520000 },
    { rank: 2, jockey: "Sophia Martinez", wins: 98, points: 1280, prize: 460000 },
    { rank: 7, jockey: "Demo Jockey", wins: 64, points: 860, prize: 420000 },
    { rank: 8, jockey: "Noah Henderson", wins: 60, points: 820, prize: 360000 },
  ],
};

export async function getJockeyDashboard() {
  const invitations = await getJockeyInvitations();

  return {
    ...structuredClone(jockeyData),
    invitations,
  };
}

export async function getJockeyInvitations() {
  const response = await apiClient.get(JOCKEY_INVITATION_ENDPOINTS.MY_INVITATIONS, {
    includeAuth: true,
  });

  return unwrapCollection(response);
}

export async function getJockeyInvitationById(invitationId) {
  const response = await apiClient.get(JOCKEY_INVITATION_ENDPOINTS.DETAIL(invitationId), {
    includeAuth: true,
  });

  return unwrapData(response);
}

export async function respondToJockeyInvitation(invitationId, status) {
  if (!["Accepted", "Rejected"].includes(status)) {
    throw new Error("Invalid invitation response.");
  }

  const response = await apiClient.patch(
    JOCKEY_INVITATION_ENDPOINTS.RESPOND(invitationId),
    { status },
    { includeAuth: true },
  );

  return unwrapData(response);
}

export async function getJockeyInvitationContract(invitationId) {
  const response = await apiClient.get(JOCKEY_INVITATION_ENDPOINTS.CONTRACT(invitationId), {
    includeAuth: true,
  });

  return unwrapData(response);
}

export async function getJockeyRaceSchedule() {
  return delay({
    schedules: jockeyData.schedules,
    standings: jockeyData.standings,
  });
}
