import 'dotenv/config';

import fs from 'fs/promises';
import path from 'path';

import { systemPrompt } from '../prompt/systemPrompt.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { llmConfig } from '../settings/aiSettings.js';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const transport =
    new StreamableHTTPClientTransport(
        new URL(process.env.MCP_URL),
        {
            timeout: 120000
        }
    );

const mcpClient = new Client({
    name: 'gemini-mcp-client',
    version: '1.0.0'
});

await mcpClient.connect(transport);

function cleanSchema(schema) {
    const cloned = structuredClone(schema);
    delete cloned.$schema;
    return cloned;
}

async function getGeminiTools() {

    const tools = await mcpClient.listTools();

    return tools.tools.map(tool => ({
        functionDeclarations: [
            {
                name: tool.name,
                description: tool.description,
                parameters: cleanSchema(tool.inputSchema)
            }
        ]
    }));
}

export async function callGemini(userQuestion, history = []) {

    const tools = await getGeminiTools();

    const model = genAI.getGenerativeModel({
        model: llmConfig.model,
        tools,
        systemInstruction: systemPrompt // Instrução gerada por prompt
    });

    history.push({
        role: 'user',
        parts: [
            {
                text: userQuestion
            }
        ]
    });

    let toolCalls = 0;
    const MAX_TOOL_CALLS = 10;

    while (toolCalls < MAX_TOOL_CALLS) {

        const result =
            await model.generateContent({
                contents: history
            });

        const candidate =
            result.response?.candidates?.[0];

        const parts =
            candidate?.content?.parts ?? [];

        const functionPart =
            parts.find(
                part => part.functionCall
            );

        if (!functionPart) {


            if (candidate?.content) {
                history.push(
                    candidate.content
                );
            }

            return result.response.text();
        }

        const { name, args } =
            functionPart.functionCall;

        const toolResponse =
            await mcpClient.callTool({
                name,
                arguments: args
            });

        let toolData;

        try {

            toolData = JSON.parse(
                toolResponse.content[0].text
            );

        } catch {

            toolData = {
                result:
                    toolResponse.content[0].text
            };
        }

        if (toolData?.type === 'file') {

            const downloadsDir =
                path.resolve('./downloads');

            await fs.mkdir(
                downloadsDir,
                { recursive: true }
            );

            const buffer =
                Buffer.from(
                    toolData.data,
                    'base64'
                );

            const filePath =
                path.join(
                    downloadsDir,
                    toolData.filename
                );

            await fs.writeFile(
                filePath,
                buffer
            );

            return {
                type: 'file',
                filename: toolData.filename,
                downloadUrl: `/download/${toolData.filename}`
            }
        }

        
        history.push(
            candidate.content
        );

        
        history.push({
            role: 'function',
            parts: [
                {
                    functionResponse: {
                        name,
                        response: toolData
                    }
                }
            ]
        });

        toolCalls++;
    }

    return `
Limite de ${MAX_TOOL_CALLS}
chamadas de ferramentas atingido.
`;
}