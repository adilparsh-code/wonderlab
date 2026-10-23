import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Accessibility features and known limitations in WonderLab.",
};

export default function AccessibilityPage() {
  return (
    <div className="container">
      <header className="page-intro">
        <p className="eyebrow">Designed for different ways of exploring</p>
        <h1>Accessibility</h1>
        <p>
          WonderLab uses semantic headings and landmarks, visible keyboard
          focus, labelled form controls, text feedback, and responsive layouts.
          The maze supports both arrow keys and on-screen controls, and reduced
          motion is respected.
        </p>
      </header>
      <div className="callout">
        <h2>Keep improving</h2>
        <p>
          This release has not been independently audited with assistive
          technology. If an activity is difficult to use, please report the
          route and issue to the project maintainer. No public contact address
          has been configured yet.
        </p>
      </div>
    </div>
  );
}
