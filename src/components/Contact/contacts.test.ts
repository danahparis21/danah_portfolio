import { describe, expect, it } from "vitest";
import { CONTACT_KEYS, telHref } from "./contacts";

const href = (id: string) => CONTACT_KEYS.find((k) => k.id === id)?.href;

describe("contact keys", () => {
  it("email key opens Danah's inbox", () => {
    expect(href("email")).toBe("mailto:danahparis.inf@gmail.com");
  });
  it("phone key dials the number without dashes", () => {
    expect(href("phone")).toBe("tel:094585431364");
    expect(telHref("0945-8543-1364")).toBe("tel:094585431364");
  });
  it("linkedin, github and resume point to the given links", () => {
    expect(href("linkedin")).toBe("https://www.linkedin.com/in/mica-danah-paris-374a10289/");
    expect(href("github")).toBe("https://github.com/danahparis21");
    expect(href("resume")).toBe("/assets/documents/resume/MicaDanahParis_Resume.pdf");
  });
});
