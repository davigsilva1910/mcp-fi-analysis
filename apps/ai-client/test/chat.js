import { callGemini } from "../llm/providers/gemini.js";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

console.log("Chat iniciado. Digite sua pergunta ou 'sair' para encerrar.\n");

while (true) {
  const userInput = await rl.question("Você: ");

  if (userInput.toLowerCase() === "sair") {
    console.log("Encerrando chat...");
    break;
  }

  try {
    const response = await callGemini(userInput);
    console.log("Gemini:", response, "\n");
  } catch (error) {
    console.error("Erro:", error.message);
  }
}

rl.close();