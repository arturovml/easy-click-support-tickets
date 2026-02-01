export type TicketStatus = "nuevo" | "en_progreso" | "en_espera" | "resuelto" | "cerrado";

export type TicketPriority = "baja" | "media" | "alta" | "critica";

export type Ticket = {
  id: string;
  publicId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requester: string;
  assignee?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  ticketId: string;
  author: string;
  message: string;
  authorRole?: "customer" | "agent";
  createdAt: string;
};
