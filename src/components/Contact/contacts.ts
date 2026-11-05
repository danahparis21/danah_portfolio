export type ContactId = "email" | "linkedin" | "github" | "resume" | "phone" | "asmr";

export interface ContactKey {
  id: ContactId;
  label: string;
  glyph: string;
  hint: string;
  href?: string;
  tone: "pink" | "cream" | "glass";
  external?: boolean;
  download?: string;
}

export const PROFILE = {
  email: "danahparis.inf@gmail.com",
  phone: "0945-8543-1364",
  linkedin: "https://www.linkedin.com/in/mica-danah-paris-374a10289/",
  github: "https://github.com/danahparis21",
  resumePath: "/assets/documents/resume/MicaDanahParis_Resume.pdf",
};

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Row-major 3x2 layout with 6 keys: 5 contact channels + 1 spammable tactile ASMR key! */
export const CONTACT_KEYS: ContactKey[] = [
  { id: "email", label: "Email", glyph: "@", hint: PROFILE.email, href: `mailto:${PROFILE.email}`, tone: "cream" },
  { id: "linkedin", label: "LinkedIn", glyph: "in", hint: "Connect with me", href: PROFILE.linkedin, tone: "pink", external: true },
  { id: "github", label: "GitHub", glyph: "</>", hint: "danahparis21", href: PROFILE.github, tone: "glass", external: true },
  { id: "resume", label: "Resume", glyph: "CV", hint: "Download PDF", href: PROFILE.resumePath, tone: "pink", download: "MicaDanahParis_Resume.pdf" },
  { id: "phone", label: "Call", glyph: "TEL", hint: PROFILE.phone, href: telHref(PROFILE.phone), tone: "cream" },
  { id: "asmr", label: "ASMR", glyph: "✦", hint: "Tactile switch · Spam me!", tone: "pink" },
];
