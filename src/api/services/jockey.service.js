import { apiClient } from "../client";
import { JOCKEY_INVITATION_ENDPOINTS } from "../endpoints/jockeyInvitation.endpoint";
import { SCHEDULE_ENDPOINTS } from "../endpoints/schedule.endpoint";
import { getProfile } from "./auth.service";
import { getUserById } from "./user.service";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

function unwrapData(response) {
  const data = response?.data;

  return (
    data?.data || data?.result || data?.invitation || data?.contract || data
  );
}

function unwrapCollection(response) {
  const data = unwrapData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.invitations)) return data.invitations;
  if (Array.isArray(data?.jockeyInvitations)) return data.jockeyInvitations;
  if (Array.isArray(data?.schedules)) return data.schedules;
  if (Array.isArray(data?.upcomingSchedules)) return data.upcomingSchedules;
  if (Array.isArray(data?.races)) return data.races;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.records)) return data.records;

  return [];
}

function pickFirstValue(source, keys, fallback = "") {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && value !== "") return value;
  }

  return fallback;
}

function pickExistingValues(source, keys) {
  if (!source || typeof source !== "object") return [];

  return keys
    .map((key) => source[key])
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map(String)
    .filter((value, index, values) => values.indexOf(value) === index);
}

function getReferenceId(reference) {
  if (!reference) return "";
  if (typeof reference === "string") return reference;

  return pickFirstValue(reference, ["id", "_id", "raceId", "scheduleId"], "");
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function pickNumber(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    const number = Number(value);

    if (value !== undefined && value !== null && value !== "" && Number.isFinite(number)) {
      return number;
    }
  }

  return null;
}

function getRank(value) {
  const rank = Number(value?.finalRank ?? value?.rank ?? value?.rawRank);
  return Number.isFinite(rank) ? rank : null;
}

function getPrize(value) {
  const prize = Number(value?.prizeAmount ?? value?.prizeMoney ?? value?.reward ?? 0);
  return Number.isFinite(prize) ? prize : 0;
}

function collectHistoryRaces(history) {
  const races = [];

  function visit(value) {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (typeof value !== "object") return;

    const hasRaceShape =
      value.raceId ||
      value.raceName ||
      value.finalRank != null ||
      value.rank != null ||
      value.rawRank != null;

    if (hasRaceShape) {
      races.push(value);
    }

    ["historyRaceJockey", "historyRace", "rounds", "races", "results"].forEach(
      (key) => {
        if (Array.isArray(value[key])) visit(value[key]);
      },
    );
  }

  visit(history);

  return races;
}

function normalizeDashboardProfile(profile = {}, schedules = [], standings = []) {
  const historyRaces = collectHistoryRaces(profile.historyRaceJockey);
  const finishedScheduleResults = asArray(schedules)
    .map((schedule) => schedule?.result)
    .filter(Boolean);
  const performanceResults = historyRaces.length
    ? historyRaces
    : finishedScheduleResults;
  const totalRaces = performanceResults.length;
  const calculatedWins = performanceResults.filter((race) => getRank(race) === 1).length;
  const calculatedPrize = performanceResults.reduce(
    (sum, race) => sum + getPrize(race?.result || race),
    0,
  );
  const currentUserIds = pickExistingValues(profile, [
    "id",
    "_id",
    "userId",
    "accountId",
    "profileId",
  ]).map(String);
  const currentName = String(profile.fullName || profile.name || "").trim();
  const standing = asArray(standings).find((item) => {
    const standingIds = pickExistingValues(item, [
      "id",
      "_id",
      "userId",
      "jockeyId",
      "jockeyProfileId",
      "profileId",
    ]).map(String);
    const hasSameId = standingIds.some((id) => currentUserIds.includes(id));
    const standingName = String(item.jockey || item.name || item.fullName || "").trim();

    return hasSameId || (currentName && standingName === currentName);
  });

  const explicitWins = pickNumber(profile, ["careerWins", "totalWin", "totalWins", "wins"]);
  const explicitTotalRaces = pickNumber(profile, ["totalRace", "totalRaces", "starts"]);
  const explicitWinRate = pickNumber(profile, ["winRate"]);
  const winRate =
    explicitWinRate ??
    (explicitTotalRaces || totalRaces
      ? Number((((explicitWins ?? calculatedWins) / (explicitTotalRaces || totalRaces)) * 100).toFixed(2))
      : null);

  return {
    ...profile,
    rank: pickNumber(profile, ["finalRank", "seasonRank", "ranking"]) ?? pickNumber(standing, ["finalRank"]),
    winRate,
    careerWins: explicitWins ?? calculatedWins,
    seasonPrize:
      pickNumber(profile, ["seasonPrize", "prize", "totalPrize", "prizeEarned"]) ??
      pickNumber(standing, ["prize"]) ??
      calculatedPrize,
  };
}

