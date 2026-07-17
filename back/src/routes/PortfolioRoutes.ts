import fs from "fs";
import os from "os";
import path from "path";
import multer from "multer";
import { Router } from "express";
import { PortfolioController } from "../controllers/PortfolioController";

const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "acoes-portfolio-upload-"));
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

export const portfolioRoutes = Router();

const getController = () => new PortfolioController();

portfolioRoutes.post("/", (req, res) => {
  return getController().createOrUpdateAsync(req, res);
});

portfolioRoutes.get("/", (req, res) => {
  return getController().listAsync(req, res);
});

portfolioRoutes.get("/export", (req, res) => {
  return getController().exportPortfolioAsync(req, res);
});

portfolioRoutes.post("/import", upload.single("file"), (req, res) => {
  return getController().importPortfolioAsync(req, res);
});

portfolioRoutes.delete("/:id", (req, res) => {
  return getController().deleteAsync(req, res);
});
