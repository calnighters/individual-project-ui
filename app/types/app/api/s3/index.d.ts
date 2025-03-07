interface BucketRecord {
    name: string;
}

interface BucketSearchResponse extends ApiExceptionResponse {
    buckets: BucketRecord[];
}

interface ObjectRecord {
    objectKey: string;
    objectSize: number;
    lastModifiedTimestamp: string;
}

interface ObjectSearchResponse extends ApiExceptionResponse {
    objects: ObjectRecord[];
}

interface GetObjectContentResponse extends ApiExceptionResponse {
    content: string;
}

interface PreUploadResponse extends ApiExceptionResponse {
    newUpload: boolean;
    unifiedDiff: string[];
}