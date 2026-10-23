import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What WonderLab stores and how it behaves in this release.",
};

export default function PrivacyPage() {
  return (
    <div className="container">
      <header className="page-intro">
        <p className="eyebrow">Privacy by design</p>
        <h1>Privacy</h1>
        <p>
          This page describes the application code in this release. Hosting
          providers may separately process request data as described by their
          own policies.
        </p>
      </header>
      <div className="card-grid">
        <article className="card">
          <h2>No account required</h2>
          <p>
            WonderLab does not ask for a name, email address, birthday,
            location, or school. There is no login, public chat, or user-posted
            content in this release.
          </p>
        </article>
        <article className="card">
          <h2>Optional local progress</h2>
          <p>
            If browser storage is available, completed game IDs and personal
            best scores are stored in local storage on this device. They are
            not sent to WonderLab servers by the application. Clearing browser
            data removes them. The Arcade also has a control to reset this
            local progress.
          </p>
        </article>
        <article className="card">
          <h2>Typing stays in the round</h2>
          <p>
            Typing Sprint compares the text in memory while the game is open.
            The typed sentence is not saved as progress. No analytics,
            advertising, or tracking scripts are included in the application.
          </p>
        </article>
      </div>
      <section className="section callout callout--blue">
        <h2>Hosting is separate</h2>
        <p>
          A static host can process technical request information such as IP
          addresses or request logs. No public deployment has been configured
          or verified, so this page does not claim that a host collects
          nothing. Review the selected host&apos;s current privacy terms before
          public launch and check legal requirements for the audiences and
          countries served.
        </p>
      </section>
    </div>
  );
}
