// Signature results — single source of truth for the headline numbers shown
// on the homepage (hero metrics, HomeBoard, CapabilitiesGrid, CareerSnapshot).
// Authoritative figures come from the CV (rendercv YAML); before 1.3 they were
// duplicated in 4+ places and drifted (e.g. the bot automation card said
// "1–2ч" while the CV says "2ч → 5 мин"). Change a number here, not in each
// component. Language-neutral: components build their own display strings.

export const METRICS = {
  abKyc: {
    /** A/B on KYC step: conversion lift in percentage points. */
    deltaPp: 6.24,
    /** Annualized incremental impact, EUR K. */
    annualEurK: 716,
  },
  retention: {
    /** M3 retention lift, percentage points. */
    deltaPp: 9.2,
    /** Incremental LTV, EUR K. */
    ltvEurK: 227,
  },
  rfm: {
    /** Share of revenue concentrated in the 4 key segments, before/after. */
    revenueBeforePct: 12,
    revenueAfterPct: 41,
  },
  bot: {
    /** Weekly report: from manual hours to automated minutes. */
    hoursBefore: 2,
    minutesAfter: 5,
  },
  portfolio: {
    projects: 14,
    sqlCases: 10,
  },
} as const;
