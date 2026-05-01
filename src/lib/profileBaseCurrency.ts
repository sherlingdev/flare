import type { SupabaseClient } from "@supabase/supabase-js";

/** PostgREST `GenericSchema` expects generated `Relationships`; hand-maintained `Database` breaks `.from()` inference without this. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see comment above
export type ProfileSupabaseClient = SupabaseClient<any>;
type Sb = ProfileSupabaseClient;

export const BASE_CURRENCY_STORAGE_KEY = "flare-base-currency";

function normalizeCode(code: string) {
    return code?.trim().toUpperCase() || "";
}

export function readStoredBaseCurrencyCode(): string {
    try {
        const raw = localStorage.getItem(BASE_CURRENCY_STORAGE_KEY);
        if (raw && /^[A-Za-z]{3}$/.test(raw)) {
            return raw.toUpperCase();
        }
    } catch {
        /* ignore */
    }
    return "USD";
}

export async function upsertProfileBaseCurrency(
    supabase: Sb,
    userId: string,
    code: string
): Promise<{ ok: boolean }> {
    const normalized = normalizeCode(code);
    if (!/^[A-Z]{3}$/.test(normalized)) return { ok: false };

    const { data: row, error: qErr } = await supabase
        .from("currencies")
        .select("id")
        .eq("code", normalized)
        .maybeSingle();

    if (qErr || row?.id == null) return { ok: false };

    const { error } = await supabase.from("profiles").upsert(
        { id: userId, currency_id: row.id },
        { onConflict: "id" }
    );
    if (error) {
        console.error("profiles currency_id upsert", error);
        return { ok: false };
    }
    return { ok: true };
}

/**
 * Logged-in: apply server base currency when set; otherwise seed profile from localStorage.
 */
export async function syncProfileBaseCurrencyOnLogin(
    supabase: Sb,
    userId: string,
    applyFromServer: (code: string) => void
): Promise<void> {
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("currency_id")
        .eq("id", userId)
        .maybeSingle();

    if (error) return;

    if (profile?.currency_id != null) {
        const { data: cur } = await supabase
            .from("currencies")
            .select("code")
            .eq("id", profile.currency_id)
            .maybeSingle();
        if (cur?.code) {
            applyFromServer(normalizeCode(cur.code));
            return;
        }
    }

    const code = readStoredBaseCurrencyCode();
    await upsertProfileBaseCurrency(supabase, userId, code);
}
