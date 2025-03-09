class ApiResponse {
  statusCode: number;
  data: any;
  status: boolean;
  message: string;

  constructor({
    statusCode,
    message = 'Something went wrong',
    data = null,
  }: {
    statusCode: number;
    message: string;
    data?: any;
    status: boolean;
  }) {
    this.statusCode = statusCode;
    this.data = data;
    this.status = statusCode < 400;
    this.message = message;
  }
}

export { ApiResponse };
