import type {ErrorResponseHandler, ErrorResponseHandlers} from "~/types/app/api/error-handling";
import {ProblemWithServiceErrorCode} from "~/constants/error-codes";
import {ErrorPageRedirectPath} from "~/utils/error-handling";

export const S3_PAGE_ERROR_RESPONSE_DEFAULT_SERVER_ERROR: ErrorResponseHandler =
    {
        errorMessage:
            'An unexpected error has occurred when interacting with the S3 API',
        redirect: {
            errorCode: ProblemWithServiceErrorCode.Unexpected,
            redirectPath: ErrorPageRedirectPath.PROBLEM_WITH_SERVICE,
        },
    };

export const S3_PAGE_ERROR_RESPONSES: ErrorResponseHandlers = {
    default: S3_PAGE_ERROR_RESPONSE_DEFAULT_SERVER_ERROR,
};