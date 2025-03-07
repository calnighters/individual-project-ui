import {
    Button,
    ButtonGroup,
    Details,
    DropPanel,
    GridCol,
    GridRow,
    Heading,
    REGEX_PRINTABLE_ASCII_PATTERN, SectionBreak,
    Select, Spinner,
    TagColor,
    TextInput
} from "@tact/gds-component-library";
import type { Option } from "@tact/gds-component-library";
import {useEffect, useRef, useState, useTransition} from "react";
import type {DateValue} from "imask/masked/date";
import {BackgroundOrganisationColorClass} from "@tact/gds-component-library/dist/theme/colors/color_classes";
import {postAuditSearch} from "~/api/audit";
import AuditTable from "~/pages/audit/audit-viewer/AuditTable";
import {REGEX_APP_LOCAL_DATE_PATTERN, REGEX_APP_LOCAL_TIME_PATTERN} from "~/constants";
import {AUDIT_PAGE_ERROR_RESPONSES} from "~/constants/pages/audit";
import {handleApiErrorClientSide} from "~/utils";

const DETAILS_ELEMENT_SUMMARY = 'Help with Audit';
const DETAILS_ELEMENT_TEXT =
    'Please enter your search filters and select the Search button to view relevant audit events. All filters are optional, and if left blank then all audit events will be displayed. Please note that the first 200 audit events will be shown. If you require more specific results, please narrow your search filters. Dates are formatted DD/MM/YYYY and time HH:MM:SS.';
const APP_LOCAL_DATE_EMPTY_FORMAT = '__/__/____';
const APP_LOCAL_TIME_EMPTY_FORMAT = '__:__';
const INPUT_DATE_MASK = 'd/`m/`Y'; //TODO - update these to a constants?
// TODO - move all of these to common types and utils files
export interface AuditSearchParams {
    eventType: string;
    bucketName?: string;
    objectKey?: string;
    userName?: string;
    fromDate?: string;
    fromTime?: string;
    toDate?: string;
    toTime?: string;
}

const DEFAULT_SEARCH_PARAMS = {
    eventType: 'All',
    bucketName: '',
    objectKey: '',
    userName: '',
    fromDate: APP_LOCAL_DATE_EMPTY_FORMAT,
    fromTime: APP_LOCAL_TIME_EMPTY_FORMAT,
    toDate: APP_LOCAL_DATE_EMPTY_FORMAT,
    toTime: APP_LOCAL_TIME_EMPTY_FORMAT
};

type SelectOption = Pick<Option, 'children', 'value'>;

