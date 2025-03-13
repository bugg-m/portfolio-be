interface ErrorWithCode {
  code: number | string;
}

interface ErrorWithStatus {
  status: number;
}

interface ErrorWithStatusCode {
  statusCode: number;
}

const hasCode = (error: unknown): error is ErrorWithCode =>
  typeof error === 'object' && error !== null && 'code' in error;

const hasStatus = (error: unknown): error is ErrorWithStatus =>
  typeof error === 'object' && error !== null && 'status' in error;

const hasStatusCode = (error: unknown): error is ErrorWithStatusCode =>
  typeof error === 'object' && error !== null && 'statusCode' in error;

const getStatusCode = (error: unknown): number => {
  if (hasCode(error) && typeof error.code === 'number') return error.code;
  if (hasStatus(error) && typeof error.status === 'number') return error.status;
  if (hasStatusCode(error) && typeof error.statusCode === 'number') return error.statusCode;
  if (hasCode(error) && error.code === 'ERR_BAD_REQUEST') return 400;
  return 500;
};

export { getStatusCode };
