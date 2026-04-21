import { Router } from "express";
import multer from "multer";
import { Op } from "sequelize";
import { sequelize } from "../database";
import { buildBrDateOrderExpression } from "../database/dateExpression";
import { Provento } from "../models/Provento";
import { extractField, parseDecimal, readSpreadsheetRows, SpreadsheetRow, toBrDateString } from "../utils/spreadsheet";
import { isFutureBrDate } from "../utils/datas";
import { ProventoTipo } from "../models/ProventoTipo";

export const proventoRoutes = Router();
const upload = multer({ storage: multer.memoryStorage() });

const normalizeText = (value: unknown): string =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const normalizeTipoProvento = (value: unknown): ProventoTipo => {
  const raw = normalizeText(value);

  if (raw.includes("divid")) {
    return "Dividendo";
  }

  if (raw.includes("juros") || raw.includes("jscp") || raw.includes("capital proprio")) {
    return "JurosSobreCapitalProprio";
  }

  return "Rendimento";
};

const isHeaderCell = (value: unknown, headers: string[]): boolean => {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue) {
    return false;
  }

  return headers.some((header) => normalizeText(header) === normalizedValue);
};

const isRowEmpty = (row: SpreadsheetRow): boolean => {
  const values = Object.values(row);
  if (!values.length) {
    return true;
  }

  return values.every((value) => {
    if (value === null || value === undefined) {
      return true;
    }

    return String(value).trim() === "";
  });
};

const normalizeCodigoFromProduto = (value: unknown): string => {
  const raw = String(value ?? "").trim().toUpperCase();
  if (!raw) {
    return "";
  }

  const codigoMatch = raw.match(/[A-Z]{4}(?:3|4|5|6|11|34|35|39)?/);
  if (codigoMatch) {
    return codigoMatch[0];
  }

  return raw.split(/\s|-|\//)[0] ?? raw;
};

proventoRoutes.post("/", async (req, res) => {
  try {
    const normalizedData = toBrDateString(req.body?.data);
    if (!normalizedData) {
      return res.status(400).json({ message: "Data inválida para provento." });
    }

    if (isFutureBrDate(normalizedData)) {
      return res.status(400).json({ message: "A data do provento não pode ser futura." });
    }

    const provento = await Provento.create({
      ...req.body,
      data: normalizedData,
    });
    return res.status(201).json(provento);
  } catch (error) {
    return res.status(400).json({ message: "Erro ao criar provento", error });
  }
});

proventoRoutes.post("/import", upload.single("file"), async (req, res) => {
  const file = (req as any).file as { buffer?: Buffer } | undefined;

  if (!file?.buffer) {
    return res.status(400).json({ message: "Arquivo não enviado. Use o campo 'file'." });
  }

  const transaction = await sequelize.transaction();

  try {
    const rows = readSpreadsheetRows(file.buffer);

    if (!rows.length) {
      await transaction.rollback();
      return res.status(400).json({ message: "Planilha sem dados." });
    }

    let imported = 0;
    const invalidLines: number[] = [];

    for (const [index, row] of rows.entries()) {
      if (isRowEmpty(row)) {
        continue;
      }

      const line = index + 2;
      const produtoField = extractField(row, ["Produto", "Código", "Codigo"]);
      const pagamentoField = extractField(row, ["Pagamento", "Data", "Data de Pagamento"]);
      const tipoField = extractField(row, ["Tipo de Evento", "Tipo"]);
      const instituicaoField = extractField(row, ["Instituição", "Instituicao"]);
      const quantidadeField = extractField(row, ["Quantidade"]);
      const precoField = extractField(row, ["Preço unitário", "Preco unitario", "Preço", "Preco"]);
      const valorField = extractField(row, ["Valor líquido", "Valor liquido", "Valor"]);

      const seemsHeaderRow =
        isHeaderCell(produtoField, ["Produto", "Código", "Codigo"]) ||
        isHeaderCell(tipoField, ["Tipo de Evento", "Tipo"]);

      if (seemsHeaderRow) {
        continue;
      }

      const hasAnyMainField = [
        produtoField,
        pagamentoField,
        tipoField,
        instituicaoField,
        quantidadeField,
        precoField,
        valorField,
      ].some((value) => String(value ?? "").trim() !== "");

      if (!hasAnyMainField) {
        continue;
      }

      const codigo = normalizeCodigoFromProduto(produtoField);
      const data = toBrDateString(pagamentoField);
      const tipo = normalizeTipoProvento(tipoField);
      const instituicao = String(instituicaoField ?? "").trim();
      const quantidadeRaw = parseDecimal(quantidadeField);
      const precoUnitario = parseDecimal(precoField);
      const valorLiquido = parseDecimal(valorField);
      const quantidade = quantidadeRaw === null ? null : Math.trunc(quantidadeRaw);

      if (
        !codigo ||
        !data ||
        !tipo ||
        !instituicao ||
        quantidade === null ||
        quantidade <= 0 ||
        precoUnitario === null ||
        valorLiquido === null
      ) {
        invalidLines.push(line);
        continue;
      }

      if (isFutureBrDate(data)) {
        invalidLines.push(line);
        continue;
      }

      await Provento.create(
        {
          codigo,
          data,
          tipo,
          instituicao,
          quantidade,
          precoUnitario,
          valorLiquido,
        },
        { transaction }
      );

      imported += 1;
    }

    if (imported === 0 && invalidLines.length > 0) {
      throw new Error(`Nenhuma linha válida encontrada. Primeira linha inválida: ${invalidLines[0]}.`);
    }

    await transaction.commit();
    return res.status(201).json({
      imported,
      skipped: invalidLines.length,
      invalidLines,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).json({
      message: "Erro ao importar planilha de proventos",
      error: error instanceof Error ? error.message : error,
    });
  }
});

proventoRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const provento = await Provento.findByPk(id);

    if (!provento) {
      return res.status(404).json({ message: "Provento não encontrado." });
    }

    await provento.destroy();
    return res.json({ message: "Provento deletado com sucesso." });
  } catch (error) {
    return res.status(400).json({
      message: "Erro ao deletar provento",
      error: error instanceof Error ? error.message : error,
    });
  }
});

