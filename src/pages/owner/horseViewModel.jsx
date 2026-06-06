export function horseCollectionFrom(data) {
    if (Array.isArray(data)) return data;
    return [];
}

export function isActiveHorse(horse) {
    return String(horse?.status || "")
        .toLowerCase()
        .includes("active");
}

export function getHorseStatusColor(status) {
    const value = String(status || "").toLowerCase();

    if (value.includes("active")) return "green";
    if (value.includes("training")) return "blue";
    if (value.includes("injured")) return "orange";

    return "default";
}

export function horseDetailFrom(data) {
    return data;
}

export function normalizeHorse(horse = {}) {
    return {
        id: horse.id ?? "",
        name: horse.name ?? "",
        breed: horse.breed ?? "",
        age: horse.age ?? 0,
        gender: horse.gender ?? "",
        color: horse.color ?? "",
        height: horse.height ?? 0,
        weight: horse.weight ?? 0,
        status: horse.status ?? "Active",
        totalWin: horse.totalWin ?? 0,
        winRate: horse.winRate ?? 0,
        ownerName: horse.ownerName ?? "",
        stable: horse.stable ?? "",
        description: horse.description ?? "",
    };
}

export function toHorseFormValues(horse = {}) {
    return {
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
        gender: horse.gender,
        color: horse.color,
        height: horse.height,
        weight: horse.weight,
        horseStatus: horse.status,
        description: horse.description,
    };
}

export function toHorsePayload(values = {}) {
    return {
        name: values.name,
        breed: values.breed,
        age: values.age,
        gender: values.gender,
        color: values.color,
        height: values.height,
        weight: values.weight,
        status: values.horseStatus,
        description: values.description,
    };
}