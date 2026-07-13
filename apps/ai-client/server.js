import express from "express";
import cors from "cors";
import { callGemini } from "./llm/providers/gemini.js";

const app = express();

app.use(cors());

app.use(express.json());

app.post("/chat", async (req, res) => {
    try {

        const { question } = req.body;

        const answer = await callGemini(question);

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