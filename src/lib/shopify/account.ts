import "server-only";
import type { AccountData, Order, User } from "../account";
import { ShopifyError } from "./config";
import { ACCOUNT, ME, ONE_ORDER, customerApi, getSession, type Session } from "./customer";
import { fromCustomerOrder, toAddress, toSubscription, toUser, type CustomerOrder, type RawContract, type RawCustomer } from "./mappers";

type AccountResult = {
  customer: RawCustomer & {
    defaultAddress?: { id: string } | null;
    addresses: { nodes: Parameters<typeof toAddress>[0][] };
    orders: { nodes: CustomerOrder[] };
    subscriptionContracts: { nodes: RawContract[] };
  };
};

/** Signed out, or a token Shopify no longer accepts: both mean "show the sign-in". */
const signedOut = (e: unknown) => e instanceof ShopifyError && (e.detail as { status?: number })?.status === 401;

/** The whole account for the account pages, or null when nobody is signed in. Read-only: safe while rendering. */
export async function getAccount(): Promise<AccountData | null> {
  const session = await getSession({ canWrite: false });
  if (!session) return null;
  try {
    const { customer: c } = await customerApi<AccountResult>(session, ACCOUNT);
    return {
      user: toUser(c),
      addresses: c.addresses.nodes.map((a) => toAddress(a, c.defaultAddress?.id)).sort((a, b) => Number(!!b.isDefault) - Number(!!a.isDefault)),
      orders: c.orders.nodes.map(fromCustomerOrder),
      subs: c.subscriptionContracts.nodes.map(toSubscription),
    };
  } catch (e) {
    if (signedOut(e)) return null;
    throw e;
  }
}

/** Just who's signed in: for the header and the login page. */
export async function getUser(session?: Session | null): Promise<User | null> {
  const s = session ?? (await getSession());
  if (!s) return null;
  try {
    return toUser((await customerApi<{ customer: RawCustomer }>(s, ME)).customer);
  } catch (e) {
    if (signedOut(e)) return null;
    throw e;
  }
}

/** One of the signed-in customer's orders, by the numeric id in /orders/[id]. */
export async function getOrder(id: string): Promise<{ order: Order | null; signedIn: boolean }> {
  const session = await getSession({ canWrite: false });
  if (!session) return { order: null, signedIn: false };
  if (!/^\d+$/.test(id)) return { order: null, signedIn: true };
  try {
    const { order } = await customerApi<{ order: CustomerOrder | null }>(session, ONE_ORDER, { id: `gid://shopify/Order/${id}` });
    return { order: order ? fromCustomerOrder(order) : null, signedIn: true };
  } catch (e) {
    if (signedOut(e)) return { order: null, signedIn: false };
    throw e;
  }
}
