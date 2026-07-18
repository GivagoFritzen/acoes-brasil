import { sequelize } from "./src/database";

// Import models to register them
import "./src/models/order/Order";
import "./src/models/portfolio/Portfolio";
import "./src/models/provento/Provento";
import "./src/models/order/OrderSellSnapshot";

async function main() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  try {
    const result = await OrderModel(sequelize).create({
      codigo: "PETR4",
      valor: 25.5,
      quantidade: 100,
      data: "20-05-2026",
      tipo: "ACAO",
      operacao: "Compra",
    });
    console.log("OK:", result.toJSON());
  } catch (e: Error) {
    console.log("FAIL:", e.name, e.message);
    if ("errors" in e && Array.isArray((e as Error & { errors: Array<{ path: string; type: string; message: string; value: string }> }).errors)) {
      for (const x of (e as Error & { errors: Array<{ path: string; type: string; message: string; value: string }> }).errors) {
        console.log("  E:", x.path, x.type, x.message, x.value);
      }
    }
  }
}

function OrderModel(seq: object) {
  const { DataTypes } = require("sequelize");
  const Order = seq.define("Order", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    codigo: { type: DataTypes.STRING, allowNull: false },
    valor: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    data: { type: DataTypes.STRING(10), allowNull: false },
    tipo: { type: DataTypes.STRING, allowNull: false },
    operacao: { type: DataTypes.STRING, allowNull: false },
  }, { tableName: "Orders" });
  return Order;
}

main();
