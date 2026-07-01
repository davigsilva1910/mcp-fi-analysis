import ExcelJS from 'exceljs';

export async function gerarExcelDinamico(
    dados,
    nomeArquivo = 'relatorio.xlsx'
) {

    if (!dados?.length) {
        throw new Error(
            'Nenhum dado encontrado'
        );
    }

    const workbook =
        new ExcelJS.Workbook();

    const worksheet =
        workbook.addWorksheet('Dados');

    // Colunas dinâmicas
    const campos =
        Object.keys(dados[0]);

    worksheet.columns =
        campos.map(campo => ({
            header: campo,
            key: campo,
            width: 25
        }));

    // Linhas
    for (const item of dados) {
        worksheet.addRow(item);
    }

    const buffer =
        await workbook.xlsx.writeBuffer();

    return {
        type: 'file',
        filename: nomeArquivo,
        mimeType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        data:
            Buffer.from(buffer).toString('base64')
    };
}