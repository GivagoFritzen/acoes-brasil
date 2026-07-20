import fs from "fs";
import os from "os";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { Container } from "../shared/dependency-injection/Container";
import { ProventoController } from "../controllers/ProventoController";
import { ValidationMiddleware } from "../middlewares/ValidationMiddleware";

const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "acoes-upload-"));
export const proventoRoutes = Router();
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 1048576 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".xlsx") {
      return cb(new Error("Apenas arquivos .xlsx são permitidos."));
    }
    cb(null, true);
  },
});
const getProventoController = (): ProventoController => Container.get<ProventoController>('ProventoController');

proventoRoutes.post("/", (req, res) => {
  return getProventoController().createAsync(req, res);
});

proventoRoutes.post("/import", upload.single("file"), (req, res) => {
  return getProventoController().importAsync(req, res);
});

proventoRoutes.delete("/:id", ValidationMiddleware.validateUuidParam("id"), (req, res) => {
  return getProventoController().deleteAsync(req, res);
});

proventoRoutes.get("/", (req, res) => {
  return getProventoController().listAsync(req, res);
});
