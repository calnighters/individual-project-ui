import {
    REGEX_APP_LOCAL_DATE_PATTERN,
    REGEX_APP_LOCAL_TIME_PATTERN,
} from '~/constants';

import type {
    DateBoundaryResponse,
    MaxDateBoundary,
    MinDateBoundary,
} from '~/types/app/utils';

import type { DateValue } from 'imask/esm/masked/date';
import type {NavigateFunction} from "react-router";
import {useMemo} from "react";
import {redirect} from "react-router-dom";

// export const getRolesFromSession = (session: Session): Roles[] => {
//     const rolesAsString = Buffer.from(
//         session.token!.id_token.split('.')[1],
//         'base64',
//     ).toString();
//     return (JSON.parse(rolesAsString) as { roles: Roles[] }).roles;
// };

export const handleApiErrorClientSide = () => {
    redirect('/expired');
};

/**
 * Accepts a native Date object and formats the output to app local format.
 *
 * Example:
 *
 * Input:   new Date('2024-12-31')
 * Output:  31/12/2024
 *
 * @param date as a Date object
 * @returns formatted date string in the output as DD/MM/YYYY
 */
export const dateFormatter = (date: DateValue): string => {
    return [
        date!.getDate().toString().padStart(2, '0'),
        (date!.getMonth() + 1).toString().padStart(2, '0'),
        date!.getFullYear(),
    ].join('/');
};

/**
 * Accepts an app local date string and formats the output as a new native Date object.
 *
 * Example:
 *
 * Input:   31/12/2024
 * Output:  2024-12-31T00:00:00.000Z
 *
 * @param date app local date
 * @returns a new Date object
 */
export const dateParser = (date: string): Date => {
    const yearMonthDay = date.split('/');
    return new Date(
        Number(yearMonthDay[2]),
        Number(yearMonthDay[1]) - 1,
        Number(yearMonthDay[0]),
    );
};

/**
 * Accepts a pathname and a Link component (Next.js) and return a breadcrumb array of objects.
 *
 * Example
 *
 * Pathname Input:  /route-one/route-two/route-three
 * Link Input:      Link (Next.js)
 * Output:          [
 { as: 'MockLink', children: 'SCR Administration', href: '/', key: '0' },
 { as: 'MockLink', children: 'Route One', href: '/route-one', key: '1' },
 {
 as: 'MockLink',
 children: 'Route Two',
 href: '/route-one/route-two',
 key: '2',
 },
 ]
 *
 * @param pathname the pathname, containing no segments as '/' or one or more segments
 * @param router the router instance
 * @returns an array of breadcrumb objects
 */
export const getBreadcrumbs = (pathname: string, router: NavigateFunction) => { // TODO - ensure this gives the correct breadcrumbs wih my path names
    const rootBreadcrumb = {
        text: 'AWS Client',
        handleOnClick: () => router('/'),
        key: '0',
    };

    const segments = pathname.split('/');

    if (pathname === '/') return [rootBreadcrumb];

    segments.pop();

    return segments.map((path, index) => {
        if (index === 0) return rootBreadcrumb;

        return {
            text: path
                .replace(/-/g, ' ')
                .split(' ')
                .join(' ')
                .replace(/(^\w{1})|(\s+\w{1})/g, (firstLetter) =>
                    firstLetter.toUpperCase(),
                ),
            handleOnClick: () =>
                router(
                    `${segments.slice(0, segments.indexOf(path) + 1).join('/')}`,
                ),
            key: index.toString(),
        };
    });
};

/**
 * Accepts an ISO 8601 date and time string and formats the output.
 *
 * Example:
 *
 * Input:   2024-12-31 23:59:59.999999
 * Output:  { date: '31/12/2024', time: '23:59' }
 *
 * @param date as a ISO 8601 date/time
 * @param timeStyleOveride set the time style as HH:MM or HH:MM:SS - HH:MM by default
 * @returns formatted date/time string in the output as { date: 'DD/MM/YYYY', time: 'HH:MM / HH:MM:SS' }
 */
export const getFormattedDateTimeStringFromDate = (
    date: string,
    timeStyleOverride?: 'short' | 'medium',
): { date: string; time: string } => {
    const dateTimeStringArray = new Date(date)
        .toLocaleString('en-GB', {
            dateStyle: 'short',
            timeStyle: timeStyleOverride || 'short',
        })
        .split(', ');

    return { date: dateTimeStringArray[0], time: dateTimeStringArray[1] };
};

export const getFormattedDateTimeStringAsString = (
    inputDate: string,
    timeStyleOverride: 'short' | 'medium',
): string => {
    const { date, time } = getFormattedDateTimeStringFromDate(
        inputDate,
        timeStyleOverride,
    );
    return `${date} ${time}`;
};

