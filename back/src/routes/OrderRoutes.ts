import { Router } from "express";
import { Container } from "../shared/dependency-injection/Container";
import { OrderController } from "../controllers/OrderController";
import { ImportController } from "../controllers/ImportController";
import { ValidationMiddleware } from "../middlewares/ValidationMiddleware";
import { createOrderSchema } from "../middlewares/OrderSchemas";

export const orderRoutes = Router();

const getOrderController = (): OrderController => Container.get<OrderController>('OrderController');

orderRoutes.post("/", ValidationMiddleware.validate(createOrderSchema), (req, res) => {
  return getOrderController().createAsync(req, res);
});

orderRoutes.post("/import", (req, res, next) => {
  const importController = Container.get<ImportController>('ImportController');
  return importController.getMiddleware()(req, res, next);
}, (req, res) => {
  const importController = Container.get<ImportController>('ImportController');
  return importController.importAsync(req, res);
});

orderRoutes.delete("/:id", ValidationMiddleware.validateUuidParam("id"), (req, res) => {
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