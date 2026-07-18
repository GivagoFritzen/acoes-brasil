import { CreateOrderDto } from "../application/dto/CreateOrderDto";
import { OrderValidator } from "../shared/validators/OrderValidator";
import { DateUtils } from "../shared/utils/DateUtils";
import { normalizeOrderCodigo } from "../../../common/utils/OrderCodigoUtils";

export function createOrderSchema(body: any): CreateOrderDto {
  const codigo = normalizeOrderCodigo(String(body?.codigo ?? ""));
  const operacao = OrderValidator.parseOperacao(String(body?.operacao ?? ""));
  const tipo = OrderValidator.parseTipo(String(body?.tipo ?? ""), codigo);
  const data = DateUtils.normalizeToIsoDate(body?.data) ?? "";

  const dto: CreateOrderDto = {
    codigo,
    quantidade: Number(body?.quantidade ?? 0),
    valor: Number(body?.valor ?? 0),
    data,
    tipo,
    operacao,
  };

  OrderValidator.validateCreateOrderDto(dto);
  OrderValidator.validateOrderDate(dto.data);

  return dto;
}
