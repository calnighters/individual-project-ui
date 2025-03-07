import type {ErrorResponseHandlers} from "~/types/app/api/error-handling";
import {v4 as uuidv4} from 'uuid';
import {S3_BUCKET_ENDPOINT} from "~/api/constants";
import {HttpStatusCode} from "~/constants/api";
import {getExceptionResponse} from "~/utils/error-handling";
import {redirect} from "react-router-dom";
import {commonHeaders} from "~/api/common";

export async function listBuckets(
    errorResponseHandlers: ErrorResponseHandlers,
): Promise<BucketSearchResponse> {
    const correlationId = uuidv4();
    try {
        const headers = await commonHeaders(correlationId);
        const response = await fetch(
            S3_BUCKET_ENDPOINT,
            {
                headers: headers
            }
        );

        const data = await response.text();

        const res = JSON.parse(data) as BucketSearchResponse;

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

export async function listObjects(
    bucketName: string,
    errorResponseHandlers: ErrorResponseHandlers,
): Promise<ObjectSearchResponse> {
    const correlationId = uuidv4();

    try {
        const response = await fetch(
            `${S3_BUCKET_ENDPOINT}/${bucketName}/contents`
        );

        const data = await response.text();

        const res = JSON.parse(data) as ObjectSearchResponse;

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

export async function getObjectContent(
    bucketName: string,
    objectKey: string,
    errorResponseHandlers: ErrorResponseHandlers,
): Promise<GetObjectContentResponse> {
    const correlationId = uuidv4();

    try {
        const requestBody = {
            objectKey: objectKey
        };

        const response = await fetch(
            `${S3_BUCKET_ENDPOINT}/${bucketName}/file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'objectKey': objectKey})
            });

        const {status} = response;

        const data = await response.text();

        if (status !== HttpStatusCode.OK.valueOf()) {
            const res = JSON.parse(data) as GetObjectContentResponse;

            const {reason, redirectPath} = getExceptionResponse({
                correlationId,
                httpStatusCode: status,
                errorResponseHandlers,
            });

            if (redirectPath) redirect(redirectPath);

            return {...res, reason};
        }

        return {content: data};
    } catch {
        redirect(
            getExceptionResponse({
                correlationId,
                errorResponseHandlers
            }).redirectPath!
        )
    }
}

export async function preUploadRequest(
    bucketName: string,
    objectKey: string,
    file: File,
    errorResponseHandlers: ErrorResponseHandlers,
): Promise<PreUploadResponse> {
    const correlationId = uuidv4();

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('objectKey', objectKey);

        const response = await fetch(
            `${S3_BUCKET_ENDPOINT}/${bucketName}/pre-upload`, {
                method: 'POST',
                body: formData
            });

        const {status} = response;

        const data = await response.text();

        const res = JSON.parse(data) as PreUploadResponse;

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

export async function postObjectContent(
    bucketName: string,
    objectKey: string,
    content: string,
    errorResponseHandlers: ErrorResponseHandlers,
): Promise<void> {
    const correlationId = uuidv4();

    try {
        const formData = new FormData();
        const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
        formData.append('file', blob, objectKey);
        formData.append('objectKey', objectKey);

        const response = await fetch(`${S3_BUCKET_ENDPOINT}/${bucketName}/upload`, {
            method: 'POST',
            body: formData,
        });

        const {status} = response;

        if (status !== HttpStatusCode.OK.valueOf()) {
            const {redirectPath} = getExceptionResponse({
                correlationId,
                httpStatusCode: status,
                errorResponseHandlers,
            });

            if (redirectPath) redirect(redirectPath);
        }
    } catch {
        redirect(
            getExceptionResponse({
                correlationId,
                errorResponseHandlers
            }).redirectPath!
        )
    }
}