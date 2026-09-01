/** Marketing display only. Not entitlement enforcement. */

export const PLAN_IDS = ["free", "pro", "business"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export interface DisplayPlan {
  id: PlanId;
  monthlyPrice: number | null;
  popular?: boolean;
  comingSoon?: boolean;
}

export const DISPLAY_PLANS: DisplayPlan[] = [
  { id: "free", monthlyPrice: 0 },
  { id: "pro", monthlyPrice: 9.99, popular: true },
  { id: "business", monthlyPrice: null, comingSoon: true },
];
