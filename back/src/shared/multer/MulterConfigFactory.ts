import multer from "multer";

const LIMITE_TAMANHO_ARQUIVO = 1048576;
const EXTENSAO_PERMITIDA = ".xlsx";

export function createMulterUpload(uploadDir: string): multer.Multer {
  return multer({
    dest: uploadDir,
    limits: { fileSize: LIMITE_TAMANHO_ARQUIVO },
    fileFilter: (_req, file, cb) => {
      const ext = require("path").extname(file.originalname).toLowerCase();
      if (ext !== EXTENSAO_PERMITIDA) {
        return cb(new Error("Apenas arquivos .xlsx são permitidos."));
      }
      cb(null, true);
    },
  });
}
