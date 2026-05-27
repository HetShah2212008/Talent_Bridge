/** Required profile fields from Clerk signup (dashboard must require first + last name). */
export type ClerkProfile = {
  firstName: string;
  lastName: string;
};

export function parseClerkProfile(data: {
  first_name?: string | null;
  last_name?: string | null;
}): ClerkProfile {
  const firstName = data.first_name?.trim() ?? "";
  const lastName = data.last_name?.trim() ?? "";

  if (!firstName || !lastName) {
    throw new Error(
      "Missing required profile: first name and last name are required."
    );
  }

  return { firstName, lastName };
}

export function parseClerkApiUser(user: {
  firstName: string | null;
  lastName: string | null;
}): ClerkProfile {
  const firstName = user.firstName?.trim() ?? "";
  const lastName = user.lastName?.trim() ?? "";

  if (!firstName || !lastName) {
    throw new Error(
      "Your account is missing required profile information. Please complete your name in your account settings."
    );
  }

  return { firstName, lastName };
}
