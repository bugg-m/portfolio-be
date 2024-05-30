class ApiResponse {
    statusCode: number;
    data: any;
    success: boolean;
    message: string;

    constructor({
        statusCode,
        message = "Something went wrong",
        data = null
    }: {
        statusCode: number;
        message: string;
        data?: any;
        success: boolean;
    }) {
        this.statusCode = statusCode;
        this.data = data;
        this.success = statusCode < 400;
        this.message = message;
    }
}

export { ApiResponse };
