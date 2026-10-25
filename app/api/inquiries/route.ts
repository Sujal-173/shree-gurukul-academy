import { NextRequest } from "next/server";
import { Resend } from "resend";
import { getDb } from "@/lib/db";
import { appendInquiryToGoogleSheet } from "@/lib/google-sheets";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/security";
import { inquirySchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Invalid request origin.", 403);
  if (Number(request.headers.get("content-length") || 0) > 32_000) return jsonError("Form payload is too large.", 413);
  if (!rateLimit(`public-inquiry:${clientIp(request)}`, 5, 10 * 60 * 1000)) return jsonError("Too many enquiries from this connection. Please try again later.", 429);
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Invalid request body.", 400); }
  if (body && typeof body === "object" && "website" in body && typeof (body as { website?: unknown }).website === "string" && (body as { website: string }).website.trim()) {
    return Response.json({ ok: true, message: "Thank you. Your enquiry has been received." }, { headers: { "Cache-Control": "no-store" } });
  }
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Please check the form details.", 400);
  try {
    const db = await getDb();
    const { website: _honeypot, ...fields } = parsed.data;
    void _honeypot;
    const record = {
      ...fields,
      name: parsed.data.name.trim(),
      phone: parsed.data.phone.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      status: "new" as const,
      googleSheetsSyncStatus: "pending" as const,
      createdAt: new Date(),
    };
    const result = await db.collection("inquiries").insertOne(record);
    const inquiry = { ...record, _id: result.insertedId };
    let googleSheetsSyncStatus: "synced" | "failed" = "failed";
    try {
      await appendInquiryToGoogleSheet(inquiry);
      await db.collection("inquiries").updateOne(
        { _id: result.insertedId },
        {
          $set: {
            googleSheetsSyncStatus: "synced",
            googleSheetsSyncedAt: new Date(),
          },
          $unset: { googleSheetsSyncError: "" },
        },
      );
      googleSheetsSyncStatus = "synced";
    } catch (syncError) {
      console.error(
        "Enquiry stored but Google Sheets sync failed:",
        syncError instanceof Error ? syncError.message : "Unknown sync error",
      );
      try {
        await db.collection("inquiries").updateOne(
          { _id: result.insertedId },
          { $set: { googleSheetsSyncStatus: "failed" } },
        );
      } catch (statusError) {
        console.error(
          "Could not record Google Sheets sync failure:",
          statusError instanceof Error
            ? statusError.message
            : "Unknown database error",
        );
      }
    }

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL;
    const sender = process.env.RESEND_FROM_EMAIL;
    if (apiKey && recipient && sender) {
      try {
        const resend = new Resend(apiKey);
        const mailResult = await resend.emails.send({
          from: sender,
          to: recipient,
          subject: `Website ${parsed.data.formType} enquiry: ${parsed.data.name}`,
          text: [
            `Form: ${parsed.data.formType}`,
            `Name: ${parsed.data.name}`,
            `Student: ${parsed.data.studentName || "Not provided"}`,
            `Parent/Guardian: ${parsed.data.parentName || "Not provided"}`,
            `Mother: ${parsed.data.motherName || "Not provided"}`,
            `Phone: ${parsed.data.phone}`,
            `Email: ${parsed.data.email || "Not provided"}`,
            `Class: ${parsed.data.classApplyingFor || "Not provided"}`,
            `Address: ${parsed.data.address || "Not provided"}`,
            `Previous school: ${parsed.data.previousSchool || "Not provided"}`,
            `Subject: ${parsed.data.subject || "Not provided"}`,
            `Message: ${parsed.data.message}`,
            `Inquiry ID: ${result.insertedId.toString()}`,
          ].join("\n"),
        });
        if (mailResult.error) throw new Error(mailResult.error.message || "Notification email failed.");
      } catch (mailError) {
        console.error("Enquiry stored but notification email failed:", mailError instanceof Error ? mailError.message : "Unknown email error");
      }
    }
    const message =
      googleSheetsSyncStatus === "synced"
        ? "Thank you. Your enquiry has been received."
        : "Your enquiry was saved for the school, but the spreadsheet could not be updated yet. The school can retry the sync from the admin panel.";
    return Response.json({ ok: true, message }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not store enquiry:", error instanceof Error ? error.message : "Unknown database error");
    return jsonError("The form service is temporarily unavailable. Please call 7247371421 or email the school directly.", 503);
  }
}