export default function AuditViewer() {
    const fromDateRef = useRef<HTMLInputElement>(null);
    const fromTimeRef = useRef<HTMLInputElement>(null);
    const toDateRef = useRef<HTMLInputElement>(null);
    const toTimeRef = useRef<HTMLInputElement>(null);

    const [isGetAuditSearchPending, startTransitionAuditSearch] = useTransition();
    const [auditSearch, setAuditSearch] = useState<AuditSearchResponse>();

    const [searchParams, setSearchParams] = useState<AuditSearchParams>(
        DEFAULT_SEARCH_PARAMS,
    );

    useEffect(() => {
        document.title = 'Audit - AWS Client';
    }, []);

    const onClickReset = () => {
        setSearchParams(DEFAULT_SEARCH_PARAMS);
        setAuditSearch(undefined);
        // setErrors(undefined);
    };

    const onSetSearchParams = (value: string | SelectOption[], field: string) =>
        setSearchParams((prev) => ({
            ...prev,
            [field]: value,
        }));

    const RESULTS_LIST = [ // TODO - update results table for colour tags
        {
            name: 'VIEW',
            color: TagColor.GREEN,
        },
        {
            name: 'UPLOAD',
            color: TagColor.BLUE,
        },
        {
            name: 'MODIFY',
            color: TagColor.YELLOW,
        }
    ];
    const mapEventTypeOptions = () => [
        { children: 'All', value: 'All' },
        ...RESULTS_LIST.map(({ name }) => ({
            children: name,
            value: name,
        })),
    ];

    const isTimeValid = (value: string | undefined) => {
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

    const dateParser = (date: string): Date => {
        const yearMonthDay = date.split('/');
        return new Date(
            Number(yearMonthDay[2]),
            Number(yearMonthDay[1]) - 1,
            Number(yearMonthDay[0]),
        );
    };

    const dateFormatter = (date: DateValue): string => {
        return [
            date!.getDate().toString().padStart(2, '0'),
            (date!.getMonth() + 1).toString().padStart(2, '0'),
            date!.getFullYear(),
        ].join('/');
    };

    enum TimeStringFlag {
        SECONDS,
        MILLISECONDS,
        NANOSECONDS,
    }

    const getFormattedDateTimeStringFromDateTime = ({
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

    type ErrorSummaryItem = {
        index: number;
        targetName: string;
        text: string;
    };

    enum FieldErrorIndex {
        StartInvalidDateTime,
        EndInvalidDateTime,
        StartInvalidDate,
        StartInvalidTime,
        EndInvalidDate,
        EndInvalidTime,
    }

    const capitalizeFirstLetter = (str: string): string => {
        return str[0].toUpperCase() + str.slice(1);
    };

    const isValidAppLocalDate = (date: string | undefined): boolean => {
        if (
            !date ||
            !new RegExp(REGEX_APP_LOCAL_DATE_PATTERN).test(date) ||
            new Date(date).toString() === 'Invalid date'
        ) {
            return false;
        }

        return true;
    };

    const isValidAppLocalTime = (time: string | undefined) => {
        if (!time || !new RegExp(REGEX_APP_LOCAL_TIME_PATTERN).test(time)) {
            return false;
        }

        return true;
    };

    const validateDate = (
        type: 'start' | 'end',
        date: string | undefined,
        time: string | undefined,
    ): {
        errors?: ErrorSummaryItem[];
        dateTime?: string;
    } => {
        if (!date || !time) {
            return {
                errors: [
                    {
                        index: FieldErrorIndex[
                            `${capitalizeFirstLetter(type)}InvalidDateTime`
                            ] as number,
                        text: `Enter a ${type} date or time`,
                        targetName: `${type}-date`,
                    },
                ],
            };
        }
        const dateEmpty = date.replace(APP_LOCAL_DATE_EMPTY_FORMAT, '').length === 0;
        const timeEmpty = time.replace(APP_LOCAL_TIME_EMPTY_FORMAT, '').length === 0;

        if (dateEmpty && timeEmpty) {
            return {};
        }

        const errors: ErrorSummaryItem[] = [];
        if (dateEmpty && !timeEmpty) {
            errors.push({
                index: FieldErrorIndex[
                    `${capitalizeFirstLetter(type)}InvalidDate`
                    ] as number,
                text: `You must supply a ${type} date if time is supplied`,
                targetName: `${type}-date`,
            });
        }

        if (!dateEmpty && !isValidAppLocalDate(date)) {
            errors.push({
                index: FieldErrorIndex[
                    `${capitalizeFirstLetter(type)}InvalidDate`
                    ] as number,
                text: `Enter a ${type} date`,
                targetName: `${type}-date`,
            });
        }

        if (!timeEmpty && !isValidAppLocalTime(time)) {
            errors.push({
                index: FieldErrorIndex[
                    `${capitalizeFirstLetter(type)}InvalidTime`
                    ] as number,
                text: `Enter a ${type} time`,
                targetName: `${type}-time`,
            });
        }

        if (errors.length > 0) {
            return { errors };
        }

        let dateTime = getFormattedDateTimeStringFromDateTime({
            date,
            timeString: {
                time: timeEmpty ? '00:00' : time,
                flag: TimeStringFlag.SECONDS,
            },
        });

        if (!timeEmpty && type === 'end') {
            dateTime = dateTime.slice(0, -2) + '59';
        }

        if (timeEmpty && type === 'end') {
            dateTime = dateTime.slice(0, -8) + '23:59:59';
        }

        return {
            dateTime: dateTime,
        };
    };

    const validStartEndDateTime = (
        fromDate?: string,
        startTime?: string,
        endDate?: string,
        endTime?: string,
    ): {
        errors?: ErrorSummaryItem[];
        startDateTime?: string;
        endDateTime?: string;
    } => {
        const startDateTime = validateDate('start', fromDate, startTime);
        const endDateTime = validateDate('end', endDate, endTime);

        if (startDateTime.errors || endDateTime.errors) {
            return {
                errors: [...(startDateTime.errors || []), ...(endDateTime.errors || [])],
            };
        }

        if (startDateTime.dateTime! > endDateTime.dateTime!) {
            return {
                errors: [
                    {
                        index: FieldErrorIndex.StartInvalidDate,
                        text: `Start date/time cannot be after end date/time`,
                        targetName: `start-date`,
                    },
                ],
            };
        }

        return {
            startDateTime: startDateTime.dateTime,
            endDateTime: endDateTime.dateTime,
        };
    };

    const onClickSearch = () => {
        setAuditSearch(undefined);
        // setErrors(undefined);

        const { startDateTime, endDateTime, errors } = validStartEndDateTime(
            searchParams.fromDate,
            searchParams.fromTime,
            searchParams.toDate,
            searchParams.toTime,
        );

        // document.title = setPageTitle(
        //     !!errors,
        //     getScrAuditMenuItem(ScrAuditMenuItem.AccessAudit).pageTitle!,
        // );
        //
        // if (errors) {
        //     setErrors(errors);
        //     setExpandDetails(true);
        //     errorsRef.current?.focus();
        //     return;
        // }
        // TODO - need to do validation and handle errors

        const search: AuditSearchRequest = {
            eventType: searchParams.eventType === 'All' || !searchParams.eventType ? undefined : searchParams.eventType,
            objectKey: searchParams.objectKey || undefined,
            bucketName: searchParams.bucketName || undefined,
            userName: searchParams.userName || undefined,
            fromDate: startDateTime,
            toDate: endDateTime
        };

        startTransitionAuditSearch(async () => {
            const searchResponse = await postAuditSearch(
                search,
                AUDIT_PAGE_ERROR_RESPONSES
            );

            if (!searchResponse) return handleApiErrorClientSide();
            if (searchResponse.code) return;

            setAuditSearch(searchResponse);
        });
    };

    return (
        <>
            <Heading>
                Audit
            </Heading>
            <Details
                summary={DETAILS_ELEMENT_SUMMARY}
            >
                {DETAILS_ELEMENT_TEXT}
            </Details>
            <form>
                <GridRow>
                    <GridCol setWidth='two-thirds'>
                        <DropPanel expandable={false} isExpanded title='Filter Options'>
                            <GridRow>
                                <GridCol setWidth='one-half'>
                                    <Select
                                        formGroup={{dataTestId: 'event-type-select'}}
                                        id='event-type'
                                        label={{children: 'Event Type', htmlFor: 'event-type'}}
                                        name='event-type'
                                        onChange={(formEvent) =>
                                            onSetSearchParams(formEvent.currentTarget.value, 'eventType')
                                        }
                                        options={mapEventTypeOptions()}
                                        value={searchParams.eventType}
                                    />
                                </GridCol>
                                <GridCol setWidth='one-half'>
                                    <TextInput
                                        id='bucket-name'
                                        dataTestId='bucket-name-input'
                                        labelProps={{
                                            children: 'Bucket Name',
                                            htmlFor: 'bucket-name',
                                        }}
                                        mask={REGEX_PRINTABLE_ASCII_PATTERN}
                                        maxLength={30}
                                        onAccept={(value: string) =>
                                            onSetSearchParams(value, 'bucketName')
                                        }
                                        type='text'
                                        value={searchParams.bucketName || ''}
                                    />
                                </GridCol>
                                <GridCol setWidth='one-half'>
                                    <TextInput
                                        id='user-name'
                                        dataTestId='user-name-input'
                                        labelProps={{
                                            children: 'User Name',
                                            htmlFor: 'user-name',
                                        }}
                                        mask={REGEX_PRINTABLE_ASCII_PATTERN}
                                        maxLength={30}
                                        onAccept={(value: string) =>
                                            onSetSearchParams(value, 'userName')
                                        }
                                        type='text'
                                        value={searchParams.userName || ''}
                                    />
                                </GridCol>
                                <GridCol setWidth='one-half'>
                                    <TextInput
                                        id='object-key'
                                        dataTestId='object-key-input'
                                        labelProps={{
                                            children: 'Object Key',
                                            htmlFor: 'object-key',
                                        }}
                                        mask={REGEX_PRINTABLE_ASCII_PATTERN}
                                        maxLength={30}
                                        onAccept={(value: string) =>
                                            onSetSearchParams(value, 'objectKey')
                                        }
                                        type='text'
                                        value={searchParams.objectKey || ''}
                                    />
                                </GridCol>
                            </GridRow>
                        </DropPanel>
                    </GridCol>
                    <GridCol setWidth='one-third'>
                        <DropPanel title='Date Range' isExpanded expandable={false}>
                            <GridRow>
                                <GridCol setWidth='one-half'>
                                    <TextInput
                                        defaultValue={searchParams.fromDate}
                                        dataTestId='from-date-input'
                                        format={dateFormatter}
                                        id='from-date'
                                        inputRef={(node) => {
                                            fromDateRef.current = node;
                                        }}
                                        labelProps={{
                                            children: 'From Date',
                                            htmlFor: 'from-date',
                                        }}
                                        lazy={false}
                                        mask={Date}
                                        parse={dateParser}
                                        pattern={INPUT_DATE_MASK}
                                        onAccept={(value: string) =>
                                            onSetSearchParams(value, 'fromDate')
                                        }
                                        type='text'
                                        value={searchParams.fromDate}
                                    />
                                </GridCol>
                                <GridCol setWidth='one-half'>
                                    <TextInput
                                        dataTestId='from-time-input'
                                        defaultValue={searchParams.fromTime}
                                        id='from-time'
                                        inputRef={(node) => {
                                            fromTimeRef.current = node;
                                        }}
                                        labelProps={{
                                            children: 'From Time',
                                            htmlFor: 'from-time',
                                        }}
                                        lazy={false}
                                        mask='00:`00'
                                        onAccept={(value: string) =>
                                            onSetSearchParams(value, 'fromTime')
                                        }
                                        type='text'
                                        validate={isTimeValid}
                                        value={searchParams.fromTime}
                                    />
                                </GridCol>
                                <GridCol setWidth='one-half'>
                                    <TextInput
                                        dataTestId='to-date-input'
                                        defaultValue={searchParams.toDate}
                                        format={dateFormatter}
                                        id='to-date'
                                        inputRef={(node) => {
                                            toDateRef.current = node;
                                        }}
                                        labelProps={{
                                            children: 'To Date',
                                            htmlFor: 'to-date',
                                        }}
                                        lazy={false}
                                        mask={Date}
                                        parse={dateParser}
                                        pattern={INPUT_DATE_MASK}
                                        onAccept={(value: string) =>
                                            onSetSearchParams(value, 'toDate')
                                        }
                                        type='text'
                                        value={searchParams.toDate}
                                    />
                                </GridCol>
                                <GridCol setWidth='one-half'>
                                    <TextInput
                                        dataTestId='to-time-input'
                                        defaultValue={searchParams.toTime}
                                        id='to-time'
                                        inputRef={(node) => {
                                            toTimeRef.current = node;
                                        }}
                                        labelProps={{
                                            children: 'To Time',
                                            htmlFor: 'to-time',
                                        }}
                                        lazy={false}
                                        mask='00:`00'
                                        onAccept={(value: string) =>
                                            onSetSearchParams(value, 'toTime')
                                        }
                                        type='text'
                                        validate={isTimeValid}
                                        value={searchParams.toTime}
                                    />
                                </GridCol>
                            </GridRow>
                        </DropPanel>
                    </GridCol>
                </GridRow>
                <SectionBreak size={'m'} />
                <ButtonGroup>
                    <Button
                        dataTestId='button-search'
                        disabled={isGetAuditSearchPending}
                        onClick={onClickSearch}
                        showProgress={isGetAuditSearchPending}
                        spacing={{
                            direction: 'right',
                            space: 'margin',
                            unit: '5',
                        }}
                        theme={{
                            backgroundColor:
                            BackgroundOrganisationColorClass.HM_REVENUE_CUSTOMS_BACKGROUND,
                        }}
                        type='submit'
                    >
                        Search
                    </Button>

                    <Button
                        dataTestId='button-reset'
                        disabled={isGetAuditSearchPending}
                        onClick={onClickReset}
                        showProgress={false}
                        variant='secondary'
                    >
                        Reset
                    </Button>
                </ButtonGroup>
            </form>
            {isGetAuditSearchPending && (
                <Spinner centerAlign dataTestId='page-spinner' />
            )}
            {!isGetAuditSearchPending && auditSearch && (
                <AuditTable auditResults={auditSearch}/>
            )}
        </>
    )
}