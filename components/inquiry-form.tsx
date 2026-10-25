"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";

type Props = { formType: "contact" | "admission"; className?: string; introEyebrow?: string; introTitle?: string; introDescription?: string };
export function InquiryForm({ formType, className = "", introEyebrow, introTitle, introDescription }: Props) {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const isAdmission = formType === "admission";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setFeedback(null);
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    if (isAdmission) values.name = String(values.parentName || "");
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, formType }) });
      const data = await response.json() as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || data.message || "Could not send your enquiry.");
      setFeedback({ type: "success", message: data.message || "Thank you. Your enquiry has been received." }); form.reset();
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Something went wrong. Please try again or call the school." });
    } finally { setPending(false); }
  }
  return <form className={`inquiry-form ${className}`} onSubmit={submit}>
    {isAdmission && <div className="form-intro"><span className="eyebrow">{introEyebrow || "ADMISSION ENQUIRY"}</span><h2>{introTitle || "Tell us a little about your child"}</h2><p>{introDescription || "Submit the form and the school team can follow up with you."}</p></div>}
    <div className="form-grid">
      {isAdmission && <div className="form-field"><label htmlFor="studentName">Student’s full name *</label><input id="studentName" name="studentName" required minLength={2} maxLength={100} placeholder="Enter student's name" autoComplete="off"/></div>}
      {isAdmission && <div className="form-field"><label htmlFor="parentName">Father’s / guardian’s name *</label><input id="parentName" name="parentName" required minLength={2} maxLength={100} placeholder="Enter father’s or guardian’s name" autoComplete="name"/></div>}
      {!isAdmission && <div className="form-field"><label htmlFor={`${formType}-name`}>Your name *</label><input id={`${formType}-name`} name="name" required minLength={2} maxLength={100} placeholder="Enter your name" autoComplete="name"/></div>}
      {isAdmission && <div className="form-field"><label htmlFor="motherName">Mother’s name</label><input id="motherName" name="motherName" maxLength={100} placeholder="Enter mother’s name" autoComplete="off"/></div>}
      <div className="form-field"><label htmlFor={`${formType}-phone`}>Mobile number *</label><input id={`${formType}-phone`} name="phone" required minLength={7} maxLength={20} pattern="[+()0-9 .-]{7,20}" inputMode="tel" placeholder="Your contact number" autoComplete="tel"/></div>
      <div className="form-field"><label htmlFor={`${formType}-email`}>Email address</label><input id={`${formType}-email`} name="email" type="email" maxLength={254} placeholder="you@example.com" autoComplete="email"/></div>
      {isAdmission ? <div className="form-field"><label htmlFor="classApplyingFor">Class applying for *</label><select id="classApplyingFor" name="classApplyingFor" required defaultValue=""><option value="" disabled>Select a class</option>{Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={`Class ${i + 1}`}>Class {i + 1}</option>)}</select></div> : <div className="form-field"><label htmlFor="contact-subject">Subject</label><input id="contact-subject" name="subject" maxLength={120} placeholder="How can we help?"/></div>}
      {isAdmission && <div className="form-field field-wide"><label htmlFor="homeAddress">Home address</label><textarea id="homeAddress" name="address" maxLength={500} rows={2} placeholder="Enter your home address" autoComplete="street-address"/></div>}
      {isAdmission && <div className="form-field field-wide"><label htmlFor="previousSchool">Previous school (optional)</label><input id="previousSchool" name="previousSchool" maxLength={160} placeholder="Enter previous school name"/></div>}
      <div className="form-field field-wide"><label htmlFor={`${formType}-message`}>{isAdmission ? "Additional message or transport enquiry" : "Message *"}</label><textarea id={`${formType}-message`} name="message" required={!isAdmission} minLength={isAdmission ? undefined : 5} maxLength={3000} rows={4} placeholder={isAdmission ? "Ask about school transport or share any questions you have." : "Write your message here..."}/></div>
      <div className="honeypot" aria-hidden="true"><label htmlFor={`${formType}-website`}>Leave this field empty</label><input id={`${formType}-website`} name="website" tabIndex={-1} autoComplete="off"/></div>
    </div>
    <button className="button button-primary submit-button" type="submit" disabled={pending}>{pending ? "Sending…" : isAdmission ? "Submit Admission Enquiry" : "Send Message"}<Icon name="send" size={16}/></button>
    {feedback && <p className={`form-feedback ${feedback.type}`} role="status" aria-live="polite">{feedback.message}</p>}
    <p className="form-note">Please do not include sensitive identity or medical documents in this form.</p>
  </form>;
}
