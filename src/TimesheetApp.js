import React from 'react'
import ReactDatePicker from 'react-datepicker'
import PropTypes from 'prop-types'
import moment from 'moment'
import { connect, Provider } from 'react-redux'
import { createStore } from 'redux'
import {
  formatHours,
  formatMonthName,
  totalHoursOnSelectedDate,
  dailyHoursFromEntriesInSelectedWeek,
  entriesForSelectedDate
} from './utils'
import initialState from './initialData'
import 'react-datepicker/dist/react-datepicker.css'
import './TimesheetApp.css'

// *****************************************************************************
// Presentational Components
// *****************************************************************************

const DateSelect = ({ selectedDate, isDraft, onDateChange, onButtonClick }) => (
  <div className={`DateSelect ${isDraft ? 'DateSelect_Draft' : 'DateSelect_NotDraft'}`}>
    <ReactDatePicker
      selected={selectedDate}
      onChange={onDateChange}
    />
    <button type='button' className='DateSelect-Button' onClick={onButtonClick}>Select</button>
  </div>
)

DateSelect.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  onDateChange: PropTypes.func.isRequired,
  onButtonClick: PropTypes.func.isRequired
}

const EntryView = ({ date, entry }) => (
  <div>
    {entry.name}
    {' '}
    &mdash;
    {' '}
    <strong>
      {formatHours(totalHoursOnSelectedDate({ date, entry }))}
    </strong>
  </div>
)

EntryView.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  entry: PropTypes.shape({
    beginsOn: PropTypes.instanceOf(Date).isRequired,
    endsOn: PropTypes.instanceOf(Date).isRequired,
    name: PropTypes.string.isRequired
  })
}

const EntryList = ({ entries, date }) => (
  <ul className='EntryList'>
    {entries.map((entry, index) => (
      <li key={index}>
        <EntryView entry={entry} date={date} />
      </li>
    ))}
  </ul>
)

EntryList.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      beginsOn: PropTypes.instanceOf(Date).isRequired,
      endsOn: PropTypes.instanceOf(Date).isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired
}

const MonthName = ({ year, month }) => (
  <div className='MonthName'>
    {formatMonthName({ year, month })}
  </div>
)

MonthName.propTypes = {
  year: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired
}

const WeekHourDay = ({ date, hours, isSelected, onClick }) => (
  <div className={['WeekHourDay', isSelected ? 'WeekHourDay_Selected' : 'WeekHourDay_NotSelected'].join(' ')}>
    <div className='WeekHourDay-NameContainer'>
      <span className='WeekHourDay-Name' onClick={onClick}>
        {moment(date).format('dd')}
      </span>
    </div>
    <div className='WeekHourDay-Hours'>{formatHours(hours)}</div>
  </div>
)

WeekHourDay.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  hours: PropTypes.number.isRequired,
  isSelected: PropTypes.bool
}

const WeekHourSummary = ({ dailyHours, onWeekDayClick }) => (
  <div className='WeekHourSummary'>
    {dailyHours.map((day, index) => (
      <WeekHourDay key={index} {...day} onClick={() => onWeekDayClick(day.date)} />
    ))}
  </div>
)

WeekHourSummary.propTypes = {
  dailyHours: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.instanceOf(Date).isRequired,
      hours: PropTypes.number.isRequired,
      isSelected: PropTypes.bool
    })
  ).isRequired,
  onWeekDayClick: PropTypes.func.isRequired
}

const NewEntry = ({ onInputChange, onDateInputChange, addEntry, beginsOn, endsOn, name }) => {
  return (
    <div className='NewEntry'>
      <form
        onSubmit={e => {
          e.preventDefault()

          let entry = { name, beginsOn, endsOn }

          let isValid =
            entry.name.trim() &&
            entry.beginsOn &&
            entry.endsOn

          if (!isValid) {
            return
          }

          if (entry.beginsOn === entry.endsOn) {
            return
          }

          addEntry(entry)
        }}
      >
        <input
          type='text'
          className='NewEntry_NameInput'
          value={name}
          onChange={onInputChange.bind(null, 'name')}
        />
        <br />
        <ReactDatePicker
          selected={beginsOn}
          onChange={onDateInputChange.bind(null, 'beginsOn')}
          showTimeSelect
          timeFormat='HH:mm'
          timeIntervals={15}
          dateFormat='MMMM d, yyyy h:mm aa'
          timeCaption='time'
        />
        {' '}
        &mdash;
        {' '}
        <ReactDatePicker
          selected={endsOn}
          onChange={onDateInputChange.bind(null, 'endsOn')}
          showTimeSelect
          timeFormat='HH:mm'
          timeIntervals={15}
          dateFormat='MMMM d, yyyy h:mm aa'
          timeCaption='time'
        />
        <br />
        <input type='submit' />
      </form>
    </div>
  )
}

