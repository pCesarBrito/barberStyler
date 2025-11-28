import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      Você é um assistente virtual especialista em estilo masculino e barbearia para o app "Barber Styles".
      Seu tom deve ser amigável, profissional e moderno.
      Ajude os clientes a escolherem cortes de cabelo, estilos de barba e explique os serviços.
      Serviços disponíveis: Corte de Cabelo (R$45), Barba Terapia (R$35), Combo Completo (R$75), Pigmentação (R$50).
      Se o usuário perguntar sobre agendamento, oriente-o a clicar no botão "Novo Agendamento".
      Responda de forma concisa e em Português do Brasil.
    `;

    // Convert history to compatible format if strictly needed, 
    // but here we will just send the conversation in a fresh call for simplicity in this demo context,
    // or use chat session. Let's use chat session.

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Desculpe, não consegui processar sua resposta no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Estou tendo dificuldades para me conectar ao servidor de estilo. Tente novamente em breve.";
  }
};