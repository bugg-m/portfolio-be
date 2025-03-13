import { Request } from 'express';
import multer, { FileFilterCallback, diskStorage } from 'multer';

const storage = diskStorage({
  destination: function (
    _: Request,
    __: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ): void {
    cb(null, 'public/uploads');
  },
  filename: function (
    _: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    cb(null, file.originalname);
  },
});

const fileFilter = (_: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