function normalizeUpcomingSchedule(schedule = {}, index = 0) {
  const race = schedule.race || schedule.raceInfo || {};
  const tournament =
    schedule.tournament ||
    schedule.tournamentInfo ||
    race.tournament ||
    race.tournamentInfo ||
    {};
  const horse = schedule.horse || schedule.horseInfo || race.horse || {};
  const owner = schedule.owner || schedule.ownerInfo || horse.owner || {};
  const raceCourse =
    schedule.raceCourse ||
    schedule.raceCourseInfo ||
    race.raceCourse ||
    race.raceCourseInfo ||
    {};
  const startTime = pickFirstValue(
    schedule,
    ["startTime", "scheduledAt"],
    pickFirstValue(race, ["startTime", "scheduledAt"], ""),
  );
  const parsedStartTime = startTime ? new Date(startTime) : null;
  const hasValidStartTime =
    parsedStartTime && !Number.isNaN(parsedStartTime.getTime());

  return {
    ...schedule,
    raceId:
      pickFirstValue(schedule, ["raceId"], "") ||
      pickFirstValue(race, ["id", "_id", "raceId"], ""),
    raceName: pickFirstValue(
      schedule,
      ["raceName", "name", "title"],
      pickFirstValue(race, ["name", "title", "raceName"], "Unnamed race"),
    ),
    tournamentId:
      pickFirstValue(schedule, ["tournamentId"], "") ||
      pickFirstValue(race, ["tournamentId"], "") ||
      pickFirstValue(tournament, ["id", "_id", "tournamentId"], ""),
    raceCourseName: pickFirstValue(
      schedule,
      ["raceCourseName"],
      pickFirstValue(raceCourse, ["name"], "N/A"),
    ),
    totalSlots: pickFirstValue(
      schedule,
      ["totalSlots"],
      pickFirstValue(race, ["totalSlots"], 0),
    ),
    filledSlots: pickFirstValue(
      schedule,
      ["filledSlots"],
      pickFirstValue(race, ["filledSlots"], 0),
    ),
    availableSlots: pickFirstValue(
      schedule,
      ["availableSlots"],
      pickFirstValue(race, ["availableSlots"], 0),
    ),
    status: pickFirstValue(
      schedule,
      ["status", "assignmentStatus"],
      pickFirstValue(race, ["status"], "Upcoming"),
    ),
    id:
      pickFirstValue(schedule, ["id", "_id", "scheduleId", "raceId"], "") ||
      getReferenceId(race) ||
      `upcoming-${index}`,
    race: pickFirstValue(
      schedule,
      ["raceName", "name", "title"],
      pickFirstValue(race, ["name", "title", "raceName"], "Unnamed race"),
    ),
    tournament: pickFirstValue(
      schedule,
      ["tournamentName", "tournamentTitle"],
      pickFirstValue(tournament, ["title", "name"], "N/A"),
    ),
    horse: pickFirstValue(
      schedule,
      ["horseName"],
      pickFirstValue(horse, ["name", "horseName"], "N/A"),
    ),
    owner: pickFirstValue(
      schedule,
      ["ownerName", "ownerFullName"],
      pickFirstValue(owner, ["fullName", "name", "stableName"], "N/A"),
    ),
    date: pickFirstValue(
      schedule,
      ["date", "raceDate"],
      pickFirstValue(
        race,
        ["date", "raceDate"],
        hasValidStartTime ? dayjs.utc(startTime).format("DD/MM/YYYY") : "N/A",
      ),
    ),
    time: pickFirstValue(
      schedule,
      ["time"],
      pickFirstValue(
        race,
        ["time"],
        hasValidStartTime
          ? dayjs.utc(startTime).format("HH:mm")
          : "N/A",
      ),
    ),
    venue: pickFirstValue(
      schedule,
      ["venue", "location", "raceCourseName"],
      pickFirstValue(raceCourse, ["name", "location"], "N/A"),
    ),
    assignmentStatus: pickFirstValue(
      schedule,
      ["assignmentStatus", "status"],
      pickFirstValue(race, ["status"], "Upcoming"),
    ),
    gate: pickFirstValue(
      schedule,
      ["gate", "gateNumber"],
      pickFirstValue(race, ["gate", "gateNumber"], "N/A"),
    ),
    distance: pickFirstValue(
      schedule,
      ["distance"],
      pickFirstValue(
        race,
        ["distance"],
        pickFirstValue(raceCourse, ["distance"], "N/A"),
      ),
    ),
    surface: pickFirstValue(
      schedule,
      ["surface", "trackType"],
      pickFirstValue(
        race,
        ["surface", "trackType"],
        pickFirstValue(raceCourse, ["trackType", "surface"], "N/A"),
      ),
    ),
    purse: pickFirstValue(
      schedule,
      ["purse", "prizePool"],
      pickFirstValue(race, ["purse", "prizePool"], 0),
    ),
    horseInfo: typeof horse === "object" ? horse : {},
    result: schedule.result || race.result || null,
  };
}

