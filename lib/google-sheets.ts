import { sign } from "node:crypto";

const sheetsScope = "https://www.googleapis.com/auth/spreadsheets";
const bearerScheme = "Bearer";
const tokenUrl = "https://oauth2.googleapis.com/token";
const sheetsApiUrl = "https://sheets.googleapis.com/v4/spreadsheets";
const indiaTimeZone = "Asia/Kolkata";
const headers = [
  "Inquiry ID",
  "Submitted at (IST)",
  "Status",
  "Name",
  "Phone",
  "Email",
  "Subject",
  "Message",
];
const admissionHeaders = [
  "Inquiry ID",
  "Submitted at (IST)",
  "Status",
  "Student name",
  "Parent/guardian name",
  "Mother's name",
  "Phone",
  "Email",
  "Class applying for",
  "Address",
  "Previous school",
  "Message",
];
const defaultContactTab = "Contact Enquiries";
const defaultAdmissionTab = "Admission Enquiries";
const statusOptions = [
  { value: "new", label: "New" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export type InquirySheetRecord = {
  _id: { toString(): string } | string;
  createdAt: Date | string;
  formType: "contact" | "admission";
  status: string;
  name: string;
  studentName?: string;
  parentName?: string;
  motherName?: string;
  phone: string;
  email?: string;
  classApplyingFor?: string;
  address?: string;
  previousSchool?: string;
  subject?: string;
  message?: string;
};

let cachedAccessToken: { value: string; expiresAt: number } | undefined;

function getSheetConfig() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const contactTab = process.env.GOOGLE_CONTACT_SHEET_TAB || defaultContactTab;
  const admissionTab =
    process.env.GOOGLE_ADMISSION_SHEET_TAB || defaultAdmissionTab;

  if (!email || !privateKey || !spreadsheetId)
    throw new Error("Google Sheets configuration is incomplete.");
  if (contactTab === admissionTab)
    throw new Error("Contact and admission enquiries must use different sheet tabs.");

  return { email, privateKey, spreadsheetId, contactTab, admissionTab };
}

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function getAccessToken(email: string, privateKey: string) {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000)
    return cachedAccessToken.value;

  const issuedAt = Math.floor(Date.now() / 1000);
  const unsignedToken = [
    encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    encodeBase64Url(
      JSON.stringify({
        iss: email,
        scope: sheetsScope,
        aud: tokenUrl,
        iat: issuedAt,
        exp: issuedAt + 3600,
      }),
    ),
  ].join(".");
  const assertion = `${unsignedToken}.${sign("RSA-SHA256", Buffer.from(unsignedToken), privateKey).toString("base64url")}`;
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  const result: unknown = await response.json();
  if (
    !response.ok ||
    !result ||
    typeof result !== "object" ||
    !("access_token" in result) ||
    typeof result.access_token !== "string" ||
    !("expires_in" in result) ||
    typeof result.expires_in !== "number"
  )
    throw new Error(`Google authentication failed (${response.status}).`);

  cachedAccessToken = {
    value: result.access_token,
    expiresAt: Date.now() + result.expires_in * 1000,
  };
  return cachedAccessToken.value;
}

function quoteTabName(tabName: string) {
  return `'${tabName.replace(/'/g, "''")}'`;
}

