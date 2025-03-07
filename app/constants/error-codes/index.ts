export enum AccessForbiddenErrorCode {
  UnauthorisedRole = '0',
  NoRolesExist = '1',
  UnknownError = '2',
  Authorisation = '3',
}

export enum PageNotFoundErrorCode {
  ResourceNotFound = '0',
}

export enum ProblemWithServiceErrorCode {
  Unrecognised = '0',
  UnknownRole = '1',
  Unexpected = '2',
}
