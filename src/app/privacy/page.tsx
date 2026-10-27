import type { Metadata } from "next";
import { ProgressSummary } from "@/components/progress-summary";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Learning without student accounts: local progress, privacy controls, and hosting limitations.",
};

export default function PrivacyPage() {
  return (
    <div className="container">
      <header className="page-intro">
        <p className="eyebrow">Learning without student accounts</p>
        <h1>Privacy</h1>
        <p>Last updated: <time dateTime="2026-10-27">27 October 2026</time>.</p>
        <p>
          WonderLab is an independent educational project with games, science
          models, and beginner coding activities designed for learners aged 11–16.
          We do not intentionally collect personal data from visitors aged 11–18.
          We apply the same privacy-first approach to every visitor.
        </p>
        <p>
          This is a commitment about our educational application. Delivering a
          website involves a hosting provider, which may process technical request
          information. Its current settings and practices are not verified here.
        </p>
      </header>
      <div className="card-grid">
        <article className="card">
          <h2>No account or personal profile</h2>
          <p>
            Activities need no registration or login. We do not ask for names,
            email addresses, birthdays, schools, student IDs, parent contact
            details, photos, or recordings. There is no public chat, upload,
            comment, or profile feature. Please use only practice answers and
            the supplied typing sentence; do not enter personal information.
          </p>
        </article>
        <article className="card">
          <h2>Progress stays on this device</h2>
          <p>
            When browser storage is available, completing a game automatically
            saves its game ID and numeric personal-best score on this browser.
            The record also has a format version. It has no name, account ID,
            timestamp, or browsing history. Application code does not send it
            to a server or sync it between devices.
          </p>
        </article>
        <article className="card">
          <h2>Practice stays in the activity</h2>
          <p>
            Search text, game answers, typing input, science controls, and Coding
            Lab choices are processed in browser memory. They are not saved as
            progress or sent to an AI provider, analytics service, or remote
            logging service by our application. Coding Lab uses fixed choices;
            it does not execute or upload student code.
          </p>
        </article>
        <article className="card">
          <h2>No tracking or advertising in the app</h2>
          <p>
            Our application includes no analytics, advertising pixels, session
            replay, behavioural profiling, targeted advertising, or external AI
            integration. We will not sell children&apos;s personal data or use it
            for targeted advertising. This promise does not describe unverified
            third-party practices.
          </p>
        </article>
        <article className="card">
          <h2>Browser storage and cookies</h2>
          <p>
            Application code does not set cookies or use session storage. Local
            progress uses a browser local-storage entry called
            {" "}<code>wonderlab.progress.v1</code>. It has no automatic expiry.
            Anyone using the same browser profile may see those scores, so
            device-local progress should not be treated as anonymous or private
            from other device users. Games remain usable if storage is blocked.
          </p>
        </article>
        <article className="card">
          <h2>Resources and security</h2>
          <p>
            The reviewed application serves its own scripts and styles, uses
            system fonts, and has no third-party embeds or remote database.
            It handles unavailable or unreadable local storage without requiring
            an account. These measures do not guarantee security or establish
            legal compliance; hosting security and response headers still need
            verification on the deployed site.
          </p>
        </article>
      </div>
      <section className="section" aria-labelledby="clear-progress-heading">
        <h2 id="clear-progress-heading">Clear local progress</h2>
        <p>
          Use this control here or on the Arcade to remove WonderLab&apos;s saved
          progress from this browser. It leaves other local-storage entries
          alone. Open game views refresh saved progress after storage changes
          and read the current record before saving a completion. New completions
          can create a new record. Close other game tabs before clearing to avoid
          completions happening at the same time; this does not erase temporary
          activity inputs in other tabs.
        </p>
        <ProgressSummary />
        <p>
          You can also clear this site&apos;s data in browser settings. Saved scores
          may be lost when browser data is cleared or a private session ends.
          This control cannot delete hosting logs, data in another browser, or
          another device&apos;s data.
        </p>
      </section>
      <section className="section callout callout--blue">
        <h2>Hosting and technical information</h2>
        <p>
          A hosting provider or CDN may process IP addresses, requested URLs,
          user-agent information, and technical or security logs to deliver and
          protect the site. These can be identifying information. Exact
          collection, cookies, retention, access, locations, and deletion
          controls for the deployed service are not verified. We cannot promise
          that visiting the website involves zero data processing.
        </p>
        <p>
          The project&apos;s deployment workflow refers to Vercel, but this review
          has no verified production URL or access to its project settings.
          No claims are made about Vercel&apos;s current configuration or other
          hosting providers. A hosting review is required before stronger
          privacy promises or a production release of these changes.
        </p>
      </section>
      <section className="section callout">
        <h2>Who operates WonderLab and privacy concerns</h2>
        <p>
          WonderLab is an independent educational project. A verified legal
          operator name and monitored private privacy contact have not yet been
          published. This is an unresolved gap for the project owner to address;
          we do not provide an invented email address or privacy officer.
          Please do not post a child&apos;s information in public issue trackers.
        </p>
        <p>
          Any future collection feature needs explicit product approval and an
          appropriate legal review before use. This policy is not a legal
          opinion, compliance certification, or a claim of independent audit.
        </p>
      </section>
    </div>
  );
}
