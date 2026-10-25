import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { appendInquiryToGoogleSheet } from "@/lib/google-sheets";
import { isSameOrigin, jsonError } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statuses = new Set(["new", "in-progress", "resolved"]);

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request)))
    return jsonError("Authentication required.", 401);

  try {
    const db = await getDb();
    const items = await db
      .collection("inquiries")
      .find({}, { projection: { ipHash: 0 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return Response.json(
      {
        inquiries: items.map((item) => ({
          ...item,
          _id: item._id.toString(),
          createdAt:
            item.createdAt instanceof Date
              ? item.createdAt.toISOString()
              : item.createdAt,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "Inquiry list failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return jsonError(
      "Could not load enquiries. Check the database configuration.",
      503,
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminRequest(request)))
    return jsonError("Authentication required.", 401);
  if (!isSameOrigin(request))
    return jsonError("Invalid request origin.", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }
  if (!body || typeof body !== "object")
    return jsonError("Invalid request body.", 400);

  const { id, status } = body as { id?: unknown; status?: unknown };
  if (
    typeof id !== "string" ||
    !ObjectId.isValid(id) ||
    typeof status !== "string" ||
    !statuses.has(status)
  )
    return jsonError("Invalid inquiry update.", 400);

  try {
    const db = await getDb();
    const result = await db
      .collection("inquiries")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } },
      );
    if (!result.matchedCount) return jsonError("Enquiry not found.", 404);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(
      "Inquiry update failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return jsonError("Could not update this enquiry.", 503);
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request)))
    return jsonError("Authentication required.", 401);
  if (!isSameOrigin(request))
    return jsonError("Invalid request origin.", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }
  if (!body || typeof body !== "object")
    return jsonError("Invalid request body.", 400);

  const { id } = body as { id?: unknown };
  if (typeof id !== "string" || !ObjectId.isValid(id))
    return jsonError("Invalid enquiry ID.", 400);

  try {
    const collection = (await getDb()).collection("inquiries");
    const inquiry = await collection.findOne({ _id: new ObjectId(id) });
    if (!inquiry) return jsonError("Enquiry not found.", 404);
    if (inquiry.googleSheetsSyncStatus === "synced")
      return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });

    try {
      await appendInquiryToGoogleSheet({
        _id: inquiry._id.toString(),
        createdAt: inquiry.createdAt,
        formType: inquiry.formType,
        status: inquiry.status,
        name: inquiry.name,
        studentName: inquiry.studentName,
        parentName: inquiry.parentName,
        motherName: inquiry.motherName,
        phone: inquiry.phone,
        email: inquiry.email,
        classApplyingFor: inquiry.classApplyingFor,
        address: inquiry.address,
        previousSchool: inquiry.previousSchool,
        subject: inquiry.subject,
        message: inquiry.message,
      });
      await collection.updateOne(
        { _id: inquiry._id },
        {
          $set: {
            googleSheetsSyncStatus: "synced",
            googleSheetsSyncedAt: new Date(),
          },
          $unset: { googleSheetsSyncError: "" },
        },
      );
      return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    } catch (syncError) {
      console.error(
        "Admin Google Sheets retry failed:",
        syncError instanceof Error ? syncError.message : "Unknown sync error",
      );
      await collection.updateOne(
        { _id: inquiry._id },
        { $set: { googleSheetsSyncStatus: "failed" } },
      );
      return jsonError(
        "Could not sync this enquiry to Google Sheets. Check the integration configuration and try again.",
        503,
      );
    }
  } catch (error) {
    console.error(
      "Google Sheets retry could not load enquiry:",
      error instanceof Error ? error.message : "Unknown database error",
    );
    return jsonError("Could not retry the enquiry sync.", 503);
  }
}
