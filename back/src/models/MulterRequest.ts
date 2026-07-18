import { Request } from "express";

export type MulterRequest = Request & { file?: Express.Multer.File };
