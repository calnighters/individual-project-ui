type ErrorCode =
    | 'CONFLICT'
    | 'FORBIDDEN'
    | 'INVALID_PAYLOAD'
    | 'NOT_FOUND'
    | 'SERVER_ERROR';

interface ApiExceptionResponse {
    code?: ErrorCode;
    reason?: string;
}
