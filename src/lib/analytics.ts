// Plausible analytics event tracking
export const EVENTS = {
  SUBSCRIBE: "subscribe",
  PICK_VIEW: "pick_view",
  BET_CLICK: "bet_click",
  SHARE_CLICK: "share_click",
  UPGRADE_CLICK: "upgrade_click",
  PARLAY_BUILD: "parlay_build",
  SIGN_IN: "sign_in",
} as const;

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number> }
    ) => void;
  }
}

export function trackEvent(
  name: string,
  props?: Record<string, string | number>
) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(name, props ? { props } : undefined);
  }
}
