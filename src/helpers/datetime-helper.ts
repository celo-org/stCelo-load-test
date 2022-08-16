export function formatDate(date: Date) {
  const d = new Date(date)
  const year = String(d.getFullYear())
  const month = padLeft("00", String(d.getMonth() + 1))
  const day = padLeft("00", String(d.getDate()))
  const hours = padLeft("00", String(d.getHours()))
  const minutes = padLeft("00", String(d.getMinutes()))
  const seconds = padLeft("00", String(d.getSeconds()))

  return [year, month, day, "_", hours, minutes, seconds].join("")
}

export function padLeft(pad: string, str: string) {
  if (typeof str === "undefined") return pad
  return (pad + str).slice(-pad.length)
}
