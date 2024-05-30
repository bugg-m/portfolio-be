class ApiError extends Error {
    statusCode: number;
    data: any;
    errors: any[];
    success: boolean;

    constructor({
        statusCode,
        message = "Something went wrong",
        data = null,
        errors = [],
        stack = ""
    }: {
        statusCode: number;
        message: string;
        success: boolean;
        data?: any;
        errors?: any[];
        stack?: string;
    }) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        this.success = statusCode >= 400;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
