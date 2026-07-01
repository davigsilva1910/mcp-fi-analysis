import {listarImports} from './tools/index.js'

const modulos = await listarImports();

for(let k of modulos) {
    console.log(k)
}