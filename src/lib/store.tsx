"use client";

/**
 * The account side of the shop in the browser. Shopify owns the account: sign-in is Shopify's
 * passwordless email code (app/api/auth), and orders, addresses and subscriptions are read from
 * the Customer Account API on the server (lib/shopify/account) and changed through Server Actions
 * (app/actions/account). This context holds what the browser needs between pages:
 *
 *   user      who's signed in, asked for once per visit from /api/auth/me
 *   account   the full account, handed in by the account pages when they render
 *   saved     the wishlist, which stays in this browser
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { AccountData, Address, Order, Subscription, User } from "./account";
import { persisted } from "./persist";

export * from "./account";

type Store = {
  user: User | null;
  /** False until we know whether anyone is signed in. */
  ready: boolean;
  orders: Order[];
  addresses: Address[];
  subs: Subscription[];
  saved: string[];
  toggleSaved: (id: string) => void;
  /** The account pages pass in what they read from Shopify. */
  setAccount: (data: AccountData | null) => void;
  /** Off to Shopify's sign-in, then back to `next`. */
  signIn: (next?: string) => void;
  /** Signs out here and at Shopify. */
  signOut: () => void;
};

const savedStore = persisted<{ saved: string[] }>("makzos-account", { saved: [] });
const StoreContext = createContext<Store | null>(null);

export const loginHref = (next = "/account") => `/api/auth/login?next=${encodeURIComponent(next)}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const { saved } = useSyncExternalStore(savedStore.subscribe, savedStore.get, savedStore.getServer);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [account, setAccountState] = useState<AccountData | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .catch(() => ({ user: null }))
      .then((d: { user: User | null }) => {
        if (!live) return;
        setUser((u) => u ?? d.user);
        setReady(true);
      });
    return () => { live = false; };
  }, []);

  const setAccount = useCallback((data: AccountData | null) => {
    setAccountState(data);
    if (data) setUser(data.user);
    setReady(true);
  }, []);

  const toggleSaved = useCallback((id: string) => {
    savedStore.set((s) => ({ saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved] }));
  }, []);

  const signIn = useCallback((next?: string) => window.location.assign(loginHref(next ?? window.location.pathname)), []);

  const signOut = useCallback(() => {
    // A POST, so a stray link or prefetch can't sign anyone out.
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/logout";
    document.body.appendChild(form);
    form.submit();
  }, []);

  const value = useMemo<Store>(() => ({
    user, ready, saved, toggleSaved, setAccount, signIn, signOut,
    orders: account?.orders ?? [],
    addresses: account?.addresses ?? [],
    subs: account?.subs ?? [],
  }), [user, ready, saved, account, toggleSaved, setAccount, signIn, signOut]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** The account the current page read on the server, when it's an account page. */
const AccountContext = createContext<AccountData | null>(null);

export function useStore(): Store {
  const store = useContext(StoreContext);
  const page = useContext(AccountContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  // Inside an account page its own fresh read wins, from the very first render.
  return page ? { ...store, user: page.user, ready: true, orders: page.orders, addresses: page.addresses, subs: page.subs } : store;
}

/**
 * Gives the account the server just read to everything under it at once, and copies it into the
 * store so the header and other pages see the same account afterwards.
 */
export function AccountProvider({ data, children }: { data: AccountData | null; children: ReactNode }) {
  const store = useContext(StoreContext);
  const setAccount = store?.setAccount;
  useEffect(() => setAccount?.(data), [data, setAccount]);
  return <AccountContext.Provider value={data}>{children}</AccountContext.Provider>;
}
