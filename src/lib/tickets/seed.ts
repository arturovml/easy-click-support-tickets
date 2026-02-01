import type { Comment, Ticket } from "@/lib/tickets/types";

const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

export const seedTickets: Ticket[] = [
  {
    id: "TCK-1001",
    publicId: "EC-1001",
    title: "Error al iniciar sesión en el panel",
    description: "Usuarios reportan que el login se queda en blanco después de enviar el formulario.",
    status: "en_progreso",
    priority: "alta",
    requester: "Lucía Fernández",
    assignee: "Carlos Vega",
    tags: ["auth", "frontend"],
    createdAt: iso(daysAgo(12)),
    updatedAt: iso(daysAgo(1))
  },
  {
    id: "TCK-1002",
    publicId: "EC-1002",
    title: "Solicitar acceso para nuevo agente",
    description: "Alta de cuenta para nuevo agente del área de soporte regional.",
    status: "nuevo",
    priority: "media",
    requester: "Marcos Silva",
    tags: ["accesos"],
    createdAt: iso(daysAgo(10)),
    updatedAt: iso(daysAgo(10))
  },
  {
    id: "TCK-1003",
    publicId: "EC-1003",
    title: "Tiempo de respuesta alto en listado de tickets",
    description: "El listado tarda más de 10 segundos en cargar con filtros activos.",
    status: "en_espera",
    priority: "critica",
    requester: "Sofía Morales",
    assignee: "Valentina Rojas",
    tags: ["performance", "backend"],
    createdAt: iso(daysAgo(9)),
    updatedAt: iso(daysAgo(4))
  },
  {
    id: "TCK-1004",
    publicId: "EC-1004",
    title: "Cambio de prioridad no se guarda",
    description: "Al cambiar la prioridad de un ticket vuelve a valor anterior.",
    status: "en_progreso",
    priority: "media",
    requester: "Javier Paredes",
    assignee: "Carlos Vega",
    tags: ["bug", "api"],
    createdAt: iso(daysAgo(8)),
    updatedAt: iso(daysAgo(2))
  },
  {
    id: "TCK-1005",
    publicId: "EC-1005",
    title: "Reporte mensual de tickets",
    description: "Solicitan exportar reporte mensual en formato CSV.",
    status: "nuevo",
    priority: "baja",
    requester: "Ana Ruiz",
    tags: ["reportes"],
    createdAt: iso(daysAgo(7)),
    updatedAt: iso(daysAgo(7))
  },
  {
    id: "TCK-1006",
    publicId: "EC-1006",
    title: "Notificaciones duplicadas por correo",
    description: "Se envían dos correos idénticos al crear un ticket.",
    status: "resuelto",
    priority: "alta",
    requester: "Iván Torres",
    assignee: "Paula Núñez",
    tags: ["email", "integraciones"],
    createdAt: iso(daysAgo(6)),
    updatedAt: iso(daysAgo(1))
  },
  {
    id: "TCK-1007",
    publicId: "EC-1007",
    title: "Actualizar firma de correo del equipo",
    description: "Cambiar firma corporativa en respuestas automáticas.",
    status: "cerrado",
    priority: "baja",
    requester: "Julieta Sáenz",
    assignee: "Paula Núñez",
    tags: ["configuracion"],
    createdAt: iso(daysAgo(6)),
    updatedAt: iso(daysAgo(3))
  },
  {
    id: "TCK-1008",
    publicId: "EC-1008",
    title: "Dashboard sin métricas de hoy",
    description: "Las métricas del día aparecen en cero desde la madrugada.",
    status: "en_progreso",
    priority: "critica",
    requester: "Pedro Castillo",
    assignee: "Valentina Rojas",
    tags: ["dashboard", "data"],
    createdAt: iso(daysAgo(5)),
    updatedAt: iso(daysAgo(1))
  },
  {
    id: "TCK-1009",
    publicId: "EC-1009",
    title: "Crear plantillas de respuesta rápida",
    description: "Necesitan plantillas para respuestas comunes en soporte.",
    status: "nuevo",
    priority: "media",
    requester: "Camila Ortega",
    tags: ["productividad"],
    createdAt: iso(daysAgo(4)),
    updatedAt: iso(daysAgo(4))
  },
  {
    id: "TCK-1010",
    publicId: "EC-1010",
    title: "Errores 500 en API de tickets",
    description: "Intermitencia con errores 500 al crear tickets.",
    status: "en_progreso",
    priority: "critica",
    requester: "Raúl Méndez",
    assignee: "Carlos Vega",
    tags: ["api", "incidente"],
    createdAt: iso(daysAgo(3)),
    updatedAt: iso(daysAgo(1))
  },
  {
    id: "TCK-1011",
    publicId: "EC-1011",
    title: "Agregar campo de categoría",
    description: "Se requiere un nuevo campo para clasificar tickets por área.",
    status: "en_espera",
    priority: "media",
    requester: "Daniela Soto",
    assignee: "Paula Núñez",
    tags: ["formulario", "ux"],
    createdAt: iso(daysAgo(3)),
    updatedAt: iso(daysAgo(2))
  },
  {
    id: "TCK-1012",
    publicId: "EC-1012",
    title: "Usuarios no reciben confirmación",
    description: "No llega el correo de confirmación al crear ticket.",
    status: "resuelto",
    priority: "alta",
    requester: "Hugo Navarro",
    assignee: "Valentina Rojas",
    tags: ["email", "bug"],
    createdAt: iso(daysAgo(2)),
    updatedAt: iso(daysAgo(1))
  }
];

export const seedComments: Comment[] = [
  {
    id: "C-2001",
    ticketId: "TCK-1001",
    author: "Carlos Vega",
    message: "Detectamos un problema en el callback del proveedor de auth. En revisión.",
    createdAt: iso(daysAgo(2))
  },
  {
    id: "C-2002",
    ticketId: "TCK-1001",
    author: "Lucía Fernández",
    message: "Gracias, quedo atenta. El impacto es alto en ventas.",
    createdAt: iso(daysAgo(2))
  },
  {
    id: "C-2003",
    ticketId: "TCK-1003",
    author: "Valentina Rojas",
    message: "Necesitamos métricas del query. ¿Hay logs del peak?",
    createdAt: iso(daysAgo(4))
  },
  {
    id: "C-2004",
    ticketId: "TCK-1004",
    author: "Carlos Vega",
    message: "Parece un problema de caché en el servicio de prioridades.",
    createdAt: iso(daysAgo(3))
  },
  {
    id: "C-2005",
    ticketId: "TCK-1006",
    author: "Paula Núñez",
    message: "Se corrigió la regla duplicada en el proveedor SMTP.",
    createdAt: iso(daysAgo(1))
  },
  {
    id: "C-2006",
    ticketId: "TCK-1008",
    author: "Valentina Rojas",
    message: "Los jobs nocturnos fallaron. Reejecutando pipeline.",
    createdAt: iso(daysAgo(1))
  },
  {
    id: "C-2007",
    ticketId: "TCK-1010",
    author: "Carlos Vega",
    message: "Identificado: timeout en validación de adjuntos. Se ajustará.",
    createdAt: iso(daysAgo(1))
  },
  {
    id: "C-2008",
    ticketId: "TCK-1012",
    author: "Valentina Rojas",
    message: "Se reactivó el webhook de confirmación.",
    createdAt: iso(daysAgo(1))
  }
];
