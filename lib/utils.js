import { startOfToday, addDays, addSeconds, getMinutes, getHours } from 'date-fns'

/* URLs */

export function cleanUrl (url) {
  return url.replace('www.', '').replace(/\/$/, '')
}

export function fixUrl (url) {
  return url.match(/^https?:\/\//) ? url : `https://${url}`
}

/* Date */

export function today () {
  return startOfToday().toString()
}

export function yesterday () {
  return getDayRelative(-1)
}

/**
* pos = 1 -> tomorrow
* pos = 0 -> today
* pos = -1 -> yesterday
* ...
*/
export function getDayRelative (pos) {
  return addDays(today(), pos).toString()
}

export function lastSevenDays (includeToday = true) {
  let res = []
  for (let i = includeToday ? -6 : -7; res.length !== 7; i++) {
    res.push(getDayRelative(i))
  }
  return res
}

export function formatTime (time) {
  if (time < 60) {
    return `${time} seconds`
  } else {
    const t = addSeconds(startOfToday(), time)
    const hours = getHours(t)
    const minutes = getMinutes(t)

    const minutesText = `${minutes} minute${minutes === 1 ? '' : 's'}`

    if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} and ${minutesText}`
    } else {
      return minutesText
    }
  }
}
