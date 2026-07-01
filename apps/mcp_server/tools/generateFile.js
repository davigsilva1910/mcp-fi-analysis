import { z } from "zod";
import { gerarExcelDinamico } from "../services/excelGenerator.js";

export const generateFile = {

    name: "generateFile",

    description: `
    Gera um arquivo Excel a partir de uma URL de consulta já validada.
    Use quando exportRecommended for true.
    `,

    input_schema: z.object({
        url: z.string()
    }),

    async execute({ url }) {

        const exportUrl = url.includes('export=true') ? url : `${url}&export=true`;

        const response = await fetch(exportUrl);

        if (!response.ok) {
            return {
                found: false,
                message: "Erro ao gerar arquivo"
            };
        }

        const data =
            await response.json();

        const registros =
            data.value ?? data;

        return await gerarExcelDinamico(
            registros,
            `export_${Date.now()}.xlsx`
        );
    }
};