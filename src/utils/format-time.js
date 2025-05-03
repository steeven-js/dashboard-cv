import 'dayjs/locale/fr';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

// Définir le français comme locale par défaut
dayjs.locale('fr');

// ----------------------------------------------------------------------

/**
 * @Docs
 * https://day.js.org/docs/en/display/format
 */

/**
 * Default timezones
 * https://day.js.org/docs/en/timezone/set-default-timezone#docsNav
 *
 */

/**
 * UTC
 * https://day.js.org/docs/en/plugin/utc
 * @install
 * import utc from 'dayjs/plugin/utc';
 * dayjs.extend(utc);
 * @usage
 * dayjs().utc().format()
 *
 */

dayjs.extend(duration);
dayjs.extend(relativeTime);

// ----------------------------------------------------------------------

export const formatPatterns = {
  dateTime: 'DD MMM YYYY HH:mm', // 17 Avr 2022 12:00
  date: 'DD MMM YYYY', // 17 Avr 2022
  time: 'HH:mm', // 12:00
  split: {
    dateTime: 'DD/MM/YYYY HH:mm', // 17/04/2022 12:00
    date: 'DD/MM/YYYY', // 17/04/2022
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY HH:mm', // 17-04-2022 12:00
    date: 'DD-MM-YYYY', // 17-04-2022
  },
};

const isValidDate = (date) => date !== null && date !== undefined && dayjs(date).isValid();

// ----------------------------------------------------------------------

export function today(template) {
  return dayjs(new Date()).startOf('day').format(template);
}

// ----------------------------------------------------------------------

/**
 * @output 17 Avr 2022 12:00
 */

// ----------------------------------------------------------------------

export function fDateTime(date, template) {
  if (!isValidDate(date)) {
    return 'Date invalide';
  }

  return dayjs(date).format(template ?? formatPatterns.dateTime);
}

// ----------------------------------------------------------------------

/**
 * @output 17 Avr 2022
 */

// ----------------------------------------------------------------------

export function fDate(date, template) {
  if (!isValidDate(date)) {
    return 'Date invalide';
  }

  return dayjs(date).format(template ?? formatPatterns.date);
}

// ----------------------------------------------------------------------

/**
 * @output 12:00
 */

// ----------------------------------------------------------------------

export function fTime(date, template) {
  if (!isValidDate(date)) {
    return 'Date invalide';
  }

  return dayjs(date).format(template ?? formatPatterns.time);
}

// ----------------------------------------------------------------------

/**
 * @output 1713250100
 */

// ----------------------------------------------------------------------

export function fTimestamp(date) {
  if (!isValidDate(date)) {
    return 'Date invalide';
  }

  return dayjs(date).valueOf();
}

// ----------------------------------------------------------------------

/**
 * @output quelques secondes, 2 ans
 */

// ----------------------------------------------------------------------

export function fToNow(date) {
  if (!isValidDate(date)) {
    return 'Date invalide';
  }

  return dayjs(date).toNow(true);
}

// ----------------------------------------------------------------------

/**
 * @output boolean
 */

// ----------------------------------------------------------------------

export function fIsBetween(inputDate, startDate, endDate) {
  if (!isValidDate(inputDate) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  const formattedInputDate = fTimestamp(inputDate);
  const formattedStartDate = fTimestamp(startDate);
  const formattedEndDate = fTimestamp(endDate);

  if (
    formattedInputDate === 'Date invalide' ||
    formattedStartDate === 'Date invalide' ||
    formattedEndDate === 'Date invalide'
  ) {
    return false;
  }

  return formattedInputDate >= formattedStartDate && formattedInputDate <= formattedEndDate;
}

// ----------------------------------------------------------------------

/**
 * @output boolean
 */

// ----------------------------------------------------------------------

export function fIsAfter(startDate, endDate) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isAfter(endDate);
}

// ----------------------------------------------------------------------

/**
 * @output boolean
 */

// ----------------------------------------------------------------------

export function fIsSame(startDate, endDate, unitToCompare) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isSame(endDate, unitToCompare ?? 'year');
}

/**
 * @output
 * Même jour: 26 Avr 2024
 * Même mois: 25 - 26 Avr 2024
 * Même mois: 25 - 26 Avr 2024
 * Même année: 25 Avr - 26 Mai 2024
 */

// ----------------------------------------------------------------------

export function fDateRangeShortLabel(startDate, endDate, initial) {
  if (!isValidDate(startDate) || !isValidDate(endDate) || fIsAfter(startDate, endDate)) {
    return 'Date invalide';
  }

  let label = `${fDate(startDate)} - ${fDate(endDate)}`;

  if (initial) {
    return label;
  }

  const isSameYear = fIsSame(startDate, endDate, 'year');
  const isSameMonth = fIsSame(startDate, endDate, 'month');
  const isSameDay = fIsSame(startDate, endDate, 'day');

  if (isSameYear && !isSameMonth) {
    label = `${fDate(startDate, 'DD MMM')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && !isSameDay) {
    label = `${fDate(startDate, 'DD')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && isSameDay) {
    label = `${fDate(endDate)}`;
  }

  return label;
}

// ----------------------------------------------------------------------

export function fAdd({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const result = dayjs()
    .add(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}

/**
 * @output 2024-05-28T05:55:31+00:00
 */

// ----------------------------------------------------------------------

export function fSub({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const result = dayjs()
    .subtract(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}
