import { HttpStatusCode } from '~/constants/api';
import { ErrorPageRedirectPath } from '~/utils/error-handling';
import {
  AccessForbiddenErrorCode,
  PageNotFoundErrorCode,
  ProblemWithServiceErrorCode,
} from '~/constants/error-codes';

interface RedirectHandler {
  errorCode?:
    | AccessForbiddenErrorCode
    | PageNotFoundErrorCode
    | ProblemWithServiceErrorCode;
  redirectPath: ErrorPageRedirectPath;
}

interface ErrorResponseHandler {
  errorMessage?: string;
  redirect?: RedirectHandler;
}

interface ErrorResponseHandlers {
  [key: HttpStatusCode]: ErrorResponseHandler;
  default: ErrorResponseHandler;
}

interface ExceptionResponse {
  redirectPath?: string;
  reason?: string;
}

interface ExceptionResponsePayload {
  correlationId: string;
  httpStatusCode?: HttpStatusCode;
  errorResponseHandlers: ErrorResponseHandlers;
  exceptionArguments?: string[];
}
