import type { Comment, Ticket } from "@/lib/tickets/types";
import { seedComments, seedTickets } from "@/lib/tickets/seed";

const STORAGE_KEY = "easy-support-tickets";
const LEGACY_STORAGE_KEY = "easy-click-support-tickets";

export type TicketsStorage = {
  tickets: Ticket[];
  comments: Comment[];
  publicIdCounter: number;
};

const isString = (value: unknown): value is string => typeof value === "string";
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

const isTicket = (value: unknown): value is Ticket => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    isString(record.id) &&
    isString(record.publicId) &&
    isString(record.title) &&
    isString(record.description) &&
    isString(record.status) &&
    isString(record.priority) &&
    isString(record.requester) &&
    isString(record.createdAt) &&
    isString(record.updatedAt) &&
    isStringArray(record.tags) &&
    (record.assignee === undefined || isString(record.assignee))
  );
};

const isComment = (value: unknown): value is Comment => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    isString(record.id) &&
    isString(record.ticketId) &&
    isString(record.author) &&
    isString(record.message) &&
    (record.authorRole === undefined || isString(record.authorRole)) &&
    isString(record.createdAt)
  );
};

const isTicketsStorage = (value: unknown): value is TicketsStorage => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.tickets) || !Array.isArray(record.comments)) return false;
  if (typeof record.publicIdCounter !== "number") return false;
  return record.tickets.every(isTicket) && record.comments.every(isComment);
};

const hasTicketsAndComments = (value: unknown): value is { tickets: Ticket[]; comments: Comment[] } => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.tickets) || !Array.isArray(record.comments)) return false;
  return record.tickets.every(isTicket) && record.comments.every(isComment);
};

const getNextPublicIdCounter = (tickets: Ticket[]) => {
  const maxNumber = tickets.reduce((acc, ticket) => {
    const match = ticket.publicId.match(/(\d+)/);
    const value = match ? Number(match[1]) : 0;
    return Number.isNaN(value) ? acc : Math.max(acc, value);
  }, 0);
  return maxNumber + 1;
};

const safeParse = (value: string): { storage: TicketsStorage; source: "persist" | "plain" } | null => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (isTicketsStorage(parsed)) {
      return { storage: parsed, source: "plain" };
    }
    if (parsed && typeof parsed === "object" && "state" in parsed) {
      const record = parsed as Record<string, unknown>;
      const state = record.state;
      if (isTicketsStorage(state)) {
        return { storage: state, source: "persist" };
      }
      if (hasTicketsAndComments(state)) {
        const normalized: TicketsStorage = {
          tickets: state.tickets,
          comments: state.comments,
          publicIdCounter: getNextPublicIdCounter(state.tickets)
        };
        return { storage: normalized, source: "persist" };
      }
    }
    if (hasTicketsAndComments(parsed)) {
      const normalized: TicketsStorage = {
        tickets: parsed.tickets,
        comments: parsed.comments,
        publicIdCounter: getNextPublicIdCounter(parsed.tickets)
      };
      return { storage: normalized, source: "plain" };
    }
    return null;
  } catch {
    return null;
  }
};

export function getTicketsStorage(): TicketsStorage {
  if (typeof window === "undefined") {
    return {
      tickets: seedTickets,
      comments: seedComments,
      publicIdCounter: getNextPublicIdCounter(seedTickets)
    };
  }

  let raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      window.localStorage.setItem(STORAGE_KEY, legacyRaw);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      raw = legacyRaw;
    }
  }
  if (!raw) {
    const seeded = {
      tickets: seedTickets,
      comments: seedComments,
      publicIdCounter: getNextPublicIdCounter(seedTickets)
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  const parsed = safeParse(raw);
  if (!parsed) {
    const seeded = {
      tickets: seedTickets,
      comments: seedComments,
      publicIdCounter: getNextPublicIdCounter(seedTickets)
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  const normalized: TicketsStorage = {
    tickets: parsed.storage.tickets,
    comments: parsed.storage.comments,
    publicIdCounter:
      Number.isFinite(parsed.storage.publicIdCounter) && parsed.storage.publicIdCounter > 0
        ? parsed.storage.publicIdCounter
        : getNextPublicIdCounter(parsed.storage.tickets)
  };

  if (normalized.tickets.length === 0) {
    const seeded = {
      tickets: seedTickets,
      comments: seedComments,
      publicIdCounter: getNextPublicIdCounter(seedTickets)
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  if (parsed.source === "plain") {
    if (normalized.publicIdCounter !== parsed.storage.publicIdCounter) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
  }

  return normalized;
}

export function setTicketsStorage(data: TicketsStorage) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
