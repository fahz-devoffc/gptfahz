
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { AppMode, ChatAttachment } from "../types";

// Always use process.env.API_KEY directly as required by guidelines
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getSystemInstruction = (mode: AppMode) => {
  const base = "Nama kamu adalah FahzGPT, asisten AI bertenaga model Fahz-Flash (Gemini 3 Flash Preview). Pembuat kamu adalah Fahz-Team OFFC. ";
  switch (mode) {
    case AppMode.MATH:
      return base + "Kamu adalah pakar Matematika. Fokuslah memberikan penjelasan matematis yang akurat dan langkah demi langkah.";
    case AppMode.CODER:
      return base + "Kamu adalah pengembang perangkat keras dan lunak senior. Berikan kode yang bersih, efisien, dan penjelasan teknis mendalam.";
    case AppMode.KOKI:
      return base + "Kamu adalah Chef profesional. Berikan resep masakan, tips dapur, dan teknik kuliner terbaik.";
    default:
      return base + "Kamu adalah asisten serba bisa yang ramah dan cerdas.";
  }
};

export const chatWithGeminiStream = async (message: string, attachment: ChatAttachment | undefined, history: any[], mode: AppMode) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: getSystemInstruction(mode),
    },
  });

  const parts: any[] = [{ text: message }];
  
  if (attachment) {
    if (attachment.type === 'image') {
      parts.push({
        inlineData: {
          data: attachment.data.split(',')[1] || attachment.data,
          mimeType: attachment.mimeType
        }
      });
    } else {
      parts[0].text += `\n\n[File Attached: ${attachment.name}]\nContent:\n${attachment.data}`;
    }
  }

  // Fixed: The 'message' property must be the string or Part array itself, not an object containing them.
  return await chat.sendMessageStream({ message: parts });
};

export const generateImageWithGemini = async (prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } },
  });

  // FIX: Added optional chaining for candidates?.[0]?.content?.parts
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error('No image generated');
};

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encodePCM(data: Float32Array): string {
  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    int16[i] = data[i] * 32768;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
