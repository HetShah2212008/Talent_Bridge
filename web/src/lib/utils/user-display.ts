type NameFields = {
  firstName: string;
  lastName: string;
  email?: string;
};

export function displayName(user: NameFields): string {
  const full = `${user.firstName} ${user.lastName}`.trim();
  if (full) return full;
  return user.email ?? "User";
}

/** Alias for consistent call sites; same as displayName. */
export function displayNameShort(user: NameFields): string {
  return displayName(user);
}
