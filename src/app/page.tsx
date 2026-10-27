import { GameCatalog } from "@/components/game-catalog";
import { scienceTopics } from "@/lib/catalog";

export default function Home() {
  return (
    <div className="container">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">Curiosity is a superpower</p>
          <h1 id="home-title">
            Don&apos;t just learn it. <span>Explore it.</span>
          </h1>
          <p>
            Play with big ideas, test your logic, and see how the world works —
            one small experiment at a time. Explore 50 games across five worlds, from orbital physics to coding and city planning.
          </p>
          <div className="button-row">
            <a className="button button--bright" href="/arcade/">
              Explore games <span aria-hidden="true">→</span>
            </a>
            <a className="button button--quiet" href="/how-it-works/">
              Discover science
            </a>
          </div>
          <span className="free-note">
            <span aria-hidden="true">●</span> Free to use. No account needed.
          </span>
        </div>
        <div
          className="hero-art"
          role="img"
          aria-label="An abstract orbit around a bright idea"
        >
          <span className="hero-orbit one" />
          <span className="hero-orbit two" />
          <div className="hero-core" aria-hidden="true">
            ?
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="games-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pick your next challenge</p>
            <h2 id="games-heading">Play your way into learning</h2>
          </div>
          <p>
            Quick games with a real idea behind every move. Search by topic or
            choose a level that feels right.
          </p>
        </div>
        <GameCatalog compact />
      </section>

      <section className="section" aria-labelledby="explore-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">See the invisible</p>
            <h2 id="explore-heading">How everyday things work</h2>
          </div>
          <a className="text-link" href="/how-it-works/">
            Explore all {scienceTopics.length} models →
          </a>
        </div>
        <div className="feature-strip">
          {scienceTopics.slice(0, 3).map((topic) => (
            <article className="feature-card" key={topic.id}>
              <span className="card-tag">{topic.id.replace("-", " ")}</span>
              <h3>{topic.title}</h3>
              <p>{topic.objective}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section callout callout--blue">
        <p className="eyebrow">Start making sense of code</p>
        <h2>Big ideas, one small instruction at a time.</h2>
        <p>
          Explore binary, conditions, loops, and algorithms with short challenges
          that run entirely in your browser.
        </p>
        <a className="button" href="/coding-lab/">
          Visit the Coding Lab
        </a>
      </section>
    </div>
  );
}