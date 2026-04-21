import { Router } from "express";
import { ImportController } from "../controllers/ImportController";
import { OrderController } from "../controllers/OrderController";

export const orderRoutes = Router();

// Lazy initialization to ensure DI container is ready
orderRoutes.post("/", (req, res) => {
  const controller = new OrderController();
  return controller.createAsync(req, res);
});

orderRoutes.post("/import", (req, res, next) => {
  const importController = new ImportController();
  return importController.getMiddleware()(req, res, next);
}, (req, res) => {
  const importController = new ImportController();
  return importController.importAsync(req, res);
});

orderRoutes.delete("/:id", (req, res) => {
  const controller = new OrderController();
  return controller.deleteAsync(req, res);
});

orderRoutes.get("/", (req, res) => {
  const controller = new OrderController();
  return controller.listAsync(req, res);
});

orderRoutes.get("/export/sell-snapshots", (req, res) => {
  const controller = new OrderController();
  return controller.exportSellSnapshotsAsync(req, res);
});

orderRoutes.get("/export/sell-snapshots/data", (req, res) => {
  const controller = new OrderController();
  return controller.getSellSnapshotsDataAsync(req, res);
});