export function addHours(numOfHours: number, date = new Date()) {
  const dateCopy = new Date(date.getTime())

  dateCopy.setTime(dateCopy.getTime() + (numOfHours * 60 * 60 * 1000))

  return dateCopy
}
