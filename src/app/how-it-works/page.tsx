import type { Metadata } from "next";
import { ScienceExperiences } from "@/components/science-experiences";

export const metadata: Metadata = {
  title: "How Things Work",
  description: "Explore simple interactive models of science and technology.",
};

export default function HowItWorksPage() {
  return (
    <div className="container">
      <header className="page-intro">
        <p className="eyebrow">Interactive science</p>
        <h1>How things work</h1>
        <p>
          Change a control, observe what changes, and use the explanation to
          connect the model to the real world. Each diagram is intentionally
          simplified.
        </p>
      </header>
      <ScienceExperiences />
    </div>
  );
}
