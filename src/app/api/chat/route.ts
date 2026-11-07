import { GoogleGenAI } from "@google/genai";
import { perfumes, delivery } from "../../data/perfume";
import { fallbackReply, type Turn } from "../../lib/fallback";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = body?.message;

  if (typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "Please enter a message." }, { status: 400 });
  }

  const history: Turn[] = (Array.isArray(body.history) ? body.history : [])
    .filter((h: any) => (h?.role === "user" || h?.role === "model") && typeof h?.text === "string" && h.text.trim())
    .slice(-12);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("no key");

    const trimmed = [...history];
    while (trimmed.length && trimmed[0].role === "model") trimmed.shift();

    const contents = [
      ...trimmed.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: "user", parts: [{ text: message.trim() }] },
    ];

    const systemPrompt = `
You are Reply Bee, a friendly sales assistant for an online perfume store.

LANGUAGE: Reply in the customer's language and script. Roman Urdu for Roman Urdu, English for English. Urdu script only if the customer uses it.
STYLE: 2-4 short lines. No Markdown, no stars, no bullet symbols. Prices always with PKR. Greet only in the first reply.
DATA: Use only the product and delivery data below. Never invent anything. If unsure say "Main seller se confirm karke batati hoon." If a product is out of stock, suggest an in-stock one.
ORDER FLOW (demo store): remember the whole chat. Collect, one question per message: perfume (skip if known), name, phone number, city, full address. Say once that this is a demo and sample details are fine. No payment details. Never take an order for an out-of-stock product. At the end write a short summary and say the order request is noted and the store team will confirm. Never say it is confirmed or paid.

PRODUCTS:
${JSON.stringify(perfumes, null, 2)}

DELIVERY INFORMATION:
${JSON.stringify(delivery, null, 2)}
`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",
      contents,
      config: { systemInstruction: systemPrompt, temperature: 0.4 },
    });

    if (!response.text) throw new Error("empty");
    return Response.json({ reply: response.text, source: "gemini" });
  } catch (error) {
    console.error("Gemini failed, using demo mode:", error);
    return Response.json({ reply: fallbackReply(message, history), source: "demo" });
  }
}