proventoRoutes.get("/", async (req, res) => {
  const {
    data,
    dataInicial,
    dataFinal,
    codigo,
    tipo,
    agruparPorCodigo,
    page = "1",
    limit = "20",
  } = req.query;
  const shouldGroupByCodigo =
    String(agruparPorCodigo ?? "")
      .trim()
      .toLowerCase() === "true";
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 20, 1);
  const offset = (pageNumber - 1) * limitNumber;

  const where: any = {};
  const andConditions: unknown[] = [];

  const normalizeToIsoDate = (value: unknown): string | null => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmedValue = value.trim();
    const brDateMatch = trimmedValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (brDateMatch) {
      const [, day, month, year] = brDateMatch;
      return `${year}-${month}-${day}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue;
    }

    return null;
  };

  const normalizedDataInicial = normalizeToIsoDate(dataInicial);
  const normalizedData = normalizeToIsoDate(data);
  const normalizedDataFinal = normalizeToIsoDate(dataFinal);

  const startDate = normalizedDataInicial ?? normalizedData;
  const endDate = normalizedDataFinal;
  const dataAsDate = buildBrDateOrderExpression("Provento");

  if (startDate && endDate) {
    andConditions.push(
      sequelize.where(dataAsDate, {
        [Op.between]: [startDate, endDate],
      })
    );
  } else if (startDate) {
    andConditions.push(
      sequelize.where(dataAsDate, {
        [Op.gte]: startDate,
      })
    );
  } else if (endDate) {
    andConditions.push(
      sequelize.where(dataAsDate, {
        [Op.lte]: endDate,
      })
    );
  }

  if (typeof codigo === "string" && codigo.trim()) {
    where.codigo = {
      [Op.like]: `%${codigo.trim()}%`,
    };
  }

  if (typeof tipo === "string" && tipo.trim()) {
    where.tipo = tipo.trim();
  }

  if (andConditions.length > 0) {
    where[Op.and] = andConditions;
  }

  if (shouldGroupByCodigo) {
    const rows = await Provento.findAll({
      where,
      order: [[buildBrDateOrderExpression("Provento"), "DESC"]],
    });

    const groupedByCodigo = new Map<string, any>();

    for (const row of rows) {
      const codigoKey = String(row.codigo ?? "").trim().toUpperCase();
      const tipoKey = String(row.tipo ?? "").trim();
      const groupKey = `${codigoKey}::${tipoKey}`;
      const existing = groupedByCodigo.get(groupKey);

      if (!existing) {
        groupedByCodigo.set(groupKey, {
          ...row.toJSON(),
          codigo: codigoKey,
          data: "",
        });
        continue;
      }

      const quantidade = Number(existing.quantidade ?? 0) + Number(row.quantidade ?? 0);
      const valorLiquido = Number(existing.valorLiquido ?? 0) + Number(row.valorLiquido ?? 0);

      groupedByCodigo.set(groupKey, {
        ...existing,
        quantidade,
        valorLiquido,
        precoUnitario: quantidade > 0 ? valorLiquido / quantidade : 0,
        data: "",
      });
    }

    const groupedRows = Array.from(groupedByCodigo.values());
    const count = groupedRows.length;
    const paginatedRows = groupedRows.slice(offset, offset + limitNumber);

    return res.json({
      data: paginatedRows,
      page: pageNumber,
      limit: limitNumber,
      total: count,
      totalPages: Math.ceil(count / limitNumber) || 1,
    });
  }

  const { rows, count } = await Provento.findAndCountAll({
    where,
    order: [[buildBrDateOrderExpression("Provento"), "DESC"]],
    limit: limitNumber,
    offset,
  });

  return res.json({
    data: rows,
    page: pageNumber,
    limit: limitNumber,
    total: count,
    totalPages: Math.ceil(count / limitNumber) || 1,
  });
});