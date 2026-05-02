import { Router } from "express";
import { ImportController } from "../controllers/ImportController";
import { OrderController } from "../controllers/OrderController";

export const orderRoutes = Router();
const getOrderController = () => new OrderController();
const getImportController = () => new ImportController();

// Lazy initialization to ensure DI container is ready
orderRoutes.post("/", (req, res) => {
  return getOrderController().createAsync(req, res);
});

orderRoutes.post("/import", (req, res, next) => {
  return getImportController().getMiddleware()(req, res, next);
}, (req, res) => {
  return getImportController().importAsync(req, res);
});

orderRoutes.delete("/:id", (req, res) => {
  return getOrderController().deleteAsync(req, res);
});

orderRoutes.get("/", (req, res) => {
  return getOrderController().listAsync(req, res);
});

orderRoutes.get("/export/sell-snapshots", (req, res) => {
  return getOrderController().exportSellSnapshotsAsync(req, res);
});

orderRoutes.get("/export/sell-snapshots/data", (req, res) => {
  return getOrderController().getSellSnapshotsDataAsync(req, res);
});