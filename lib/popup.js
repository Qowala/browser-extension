const state = {
  dates: {
    'Today': new Date(new Date().setHours(0, 0, 0, 0)),
    'Yesterday': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0))
  },
  date: 'Today',
  tracked: () => state.config.blacklist && state.config.blacklist.includes(state.hostname),
  topSites: () => {
    const dayStats = state.stats[state.dates[state.date]]
    // We take the five most visited websites, ordered by the time spent on them
    return dayStats ? Object.keys(dayStats).sort((a, b) => dayStats[a] <= dayStats[b]).slice(0, 5) : []
  },
  timeSpent: () => {
    if (state.dates[state.date]) {
      if (state.stats[state.dates[state.date]]) {
        if (state.stats[state.dates[state.date]][state.hostname]) {
          return formatTime(state.stats[state.dates[state.date]][state.hostname])
        } else {
          return 'No data for this site'
        }
      } else {
        return 'No data for this day'
      }
    } else {
      return 'Invalid date'
    }
  }
}

const Popup = {
  view: () => m('div',
    m('header',
      m('img', { src: '../assets/white_logo.png', alt: 'Qowala' }),
      m('hr')
    ),
    state.tracked()
      ? m('div', [
        m('p', { class: 'text secondary' }, `You've spent…`),
        m('div', { class: 'time-spent' }, state.timeSpent()),
        m('div', { class: 'parameters' }, [
          'On',
          state.topSites().length
          ? m('select', {
            class: 'parameters__dropdown network',
            onchange: evt => {
              state.hostname = evt.target.value
            }
          },
            state.topSites().map((site, i, arr) => {
              const select = site === state.hostname
              this.foundCurrent = this.foundCurrent || select
              return m('option', {
                value: site === '' ? state.hostname : site,
                selected: (!this.foundCurrent && i === arr.length) || select
              }, site === '' ? '&mdash;' : site)
            }, { foundCurrent: false })
          )
          : null,
          m('select', {
            class: 'parameters__dropdown date',
            onchange: evt => {
              state.date = evt.target.value
            }
          },
          Object.keys(state.dates).map(date =>
            state.dates[date] ? m('option', { value: date }, date) : null
          ))
        ])
      ])
      : m('div',
        m('p', { class: 'text secondary' },
          'It looks like this website is not on your list.',
          m('br'),
          'If it should, you can add it now.'
        ),
        m('button', {
          class: 'btn primary',
          onclick: evt => {
            state.config.blacklist.push(state.hostname)
            state.stats[state.dates[state.date]][state.hostname] = 1 // "Fake" time to be sure that it will show something after re-rendering
            chrome.storage.local.set({ hostNavigationStats: state.stats, config: state.config })
          }
        }, 'Start tracking')
      )
  )
}

chrome.storage.local.get({ hostNavigationStats: {}, config: {} }, res => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    state.hostname = new URL(tabs[0].url).hostname
    state.config = res.config
    state.stats = res.hostNavigationStats
    m.mount(document.body, Popup)
  })
})

function formatTime (time) {
  let displayTime
  let displayUnit

  if (time >= 3600) {
    displayTime = Math.floor(time / 3600)
    displayUnit = 'hour'
  } else if (time >= 60) {
    displayTime = Math.floor(time / 60)
    displayUnit = 'minute'
  } else {
    displayTime = time
    displayUnit = 'second'
  }

  // Display plural
  if (displayTime > 1) {
    displayUnit = displayUnit + 's'
  }

  return `${displayTime} ${displayUnit}`
}

if (module) {
  module.exports = {
    formatTime: formatTime
  }
}
