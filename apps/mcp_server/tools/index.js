import fs from 'fs/promises';
import path from 'path';
const diretorio = path.resolve('./tools'); // Salva o caminho do diretório atual


export async function listarImports() {
    const modulosImport = []


    const ignorar = 'index.js';

    let listaDeArquivos = await fs.readdir(diretorio);
    const filtrados = listaDeArquivos.filter(nome => nome !== ignorar && nome.endsWith('.js'))


    for (let k of filtrados) {
        try {
            const caminho = path.join(diretorio, k);
            const modulo = await import(`file://${caminho}`);
            const tool = modulo.default ?? Object.values(modulo)[0];
            modulosImport.push(tool);
        } catch (e) {

            console.log(`Erro no arquivo: ${k}`);
            console.log(e);

        }
    }

    return modulosImport;

}