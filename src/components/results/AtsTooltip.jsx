// Renders "ATS" with a hover tooltip explaining the acronym.
// Use only on the first appearance of "ATS" in the results UI.
export default function AtsTooltip() {
  return (
    <span className="ats-tip">
      ATS
      <span className="ats-tip__bubble">
        Applicant Tracking System - the software that filters resumes before a human ever sees them
      </span>
    </span>
  )
}
