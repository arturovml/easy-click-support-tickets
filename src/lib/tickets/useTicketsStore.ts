"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Comment, Ticket, TicketPriority, TicketStatus } from "@/lib/tickets/types";
import { getTicketsStorage } from "@/lib/tickets/storage";

const STORAGE_KEY = "easy-support-tickets";

const createId = () => crypto.randomUUID();

type TicketsState = {
  tickets: Ticket[];
  comments: Comment[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  publicIdCounter: number;
  createTicket: (
    input: Omit<Ticket, "id" | "publicId" | "createdAt" | "updatedAt">
  ) => Ticket;
  addComment: (
    ticketId: string,
    input: Omit<Comment, "id" | "ticketId" | "createdAt">
  ) => Comment;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  updateTicketPriority: (ticketId: string, priority: TicketPriority) => void;
  assignTicket: (ticketId: string, assignee?: string) => void;
  byStatus: (status: TicketStatus) => Ticket[];
  search: (query: string) => Ticket[];
  counts: () => Record<TicketStatus, number>;
};

const initialData = getTicketsStorage();

export const useTicketsStore = create<TicketsState>()(
  persist(
    (set, get) => ({
      tickets: initialData.tickets,
      comments: initialData.comments,
      hasHydrated: false,
      publicIdCounter: initialData.publicIdCounter,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      createTicket: (input) => {
        const now = new Date().toISOString();
        const nextCounter = get().publicIdCounter;
        const publicId = `EC-${String(nextCounter).padStart(4, "0")}`;
        const requesterParts = input.requester.split(" · ");
        const requesterName = requesterParts[0]?.trim() ?? input.requester.trim();
        const requesterEmail = requesterParts[1]?.trim().toLowerCase();
        const requester = requesterEmail
          ? `${requesterName} · ${requesterEmail}`
          : requesterName;
        const ticket: Ticket = {
          ...input,
          id: createId(),
          publicId,
          requester,
          createdAt: now,
          updatedAt: now
        };
        set((state) => ({
          tickets: [ticket, ...state.tickets],
          publicIdCounter: state.publicIdCounter + 1
        }));
        return ticket;
      },
      addComment: (ticketId, input) => {
        const comment: Comment = {
          ...input,
          id: createId(),
          ticketId,
          createdAt: new Date().toISOString()
        };
        set((state) => ({ comments: [comment, ...state.comments] }));
        return comment;
      },
      updateTicketStatus: (ticketId, status) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, status, updatedAt: new Date().toISOString() }
              : ticket
          )
        }));
      },
      updateTicketPriority: (ticketId, priority) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, priority, updatedAt: new Date().toISOString() }
              : ticket
          )
        }));
      },
      assignTicket: (ticketId, assignee) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, assignee, updatedAt: new Date().toISOString() }
              : ticket
          )
        }));
      },
      byStatus: (status) => get().tickets.filter((ticket) => ticket.status === status),
      search: (query) => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return get().tickets;
        return get().tickets.filter((ticket) => {
          const haystack = [
            ticket.id,
            ticket.publicId,
            ticket.title,
            ticket.description,
            ticket.requester,
            ticket.assignee ?? "",
            ticket.tags.join(" ")
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalized);
        });
      },
      counts: () => {
        const base: Record<TicketStatus, number> = {
          nuevo: 0,
          en_progreso: 0,
          en_espera: 0,
          resuelto: 0,
          cerrado: 0
        };
        get().tickets.forEach((ticket) => {
          base[ticket.status] += 1;
        });
        return base;
      }
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
