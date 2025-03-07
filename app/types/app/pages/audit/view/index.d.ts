interface AuditSearchParams {
    eventType: string;
    bucketName?: string;
    objectKey?: string;
    userName?: string;
    fromDate?: string;
    fromTime?: string;
    toDate?: string;
    toTime?: string;
}