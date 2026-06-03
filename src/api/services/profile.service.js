const mockAdminProfile = {
  id: "admin-001",
  fullName: "GoldenHoof Admin",
  dob: "1992-08-18",
  role: "Admin",
  avatarUrl: "/goldenhoof-hero.png",
};

function delay(value, ms = 180) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });
}

export async function getAdminProfile() {
  return delay(mockAdminProfile);
}