export async function getJockeyDashboard() {
  const [invitations, scheduleData, profile] = await Promise.all([
    getJockeyInvitations(),
    getJockeyRaceSchedule(),
    getJockeyProfile(),
  ]);
  const schedules = scheduleData.schedules || [];
  const standings = scheduleData.standings || [];

  return {
    profile: normalizeDashboardProfile(profile, schedules, standings),
    invitations,
    schedules,
    standings,
  };
}

export async function getJockeyProfile() {
  const profile = await getProfile();
  const userIds = pickExistingValues(profile, [
    "id",
    "_id",
    "userId",
    "accountId",
    "profileId",
  ]);

  if (userIds.length === 0) return profile || {};

  for (const userId of userIds) {
    try {
      const userDetail = await getUserById(userId);

      return {
        ...(profile || {}),
        ...(userDetail || {}),
      };
    } catch {
      // Try the next possible id shape from the auth profile.
    }
  }

  return profile || {};
}

export async function getJockeyInvitations() {
  const response = await apiClient.get(
    JOCKEY_INVITATION_ENDPOINTS.MY_INVITATIONS,
    {
      includeAuth: true,
    },
  );

  return unwrapCollection(response);
}

export async function getJockeyInvitationById(invitationId) {
  const response = await apiClient.get(
    JOCKEY_INVITATION_ENDPOINTS.DETAIL(invitationId),
    {
      includeAuth: true,
    },
  );

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
  const response = await apiClient.get(
    JOCKEY_INVITATION_ENDPOINTS.CONTRACT(invitationId),
    {
      includeAuth: true,
    },
  );

  return unwrapData(response);
}

export async function getAllContracts(params = {}) {
  const response = await apiClient.get(
    JOCKEY_INVITATION_ENDPOINTS.ALL_CONTRACTS,
    {
      params,
      includeAuth: true,
    },
  );

  return unwrapCollection(response);
}

export async function getContractDetailByInvitationId(invitationId) {
  const response = await apiClient.get(
    JOCKEY_INVITATION_ENDPOINTS.CONTRACT_DETAIL(invitationId),
    { includeAuth: true },
  );
  return response.data;
}

export async function completeContract(contractId) {
  const response = await apiClient.patch(
    JOCKEY_INVITATION_ENDPOINTS.COMPLETE_CONTRACT(contractId),
    {},
    { includeAuth: true },
  );

  return unwrapData(response);
}

export async function getJockeyRaceSchedule() {
  const response = await apiClient.get(SCHEDULE_ENDPOINTS.UPCOMING_JOCKEY, {
    includeAuth: true,
  });

  return {
    schedules: unwrapCollection(response).map(normalizeUpcomingSchedule),
    standings: [],
  };
}

// Admin phê duyệt hoặc từ chối đơn tố cáo vi phạm hợp đồng
export async function processBreachReportByAdmin(
  breachId,
  { isApproved, adminReason },
) {
  const response = await apiClient.patch(
    JOCKEY_INVITATION_ENDPOINTS.PROCESS_BREACH(breachId),
    { isApproved, adminReason },
    { includeAuth: true },
  );
  return unwrapData(response);
}

// Lấy thông tin đơn tố cáo/vi phạm theo ID hợp đồng
export async function getBreachByContractId(contractId) {
  const response = await apiClient.get(
    JOCKEY_INVITATION_ENDPOINTS.GET_BREACH_BY_CONTRACT(contractId),
    { includeAuth: true },
  );
  return unwrapData(response);
}
