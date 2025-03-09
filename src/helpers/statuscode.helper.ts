const getStatusCode = (error: any): number => {
  if (typeof error.code === 'number') return error.code;
  if (typeof error.status === 'number') return error.status;
  if (typeof error.statusCode === 'number') return error.statusCode;
  if (error.code === 'ERR_BAD_REQUEST') return 400;
  return 500;
};

export { getStatusCode };
