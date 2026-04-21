import { Router } from "express";
import { ImportController } from "../controllers/ImportController";
import { OrderController } from "../controllers/OrderController";

export const orderRoutes = Router();

const orderController = new OrderController();
const importController = new ImportController();

orderRoutes.post("/", orderController.createAsync.bind(orderController));
orderRoutes.post("/import", importController.getMiddleware(), importController.importAsync.bind(importController));
orderRoutes.delete("/:id", orderController.deleteAsync.bind(orderController));
orderRoutes.get("/", orderController.listAsync.bind(orderController));
orderRoutes.get("/export/sell-snapshots", orderController.exportSellSnapshotsAsync.bind(orderController));
orderRoutes.get("/export/sell-snapshots/data", orderController.getSellSnapshotsDataAsync.bind(orderController));