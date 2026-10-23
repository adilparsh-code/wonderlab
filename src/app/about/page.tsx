import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About WonderLab",
  description: "The learning mission and principles behind WonderLab.",
};

export default function AboutPage() {
  return (
    <div className="container">
      <header className="page-intro">
        <p className="eyebrow">Learning by exploring</p>
        <h1>About WonderLab</h1>
        <p>
          WonderLab is a free learning arcade for curious students aged 11–16.
          It turns maths, science, logic, and beginner programming ideas into
          things you can try directly in a browser.
        </p>
      </header>
      <div className="feature-strip">
        <article className="feature-card">
          <h2>Try, notice, understand</h2>
          <p>
            Small interactions make an idea easier to inspect. Explanations
            matter as much as scores.
          </p>
        </article>
        <article className="feature-card">
          <h2>Open to everyone</h2>
          <p>
            Core activities are free, need no account, and work without sending
            scores to a server.
          </p>
        </article>
        <article className="feature-card">
          <h2>Honest models</h2>
          <p>
            Simulations simplify reality. Each science activity explains what
            it leaves out.
          </p>
        </article>
      </div>
      <section className="section callout">
        <h2>Built for practice, not promises</h2>
        <p>
          A completed game is not a measure of intelligence, a guarantee of
          grades, or a verified achievement. WonderLab is an independent
          educational project; no school partnerships or endorsements are
          claimed.
        </p>
      </section>
    </div>
  );
}