async function sheetsRequest(
  url: string,
  accessToken: string,
  init?: RequestInit,
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `${bearerScheme} ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    let message = `Google Sheets request failed (${response.status}).`;
    try {
      const result: unknown = await response.json();
      if (
        result &&
        typeof result === "object" &&
        "error" in result &&
        result.error &&
        typeof result.error === "object" &&
        "message" in result.error &&
        typeof result.error.message === "string"
      )
        message += ` ${result.error.message}`;
    } catch {
      // Keep the HTTP status in the error when Google returns a non-JSON body.
    }
    throw new Error(message);
  }
  return response;
}

export function getInquirySheetRow(inquiry: InquirySheetRecord) {
  const createdAt = getIndiaTimeSerial(inquiry.createdAt);
  const status =
    statusOptions.find((option) => option.value === inquiry.status)?.label ||
    inquiry.status;
  if (inquiry.formType === "admission") {
    return [
      inquiry._id.toString(),
      createdAt,
      status,
      inquiry.studentName || "",
      inquiry.parentName || "",
      inquiry.motherName || "",
      inquiry.phone,
      inquiry.email || "",
      inquiry.classApplyingFor || "",
      inquiry.address || "",
      inquiry.previousSchool || "",
      inquiry.message || "",
    ];
  }
  return [
    inquiry._id.toString(),
    createdAt,
    status,
    inquiry.name,
    inquiry.phone,
    inquiry.email || "",
    inquiry.subject || "",
    inquiry.message || "",
  ];
}

export function getIndiaTimeSerial(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new Error("Invalid enquiry submission date.");

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: indiaTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      if (part.type !== "literal") result[part.type] = part.value;
      return result;
    }, {});
  const indiaWallTime = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
    date.getUTCMilliseconds(),
  );
  return indiaWallTime / 86_400_000 + 25_569;
}

function getInquiryHeaders(formType: InquirySheetRecord["formType"]) {
  return formType === "admission" ? admissionHeaders : headers;
}

export function getInquirySheetTab(formType: InquirySheetRecord["formType"]) {
  return formType === "admission"
    ? process.env.GOOGLE_ADMISSION_SHEET_TAB || defaultAdmissionTab
    : process.env.GOOGLE_CONTACT_SHEET_TAB || defaultContactTab;
}

function columnName(column: number) {
  let result = "";
  while (column > 0) {
    const remainder = (column - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    column = Math.floor((column - 1) / 26);
  }
  return result;
}

async function getWorksheetIds(spreadsheetId: string, accessToken: string) {
  const url = `${sheetsApiUrl}/${encodeURIComponent(spreadsheetId)}?fields=${encodeURIComponent("sheets.properties(sheetId,title)")}`;
  const response = await sheetsRequest(url, accessToken);
  const result = (await response.json()) as {
    sheets?: { properties?: { sheetId?: number; title?: string } }[];
  };
  return new Map(
    result.sheets
      ?.filter(
        (
          sheet,
        ): sheet is {
          properties: { sheetId: number; title: string };
        } =>
          typeof sheet.properties?.sheetId === "number" &&
          typeof sheet.properties.title === "string",
      )
      .map((sheet) => [sheet.properties.title, sheet.properties.sheetId]) ||
      [],
  );
}

async function ensureWorksheetTabs(
  spreadsheetId: string,
  accessToken: string,
  tabNames: string[],
) {
  let worksheetIds = await getWorksheetIds(spreadsheetId, accessToken);
  const missingTabs = tabNames.filter((tabName) => !worksheetIds.has(tabName));
  if (missingTabs.length) {
    try {
      await sheetsRequest(
        `${sheetsApiUrl}/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
        accessToken,
        {
          method: "POST",
          body: JSON.stringify({
            requests: missingTabs.map((title) => ({
              addSheet: { properties: { title } },
            })),
          }),
        },
      );
    } catch (error) {
      worksheetIds = await getWorksheetIds(spreadsheetId, accessToken);
      if (tabNames.some((tabName) => !worksheetIds.has(tabName))) throw error;
    }
  }
  worksheetIds = await getWorksheetIds(spreadsheetId, accessToken);
  const unresolvedTabs = tabNames.filter((tabName) => !worksheetIds.has(tabName));
  if (unresolvedTabs.length)
    throw new Error(`Could not find Google Sheets tabs: ${unresolvedTabs.join(", ")}.`);
  return worksheetIds;
}

function getStatusValidationRule() {
  return {
    condition: {
      type: "ONE_OF_LIST",
      values: statusOptions.map((option) => ({
        userEnteredValue: option.label,
      })),
    },
    inputMessage: "Choose New, In Progress, or Resolved",
    strict: true,
    showCustomUi: true,
  };
}

