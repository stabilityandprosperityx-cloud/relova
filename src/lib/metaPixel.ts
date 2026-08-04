import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Generates a unique event ID for Pixel ↔ CAPI deduplication. */
export function generateEventId(): string {
  return crypto.randomUUID();
}

/**
 * Fires a client-side Pixel event.
 * eventID must match the one sent to CAPI for deduplication.
 */
export function trackPixelEvent(
  eventName: string,
  eventId: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window.fbq !== "function") return;
  window.fbq("track", eventName, params ?? {}, { eventID: eventId });
}

/**
 * Fires a server-side CAPI event via the meta-capi Edge Function.
 * Never throws — analytics must not break user flows.
 */
export async function trackServerEvent(
  eventName: string,
  eventId: string,
  customData?: Record<string, unknown>,
  userData?: Record<string, unknown>,
): Promise<void> {
  try {
    await supabase.functions.invoke("meta-capi", {
      body: {
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        customData,
        userData,
      },
    });
  } catch {
    // intentionally swallow — analytics must not break user flows
  }
}

/**
 * Fires both Pixel and CAPI with the same eventID for deduplication.
 * Use for high-value conversion events (Registration, Purchase).
 */
export async function trackDualEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  userData?: Record<string, unknown>,
): Promise<void> {
  const eventId = generateEventId();
  trackPixelEvent(eventName, eventId, customData);
  await trackServerEvent(eventName, eventId, customData, userData);
}
