export type Turn = { role: "user" | "model"; text: string };

type Product = {
  name: string;
  price: number;
  gender: string;
  scent: string;
  inStock: boolean;
  keys: string[];
};

// Ye list tumhare data/perfume.ts se match honi chahiye. Badlo to yahan bhi badlo.
const PRODUCTS: Product[] = [
  { name: "Royal Oud", price: 4500, gender: "Men", scent: "Woody", inStock: true, keys: ["royal", "oud"] },
  { name: "Midnight Musk", price: 3500, gender: "Unisex", scent: "Musky", inStock: false, keys: ["midnight", "musk"] },
  { name: "Blue Storm", price: 2800, gender: "Men", scent: "Fresh", inStock: true, keys: ["blue", "storm"] },
  { name: "Rose Bloom", price: 3200, gender: "Women", scent: "Sweet Floral", inStock: true, keys: ["rose", "bloom"] },
];

const DELIVERY_TEXT =
  "Karachi mein delivery 2-3 working days mein hoti hai, aur doosre shehron mein 4-6 working days. Delivery charges seller se confirm karke batati hoon.";

const pkr = (n: number) => `PKR ${n.toLocaleString("en-US")}`;

function find(text: string): Product | undefined {
  const t = text.toLowerCase();
  return PRODUCTS.find((p) => p.keys.some((k) => t.includes(k)));
}

function detail(p: Product): string {
  return `${p.name} (${p.gender}, ${p.scent}) ki price ${pkr(p.price)} hai. ${
    p.inStock ? "Stock mein available hai." : "Abhi stock mein nahi hai."
  }`;
}

function alternative(p: Product): Product | undefined {
  return (
    PRODUCTS.find((x) => x.inStock && x !== p && x.gender === p.gender) ??
    PRODUCTS.find((x) => x.inStock && x !== p)
  );
}

type Step = "perfume" | "name" | "phone" | "city" | "address" | null;

function askType(text: string): Step {
  const t = text.toLowerCase();
  if (t.includes("kaunsa perfume")) return "perfume";
  if (t.includes("naam kya")) return "name";
  if (t.includes("phone number")) return "phone";
  if (t.includes("kis shehar")) return "city";
  if (t.includes("address") && (t.includes("likh") || t.includes("bata"))) return "address";
  return null;
}

function orderFlow(message: string, history: Turn[]): string | null {
  const last = history[history.length - 1];
  const pending = last && last.role === "model" ? askType(last.text) : null;
  if (!pending) return null;

  const data: Record<string, string> = {};
  let product: Product | undefined;
  for (let i = 0; i < history.length; i++) {
    const h = history[i];
    if (h.role === "user") {
      const p = find(h.text);
      if (p) product = p;
    } else {
      const s = askType(h.text);
      const next = history[i + 1];
      if (s && s !== "perfume" && next && next.role === "user") data[s] = next.text.trim();
    }
  }

  const msg = message.trim();

  if (pending === "perfume") {
    const p = find(msg);
    if (!p) return "Kaunsa perfume order karna hai? Royal Oud, Blue Storm ya Rose Bloom?";
    if (!p.inStock) {
      const alt = alternative(p);
      return `${p.name} abhi stock mein nahi hai.${alt ? ` ${alt.name} (${pkr(alt.price)}) available hai.` : ""} Kaunsa perfume order karna hai?`;
    }
    return `Zaroor! ${p.name} (${pkr(p.price)}). Aapka naam kya hai?`;
  }

  if (!product) return "Kaunsa perfume order karna hai? Royal Oud, Blue Storm ya Rose Bloom?";

  if (pending === "name") return `Shukriya ${msg}. Apna phone number likhein? (Ye demo hai, sample number bhi likh sakte hain.)`;
  if (pending === "phone") return "Aap kis shehar mein hain?";
  if (pending === "city") return "Mukammal address likh dein.";

  return `Order request note ho gayi hai (demo).\n\nPerfume: ${product.name}\nPrice: ${pkr(product.price)}\nNaam: ${data.name ?? "-"}\nPhone: ${data.phone ?? "-"}\nShehar: ${data.city ?? "-"}\nAddress: ${msg}\n\nStore team jald confirm karegi. Shukriya!`;
}

export function fallbackReply(message: string, history: Turn[] = []): string {
  const flow = orderFlow(message, history);
  if (flow) return flow;

  const t = message.toLowerCase();
  const p = find(t);

  if (/show all|all perfume|sab perfume|collection/.test(t)) {
    return "Hamare perfumes:\n" + PRODUCTS.map((x) => `${x.name} - ${pkr(x.price)} (${x.inStock ? "In Stock" : "Out of Stock"})`).join("\n");
  }

  const m = t.match(/(?:under|below|se kam|budget)\s*(?:rs\.?|pkr)?\s*(\d{3,6})|(\d{3,6})\s*(?:se kam|ke andar|tak)/);
  if (m) {
    const limit = Number(m[1] ?? m[2]);
    const list = PRODUCTS.filter((x) => x.inStock && x.price <= limit);
    return list.length
      ? `${pkr(limit)} ke andar:\n` + list.map((x) => `${x.name} - ${pkr(x.price)}`).join("\n")
      : `${pkr(limit)} ke andar abhi koi perfume available nahi hai.`;
  }

  if (/ladies|women|female|girl|sweet/.test(t)) {
    const x = PRODUCTS.find((q) => q.gender === "Women" && q.inStock)!;
    return `Ladies ke liye ${x.name} hai, ${x.scent} khushboo, price ${pkr(x.price)}. Stock mein available hai.`;
  }

  if (/deliver|shipping|kitne din|charges/.test(t)) return DELIVERY_TEXT;

  if (/order|mangwa|buy|lena hai|khareed/.test(t)) {
    if (!p) return "Zaroor! Kaunsa perfume order karna hai?";
    if (!p.inStock) {
      const alt = alternative(p);
      return `${p.name} abhi stock mein nahi hai.${alt ? ` ${alt.name} (${pkr(alt.price)}) available hai.` : ""} Kaunsa perfume order karna hai?`;
    }
    return `Zaroor! ${p.name} (${pkr(p.price)}). Aapka naam kya hai?`;
  }

  if (/price|qeemat|kitne ka|rate|kitna/.test(t)) {
    if (p) return `${p.name} ki price ${pkr(p.price)} hai.`;
    return PRODUCTS.map((x) => `${x.name} - ${pkr(x.price)}`).join("\n");
  }

  if (p && /hai|available|stock|milega/.test(t)) {
    if (p.inStock) return `${p.name} stock mein available hai (${pkr(p.price)}).`;
    const alt = alternative(p);
    return `${p.name} abhi stock mein nahi hai.${alt ? ` ${alt.name} (${pkr(alt.price)}) available hai, dekhna chahenge?` : ""}`;
  }

  if (p) return detail(p);

  if (/\bmen\b|gents|boys|fresh|male|woody|strong/.test(t)) {
    return PRODUCTS.filter((x) => x.gender === "Men" && x.inStock).map(detail).join("\n");
  }

  if (/^(hi|hello|hey|salam|assalam)/.test(t.trim())) {
    return "Assalamualaikum! Perfumes, price, stock ya delivery ke baare mein poochh sakte hain.";
  }

  return "Main seller se confirm karke batati hoon. Tab tak price, stock ya delivery ke baare mein poochh sakte hain.";
}