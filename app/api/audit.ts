import type {ErrorResponseHandlers} from "~/types/app/api/error-handling";
import {v4 as uuidv4} from 'uuid';
import {redirect} from "react-router-dom";
import {getExceptionResponse} from "~/utils/error-handling";
import {HttpStatusCode} from "~/constants/api";
import {AUDIT_DIFF_ENDPOINT, AUDIT_SEARCH_ENDPOINT} from "~/api/constants";
import {commonHeaders} from "~/api/common";

export async function postAuditSearch(
    searchRequest: AuditSearchRequest,
    errorResponseHandlers: ErrorResponseHandlers,
): Promise<AuditSearchResponse | undefined> {
    const correlationId = uuidv4();

    try {
        const headers = await commonHeaders(correlationId);
        const response = await fetch(
            AUDIT_SEARCH_ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(searchRequest),
                headers: headers
            },
        );

        const data = await response.text();

        const res = JSON.parse(data) as AuditSearchResponse;

        const {status} = response;

        if (status !== HttpStatusCode.OK.valueOf()) {
            const {reason, redirectPath} = getExceptionResponse({
                correlationId,
                httpStatusCode: status,
                errorResponseHandlers,
            });

            if (redirectPath) redirect(redirectPath);

            return {...res, reason};
        }

        return res;
    } catch {
        redirect(
            getExceptionResponse({
                correlationId,
                errorResponseHandlers
            }).redirectPath!
        )
    }
}

export async function postFindAuditDiff(
    diffRequest: AuditDiffRequest,
    errorResponseHandlers: ErrorResponseHandlers,
): Promise<AuditDiffResponse> {
    const correlationId = uuidv4();

    try {
        const headers = await commonHeaders(correlationId);
        const response = await fetch(
            AUDIT_DIFF_ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(diffRequest),
                headers: headers
            },
        );

        const data = await response.text();

        const res = JSON.parse(data) as AuditDiffResponse;

        const {status} = response;

        if (status !== HttpStatusCode.OK.valueOf()) {
            const {reason, redirectPath} = getExceptionResponse({
                correlationId,
                httpStatusCode: status,
                errorResponseHandlers,
            });

            if (redirectPath) redirect(redirectPath);

            return {...res, reason};
        }

        return res;
    } catch {
        redirect(
            getExceptionResponse({
                correlationId,
                errorResponseHandlers
            }).redirectPath!
        )
    }
}