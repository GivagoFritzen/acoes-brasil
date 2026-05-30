import { sequelize } from "./src/database";
import "./src/models/order/Order";
import "./src/models/portfolio/Portfolio";
import "./src/models/provento/Provento";

async function test() {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log("DB synced");

  try {
    const order = await sequelize.models.Order!.create({
      codigo: "PETR4",
      valor: 25.5,
      quantidade: 100,
      data: "20-05-2026",
      tipo: "ACAO",
      operacao: "Compra",
    });
    console.log("SUCCESS:", order.toJSON());
  } catch (err: any) {
    console.error("ERROR_NAME:", err.name);
    console.error("ERROR_MESSAGE:", err.message);
    if (err.errors) {
      err.errors.forEach((e: any) =>
        console.error("  FIELD:", e.path, "TYPE:", e.type, "MSG:", e.message, "VALUE:", e.value)
      );
    } else {
      console.error("STACK:", err.stack);
    }
  }
}
test().catch(console.error);
