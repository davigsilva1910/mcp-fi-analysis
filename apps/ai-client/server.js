import express from "express";
import cors from "cors";
import { callGemini } from "./llm/providers/gemini.js";
import path from "path";

const app = express();

app.use(cors());

app.use(express.json());

const sessions = new Map();

app.post("/chat", async (req, res) => {
    try {

        const { question, sessionId } = req.body;

        console.log("Pergunta:", question);        
        console.log("SessionId:", sessionId);

        if (!sessions.has(sessionId)) {
            sessions.set(sessionId, [])
        }

        const history = sessions.get(sessionId)

        const result = await callGemini(question, history);

        console.log("Resultado Gemini:", JSON.stringify(result, null, 2));

        if (typeof result === 'object' && result?.type === 'file') {
            return res.json({
                success: true,
                ...result
            })
        }

        return res.json({
            success: true,
            answer: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

app.get(
    "/download/:filename",
    (req, res) => {

        const filePath =
            path.resolve(
                "./downloads",
                req.params.filename
            );

        res.download(
            filePath,
            err => {

                if (err) {

                    res.status(404).json({
                        success: false,
                        message:
                            "Arquivo não encontrado"
                    });

                }

            }
        );

    }
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});