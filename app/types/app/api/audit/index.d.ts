interface AuditSearchRequest {
    eventType?: string;
    objectKey?: string;
    bucketName?: string;
    userName?: string;
    fromDate?: string;
    toDate?: string;
}

interface AuditInfo {
    eventType: string;
    objectKey: string;
    bucketName: string;
    userName: string;
    auditDate: string;
    auditObjectKey: string;
}

interface AuditSearchResponse extends ApiExceptionResponse {
    auditRecords: AuditInfo[];
}

interface AuditDiffRequest {
    auditObjectKey: string;
}

interface AuditDiffResponse extends ApiExceptionResponse {
    unifiedDiff: string[];
}