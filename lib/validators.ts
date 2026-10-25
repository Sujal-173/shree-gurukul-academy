import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(256),
});

export const inquirySchema = z
  .object({
    formType: z.enum(["contact", "admission"]),
    name: z.string().trim().min(2).max(100),
    studentName: z.string().trim().max(100).optional().default(""),
    parentName: z.string().trim().max(100).optional().default(""),
    motherName: z.string().trim().max(100).optional().default(""),
    address: z.string().trim().max(500).optional().default(""),
    previousSchool: z.string().trim().max(160).optional().default(""),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(20)
      .regex(/^[+()\d\s.-]+$/, "Enter a valid phone number."),
    email: z
      .union([z.email().max(254), z.literal("")])
      .optional()
      .default(""),
    classApplyingFor: z.string().trim().max(30).optional().default(""),
    subject: z.string().trim().max(120).optional().default(""),
    message: z.string().trim().max(3000).optional().default(""),
    website: z.string().max(0).optional().default(""),
  })
  .superRefine((values, ctx) => {
    if (values.formType === "contact" && values.message.trim().length < 5)
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: "Enter a message of at least five characters.",
      });

    if (values.formType === "admission") {
      if (!values.studentName.trim())
        ctx.addIssue({
          code: "custom",
          path: ["studentName"],
          message: "Enter the student's name.",
        });
      if (!values.parentName.trim())
        ctx.addIssue({
          code: "custom",
          path: ["parentName"],
          message: "Enter a parent or guardian name.",
        });
      if (!values.classApplyingFor.trim())
        ctx.addIssue({
          code: "custom",
          path: ["classApplyingFor"],
          message: "Select the class you are enquiring about.",
        });
    }
  });

export const contentSchema = z
  .object({
    brand: z
      .object({
        name: z.string().min(1).max(120),
        shortName: z.string().min(1).max(80),
        phone: z.string().max(30),
        email: z.string().max(254),
        gradeRange: z.string().max(80),
      })
      .passthrough(),
    home: z.record(z.string(), z.unknown()),
    navigation: z
      .array(
        z.object({
          label: z.string().min(1).max(80),
          href: z.string().min(1).max(200),
        }),
      )
      .max(20)
      .optional(),
    footer: z
      .object({
        description: z.string().max(1000),
        quickLinks: z
          .array(
            z.object({
              label: z.string().min(1).max(80),
              href: z.string().min(1).max(200),
            }),
          )
          .max(30),
        informationLinks: z
          .array(
            z.object({
              label: z.string().min(1).max(80),
              href: z.string().min(1).max(200),
            }),
          )
          .max(30),
      })
      .passthrough()
      .optional(),
    pages: z.record(z.string(), z.unknown()),
    seo: z.record(z.string(), z.unknown()),
  })
  .passthrough();
