import { Router } from "express";
import multer from "multer";
import { ProventoController } from "../controllers/ProventoController";

export const proventoRoutes = Router();
const upload = multer({ storage: multer.memoryStorage() });
const getProventoController = () => new ProventoController();

proventoRoutes.post("/", (req, res) => {
  return getProventoController().createAsync(req, res);
});

proventoRoutes.post("/import", upload.single("file"), (req, res) => {
  return getProventoController().importAsync(req, res);
});

proventoRoutes.delete("/:id", (req, res) => {
  return getProventoController().deleteAsync(req, res);
});

proventoRoutes.get("/", (req, res) => {
  return getProventoController().listAsync(req, res);
});
