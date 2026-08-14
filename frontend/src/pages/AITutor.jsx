import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { API } from "../lib/api";
import Mathdown from "../components/Mathdown";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Bot, Send, Plus, User, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Derive the range of a projectile.",
  "Why does a pendulum's period not depend on mass?",
  "Explain conservation of momentum with an example.",
  "What is escape velocity and derive it?",
];

const DIFFICULTIES = [
  { v: "simple", label: "Simple" },
  { v: "standard", label: "Standard" },
  { v: "advanced", label: "Advanced" },
];

export default function AITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [difficulty, setDifficulty] = useState("standard");
  const [streaming, setStreaming] = useState(false);
  const [sessions, setSessions] = useState([]);
  const scrollRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const sentRef = useRef(false);

  const loadSessions = () => api.get("/tutor/sessions").then((r) => setSessions(r.data)).catch(() => {});
  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  // auto-send a question passed via ?q= (from a concept in the Physics Universe)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !sentRef.current) {
      sentRef.current = true;
      setSearchParams({}, { replace: true });
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const openSession = async (sid) => {
    const { data } = await api.get(`/tutor/history/${sid}`);
    setMessages(data);
    setSessionId(sid);
  };

  const newChat = () => { setMessages([]); setSessionId(null); };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const res = await fetch(`${API}/tutor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("pv_token") || ""}` },
        credentials: "include",
        body: JSON.stringify({ session_id: sessionId, message: msg, difficulty }),
      });
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop();
        for (const p of parts) {
          const line = p.trim();
          if (!line.startsWith("data:")) continue;
          const d = line.slice(5).trim();
          if (d === "[DONE]") continue;
          try {
            const j = JSON.parse(d);
            if (j.session_id) setSessionId(j.session_id);
            if (j.delta) setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + j.delta };
              return copy;
            });
          } catch (_) {}
        }
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "Sorry, I couldn't reach the tutor. Please try again." };
        return copy;
      });
    } finally {
      setStreaming(false);
      loadSessions();
    }
  };

  return (
    <div className="flex h-[calc(100vh-0px)] lg:h-screen">
      {/* sessions */}
      <aside className="hidden xl:flex w-64 flex-col border-r border-border bg-white">
        <div className="p-4">
          <Button data-testid="new-chat-button" onClick={newChat} className="w-full rounded-full gap-2"><Plus className="w-4 h-4" /> New chat</Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <p className="text-xs text-muted-foreground px-2 mb-1">Recent</p>
          {sessions.map((s) => (
            <button key={s.session_id} data-testid={`session-${s.session_id}`} onClick={() => openSession(s.session_id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate hover:bg-slate-100 ${sessionId === s.session_id ? "bg-slate-100 text-slate-900" : "text-muted-foreground"}`}>
              {s.title || "Conversation"}
            </button>
          ))}
          {!sessions.length && <p className="text-xs text-muted-foreground px-2">No conversations yet.</p>}
        </div>
      </aside>

      {/* chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border bg-white/95 backdrop-blur px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div>
              <p className="font-display font-semibold text-slate-900 leading-none">AI Physics Tutor</p>
              <p className="text-[11px] text-muted-foreground font-mono-data mt-0.5">Claude Sonnet 4.6 · Mechanics</p>
            </div>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-full p-1">
            {DIFFICULTIES.map((d) => (
              <button key={d.v} data-testid={`difficulty-${d.v}`} onClick={() => setDifficulty(d.v)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${difficulty === d.v ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {!messages.length && (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl text-slate-900">Ask me anything about Mechanics</h2>
                <p className="text-muted-foreground mt-2">I derive equations, find your mistakes and explain at any level.</p>
                <div className="grid sm:grid-cols-2 gap-3 mt-8 text-left">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} data-testid="suggestion-chip" onClick={() => send(s)}
                      className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-slate-700 hover:border-primary/40 hover:shadow-sm transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} data-testid={`chat-message-${m.role}`} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${m.role === "user" ? "bg-slate-900" : "bg-primary"}`}>
                  {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm ${m.role === "user" ? "bg-slate-900 text-white" : "bg-card border border-border text-slate-800"}`}>
                  {m.role === "user" ? m.content : (m.content ? <Mathdown text={m.content} /> : <span className="text-muted-foreground">Thinking…</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border bg-white px-4 lg:px-8 py-4">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <Textarea
              data-testid="tutor-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about projectile motion, momentum, SHM…"
              rows={1}
              className="resize-none min-h-[46px] rounded-xl"
            />
            <Button data-testid="tutor-send-button" onClick={() => send()} disabled={streaming || !input.trim()} className="rounded-xl h-[46px] w-[46px] p-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
