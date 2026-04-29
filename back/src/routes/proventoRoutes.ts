import { Router } from "express";
import multer from "multer";
import { ProventoController } from "../controllers/ProventoController";

export const proventoRoutes = Router();
const upload = multer({ storage: multer.memoryStorage() });

proventoRoutes.post("/", (req, res) => {
  new ProventoController().createAsync(req, res);
});

proventoRoutes.post("/import", upload.single("file"), (req, res) => {
  new ProventoController().importAsync(req, res);
});

proventoRoutes.delete("/:id", (req, res) => {
  new ProventoController().deleteAsync(req, res);
});

proventoRoutes.get("/", (req, res) => {
  new ProventoController().listAsync(req, res);
});
