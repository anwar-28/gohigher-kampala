"use client";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: Date;
  topic?: "climate" | "waste" | "action" | "water";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are GoHigher AI, an expert climate change and sustainability assistant specifically focused on Uganda, East Africa, and Kampala. You have deep knowledge of:

CLIMATE TOPICS:
- Uganda's specific climate vulnerabilities: irregular rainfall, prolonged droughts, flash floods, landslides in Elgon/Rwenzori regions
- Lake Victoria's declining water levels, fish stocks, and impact on fishing communities
- Deforestation in Mabira, Budongo, and other Ugandan forests
- The impact of climate change on Uganda's agriculture (coffee, tea, matooke, cattle)
- Kampala's urban heat island effect, flooding in low-lying areas like Bwaise, Ndeeba
- Air quality issues from Kampala's traffic, burning waste, and industrial emissions

SOLUTIONS & LOCAL CONTEXT:
- Ugandan government climate policies, NDCs, and international commitments
- Local NGOs and climate initiatives (NEMA, Climate Action Network Uganda, etc.)
- Renewable energy opportunities: solar, mini-hydro, biogas in Uganda
- Climate-smart agriculture adapted for Uganda's farming calendar
- Waste management: formal and informal sectors in Kampala, KCCA initiatives
- Community adaptation strategies used across Ugandan districts

GUIDANCE PRINCIPLES:
- Always give THOROUGH, DETAILED responses (aim for 250-450 words minimum)
- Use specific Ugandan geography, statistics, and cultural context
- Include practical, actionable steps that are realistic for Ugandan citizens
- Reference local organizations, government bodies (NEMA, KCCA, MEMD), and programs when relevant
- Blend scientific information with accessible, encouraging language
- Use occasional local references (Owino Market, Gulu, Mbarara, etc.) to make responses feel grounded
- Structure longer answers with clear sections using **bold headings** and bullet points for readability
- Always end with an empowering call-to-action or next step

You care deeply about Uganda's future and want every citizen to feel empowered to act on climate change.`;

const QUICK_PROMPTS = [
  {
    icon: "🌡️",
    label: "Climate threats in Uganda",
    q: "What are the biggest climate change threats facing Uganda right now, and which regions are most at risk?",
  },
  {
    icon: "💧",
    label: "Lake Victoria & climate",
    q: "How is Lake Victoria being affected by climate change and what can Kampala residents do to help protect it?",
  },
  {
    icon: "♻️",
    label: "Sustainable waste Kampala",
    q: "What are sustainable waste management practices I can adopt in Kampala to reduce my carbon footprint?",
  },
  {
    icon: "🌳",
    label: "Deforestation & forests",
    q: "How is deforestation in Uganda contributing to climate change and what can citizens do to help reverse it?",
  },
  {
    icon: "🌾",
    label: "Climate-smart farming",
    q: "What climate-smart agriculture methods work best for Ugandan farmers facing unpredictable rainfall patterns?",
  },
  {
    icon: "☀️",
    label: "Renewable energy options",
    q: "What renewable energy options are available and affordable for households in Kampala?",
  },
];

