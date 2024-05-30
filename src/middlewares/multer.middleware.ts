import multer from "multer";
import { Request } from "express";
const storage = multer.diskStorage({
    destination: function (
        _: Request,
        __: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ): void {
        cb(null, "public/images");
    },
    filename: function (_: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });
