export type LeadershipMember = {
  id: string;
  name: string;
  title: string;
  chapter: string;
  email?: string;
  imageUrl?: string | null;
};

export type LeadershipContent = {
  executiveBoard: LeadershipMember[];
  additionalChairs: LeadershipMember[];
};

export const DEFAULT_CONTACT_EMAIL = "nphcofhudsoncounty@gmail.com";

export const DEFAULT_LEADERSHIP_CONTENT: LeadershipContent = {
  executiveBoard: [
    { id: "eb-1", title: "President", name: "Christopher DeMarkus", chapter: "Alpha Phi Alpha Fraternity, Inc." },
    { id: "eb-2", title: "Vice President", name: "Kimberly Conway", chapter: "Alpha Kappa Alpha Sorority, Inc." },
    { id: "eb-3", title: "Secretary", name: "April Stitt", chapter: "Sigma Gamma Rho Sorority, Inc." },
    { id: "eb-4", title: "Treasurer", name: "Gibrill Kamara", chapter: "Alpha Phi Alpha Fraternity, Inc." },
    { id: "eb-5", title: "Financial Secretary", name: "Chris Gadsden", chapter: "Phi Beta Sigma Fraternity, Inc." },
    { id: "eb-6", title: "Parliamentarian", name: "Ayesha Noel-Smith", chapter: "Zeta Phi Beta Sorority, Inc." },
    { id: "eb-7", title: "Chaplain", name: "Dr. Viva White", chapter: "Zeta Phi Beta Sorority, Inc." },
  ],
  additionalChairs: [
    { id: "ch-1", title: "Service Chair", name: "Tina Jones", chapter: "Delta Sigma Theta Sorority, Inc." },
    { id: "ch-2", title: "Fundraising Chair", name: "Dr. Azaria Cunningham", chapter: "" },
    { id: "ch-3", title: "Scholarship Chair", name: "Dr. Aaliyah Davis", chapter: "" },
  ],
};