const STATS = [
  { num: "+1.5°C", lbl: "Temp rise\nsince 1960" },
  { num: "−30%", lbl: "Rainfall\nvariability" },
  { num: "2.4M", lbl: "Climate\ndisplaced" },
  { num: "8%", lbl: "Forest cover\nremaining" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTopicTag(content: string): Message["topic"] {
  const l = content.toLowerCase();
  if (
    l.includes("lake") ||
    l.includes("flood") ||
    l.includes("water") ||
    l.includes("rain")
  )
    return "water";
  if (
    l.includes("waste") ||
    l.includes("recycl") ||
    l.includes("pollution") ||
    l.includes("dump")
  )
    return "waste";
  if (
    l.includes("step") ||
    l.includes("action") ||
    l.includes("can do") ||
    l.includes("should")
  )
    return "action";
  return "climate";
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-UG", { hour: "2-digit", minute: "2-digit" });
}

// Very lightweight markdown renderer (bold, lists, headings)
function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<p class="gh-h3">$1</p>')
    .replace(/^## (.+)$/gm, '<p class="gh-h2">$1</p>')
    .replace(
      /^- (.+)$/gm,
      '<div class="gh-li"><span class="gh-bullet">▸</span><span>$1</span></div>',
    )
    .replace(
      /^(\d+)\. (.+)$/gm,
      '<div class="gh-li"><span class="gh-num">$1.</span><span>$2</span></div>',
    )
    .replace(/\n\n/g, "<br /><br />")
    .replace(/\n/g, "<br />");
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AIPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      topic: "climate",
      content: `Oli otya${firstName ? `, ${firstName}` : ""}! 👋 I'm **GoHigher AI** — your climate intelligence companion for Uganda and Kampala.\n\nI'm powered by Google Gemini and built to give you **deep, actionable insights** on Uganda's most pressing environmental challenges:\n\n- 🌡️ Climate change impacts across Uganda's regions\n- 💧 Lake Victoria and freshwater security\n- 🌳 Deforestation and biodiversity loss\n- ♻️ Waste management and urban emissions\n- ☀️ Renewable energy and clean technology\n- 🌾 Climate-smart agriculture for local farmers\n\nAsk me anything — I'll give you thorough, Uganda-specific answers. **What's on your mind?**`,
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      ts: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSidebarOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!API_KEY || API_KEY === "AIzaSyAPtuO9zDl9OVWG_y5FQcMENIbiUpdEHYA") {
        throw new Error(
          "API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in .env.local",
        );
      }

      // Build full conversation history
      const history = messages
        .filter((m) => m.id !== "0")
        .map((m, i) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [
            {
              text:
                i === 0 && m.role === "user"
                  ? `${SYSTEM_PROMPT}\n\n---\n\nUser: ${m.content}`
                  : m.content,
            },
          ],
        }));

      // Add current user message
      history.push({
        role: "user",
        parts: [
          {
            text:
              history.length === 0
                ? `${SYSTEM_PROMPT}\n\n---\n\nUser: ${trimmed}`
                : trimmed,
          },
        ],
      });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: history,
            generationConfig: {
              temperature: 0.75,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1200,
            },
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? `API error ${res.status}`);
      }

      const data = await res.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        "I couldn't generate a response. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: reply,
          topic: getTopicTag(reply),
          ts: new Date(),
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          topic: "climate",
          content: `**Configuration needed 🔧**\n\nTo activate the AI, add your Gemini API key:\n\n1. Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey)\n2. Create a free API key\n3. Add it to \`.env.local\` as \`NEXT_PUBLIC_GEMINI_API_KEY=your_key\`\n4. Restart the dev server\n\n**Meanwhile**, Uganda faces some of East Africa's most pressing climate challenges — from Lake Victoria's receding shores to devastating floods in Kampala's low-lying neighborhoods like Bwaise and Ndeeba. Rising temperatures have already disrupted coffee and tea harvests in the highlands, threatening millions of smallholder farmers.\n\n_Error: ${msg}_`,
          ts: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const topicMeta: Record<
    NonNullable<Message["topic"]>,
    { label: string; cls: string }
  > = {
    climate: { label: "Climate · Uganda", cls: "tag-climate" },
    water: { label: "Water & Climate", cls: "tag-water" },
    waste: { label: "Waste & Pollution", cls: "tag-waste" },
    action: { label: "Take Action", cls: "tag-action" },
  };

  return (
    <AppShell>
      {/* ── Styles injected via a style tag so no extra CSS file is needed ── */}
      <style>{`
        /* ── Reset & base ───────────────────────────── */
        .gh-root *, .gh-root *::before, .gh-root *::after { box-sizing: border-box; }
        .gh-root {
          --forest:  #003d82;
          --forest2: #0052b4;
          --leaf:    #0ea5e9;
          --lime:    #38bdf8;
          --mist:    #f0f9ff;
          --gold:    #3b82f6;
          --amber:   #2563eb;
          --sky:     #0284c7;
          --cream:   #f8fbff;
          --td:      #0c2344;
          --tm:      #1e40af;
          --tl:      #3b82f6;
          --border:  rgba(14,165,233,.08);
          --shad:    0 10px 40px rgba(0,61,130,.06);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'DM Sans', sans-serif;
          height: calc(100vh - 4rem);
          display: flex;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #f0f9ff 0%, #eff6ff 100%);
          color: var(--td);
        }
        /* ── Subtle background accent ──────────────────────────– */
        .gh-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          opacity: .08;
          pointer-events: none;
          mix-blend-mode: multiply;
        }
        .gh-orb-1 { width:400px;height:400px;background:#0ea5e9;top:-100px;right:-80px; }
        .gh-orb-2 { width:300px;height:300px;background:#3b82f6;bottom:-60px;left:-60px; }
        .gh-orb-3 { display: none; }
        /* ── Grid texture ───────────────────────────── */
        .gh-grid {
          position:fixed;inset:0;pointer-events:none;z-index:0;
          background-image:
            linear-gradient(rgba(14,165,233,.01) 1px,transparent 1px),
            linear-gradient(90deg,rgba(14,165,233,.01) 1px,transparent 1px);
          background-size:50px 50px;
        }
        /* ── Sidebar ────────────────────────────────── */
        .gh-sidebar {
          width: 280px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #003d82 0%, #0052b4 100%);
          display: flex;
          flex-direction: column;
          padding: 28px 20px;
          position: relative;
          z-index: 10;
          overflow-y: auto;
          overflow-x: hidden;
          animation: gh-slideLeft .55s cubic-bezier(.22,1,.36,1) both;
          transition: transform .3s cubic-bezier(.22,1,.36,1);
          box-shadow: inset -1px 0 0 rgba(255,255,255,.05);
        }
        .gh-sidebar.closed { transform: translateX(-100%); position: absolute; height: 100%; }
        @keyframes gh-slideLeft {
          from{transform:translateX(-100%);opacity:0;}
          to{transform:translateX(0);opacity:1;}
        }
        .gh-sidebar::before {
          content:'';position:absolute;top:-60px;right:-40px;
          width:200px;height:200px;
          background:radial-gradient(circle,rgba(14,165,233,.08),transparent 70%);
          border-radius:50%;pointer-events:none;
        }
        /* ── Logo ───────────────────────────────────── */
        .gh-logo { display:flex;align-items:center;gap:12px;margin-bottom:32px; }
        .gh-logo-icon {
          width:44px;height:44px;
          background:linear-gradient(135deg,#38bdf8,#0ea5e9);
          border-radius:14px;display:flex;align-items:center;justify-content:center;
          font-size:22px;flex-shrink:0;
          box-shadow:0 6px 20px rgba(14,165,233,.25);
        }
        .gh-logo-name {
          font-family:inherit;font-weight:700;
          font-size:16px;color:#fff;line-height:1.2;letter-spacing:-.3px;
        }
        .gh-logo-sub { font-size:11px;color:rgba(255,255,255,.42);letter-spacing:.05em;margin-top:2px; }
        /* ── Status badge ───────────────────────────── */
        .gh-status {
          display:flex;align-items:center;gap:9px;
          background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);
          border-radius:12px;padding:10px 14px;margin-bottom:28px;
        }
        .gh-dot {
          width:8px;height:8px;background:#0ea5e9;border-radius:50%;
          animation:gh-pulse 2s ease-in-out infinite;
          box-shadow:0 0 10px rgba(14,165,233,.6);
        }
        @keyframes gh-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(.85);}}
        .gh-status-txt { color:rgba(255,255,255,.75);font-size:12px;font-weight:500;letter-spacing:.3px; }
        /* ── Section label ──────────────────────────── */
        .gh-sec {
          font-size:11px;letter-spacing:.08em;text-transform:uppercase;
          color:rgba(255,255,255,.32);font-weight:700;
          margin-bottom:12px;
        }
        /* ── Quick buttons ──────────────────────────── */
        .gh-qbtn {
          width:100%;background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.09);border-radius:11px;
          padding:11px 14px;text-align:left;
          color:rgba(255,255,255,.76);font-size:12.5px;
          cursor:pointer;
          margin-bottom:6px;transition:all .25s cubic-bezier(.22,1,.36,1);
          line-height:1.45;
          display:flex;align-items:center;gap:9px;
          font-weight:500;
        }
        .gh-qbtn:hover {
          background:rgba(14,165,233,.15);border-color:rgba(14,165,233,.3);
          color:#fff;transform:translateX(4px);
        }
        .gh-qbtn:active{transform:translateX(2px);opacity:.85;}
        /* ── Sidebar footer stats ───────────────────── */
        .gh-footer { margin-top:auto;border-top:1px solid rgba(255,255,255,.08);padding-top:20px; }
        .gh-stats { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
        .gh-stat {
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);
          border-radius:11px;padding:12px;text-align:center;
        }
        .gh-stat-num {
          font-weight:700;font-size:16px;color:#38bdf8;letter-spacing:-.5px;
        }
        .gh-stat-lbl { font-size:10px;color:rgba(255,255,255,.35);margin-top:4px;line-height:1.4;white-space:pre-line; }
        /* ── Chat panel ─────────────────────────────── */
        .gh-chat {
          flex:1;display:flex;flex-direction:column;
          padding:24px 28px;position:relative;z-index:1;
          animation:gh-fadeUp .5s .15s cubic-bezier(.22,1,.36,1) both;
          overflow: hidden;
        }
        @keyframes gh-fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        /* ── Chat header ────────────────────────────── */
        .gh-chat-hdr {
          display:flex;align-items:center;justify-content:space-between;
          margin-bottom:20px;flex-shrink:0;
          gap:16px;
        }
        .gh-chat-title {
          font-size:22px;font-weight:700;color:var(--td);letter-spacing:-.4px;
        }
        .gh-chat-sub { font-size:13px;color:var(--tl);margin-top:3px;font-weight:500; }
        .gh-gemini-badge {
          display:flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#1e1b4b,#312e81);
          color:#fff;border-radius:22px;padding:8px 16px;
          font-size:12px;font-weight:600;
          letter-spacing:.02em;
          box-shadow:0 4px 16px rgba(0,0,0,.16);
          flex-shrink:0;
        }
        .gh-gem-dot {
          width:7px;height:7px;
          background:conic-gradient(#4285f4 0deg,#0f9d58 90deg,#f4b400 180deg,#db4437 270deg,#4285f4 360deg);
          border-radius:50%;animation:gh-spin 3s linear infinite;
        }
        @keyframes gh-spin{to{transform:rotate(360deg);}}
        /* ── Hamburger (mobile) ─────────────────────── */
        .gh-menu-btn {
          display:none;width:38px;height:38px;border-radius:11px;
          background:var(--mist);border:1.5px solid var(--border);
          align-items:center;justify-content:center;cursor:pointer;
          font-size:18px;flex-shrink:0;
          color:var(--td);
          transition:all .2s;
        }
        .gh-menu-btn:hover { background:#fff;border-color:rgba(14,165,233,.2); }
        /* ── Messages ───────────────────────────────── */
        .gh-msgs {
          flex:1;overflow-y:auto;padding-right:6px;
          display:flex;flex-direction:column;gap:16px;margin-bottom:16px;
        }
        .gh-msgs::-webkit-scrollbar{width:6px;}
        .gh-msgs::-webkit-scrollbar-thumb{background:rgba(14,165,233,.1);border-radius:3px;}
        .gh-msgs::-webkit-scrollbar-track{background:transparent;}
        .gh-msg {
          display:flex;gap:12px;
          animation:gh-msgIn .35s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes gh-msgIn{from{opacity:0;transform:translateY(12px) scale(.96);}to{opacity:1;transform:none;}}
        .gh-msg.user { flex-direction:row-reverse; }
        .gh-avatar {
          width:36px;height:36px;border-radius:12px;
          display:flex;align-items:center;justify-content:center;
          font-size:16px;flex-shrink:0;margin-top:2px;
          font-weight:700;
        }
        .gh-avatar.ai {
          background:linear-gradient(135deg,#003d82,#0ea5e9);
          box-shadow:0 4px 14px rgba(0,61,130,.24);
        }
        .gh-avatar.usr {
          background:linear-gradient(135deg,#f59e0b,#f97316);
          box-shadow:0 4px 14px rgba(245,158,11,.26);
          color:#fff;
        }
        .gh-bubble {
          max-width:72%;border-radius:18px;
          padding:13px 16px;font-size:13.5px;line-height:1.6;
        }
        .gh-bubble.ai {
          background:#fff;border:1.5px solid var(--border);
          border-top-left-radius:5px;color:#000000;
          box-shadow:0 4px 16px rgba(0,61,130,.06);
        }
        .gh-bubble.usr {
          background:linear-gradient(135deg,#003d82,#0052b4);
          border-top-right-radius:5px;color:#fff;
          box-shadow:0 4px 16px rgba(0,61,130,.16);
        }
        .gh-meta { font-size:11px;color:#1a1a1a;margin-top:6px;opacity:.6;font-weight:500; }
        .gh-bubble.usr + .gh-meta { color:rgba(255,255,255,.4); }
        /* ── Topic tags ─────────────────────────────── */
        .gh-tag {
          display:inline-block;font-size:10px;font-weight:700;
          letter-spacing:.06em;text-transform:uppercase;
          padding:4px 10px;border-radius:7px;margin-bottom:9px;
        }
        .tag-climate{background:rgba(14,165,233,.11);color:#000000;}
        .tag-water  {background:rgba(59,131,246,.12);color:#000000;}
        .tag-waste  {background:rgba(14,165,233,.12);color:#000000;}
        .tag-action {background:rgba(3,102,214,.13);color:#000000;}
        /* ── Markdown render ────────────────────────── */
        .gh-bubble.ai strong { color:#000000;font-weight:700; }
        .gh-h2 { font-weight:700;font-size:14px;color:#000000;margin:13px 0 5px; }
        .gh-h3 { font-weight:600;font-size:13px;color:#1a1a1a;margin:11px 0 4px; }
        .gh-li { display:flex;gap:8px;margin:4px 0; }
        .gh-bullet { color:#0ea5e9;flex-shrink:0;margin-top:2px;font-weight:600; }
        .gh-num    { color:#0ea5e9;font-weight:700;flex-shrink:0; }
        /* ── Thinking indicator ─────────────────────── */
        .gh-thinking { display:flex;gap:6px;align-items:center;padding:14px 16px; }
        .gh-tdot {
          width:8px;height:8px;background:#0ea5e9;border-radius:50%;
          animation:gh-bounce 1.3s ease-in-out infinite;
          box-shadow:0 0 8px rgba(14,165,233,.4);
        }
        .gh-tdot:nth-child(2){animation-delay:.2s;}
        .gh-tdot:nth-child(3){animation-delay:.4s;}
        @keyframes gh-bounce{0%,60%,100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-10px);opacity:1;}}
        /* ── Input area ─────────────────────────────── */
        .gh-input-wrap { flex-shrink:0; }
        .gh-input-card {
          background:#fff;border:1.5px solid var(--border);
          border-radius:18px;padding:5px 5px 5px 18px;
          display:flex;align-items:flex-end;gap:10px;
          box-shadow:0 8px 32px rgba(0,61,130,.08);
          transition:all .2s cubic-bezier(.22,1,.36,1);
        }
        .gh-input-card:focus-within {
          border-color:#0ea5e9;
          box-shadow:0 8px 32px rgba(14,165,233,.12);
          transform:translateY(-1px);
        }
        .gh-textarea {
          flex:1;border:none;outline:none;resize:none;overflow:hidden;
          font-size:13.5px;
          color:var(--td);background:transparent;
          padding:12px 0;line-height:1.55;min-height:44px;max-height:120px;
          font-family:inherit;
        }
        .gh-textarea::placeholder{color:var(--tl);opacity:.55;}
        .gh-send {
          width:44px;height:44px;flex-shrink:0;
          background:linear-gradient(135deg,#0ea5e9,#0052b4);
          border:none;border-radius:13px;color:#fff;cursor:pointer;
          display:flex;align-items:center;justify-content:center;font-size:18px;
          transition:all .25s cubic-bezier(.22,1,.36,1);
          box-shadow:0 4px 16px rgba(14,165,233,.3);
          margin-bottom:2px;
          font-weight:600;
        }
        .gh-send:hover:not(:disabled){transform:scale(1.08);box-shadow:0 6px 20px rgba(14,165,233,.4);}
        .gh-send:active:not(:disabled){transform:scale(.96);}
        .gh-send:disabled{opacity:.34;cursor:not-allowed;}
        .gh-hint { font-size:11px;color:var(--tl);text-align:center;margin-top:9px;opacity:.5;font-weight:500; }
        /* ── Welcome chips ──────────────────────────── */
        .gh-chips { display:flex;flex-wrap:wrap;gap:7px;margin-top:10px; }
        .gh-chip {
          background:var(--mist);border:1.5px solid rgba(14,165,233,.14);
          border-radius:9px;padding:4px 11px;font-size:12px;
          color:var(--forest);font-weight:600;transition:all .2s;
        }
        .gh-chip:hover { background:#fff;border-color:rgba(14,165,233,.3); }
        /* ── Responsive ─────────────────────────────── */
        @media(max-width:768px){
          .gh-root { flex-direction: column; }
          .gh-sidebar { position:fixed;height:100%;width:75%;max-width:280px;z-index:30;bottom:0;left:0;top:0; }
          .gh-sidebar.closed { transform:translateX(-100%); }
          .gh-menu-btn { display:flex; }
          .gh-gemini-badge span { display:none; }
          .gh-chat { padding:16px 14px;height:100%; }
          .gh-msgs { margin-bottom:12px; }
          .gh-bubble { max-width:85%; }
          .gh-chat-title { font-size:18px; }
          .gh-chat-hdr { margin-bottom:12px; }
          .gh-input-wrap { padding:0 2px; }
        }
      `}</style>

      <div className="gh-root">
        {/* Background decorations */}
        <div className="gh-orb gh-orb-1" />
        <div className="gh-orb gh-orb-2" />
        <div className="gh-orb gh-orb-3" />
        <div className="gh-grid" />

        {/* ── Main chat ────────────────────────────────────────────────── */}
        <main className="gh-chat">
          {/* Header */}
          <div className="gh-chat-hdr">
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
            >
              <button
                className="gh-menu-btn"
                onClick={() => setSidebarOpen((o) => !o)}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>
              <div>
                <div className="gh-chat-title">Climate Assistant</div>
                <div className="gh-chat-sub">
                  Smart AI guide for Uganda's environmental future
                </div>
              </div>
            </div>
            <div className="gh-gemini-badge">
              <div className="gh-gem-dot" />
              <span>Gemini 2.5 Flash</span>
            </div>
          </div>

          {/* Messages */}
          <div className="gh-msgs">
            {messages.map((msg) => {
              const meta = msg.topic ? topicMeta[msg.topic] : topicMeta.climate;
              return (
                <div
                  key={msg.id}
                  className={`gh-msg ${msg.role === "user" ? "user" : ""}`}
                >
                  <div
                    className={`gh-avatar text-white ${msg.role === "assistant" ? "ai" : "usr"}`}
                  >
                    {msg.role === "assistant"
                      ? "AI"
                      : (user?.name?.charAt(0) ?? "U")}
                  </div>
                  <div>
                    <div
                      className={`gh-bubble ${msg.role === "assistant" ? "ai" : "usr"}`}
                    >
                      {msg.role === "assistant" && (
                        <span className={`gh-tag ${meta.cls}`}>
                          {meta.label}
                        </span>
                      )}
                      {msg.role === "assistant" ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdown(msg.content),
                          }}
                        />
                      ) : (
                        <div>{msg.content}</div>
                      )}
                    </div>
                    <div className="gh-meta">{formatTime(msg.ts)}</div>
                  </div>
                </div>
              );
            })}

            {/* Thinking indicator */}
            {loading && (
              <div className="gh-msg">
                <div className="gh-avatar ai">🌿</div>
                <div className="gh-bubble ai gh-thinking">
                  <div className="gh-tdot" />
                  <div className="gh-tdot" />
                  <div className="gh-tdot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="gh-input-wrap">
            <div className="gh-input-card">
              <textarea
                ref={textareaRef}
                className="gh-textarea"
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask anything"
                rows={1}
              />
              <button
                className="gh-send"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                title="Send message"
              >
                ➤
              </button>
            </div>
            <div className="gh-hint">
              Enter to send · Shift+Enter for new line
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
