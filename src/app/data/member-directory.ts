export type MemberDirectoryEntry = {
  email: string;
  displayName: string;
  designation?: string; // "Mr. President", "Madam Vice President", "Mr.", etc.
};

export type MemberDirectory = {
  entries: MemberDirectoryEntry[];
};

export const DEFAULT_MEMBER_DIRECTORY: MemberDirectory = {
  entries: [],
};

