type WhatsAppFloatProps = {
  phone: string;
};

const DEFAULT_MESSAGE =
  "Namaste Shri Gurukul Academy, I would like to enquire about admissions for Classes 1–10.";

export function WhatsAppFloat({ phone }: WhatsAppFloatProps) {
  // wa.me requires an international-format number containing digits only.
  const rawNumber = phone.replace(/\D/g, "");
  const number = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  if (!number) return null;

  return (
    <a
      className="float-whatsapp"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Shri Gurukul Academy on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <svg
        className="float-whatsapp-icon"
        viewBox="0 0 24 24"
        width="27"
        height="27"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M20.52 3.48A11.8 11.8 0 0 0 12.1 0C5.55 0 .22 5.33.22 11.88c0 2.1.55 4.16 1.6 5.97L.12 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.44h.01C18.66 23.79 24 18.46 24 11.91a11.8 11.8 0 0 0-3.48-8.43ZM12.11 21.77h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.83 9.83 0 0 1-1.51-5.26c0-5.46 4.44-9.89 9.9-9.89a9.82 9.82 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.89-9.89 9.89Zm5.43-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.34Z"
        />
      </svg>
      <span className="float-whatsapp-copy">
        <strong>Chat with us</strong>
        <small>WhatsApp message</small>
      </span>
      <span className="float-whatsapp-arrow" aria-hidden="true">↗</span>
    </a>
  );
}
