import Image from "next/image";
import type { LeaderProfile } from "@/lib/types";

type Props = {
  profiles: LeaderProfile[];
  schoolName: string;
};

function messageParagraphs(message: string) {
  return message
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function LeadershipSection({ profiles, schoolName }: Props) {
  if (!profiles.length) return null;

  return (
    <section className="home-leadership" aria-label="School leadership">
      {profiles.map((profile, index) => (
        <article className="home-leader-row" key={`${profile.role}-${profile.name}-${index}`}>
          <div className="wrap home-leader-layout">
            <div className="home-leader-profile">
              <div className="leader-mark">
                <Image
                  src={profile.portrait}
                  alt={profile.alt?.trim() || `Portrait of ${profile.name}, ${profile.role} at ${schoolName}`}
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1020px) 320px, 420px"
                />
              </div>
              <strong>{profile.name}</strong>
              {profile.designation?.trim() && <span>{profile.designation}</span>}
              <small className="home-leader-school">{schoolName}</small>
            </div>
            <div className="home-leader-message">
              <h2>{profile.role}</h2>
              {profile.quote?.trim() && <blockquote>{profile.quote}</blockquote>}
              {profile.message?.trim() && (
                <div className="home-leader-copy">
                  {messageParagraphs(profile.message).map((paragraph, paragraphIndex) => (
                    <p key={`${paragraphIndex}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                  ))}
                </div>
              )}
              <p className="home-leader-signoff">
                With Warm Regards,
                <br />
                <strong>{profile.name}</strong>
              </p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
