import moment from 'moment'

const initialDate = new Date()
initialDate.setHours(0)
initialDate.setMinutes(0)
initialDate.setSeconds(0)
initialDate.setMilliseconds(0)

const mStartOfWeek = moment(initialDate).startOf('week')

export default {
  entries: [
    {
      beginsOn: mStartOfWeek.set({ hour: 9, minute: 0, second: 0, millisecond: 0 }).toDate(),
      endsOn: mStartOfWeek.set({ hour: 15, minute: 30, second: 0, millisecond: 0 }).toDate(),
      name: 'Mowing lawns'
    },
    {
      beginsOn: mStartOfWeek.clone().add(1, 'd').set({ hour: 22, minute: 0, second: 0, millisecond: 0 }).toDate(),
      endsOn: mStartOfWeek.clone().add(2, 'd').set({ hour: 7, minute: 30, second: 0, millisecond: 0 }).toDate(),
      name: 'Overnight security watch'
    }
  ],
  selectedDate: initialDate,
  selectedDateDraft: initialDate,
  newEntry: {
    beginsOn: initialDate,
    endsOn: initialDate,
    name: ''
  }
}
