/** Persists auth toast across full-page reloads (e.g. logout). */
export const AUTH_TOAST_STORAGE_KEY = "flare_auth_toast";

export type PendingAuthToast = "signed-in" | "signed-out";

export function setPendingAuthToast(kind: PendingAuthToast): void {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(AUTH_TOAST_STORAGE_KEY, kind);
    } catch {
        // Ignore quota / private mode
    }
}

export function consumePendingAuthToast(): PendingAuthToast | null {
    if (typeof window === "undefined") return null;
    try {
        const value = sessionStorage.getItem(AUTH_TOAST_STORAGE_KEY);
        if (value === "signed-in" || value === "signed-out") {
            sessionStorage.removeItem(AUTH_TOAST_STORAGE_KEY);
            return value;
        }
    } catch {
        // Ignore
    }
    return null;
}
