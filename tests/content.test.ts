import { describe, expect, it } from "vitest";
import { defaultContent } from "../lib/default-content";

describe("default academy content", () => {
  it("uses the confirmed grade range and contact details", () => {
    expect(defaultContent.brand.gradeRange).toBe("Classes 1–10");
    expect(defaultContent.brand.phone).toBe("7247371421");
    expect(defaultContent.brand.email).toBe("gurukulacedmynewlepa@gmail.com");
  });
  it("provides four distinct hero image assets", () => {
    expect(defaultContent.home.hero).toHaveLength(4);
    expect(new Set(defaultContent.home.hero.map((slide) => slide.image)).size).toBe(4);
  });
  it("has a CMS record for each primary route", () => {
    for (const route of ["about", "academics", "admissions", "facilities", "notices", "gallery", "vision", "contact", "disclosure", "calendar", "schoolLife", "privacy"]) {
      expect(defaultContent.pages[route], `missing page ${route}`).toBeTruthy();
    }
  });
  it("does not invent named school leaders", () => {
    expect(defaultContent.home.leaders.every((leader) => leader.name === "")).toBe(true);
  });
  it("provides editable defaults for homepage labels and bullet points", () => {
    expect(defaultContent.home.introPoints.split(/\r?\n/)).toHaveLength(4);
    expect(defaultContent.home.heroCaptionTitle).toBeTruthy();
    expect(defaultContent.home.valuesSubtitle).toBeTruthy();
  });
  it("provides CMS-managed header, homepage CTA and footer headings", () => {
    expect(defaultContent.brand.enquiryLabel).toBe("Enquiry Now");
    expect(defaultContent.brand.enquiryHref).toBe("/admission#enquiry");
    expect(defaultContent.home.introButtonLabel).toBeTruthy();
    expect(defaultContent.home.ctaSecondaryHref).toBe("/contact");
    expect(defaultContent.footer.quickLinksTitle).toBe("Quick Links");
    expect(defaultContent.footer.informationLinksTitle).toBe("Information");
    expect(defaultContent.footer.contactTitle).toBe("Contact Details");
  });
  it("provides editable section labels for interior page layouts", () => {
    expect(defaultContent.pages.about.commitmentTitle).toBe("Get current information directly from the school.");
    expect(defaultContent.pages.academics.levelsTitle).toBe("Classes & learning stages");
    expect(defaultContent.pages.admissions.stepsTitle).toBe("A simple enquiry-to-admission journey");
    expect(defaultContent.pages.contact.contactFormTitle).toBe("Send us a message");
    expect(defaultContent.pages.calendar.calendarBlockTitle).toBe("School Academic Calendar & Planners");
  });
  it("keeps the public About copy factual and locally specific", () => {
    expect(defaultContent.pages.about.body).toContain("New Lepa, Kasrawad, Khargone");
    expect(defaultContent.pages.about.body).toContain("Classes 1–10");
    expect(defaultContent.pages.about.body).toContain("contact the academy");
    expect(defaultContent.seo.description).toContain("New Lepa, Kasrawad, Khargone");
  });
});
