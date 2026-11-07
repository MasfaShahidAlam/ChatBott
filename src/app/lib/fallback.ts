export type Turn = { role: "user" | "model"; text: string };

type Lang = "ur" | "en";

type Product = {
  name: string;
  price: number;
  gender: string;
  scent: string;
  inStock: boolean;
  keys: string[];
};

// Ye list data/perfume.ts se match honi chahiye.
const PRODUCTS: Product[] = [
  { name: "Royal Oud", price: 4500, gender: "Men", scent: "Woody", inStock: true, keys: ["royal", "oud"] },
  { name: "Midnight Musk", price: 3500, gender: "Unisex", scent: "Musky", inStock: false, keys: ["midnight", "musk"] },
  { name: "Blue Storm", price: 2800, gender: "Men", scent: "Fresh", inStock: true, keys: ["blue", "storm"] },
  { name: "Rose Bloom", price: 3200, gender: "Women", scent: "Sweet Floral", inStock: true, keys: ["rose", "bloom"] },
];

const pkr = (n: number) => `PKR ${n.toLocaleString("en-US")}`;

const URDU =
  /\b(hai|hain|kya|kitne|kitna|kitni|mujhe|karna|chahiye|ka|ki|ke|mein|aap|aapka|nahi|bhi|ko|ye|wo|salam|assalam|qeemat|mangwa|lena|khareed|batao|dikhao)\b/i;

function detectLang(message: string, history: Turn[]): Lang {
  const texts = [message, ...history.filter((h) => h.role === "user").map((h) => h.text)];
  return texts.some((t) => URDU.test(t)) ? "ur" : "en";
}

function find(text: string): Product | undefined {
  const t = text.toLowerCase();
  return PRODUCTS.find((p) => p.keys.some((k) => t.includes(k)));
}

function alternative(p: Product): Product | undefined {
  return (
    PRODUCTS.find((x) => x.inStock && x !== p && x.gender === p.gender) ??
    PRODUCTS.find((x) => x.inStock && x !== p)
  );
}

const M = {
  ur: {
    delivery:
      "Karachi mein delivery 2-3 working days mein hoti hai, aur doosre shehron mein 4-6 working days. Delivery charges seller se confirm karke batati hoon.",
    pickPerfume: "Kaunsa perfume order karna hai? Royal Oud, Blue Storm ya Rose Bloom?",
    askOrder: "Zaroor! Kaunsa perfume order karna hai?",
    oos: (p: Product, a?: Product) =>
      `${p.name} abhi stock mein nahi hai.${a ? ` ${a.name} (${pkr(a.price)}) available hai.` : ""} Kaunsa perfume order karna hai?`,
    sure: (p: Product) => `Zaroor! ${p.name} (${pkr(p.price)}). Aapka naam kya hai?`,
    askPhone: (n: string) => `Shukriya ${n}. Apna phone number likhein? (Ye demo hai, sample number bhi likh sakte hain.)`,
    askCity: "Aap kis shehar mein hain?",
    askAddress: "Mukammal address likh dein.",
    summary: (p: Product, d: Record<string, string>, addr: string) =>
      `Order request note ho gayi hai (demo).\n\nPerfume: ${p.name}\nPrice: ${pkr(p.price)}\nNaam: ${d.name ?? "-"}\nPhone: ${d.phone ?? "-"}\nShehar: ${d.city ?? "-"}\nAddress: ${addr}\n\nStore team jald confirm karegi. Shukriya!`,
    all: "Hamare perfumes:\n",
    under: (limit: number, list: Product[]) =>
      list.length
        ? `${pkr(limit)} ke andar:\n` + list.map((x) => `${x.name} - ${pkr(x.price)}`).join("\n")
        : `${pkr(limit)} ke andar abhi koi perfume available nahi hai.`,
    ladies: (x: Product) => `Ladies ke liye ${x.name} hai, ${x.scent} khushboo, price ${pkr(x.price)}. Stock mein available hai.`,
    price: (p: Product) => `${p.name} ki price ${pkr(p.price)} hai.`,
    stock: (p: Product, a?: Product) =>
      p.inStock
        ? `${p.name} stock mein available hai (${pkr(p.price)}).`
        : `${p.name} abhi stock mein nahi hai.${a ? ` ${a.name} (${pkr(a.price)}) available hai, dekhna chahenge?` : ""}`,
    detail: (p: Product) =>
      `${p.name} (${p.gender}, ${p.scent}) ki price ${pkr(p.price)} hai. ${p.inStock ? "Stock mein available hai." : "Abhi stock mein nahi hai."}`,
    hello: "Assalamualaikum! Perfumes, price, stock ya delivery ke baare mein poochh sakte hain.",
    unknown: "Main seller se confirm karke batati hoon. Tab tak price, stock ya delivery ke baare mein poochh sakte hain.",
  },
  en: {
    delivery:
      "Delivery takes 2-3 working days in Karachi and 4-6 working days to other cities. I will confirm the delivery charges with the seller.",
    pickPerfume: "Which perfume would you like to order? Royal Oud, Blue Storm or Rose Bloom?",
    askOrder: "Sure! Which perfume would you like to order?",
    oos: (p: Product, a?: Product) =>
      `${p.name} is currently out of stock.${a ? ` ${a.name} (${pkr(a.price)}) is available.` : ""} Which perfume would you like to order?`,
    sure: (p: Product) => `Sure! ${p.name} (${pkr(p.price)}). May I have your name?`,
    askPhone: (n: string) => `Thanks ${n}. Please share your phone number. (This is a demo, a sample number is fine.)`,
    askCity: "Which city are you in?",
    askAddress: "Please type your full address.",
    summary: (p: Product, d: Record<string, string>, addr: string) =>
      `Order request noted (demo).\n\nPerfume: ${p.name}\nPrice: ${pkr(p.price)}\nName: ${d.name ?? "-"}\nPhone: ${d.phone ?? "-"}\nCity: ${d.city ?? "-"}\nAddress: ${addr}\n\nThe store team will confirm soon. Thank you!`,
    all: "Our perfumes:\n",
    under: (limit: number, list: Product[]) =>
      list.length
        ? `Under ${pkr(limit)}:\n` + list.map((x) => `${x.name} - ${pkr(x.price)}`).join("\n")
        : `There is no perfume available under ${pkr(limit)} right now.`,
    ladies: (x: Product) => `For ladies we have ${x.name}, a ${x.scent} fragrance priced at ${pkr(x.price)}. It is in stock.`,
    price: (p: Product) => `${p.name} costs ${pkr(p.price)}.`,
    stock: (p: Product, a?: Product) =>
      p.inStock
        ? `${p.name} is in stock (${pkr(p.price)}).`
        : `${p.name} is currently out of stock.${a ? ` ${a.name} (${pkr(a.price)}) is available, would you like to see it?` : ""}`,
    detail: (p: Product) =>
      `${p.name} (${p.gender}, ${p.scent}) costs ${pkr(p.price)}. ${p.inStock ? "It is in stock." : "It is currently out of stock."}`,
    hello: "Hello! Ask me about perfumes, prices, stock or delivery.",
    unknown: "I will confirm that with the seller. Meanwhile, feel free to ask about price, stock or delivery.",
  },
};