export enum TimeStringFlag {
    SECONDS,
    MILLISECONDS,
    NANOSECONDS,
}

/**
 * Accepts an app local date string in the format DD/MM/YYYY and an optional time and formats the output.
 *
 * Example
 *
 * Date String Input:       31/12/2024
 * Time String Input:       23:59
 * Time String Flag Input:  TimeStringFlag.NANOSECONDS
 * Output:                  2024-12-31 23:59:00.000000
 *
 * @param date app local date
 * @param timeString optional object containing a child prop as 'time' and optional 'flag'
 * @returns formatted date/time string
 */
export const getFormattedDateTimeStringFromDateTime = ({
                                                           date,
                                                           timeString,
                                                       }: {
    date: string;
    timeString?: {
        flag?: TimeStringFlag;
        time: string;
    };
}): string => {
    const [day, month, year] = date.split('/');

    const currentDate = new Date(+year, +month - 1, +day);

    if (!timeString) {
        return currentDate.toISOString().replace('T', ' ').replace('Z', '');
    }

    const [hour, minute] = timeString.time.split(':');
    const timezoneOffSetHours = -(currentDate.getTimezoneOffset() / 60);

    const time = new Date(
        +year,
        +month - 1,
        +day,
        +hour + timezoneOffSetHours,
        +minute,
        0o0,
        0o0,
    )
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '');

    switch (timeString.flag) {
        case TimeStringFlag.SECONDS:
            return time.substring(0, 19);
        case TimeStringFlag.MILLISECONDS:
            return time;
        case TimeStringFlag.NANOSECONDS:
            return time.concat('000');
        default:
            return time;
    }
};

/**
 *
 * Accepts and app local date string in the format DD/MM/YYYY and an optional minDate and maxDate object
 * and validates the date provided within a date boundary against the current system date.
 *
 * Examples
 *
 * All examples below assume the current date as the 27th February 2024.
 *
 * Date valid example, without a minDate and maxDate
 *
 * Date String Input:       27/02/2024
 * Output:                  { isValid: true }
 *
 * Date invalid example, without a minDate and maxDate
 *
 * Date String Input:       28/02/2024
 * Output:                  { isValid: false, minDate: '27/02/2024', maxDate: '27/02/2024' }
 *
 * Date valid example, with a minDate
 *
 * Date String Input:       26/01/2023
 * Minimum Date Input:      { minYear: 1, minMonth: 1, minDay: 1 }
 * Output:                  { isValid: true }
 *
 * Date invalid example, with a minDate
 *
 * Date String Input:       25/01/2023
 * Minimum Date Input:      { minYear: 1, minMonth: 1, minDay: 1 }
 * Output:                  { isValid: false, minDate: '26/01/2023', maxDate: '27/02/2024' }
 *
 * Date valid example, with a maxDate
 *
 * Date String Input:       28/03/2025
 * Maxmimum Date Input:     { maxYear: 1, maxMonth: 1, maxDay: 1 }
 * Output:                  { isValid: true }
 *
 * Date invalid example, with a maxDate
 *
 * Date String Input:       29/03/2025
 * Minimum Date Input:      { maxYear: 1, maxMonth: 1, maxDay: 1 }
 * Output:                  { isValid: false, minDate: '27/02/2024', maxDate: '28/03/2025' }
 *
 * @param date app local date
 * @param minDate object containing optional child props as numbers, 'minYear', 'minMonth' and 'minDay'
 * @param maxDate object containing optional child props as numbers, 'maxYear', 'maxMonth' and 'maxDay'
 * @returns an object as { isValid: true } or { isValid: false, minDate: 'DD/MM/YYYY', maxDate: 'DD/MM/YYYY' }
 */
