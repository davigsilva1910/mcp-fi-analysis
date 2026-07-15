import { z } from "zod";
import { gerarExcelDinamico } from "../services/excelGenerator.js";

export const generateFile = {

    name: "generateFile",

    description: `
    Sempre utilize esta ferramenta quando o usuário solicitar: 
        -exportar dados
        -gerar excel
        -baixar excel
        -planilha
        -download de relatório
        
        A ferramenta retorna um arquivo XLSX. 
        Nunca responda apenas com links quando esta ferramenta puder ser utilizada.
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