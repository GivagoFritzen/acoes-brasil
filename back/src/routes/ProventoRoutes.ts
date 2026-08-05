import fs from "fs";
import os from "os";
import path from "path";
import { Router } from "express";
import { Container } from "../shared/dependency-injection/Container";
import { ProventoController } from "../controllers/ProventoController";
import { ValidationMiddleware } from "../middlewares/ValidationMiddleware";
import { createMulterUpload } from "../shared/multer/MulterConfigFactory";

const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "acoes-upload-"));
const upload = createMulterUpload(uploadDir);

export const proventoRoutes = Router();
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

proventoRoutes.delete("/by-codigo/:codigo", (req, res) => {
  return getProventoController().deleteByCodigoAsync(req, res);
});

proventoRoutes.put("/:id", ValidationMiddleware.validateUuidParam("id"), (req, res) => {
  return getProventoController().updateAsync(req, res);
});

proventoRoutes.get("/", (req, res) => {
  return getProventoController().listAsync(req, res);
});
