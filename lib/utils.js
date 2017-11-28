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

function unit (long, n, u) {
  return long ? ` ${u}${plural(n)}` : u[0]
}

function plural (n) {
  return n === 1 ? '' : 's'
}

export function formatTime (time, long = true) {
  const u = unit.bind(null, long)
  if (time < 60) {
    return `${time}${u(time, 'second')}`
  } else {
    const t = addSeconds(startOfToday(), time)
    const hours = getHours(t)
    const minutes = getMinutes(t)

    const minutesText = `${minutes}${u(minutes, 'minute')}`

    if (hours > 0) {
      const min = minutes > 0 ? `${long ? 'and ' : ''}${minutesText}` : ''
      return `${hours}${u(hours, 'hour')}${min}`
    } else {
      return minutesText
    }
  }
}

export function formatTimeShort (time) {
  return formatTime(time, false)
}
