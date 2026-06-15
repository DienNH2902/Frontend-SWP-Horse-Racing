export function horseCollectionFrom(data) {
    if (Array.isArray(data)) return data;
    return [];
}

export function isActiveHorse(horse) {
    return String(horse?.horseStatus || horse?.status || "")
        .toLowerCase()
        .includes("active") || String(horse?.horseStatus || horse?.status || "").toLowerCase() === "idle";
}

export function getHorseStatusColor(status) {
    const value = String(status || "").toLowerCase();

    if (value.includes("idle")) return "cyan";
    if (value.includes("active")) return "green";
    if (value.includes("training")) return "blue";
    if (value.includes("racing")) return "purple";
    if (value.includes("injured")) return "orange";
    if (value.includes("retired")) return "default";

    return "default";
}

export function horseDetailFrom(data) {
    return data;
}

export function normalizeHorse(horse = {}) {
    return {
        id: horse.id ?? horse._id ?? "",
        name: horse.name ?? "",
        breed: horse.breed ?? "",
        color: horse.color ?? "",
        height: horse.height ?? 0,
        weight: horse.weight ?? 0,
        status: horse.horseStatus ?? horse.status ?? "IDLE",
        totalWin: horse.totalWin ?? 0,
        winRate: horse.winRate ?? 0,
        starts: horse.starts ?? 0,
        podiums: horse.podiums ?? 0,
        rating: horse.rating ?? 0,
        lastRace: horse.lastRace ?? "",
        ownerName: horse.ownerName ?? "",
        stable: horse.stable ?? "",
        description: horse.description ?? "",
        imageUrl: horse.imageUrl ?? "",
    };
}

export function toHorseFormValues(horse = {}) {
    return {
        name: horse.name,
        breed: horse.breed,
        color: horse.color,
        imageUrl: horse.imageUrl,
        height: horse.height,
        weight: horse.weight,
        horseStatus: horse.status,
        description: horse.description,
    };
}

export function toHorsePayload(values = {}) {
    return {
        name: values.name,
        color: values.color,
        imageUrl: values.imageUrl || "",
        height: values.height,
        weight: values.weight,
        horseStatus: values.horseStatus,
    };
}

export function toHorseCreatePayload(values = {}) {
    return {
        name: values.name,
        color: values.color,
        imageUrl: values.imageUrl || "",
        height: values.height,
        weight: values.weight,
    };
}