export const isDateEnteredWithinValidBoundary = ({
                                                     date,
                                                     minDate,
                                                     maxDate,
                                                 }: {
    date: string;
    minDate?: MinDateBoundary;
    maxDate?: MaxDateBoundary;
}): DateBoundaryResponse => {
    if (!isValidAppLocalDate(date)) return { isValid: false };

    const currentDate = new Date();

    const providedDateParts = date.split('/');

    const providedDate = new Date(
        `${providedDateParts[1]}/${providedDateParts[0]}/${providedDateParts[2]}`,
    );

    const minimumDate = new Date();

    minimumDate.setFullYear(
        minDate?.minYear
            ? currentDate.getFullYear() - minDate.minYear
            : currentDate.getFullYear(),
    );
    minimumDate.setMonth(
        minDate?.minMonth
            ? currentDate.getMonth() - minDate.minMonth
            : currentDate.getMonth(),
    );
    minimumDate.setDate(
        minDate?.minDay
            ? currentDate.getDate() - minDate.minDay
            : currentDate.getDate(),
    );
    minimumDate.setHours(0);
    minimumDate.setMinutes(0);
    minimumDate.setSeconds(0);
    minimumDate.setMilliseconds(0);

    const maxmimumDate = new Date();

    maxmimumDate.setFullYear(
        maxDate?.maxYear
            ? currentDate.getFullYear() + maxDate.maxYear
            : currentDate.getFullYear(),
    );
    maxmimumDate.setMonth(
        maxDate?.maxMonth
            ? currentDate.getMonth() + maxDate.maxMonth
            : currentDate.getMonth(),
    );
    maxmimumDate.setDate(
        maxDate?.maxDay
            ? currentDate.getDate() + maxDate.maxDay
            : currentDate.getDate(),
    );
    maxmimumDate.setHours(0);
    maxmimumDate.setMinutes(0);
    maxmimumDate.setSeconds(0);
    maxmimumDate.setMilliseconds(0);

    if (providedDate < minimumDate || providedDate > maxmimumDate) {
        return {
            isValid: false,
            minDate: dateFormatter(minimumDate),
            maxDate: dateFormatter(maxmimumDate),
        };
    }

    return { isValid: true };
};

/**
 *
 * Accepts and validated an app local date string.
 *
 * Example:
 *
 * Input:   31/12/2024
 * Output:  true
 *
 * @param date app local date
 * @returns a boolean to indicate if the date is valid
 */
export const isValidAppLocalDate = (date: string | undefined): boolean => {
    if (
        !date ||
        !new RegExp(REGEX_APP_LOCAL_DATE_PATTERN).test(date) ||
        new Date(date).toString() === 'Invalid date'
    ) {
        return false;
    }

    return true;
};

export const capitalizeFirstLetter = (str: string): string => {
    return str[0].toUpperCase() + str.slice(1);
};

/**
 *
 * Validates text to determine if it contains leading/trailing whitespace.
 *
 * Example:
 *
 * Input:   ' INVALID TEXT '
 * Output:  true
 *
 * Input:   'INVALID TEXT '
 * Output:  true
 *
 * Input:   ' INVALID TEXT'
 * Output:  true
 *
 * Input:   'VALID TEXT'
 * Output:  false
 *
 * @param text
 * @returns a boolean to indicate if the text contains invalid leading/trailing whitespace
 */
export const isLeadingTrailingWhitespace = (text: string): boolean => {
    return text.trim().length !== text.length;
};

export const isValidAppLocalTime = (time: string | undefined) => {
    if (!time || !new RegExp(REGEX_APP_LOCAL_TIME_PATTERN).test(time)) {
        return false;
    }

    return true;
};

export const isTimeValid = (value: string | undefined) => {
    if (!value) {
        return false;
    }
    const [hours, minutes] = value.split(':');
    if (hours && !hours.includes('__')) {
        const [h1, h2] = hours.split('');
        const hoursNoMask1 = h1 ? parseInt(h1.replace('_', '-1')) : 0;
        const hoursNoMask2 = h2 ? parseInt(h2.replace('_', '-1')) : 0;
        if (hoursNoMask1 > 2) {
            return false;
        }
        if (hoursNoMask1 === 2 && hoursNoMask2 && hoursNoMask2 > 3) {
            return false;
        }
    }

    if (minutes && !minutes.includes('__')) {
        const [m1] = minutes.split('');
        const minutesNoMask1 = m1 ? parseInt(m1.replace('_', '-1')) : 0;
        if (minutesNoMask1 > 5) {
            return false;
        }
    }

    return true;
};

/**
 *
 * Turns time from format HH:MM to minutes.
 *
 * @param time time in format HH:MM
 * @returns a number of how many minutes in the time
 */
export const timeToMinutes = (time: string): number => {
    const splitTime = time.split(':');
    return Number(splitTime[0]) * 60 + Number(splitTime[1]);
};

export const onToggleExpand = (
    event: React.SyntheticEvent<HTMLDetailsElement>,
    expandDetails: boolean,
    setExpandDetails: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    if (expandDetails && !(event.currentTarget as HTMLDetailsElement).open) {
        setExpandDetails(!expandDetails);
    }
};

export const replaceSpaces = (input: string) => {
    return input.replace(/ /g, '\u00a0');
};

export const setPageTitle = (error: boolean, title: string) => {
    if (error) return `Error: ${title}`;
    return title;
};

export const useQuery = (search: string) => {
    return useMemo(() => new URLSearchParams(search), [search]);
}
