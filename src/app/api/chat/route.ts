
import { GoogleGenAI } from "@google/genai";
import { perfumes, delivery } from "../../data/perfume";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key missing." },
        { status: 500 }
      );
    }

    const { message } = await request.json();

    if (typeof message !== "string" || !message.trim()) {
      return Response.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are Reply Bee, a friendly perfume shop sales assistant.

Rules:
- Reply in the same language as the customer.
- Keep replies short and helpful.
- Use only the product information below.
- Never invent prices or stock availability.
- Show prices in PKR.
- If you don't know something, say the seller needs to confirm.
- This is a demo. Never request real phone numbers,
  addresses or payment details.

Products: ${JSON.stringify(perfumes)}
Delivery: ${JSON.stringify(delivery)}

Customer message: ${message}
      `,
    });

    return Response.json({
      reply: response.text ?? "Seller se confirm karna hoga.",
    });

  } catch (error) {
    console.error("Gemini error:", error);

    return Response.json(
      { error: "AI reply generate nahi ho saka." },
      { status: 500 }
    );
  }
}
