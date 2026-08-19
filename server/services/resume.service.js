import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const extractResumeText = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("Resume file is required.");
  }

  const mimeType = file.mimetype;

  // PDF
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({
      data: file.buffer,
    });

    try {
      const result = await parser.getText();

      return result.text?.trim() || "";
    } finally {
      await parser.destroy();
    }
  }

  // DOCX
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return result.value?.trim() || "";
  }

  throw new Error(
    "Unsupported resume format. Only PDF and DOCX are supported."
  );
};