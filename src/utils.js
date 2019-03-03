import moment from 'moment'

export function formatHours (hours) {
  let wholeHours = Math.floor(hours)
  let remainingHours = hours - wholeHours
  let remainingMinutes = Math.round(remainingHours * 60)
  let paddedMinutes = `${remainingMinutes < 9 ? '0' : ''}${remainingMinutes}`

  return `${wholeHours}:${paddedMinutes}`
}

export function formatMonthName ({ year, month }) {
  return moment().set({ year: year, month: month, date: 1 }).format('MMMM YYYY')
}

export function dailyHoursFromEntriesInSelectedWeek ({ selectedDate, entries }) {
  let startOfWeek = moment(selectedDate).startOf('week')

  return moment.weekdays().map((dayName, dayIndex) => {
    let thisDate = startOfWeek.clone().add(dayIndex, 'd').toDate()
    let hours = entriesForSelectedDate({ selectedDate: thisDate, entries }).reduce((acc, entry) => {
      return acc + totalHoursOnSelectedDate({ date: thisDate, entry })
    }, 0)

    return {
      date: thisDate,
      hours: hours,
      isSelected: thisDate.getTime() === selectedDate.getTime()
    }
  })
}

export function entriesForSelectedDate ({ selectedDate, entries }) {
  return entries.filter((entry) => {
    return moment(entry.beginsOn).isSame(selectedDate, 'day') || moment(entry.endsOn).isSame(selectedDate, 'day')
  })
}

export function totalHoursOnSelectedDate ({ date, entry }) {
  let mFrom = moment.max(moment(entry.beginsOn), moment(date).startOf('day'))
  let mTo = moment.min(moment(entry.endsOn), moment(date).add(1, 'd').startOf('day'))

  return hoursBetween(mFrom, mTo)
}

function hoursBetween (from, to) {
  let mFrom = moment(from)
  let mTo = moment(to)
  let duration = moment.duration(mTo.diff(mFrom))

  return duration.asHours()
}
