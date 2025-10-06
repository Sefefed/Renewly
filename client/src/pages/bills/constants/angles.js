export const BILL_ANALYSIS_ANGLES = [
  {
    id: "urgency_window",
    label: "Urgency window",
    tagline: "Stress-test due timing and late-fee exposure.",
    prompt:
      "Prioritize due timing, grace periods, and the concrete steps needed to dodge late fees or service interruptions.",
    fallbackHint:
      "Lens focus: highlight urgency windows, potential late fees, and what to do before the clock runs out.",
  },
  {
    id: "cash_flow_impact",
    label: "Cash-flow impact",
    tagline: "Map the payment to liquidity and runway.",
    prompt:
      "Explain how this payment affects cash flow, runway, and adjacent obligations. Surface mitigation levers if liquidity gets tight.",
    fallbackHint:
      "Lens focus: connect this bill to cash-flow pacing, pointing out cushions or pressure points in the near term.",
  },
  {
    id: "compliance_controls",
    label: "Compliance controls",
    tagline: "Check documentation, disputes, and audit readiness.",
    prompt:
      "Audit for documentation gaps, dispute triggers, or approval workflows that need attention before payment.",
    fallbackHint:
      "Lens focus: verify documentation, dispute paths, and approvals so compliance is airtight.",
  },
  {
    id: "vendor_relationship",
    label: "Vendor relationship",
    tagline: "Review expectations and negotiation opportunities.",
    prompt:
      "Comment on vendor communications, expected service levels, and whether a negotiation, renewal, or cancellation conversation is due.",
    fallbackHint:
      "Lens focus: assess vendor expectations and negotiation levers tied to this payment.",
  },
];

export const pickBillAngle = (previousId = null) => {
  const candidates = BILL_ANALYSIS_ANGLES.filter(
    (angle) => angle.id !== previousId
  );
  const pool = candidates.length ? candidates : BILL_ANALYSIS_ANGLES;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? BILL_ANALYSIS_ANGLES[0];
};
