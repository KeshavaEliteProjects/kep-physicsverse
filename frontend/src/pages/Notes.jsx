import { useEffect, useState } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { StickyNote, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "" });

  const load = () => api.get("/notes").then((r) => setNotes(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!draft.title.trim()) return;
    await api.post("/notes", draft);
    toast.success("Note saved");
    setDraft({ title: "", content: "" });
    setOpen(false);
    load();
  };

  const del = async (id) => { await api.delete(`/notes/${id}`); load(); };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-amber-600 font-mono-data flex items-center gap-1.5"><StickyNote className="w-4 h-4" /> Notes</span>
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 mt-1">Your study notes</h1>
        </div>
        <Button data-testid="new-note-button" onClick={() => setOpen(true)} className="rounded-full gap-2"><Plus className="w-4 h-4" /> New note</Button>
      </div>

      {open && (
        <div className="rounded-2xl border border-primary/30 bg-card p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">New note</h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-slate-900"><X className="w-5 h-5" /></button>
          </div>
          <Input data-testid="note-title-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="mb-3" />
          <Textarea data-testid="note-content-input" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder="Write your note… supports $LaTeX$ math" rows={5} />
          <Button data-testid="save-note-button" onClick={save} className="rounded-full mt-4">Save note</Button>
        </div>
      )}

      {notes.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {notes.map((n) => (
            <div key={n.id} data-testid={`note-${n.id}`} className="rounded-2xl border border-border bg-card p-5 group">
              <div className="flex items-start justify-between">
                <h3 className="font-display font-semibold text-slate-900">{n.title}</h3>
                <button data-testid={`delete-note-${n.id}`} onClick={() => del(n.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-5">{n.content}</p>
            </div>
          ))}
        </div>
      ) : (
        !open && (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <StickyNote className="w-7 h-7 text-amber-600" />
            </div>
            <p className="text-muted-foreground">No notes yet. Capture a formula or insight.</p>
          </div>
        )
      )}
    </div>
  );
}
