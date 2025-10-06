export const SUBSCRIPTION_ANALYSIS_ANGLES = [
  {
    id: "renewal_watch",
    label: "Renewal runway",
    tagline: "Readiness check on renewal timing and cancellation risk.",
    prompt:
      "Emphasize renewal runway, payment reliability, and potential churn triggers. Reference concrete dates or missing data that influence retention decisions.",
    fallbackHint:
      "Lens focus: stress-test renewal timing, payment reliability, and cancellation risk so the team can act before charges lock in.",
  },
  {
    id: "value_velocity",
    label: "Value velocity",
    tagline: "Surface utilization signals and outcome alignment.",
    prompt:
      "Highlight how spend maps to value delivery, usage patterns, and whether the subscription accelerates or drags progress. Call out missing context that prevents a value judgment.",
    fallbackHint:
      "Lens focus: connect spend to value delivery, underscoring where utilization feels strong versus speculative.",
  },
  {
    id: "budget_guardrails",
    label: "Budget guardrails",
    tagline: "Examine pacing, spikes, and mitigation levers.",
    prompt:
      "Detail cash flow cadence, budget pacing, and mitigation levers if spend drifts upward. Flag places where incomplete data weakens guardrails.",
    fallbackHint:
      "Lens focus: inspect budget pacing, potential spikes, and the safeguards that keep this line item predictable.",
  },
  {
    id: "stakeholder_alignment",
    label: "Stakeholder alignment",
    tagline: "Clarify ownership, expectations, and communication gaps.",
    prompt:
      "Clarify who relies on this service, expectations they hold, and any communication gaps or approvals needed before renewal decisions.",
    fallbackHint:
      "Lens focus: align stakeholders by documenting who depends on the service and what updates they need before the next renewal.",
  },
];

export const pickSubscriptionAngle = (previousId = null) => {
  const candidates = SUBSCRIPTION_ANALYSIS_ANGLES.filter(
    (angle) => angle.id !== previousId
  );
  const pool = candidates.length ? candidates : SUBSCRIPTION_ANALYSIS_ANGLES;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? SUBSCRIPTION_ANALYSIS_ANGLES[0];
};