async function applyStatusDropdown(
  spreadsheetId: string,
  sheetId: number,
  rowIndex: number,
  accessToken: string,
) {
  await sheetsRequest(
    `${sheetsApiUrl}/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        requests: [
          {
            setDataValidation: {
              range: {
                sheetId,
                startRowIndex: rowIndex,
                endRowIndex: rowIndex + 1,
                startColumnIndex: 2,
                endColumnIndex: 3,
              },
              rule: getStatusValidationRule(),
            },
          },
        ],
      }),
    },
  );
}

async function applyTimestampFormat(
  spreadsheetId: string,
  sheetId: number,
  rowIndex: number,
  accessToken: string,
) {
  await sheetsRequest(
    `${sheetsApiUrl}/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: rowIndex,
                endRowIndex: rowIndex + 1,
                startColumnIndex: 1,
                endColumnIndex: 2,
              },
              cell: {
                userEnteredFormat: {
                  numberFormat: {
                    type: "DATE_TIME",
                    pattern: 'dd mmm yyyy, hh:mm:ss AM/PM "IST"',
                  },
                  horizontalAlignment: "CENTER",
                },
              },
              fields:
                "userEnteredFormat.numberFormat,userEnteredFormat.horizontalAlignment",
            },
          },
        ],
      }),
    },
  );
}

export async function appendInquiryToGoogleSheet(
  inquiry: InquirySheetRecord,
) {
  const { email, privateKey, spreadsheetId, contactTab, admissionTab } =
    getSheetConfig();
  const accessToken = await getAccessToken(email, privateKey);
  const worksheetIds = await ensureWorksheetTabs(spreadsheetId, accessToken, [
    contactTab,
    admissionTab,
  ]);

  const tabName = getInquirySheetTab(inquiry.formType);
  const sheetId = worksheetIds.get(tabName);
  if (sheetId === undefined)
    throw new Error(`Google Sheets tab "${tabName}" is not available.`);
  const inquiryHeaders = getInquiryHeaders(inquiry.formType);
  const lastColumn = columnName(inquiryHeaders.length);
  const sheetRange = `${quoteTabName(tabName)}!A:${lastColumn}`;
  const baseUrl = `${sheetsApiUrl}/${encodeURIComponent(spreadsheetId)}/values`;
  const headerRange = `${quoteTabName(tabName)}!A1:${lastColumn}1`;
  const encodedHeaderRange = encodeURIComponent(headerRange);
  const sheetUrl = `${baseUrl}/${encodedHeaderRange}`;

  const headerResponse = await sheetsRequest(sheetUrl, accessToken);
  const headerResult = (await headerResponse.json()) as {
    values?: string[][];
  };
  if (!headerResult.values?.length || !headerResult.values[0]?.length) {
    await sheetsRequest(`${sheetUrl}?valueInputOption=RAW`, accessToken, {
      method: "PUT",
      body: JSON.stringify({ values: [inquiryHeaders] }),
    });
  } else if (
    inquiryHeaders.some(
      (header, index) => headerResult.values?.[0]?.[index] !== header,
    )
  ) {
    throw new Error(
      "The first row of the Google Sheet does not match the expected enquiry headers.",
    );
  }

  const idRange = encodeURIComponent(`${quoteTabName(tabName)}!A:A`);
  const idsResponse = await sheetsRequest(
    `${baseUrl}/${idRange}`,
    accessToken,
  );
  const idsResult = (await idsResponse.json()) as { values?: string[][] };
  const inquiryId = inquiry._id.toString();
  const existingRowIndex = idsResult.values?.findIndex(
    (row) => row[0] === inquiryId,
  );
  if (existingRowIndex !== undefined && existingRowIndex >= 0) {
    await applyStatusDropdown(
      spreadsheetId,
      sheetId,
      existingRowIndex,
      accessToken,
    );
    await applyTimestampFormat(
      spreadsheetId,
      sheetId,
      existingRowIndex,
      accessToken,
    );
    return;
  }

  const appendRange = encodeURIComponent(sheetRange);
  const appendResponse = await sheetsRequest(
    `${baseUrl}/${appendRange}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ values: [getInquirySheetRow(inquiry)] }),
    },
  );
  const appendResult = (await appendResponse.json()) as {
    updates?: { updatedRange?: string };
  };
  const appendedRow = appendResult.updates?.updatedRange?.match(
    /![A-Z]+(\d+):[A-Z]+\d+$/i,
  );
  if (!appendedRow)
    throw new Error("Google Sheets did not return the appended enquiry row.");
  await applyStatusDropdown(
    spreadsheetId,
    sheetId,
    Number(appendedRow[1]) - 1,
    accessToken,
  );
  await applyTimestampFormat(
    spreadsheetId,
    sheetId,
    Number(appendedRow[1]) - 1,
    accessToken,
  );
}
