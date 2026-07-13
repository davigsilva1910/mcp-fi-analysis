import express from "express";
import cors from "cors";
import { callGemini } from "./llm/providers/gemini.js";

const app = express();

app.use(cors());

app.use(express.json());

const sessions = new Map();

app.post("/chat", async (req, res) => {
    try {

        const { question, sessionId } = req.body;

        if (!sessions.has(sessionId)) {
            sessions.set(sessionId, [])
        }

        const history = sessions.get(sessionId)

        const answer = await callGemini(question, history);

        res.json({
            success: true,
            answer
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});