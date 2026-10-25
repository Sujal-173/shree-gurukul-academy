import { describe, expect, it } from "vitest";
import {
  getIndiaTimeSerial,
  getInquirySheetRow,
  getInquirySheetTab,
} from "../lib/google-sheets";
import { inquirySchema } from "../lib/validators";

describe("admission enquiry details", () => {
  it("accepts parent details and an optional admission message", () => {
    const result = inquirySchema.safeParse({
      formType: "admission",
      name: "Asha Patel",
      studentName: "Riya Patel",
      parentName: "Asha Patel",
      motherName: "Kavita Patel",
      phone: "9876543210",
      email: "asha@example.com",
      classApplyingFor: "Class 5",
      address: "New Lepa",
      previousSchool: "Local Primary School",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe("");
      expect(result.data.motherName).toBe("Kavita Patel");
      expect(result.data.previousSchool).toBe("Local Primary School");
    }
  });

  it("continues to require a message for contact enquiries", () => {
    const result = inquirySchema.safeParse({
      formType: "contact",
      name: "Asha Patel",
      phone: "9876543210",
    });

    expect(result.success).toBe(false);
  });
});

describe("Google Sheets enquiry rows", () => {
  it("routes contact enquiries to their own tab and exports a complete row", () => {
    const row = getInquirySheetRow({
      _id: "65d5cb5f4f09af62b9f31877",
      createdAt: new Date("2026-10-24T12:00:00.000Z"),
      formType: "contact",
      status: "new",
      name: "=1+1",
      phone: "+91 1234567890",
      message: "@hello",
    });

    expect(getInquirySheetTab("contact")).toBe("Contact Enquiries");
    expect(row).toHaveLength(8);
    expect(row[0]).toBe("65d5cb5f4f09af62b9f31877");
    expect(row[1]).toBe(getIndiaTimeSerial("2026-10-24T12:00:00.000Z"));
    expect(row[2]).toBe("New");
    expect(row[3]).toBe("=1+1");
    expect(row[7]).toBe("@hello");
  });

  it("routes admission enquiries to their own tab with admission details", () => {
    const row = getInquirySheetRow({
      _id: "65d5cb5f4f09af62b9f31877",
      createdAt: new Date("2026-10-24T12:00:00.000Z"),
      formType: "admission",
      status: "new",
      name: "Asha Patel",
      studentName: "Riya Patel",
      parentName: "Asha Patel",
      motherName: "Kavita Patel",
      phone: "9876543210",
      email: "asha@example.com",
      classApplyingFor: "Class 5",
      address: "New Lepa",
      previousSchool: "Local Primary School",
    });

    expect(getInquirySheetTab("admission")).toBe("Admission Enquiries");
    expect(row).toHaveLength(12);
    expect(row[2]).toBe("New");
    expect(row[3]).toBe("Riya Patel");
    expect(row[8]).toBe("Class 5");
  });

  it("converts UTC instants to India Standard Time spreadsheet serials", () => {
    const serial = getIndiaTimeSerial("2026-10-24T12:00:00.000Z");
    const roundTrip = new Date((serial - 25_569) * 86_400_000);

    expect(roundTrip.toISOString()).toBe("2026-10-24T17:30:00.000Z");
    expect(() => getIndiaTimeSerial("not-a-date")).toThrow(
      "Invalid enquiry submission date.",
    );
  });
});
