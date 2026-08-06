import fs from "fs";
import os from "os";
import path from "path";
import { Router } from "express";
import { Container } from "../shared/dependency-injection/Container";
import { PortfolioController } from "../controllers/PortfolioController";
import { ValidationMiddleware } from "../middlewares/ValidationMiddleware";
import { createMulterUpload } from "../shared/multer/MulterConfigFactory";

let uploadDir: string | null = null;
let upload: ReturnType<typeof createMulterUpload> | null = null;

const getUpload = () => {
  if (!uploadDir) {
    uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "acoes-portfolio-upload-"));
    upload = createMulterUpload(uploadDir);
  }
  return upload!;
};

export const portfolioRoutes = Router();

const getController = (): PortfolioController => Container.get<PortfolioController>('PortfolioController');

portfolioRoutes.post("/", (req, res) => {
  return getController().createOrUpdateAsync(req, res);
});

portfolioRoutes.get("/", (req, res) => {
  return getController().listAsync(req, res);
});

portfolioRoutes.get("/export", (req, res) => {
  return getController().exportPortfolioAsync(req, res);
});

portfolioRoutes.post("/import", (req, res) => {
  return getUpload().single("file")(req, res, () => {
    return getController().importPortfolioAsync(req, res);
  });
});

portfolioRoutes.delete("/:id", ValidationMiddleware.validateUuidParam("id"), (req, res) => {
  return getController().deleteAsync(req, res);
});

portfolioRoutes.put("/:id", ValidationMiddleware.validateUuidParam("id"), (req, res) => {
  return getController().updateAsync(req, res);
});