NewEntry.propTypes = {
  onInputChange: PropTypes.func.isRequired,
  beginsOn: PropTypes.instanceOf(Date).isRequired,
  endsOn: PropTypes.instanceOf(Date).isRequired,
  name: PropTypes.string.isRequired
}

// *****************************************************************************
// Container Components
// *****************************************************************************

const WeekHourSummaryContainer = connect(
  (state) => {
    return {
      dailyHours: dailyHoursFromEntriesInSelectedWeek(state)
    }
  },
  (dispatch) => {
    return {
      onWeekDayClick: date => {
        dispatch({ type: 'SELECT_DATE', date: date })
      }
    }
  }
)(WeekHourSummary)

const MonthNameContainer = connect(
  (state) => {
    let mDate = moment(state.selectedDate)

    return {
      year: mDate.year(),
      month: mDate.month()
    }
  }
)(MonthName)

const DateSelectContainer = connect(
  (state) => {
    return {
      selectedDate: state.selectedDateDraft,
      isDraft: state.selectedDateDraft !== state.selectedDate
    }
  },
  (dispatch) => {
    return {
      onDateChange: date => {
        dispatch({ type: 'CHANGE_DATE_DRAFT', date: date })
      },
      onButtonClick: e => {
        dispatch({ type: 'SELECT_DATE_DRAFT' })
      }
    }
  }
)(DateSelect)

const EntryListContainer = connect(
  (state) => {
    return {
      entries: entriesForSelectedDate(state),
      date: state.selectedDate
    }
  }
)(EntryList)

const NewEntryContainer = connect(
  state => ({ ...state.newEntry }),
  dispatch => (
    {
      onInputChange: (field, e) => {
        dispatch({ type: 'UPDATE_NEW_ENTRY_FIELD', field: field, value: e.target.value })
      },

      onDateInputChange: (field, value) => {
        dispatch({ type: 'UPDATE_NEW_ENTRY_FIELD', field: field, value: value })
      },

      addEntry: entry => {
        dispatch({ type: 'ADD_ENTRY', entry: entry })
      }
    }
  )
)(NewEntry)

// *****************************************************************************
// App Component
// *****************************************************************************

const TimesheetApp = () => (
  <div className='TimesheetApp'>
    <MonthNameContainer />
    <DateSelectContainer />
    <WeekHourSummaryContainer />
    <EntryListContainer />
    <NewEntryContainer />
  </div>
)

function timesheetApp (state = initialState, action) {
  switch (action.type) {
    case 'SELECT_DATE':
      return Object.assign({}, state, {
        selectedDate: action.date,
        selectedDateDraft: action.date
      })
    case 'CHANGE_DATE_DRAFT':
      return Object.assign({}, state, {
        selectedDateDraft: action.date
      })
    case 'SELECT_DATE_DRAFT':
      return Object.assign({}, state, {
        selectedDate: state.selectedDateDraft,
        selectedDateDraft: state.selectedDateDraft
      })
    case 'UPDATE_NEW_ENTRY_FIELD':
      return Object.assign({}, state, {
        newEntry: {
          ...state.newEntry,
          [action.field]: action.value
        }
      })
    case 'ADD_ENTRY':
      return Object.assign({}, state, {
        newEntry: {
          ...state.newEntry,
          name: ''
        },
        entries: [
          ...state.entries,
          action.entry
        ]
      })
    default:
      return state
  }
};

const store = createStore(timesheetApp)

export default () => (
  <Provider store={store}>
    <TimesheetApp />
  </Provider>
)
