import type {ErrorResponseHandler, ErrorResponseHandlers} from "~/types/app/api/error-handling";
import {ProblemWithServiceErrorCode} from "~/constants/error-codes";
import {ErrorPageRedirectPath} from "~/utils/error-handling";

export const TABLE_HEADERS = [
    {index: 0, children: 'Bucket Name'},
    {index: 1, children: 'Object Key'},
    {index: 2, children: 'Action Timestamp'},
    {index: 3, children: 'Event Type'},
    {index: 4, children: 'User Name'},
    {index: 5, children: ''}
];

export const RESULTS_PER_PAGE_LIMIT = 20;

export const NO_RESULTS_TEXT =
    "Your search returned no results. Try changing your search filters and select 'Search' to try again.";

export const MANY_RESULTS =
    'Your search returned a large number of results. Only the first 100 will be displayed.';

export const AUDIT_PAGE_ERROR_RESPONSE_DEFAULT_SERVER_ERROR: ErrorResponseHandler =
    {
        errorMessage:
            'An unexpected error has occurred when interacting with the Audit API',
        redirect: {
            errorCode: ProblemWithServiceErrorCode.Unexpected,
            redirectPath: ErrorPageRedirectPath.PROBLEM_WITH_SERVICE,
        },
    };

export const AUDIT_PAGE_ERROR_RESPONSES: ErrorResponseHandlers = {
    default: AUDIT_PAGE_ERROR_RESPONSE_DEFAULT_SERVER_ERROR,
};

export const DETAILS_ELEMENT_SUMMARY = 'Help with Audit';
export const DETAILS_ELEMENT_TEXT =
    'Please enter your search filters and select the Search button to view relevant audit events. All filters are optional, and if left blank then all audit events will be displayed. Please note that the first 200 audit events will be shown. If you require more specific results, please narrow your search filters. Dates are formatted DD/MM/YYYY and time HH:MM:SS.';
export const APP_LOCAL_DATE_EMPTY_FORMAT = '__/__/____';
export const APP_LOCAL_TIME_EMPTY_FORMAT = '__:__';
export const INPUT_DATE_MASK = 'd/`m/`Y';