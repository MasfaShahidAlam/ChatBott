
"use client";

import { useEffect, useRef, useState } from "react";
import { perfumes } from "./data/perfume";

type Message = {
  role: "user" | "bot";
  text: string;
};

const perfumeImages: Record<string, string> = {
  "Rose Bloom": "/rose-bloom.png",
  "Royal Oud": "/royal-oud.png",
  "Midnight Musk": "/midnight-musk.png",
  "Blue Storm": "/blue-storm.png",
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Assalam-o-Alaikum! Welcome to our perfume store. 🌸 I'm your shopping assistant. Ask me about perfumes, prices, availability or delivery!",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(textToSend?: string) {
    const userMessage = (textToSend ?? message).trim();

    if (!userMessage || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
                body: JSON.stringify({
          message: userMessage,
          history: messages.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            data.reply ||
            data.error ||
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Connection error. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  const suggestions = [
    "Show all perfumes",
    "Ladies perfumes",
    "Delivery details",
    "Perfumes under 3000",
  ];

  

  return (
    <main className="min-h-screen bg-[#F4EFE7] px-4 py-8 text-[#211A17]">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <div className="mb-2 text-4xl">🐝</div>
          <h1 className="text-4xl font-bold tracking-wide">
            Reply Bee
          </h1>
          <p className="mt-2 text-sm text-[#88796B]">
            Intelligent Shopping Assistant
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs shadow-sm">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            AI Assistant Online
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
          <section className="rounded-3xl border border-[#E8DFD2] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                Our Collection
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                Explore Perfumes
              </h2>
              <p className="mt-1 text-sm text-[#88796B]">
                Select a perfume to ask the AI assistant about it.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {perfumes.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() =>
                    sendMessage(`Tell me about ${product.name}`)
                  }
                  disabled={isTyping}
                  className="rounded-2xl border border-[#E8DFD2] bg-[#FAF7F0] p-3 text-left transition hover:border-[#B08D57] hover:shadow-md disabled:opacity-50"
                >
                  <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-white">
                    <img
                      src={perfumeImages[product.name]}
                      alt={product.name}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>

                  <h3 className="font-semibold">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-xs text-[#88796B]">
                    {product.category} · {product.scent}
                  </p>

                  <p className="mt-3 font-semibold">
                    PKR {product.price.toLocaleString()}
                  </p>

                  <p
                    className={`mt-2 text-xs font-medium ${
                      product.stock
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {product.stock ? "In Stock" : "Out of Stock"}
                  </p>

                  <p className="mt-3 text-xs text-[#A17B45]">
                    Ask about this →
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="flex min-h-[650px] flex-col overflow-hidden rounded-3xl border border-[#E8DFD2] bg-white shadow-sm">
            <div className="border-b border-[#E8DFD2] bg-[#FAF7F0] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9DCC8] text-2xl">
                  🐝
                </div>

                <div>
                  <h2 className="font-semibold">
                    Reply Bee Assistant
                  </h2>
                  <p className="text-xs text-green-700">
                    Online · Ready to help
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => sendMessage(item)}
                    disabled={isTyping}
                    className="rounded-full border border-[#DCCDB9] bg-white px-3 py-2 text-xs transition hover:bg-[#EEE5D8] disabled:opacity-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-white p-5">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-[#30251F] text-white"
                        : "rounded-bl-sm bg-[#F4EFE7] text-[#30251F]"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-[#F4EFE7] px-4 py-3 text-sm text-[#88796B]">
                    Assistant is typing...
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="border-t border-[#E8DFD2] bg-[#FAF7F0] p-4"
            >
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Ask about a perfume..."
                  disabled={isTyping}
                  className="min-w-0 flex-1 rounded-full border border-[#DCCDB9] bg-white px-5 py-3 text-sm outline-none focus:border-[#B08D57] disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!message.trim() || isTyping}
                  className="rounded-full bg-[#30251F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#594638] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Send
                </button>
              </div>

              <p className="mt-3 text-center text-[10px] text-[#A09283]">
                Powered by Reply Bee AI · Demo Store
              </p>
            </form>
          </section>
        </div>

        <footer className="mt-6 text-center text-xs text-[#A09283]">
          Reply Bee · Smart conversations for online sellers
        </footer>
      </div>
    </main>
  );
}
