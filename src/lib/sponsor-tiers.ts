export const SPONSOR_TIERS = ['general_partner', 'partner', 'sponsor'] as const;
export type SponsorTier = typeof SPONSOR_TIERS[number];

export const TIER_LABELS: Record<SponsorTier, string> = {
  general_partner: "Генеральный партнёр",
  partner: "Партнёр",
  sponsor: "Спонсор",
};