type Msgs = typeof M.ur;
type Step = "perfume" | "name" | "phone" | "city" | "address" | null;

function askType(text: string): Step {
  const t = text.toLowerCase();
  if (t.includes("kaunsa perfume") || t.includes("which perfume")) return "perfume";
  if (t.includes("naam kya") || t.includes("your name")) return "name";
  if (t.includes("phone number")) return "phone";
  if (t.includes("kis shehar") || t.includes("which city")) return "city";
  if (t.includes("full address") || (t.includes("address") && (t.includes("likh") || t.includes("bata")))) return "address";
  return null;
}

function orderFlow(message: string, history: Turn[], T: Msgs): string | null {
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
    if (!p) return T.pickPerfume;
    if (!p.inStock) return T.oos(p, alternative(p));
    return T.sure(p);
  }

  if (!product) return T.pickPerfume;

  if (pending === "name") return T.askPhone(msg);
  if (pending === "phone") return T.askCity;
  if (pending === "city") return T.askAddress;
  return T.summary(product, data, msg);
}

export function fallbackReply(message: string, history: Turn[] = []): string {
  const T: Msgs = M[detectLang(message, history)];

  const flow = orderFlow(message, history, T);
  if (flow) return flow;

  const t = message.toLowerCase();
  const p = find(t);

  if (/show all|all perfume|sab perfume|collection/.test(t)) {
    return T.all + PRODUCTS.map((x) => `${x.name} - ${pkr(x.price)} (${x.inStock ? "In Stock" : "Out of Stock"})`).join("\n");
  }

  const m = t.match(/(?:under|below|se kam|budget)\s*(?:rs\.?|pkr)?\s*(\d{3,6})|(\d{3,6})\s*(?:se kam|ke andar|tak)/);
  if (m) {
    const limit = Number(m[1] ?? m[2]);
    return T.under(limit, PRODUCTS.filter((x) => x.inStock && x.price <= limit));
  }

  if (/ladies|women|female|girl|sweet|for her/.test(t)) {
    return T.ladies(PRODUCTS.find((q) => q.gender === "Women" && q.inStock)!);
  }

  if (/deliver|shipping|kitne din|charges|how long|how many days/.test(t)) return T.delivery;

  if (/order|mangwa|buy|purchase|lena hai|khareed/.test(t)) {
    if (!p) return T.askOrder;
    if (!p.inStock) return T.oos(p, alternative(p));
    return T.sure(p);
  }

  if (/price|qeemat|kitne ka|rate|kitna|how much|cost/.test(t)) {
    if (p) return T.price(p);
    return PRODUCTS.map((x) => `${x.name} - ${pkr(x.price)}`).join("\n");
  }

  if (p && /hai|available|stock|milega|have/.test(t)) return T.stock(p, alternative(p));

  if (p) return T.detail(p);

  if (/\bmen\b|gents|boys|fresh|male|woody|strong/.test(t)) {
    return PRODUCTS.filter((x) => x.gender === "Men" && x.inStock).map(T.detail).join("\n");
  }

  if (/^(hi|hello|hey|salam|assalam)/.test(t.trim())) return T.hello;

  return T.unknown;
}