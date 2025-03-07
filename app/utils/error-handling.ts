import type {
    ErrorResponseHandler,
    ExceptionResponse,
    ExceptionResponsePayload,
    RedirectHandler
} from "~/types/app/api/error-handling";

export enum ErrorPageRedirectPath {
    ACCESS_FORBIDDEN = '/access-forbidden',
    PAGE_NOT_FOUND = '/page-not-found',
    PROBLEM_WITH_SERVICE = '/problem-with-service',
}

const buildRedirectPath = (
    redirect: RedirectHandler,
    correlationId: string,
    errorMessage?: string,
    exceptionArguments?: string[],
) => {
    const {errorCode, redirectPath} = redirect;

    const redirectUrlSearchParams = new URLSearchParams({correlationId});

    if (errorCode) {
        redirectUrlSearchParams.append('errorCode', errorCode);
    }

    if (errorMessage) {
        let formattedErrorMessage = errorMessage;

        if (exceptionArguments) {
            formattedErrorMessage = formattedErrorMessage
                .concat(exceptionArguments.join(', '))
                .concat('.');
        }

        redirectUrlSearchParams.append('errorMessage', formattedErrorMessage);
    }

    return redirectPath.concat(`?${redirectUrlSearchParams.toString()}`);
};

export function getExceptionResponse({
                                         correlationId,
                                         errorResponseHandlers,
                                         exceptionArguments,
                                         httpStatusCode,
                                     }: ExceptionResponsePayload): ExceptionResponse {
    let errorHandler: ErrorResponseHandler;

    if (httpStatusCode && errorResponseHandlers[httpStatusCode]) {
        errorHandler = errorResponseHandlers[
            httpStatusCode
            ] as ErrorResponseHandler;
    } else {
        errorHandler = errorResponseHandlers.default;
    }

    if (errorHandler.redirect || !httpStatusCode) {
        return {
            redirectPath: buildRedirectPath(
                errorHandler.redirect!,
                correlationId,
                errorHandler.errorMessage,
                exceptionArguments,
            ),
        };
    }

    let reasonString = errorHandler.errorMessage;

    if (exceptionArguments) {
        reasonString = reasonString?.concat(exceptionArguments.join(', '));
    }

    return {reason: reasonString};
}