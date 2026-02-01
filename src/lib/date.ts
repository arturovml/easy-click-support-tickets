const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC"
});

const dayLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "2-digit",
  timeZone: "UTC"
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC"
});

export const formatDate = (isoDate: string) => dateFormatter.format(new Date(isoDate));

export const formatDayLabel = (date: Date) => dayLabelFormatter.format(date);

export const formatDateTime = (isoDate: string) =>
  dateTimeFormatter.format(new Date(isoDate));
