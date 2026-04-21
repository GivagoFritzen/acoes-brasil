import { Router } from "express";
import { FundamentusAcaoDetails } from "../models/FundamentusAcaoDetails";

export const fundamentusRoutes = Router();

const BASE_URL = "https://www.fundamentus.com.br/detalhes.php";

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)));

const stripHtml = (value: string): string =>
  decodeHtmlEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const normalizeLabel = (value: string): string =>
  stripHtml(value)
    .replace(/\s*:\s*$/, "")
    .replace(/^\?\s*/, "")
    .trim();

const normalizeCodigoForFundamentus = (value: string): string => {
  const normalized = value.trim().toUpperCase();

  if (/^[A-Z0-9]{6}$/.test(normalized) && normalized.endsWith("F")) {
    return normalized.slice(0, -1);
  }

  return normalized;
};

const parseFundamentusDetails = (codigo: string, html: string): FundamentusAcaoDetails => {
  const pairRegex = /<td[^>]*class="label[^"]*"[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*class="data[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
  const indicadoresMap = new Map<string, string>();

  let match: RegExpExecArray | null;
  while ((match = pairRegex.exec(html)) !== null) {
    const label = normalizeLabel(match[1] ?? "");
    const value = stripHtml(match[2] ?? "");

    if (!label || !value) {
      continue;
    }

    if (!indicadoresMap.has(label)) {
      indicadoresMap.set(label, value);
    }
  }

  const empresa = indicadoresMap.get("Empresa") ?? null;
  const setor = indicadoresMap.get("Setor") ?? null;
  const subsetor = indicadoresMap.get("Subsetor") ?? null;

  const indicadores = Array.from(indicadoresMap.entries())
    .filter(([label]) => !["Empresa", "Setor", "Subsetor"].includes(label))
    .map(([label, value]) => ({
      label,
      value,
    }));

  return {
    codigo,
    empresa,
    setor,
    subsetor,
    indicadores,
    updatedAt: new Date().toISOString(),
  };
};

fundamentusRoutes.get("/:codigo", async (req, res) => {
  const codigo = String(req.params.codigo ?? "")
    .trim()
    .toUpperCase();
  const codigoFundamentus = normalizeCodigoForFundamentus(codigo);

  if (!codigo) {
    return res.status(400).json({ message: "Código do ativo é obrigatório." });
  }

  try {
    const url = `${BASE_URL}?papel=${encodeURIComponent(codigoFundamentus)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      return res.status(502).json({
        message: `Falha ao consultar Fundamentus (${response.status}).`,
      });
    }

    // Decodifica o HTML usando a codificação correta (iso-8859-1)
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("iso-8859-1");
    const html = decoder.decode(buffer);

    if (/papel\s+inexistente|nenhum\s+resultado/i.test(html)) {
      return res.status(404).json({ message: `Ativo ${codigo} não encontrado no Fundamentus.` });
    }

    const parsed = parseFundamentusDetails(codigo, html);

    if (!parsed.indicadores.length) {
      return res.status(502).json({
        message: "Não foi possível extrair dados do Fundamentus.",
      });
    }

    return res.json(parsed);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao consultar Fundamentus.",
      error: error instanceof Error ? error.message : error,
    });
  }
});
