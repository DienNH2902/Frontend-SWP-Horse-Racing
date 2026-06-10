const delay = (value, ms = 180) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });

let mockHorses = [
  {
    id: 1,
    name: "Thunder",
    breed: "Arabian",
    age: 4,
    gender: "Male",
    color: "Black",
    height: 1.65,
    weight: 450,
    status: "Active",
    ownerName: "Golden Hoof Stable",
    stable: "Stable A",
    totalWin: 12,
    winRate: 65,
    starts: 21,
    podiums: 16,
    rating: 94,
    lastRace: "Emerald Stakes",
    description: "Calm sprinter with strong late acceleration.",
  },
  {
    id: 2,
    name: "Storm",
    breed: "Thoroughbred",
    age: 5,
    gender: "Female",
    color: "Bay",
    height: 1.6,
    weight: 430,
    status: "Training",
    ownerName: "Golden Hoof Stable",
    stable: "Stable B",
    totalWin: 7,
    winRate: 48,
    starts: 18,
    podiums: 11,
    rating: 88,
    lastRace: "Sunshine Cup",
    description: "Reliable middle-distance runner currently in training.",
  },
  {
    id: 3,
    name: "Midnight Arrow",
    breed: "Thoroughbred",
    age: 3,
    gender: "Gelding",
    color: "Dark bay",
    height: 1.58,
    weight: 418,
    status: "Active",
    ownerName: "Golden Hoof Stable",
    stable: "Stable C",
    totalWin: 4,
    winRate: 44,
    starts: 9,
    podiums: 6,
    rating: 82,
    lastRace: "Rookie Sprint",
    description: "Young horse with promising gate speed.",
  },
];

function clone(value) {
  return structuredClone(value);
}

export async function createHorse(payload) {
  const nextId = Math.max(0, ...mockHorses.map((horse) => Number(horse.id) || 0)) + 1;
  const horse = {
    id: nextId,
    ownerName: "Golden Hoof Stable",
    stable: payload.stable || "Stable A",
    totalWin: 0,
    winRate: 0,
    starts: 0,
    podiums: 0,
    rating: 70,
    lastRace: "Not raced yet",
    status: "Active",
    ...payload,
  };

  mockHorses = [horse, ...mockHorses];
  return delay(clone(horse));
}

export async function getHorses() {
  return delay(clone(mockHorses));
}

export async function getMyHorses() {
  return delay(clone(mockHorses));
}

export async function getHorseById(id) {
  const horse = mockHorses.find((item) => String(item.id) === String(id));

  return delay(horse ? clone(horse) : null);
}

export async function updateHorse(id, payload) {
  let updatedHorse = null;

  mockHorses = mockHorses.map((horse) => {
    if (String(horse.id) !== String(id)) {
      return horse;
    }

    updatedHorse = { ...horse, ...payload };
    return updatedHorse;
  });

  if (!updatedHorse) {
    throw new Error("Horse not found.");
  }

  return delay(clone(updatedHorse));
}

export async function deleteHorse(id) {
  const previousLength = mockHorses.length;
  mockHorses = mockHorses.filter((horse) => String(horse.id) !== String(id));

  if (previousLength === mockHorses.length) {
    throw new Error("Horse not found.");
  }

  return delay({ success: true });
}
