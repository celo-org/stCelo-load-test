import path from "path"

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

// accounts_alfajores_10_0.01CELO_20220816_132253.json
export function parseExistingFileName(fullFilename: string) {
  const fileName = path.basename(fullFilename)
  const split = fileName.split("_")
  if (split.length === 0 || split[0] !== "accounts") {
    return null
  }

  return {
    network: split[1],
    accountCount: split[2],
    celoAmount: split[3].replace("CELO", ""),
    datetime: dateFromString(split[4] + split[5]),
  }
}

// 20220816132253
export function dateFromString(dateString: string) {
  const year = Number.parseInt(dateString.slice(0, 4))
  const month = Number.parseInt(dateString.slice(4, 6))
  const day = Number.parseInt(dateString.slice(6, 8))
  const hour = Number.parseInt(dateString.slice(8, 10))
  const minute = Number.parseInt(dateString.slice(10, 12))
  const second = Number.parseInt(dateString.slice(12, 14))

  return new Date(year, month, day, hour, minute, second)
}

export function addHours(numOfHours: number, date = new Date()) {
  const dateCopy = new Date(date.getTime())

  dateCopy.setTime(dateCopy.getTime() + (numOfHours * 60 * 60 * 1000))

  return dateCopy
}
