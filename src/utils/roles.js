export function normalizeRole(role) {
    return String(role ?? "")
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
}

export function getRoleHomePath(role) {
    const value = normalizeRole(role);

    if (value === "horseowner") return "/owner";
    if (value === "referee") return "/referee";
    if (value === "spectator") return "/spectator";
    if (value === "jockey") return "/jockey";
    if (value === "admin") return "/admin/dashboard";

    return "/home";
}

export function getDisplayName(user = {}) {
    return (
        user.fullName ||
        user.name ||
        user.username ||
        user.email ||
        "GoldenHoof User"
    );
}

export function getInitials(value = "") {
    return String(value)
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
