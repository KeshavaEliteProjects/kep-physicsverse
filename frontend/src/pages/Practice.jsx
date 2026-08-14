import { useEffect, useState } from "react";
import api from "../lib/api";
import Mathdown from "../components/Mathdown";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { GraduationCap, Check, X, ChevronRight, RotateCcw } from "lucide-react";

const DIFFS = [
  { v: "", label: "All" },
  { v: "easy", label: "Easy" },
  { v: "medium", label: "Medium" },
  { v: "hard", label: "Hard" },
];

const DIFF_BADGE = {
  easy: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  hard: "bg-rose-50 text-rose-700",
};

export default function Practice() {
  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [numeric, setNumeric] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const load = (diff) => {
    api.get(`/practice/questions${diff ? `?difficulty=${diff}` : ""}`).then((r) => {
      setQuestions(r.data); setIdx(0); reset();
    });
  };
  useEffect(() => { load(difficulty); /* eslint-disable-next-line */ }, [difficulty]);

  const q = questions[idx];
  const reset = () => { setSelected(null); setNumeric(""); setFeedback(null); };

  const submit = async () => {
    if (feedback) return;
    const answer = q.type === "mcq" ? selected : parseFloat(numeric);
    if (q.type === "mcq" && selected === null) return;
    if (q.type === "numerical" && numeric === "") return;
    const { data } = await api.post("/practice/submit", { question_id: q.id, answer });
    setFeedback(data);
    setScore((s) => ({ correct: s.correct + (data.correct ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => { if (idx < questions.length - 1) { setIdx(idx + 1); reset(); } };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <span className="text-sm text-violet-600 font-mono-data flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> JEE / NEET Practice</span>
      <h1 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 mt-1">Test your understanding</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
        <div className="flex gap-2">
          {DIFFS.map((d) => (
            <button key={d.v} data-testid={`practice-diff-${d.v || "all"}`} onClick={() => setDifficulty(d.v)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                difficulty === d.v ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-border"
              }`}>{d.label}</button>
          ))}
        </div>
        <div className="text-sm font-mono-data text-muted-foreground">
          Score: <span className="text-slate-900 font-semibold">{score.correct}/{score.total}</span>
        </div>
      </div>

      {q && (
        <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono-data text-muted-foreground">Question {idx + 1} of {questions.length}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DIFF_BADGE[q.difficulty]}`}>{q.difficulty}</span>
          </div>
          <div className="text-lg text-slate-900 font-medium"><Mathdown text={q.question} /></div>

          {q.type === "mcq" ? (
            <div className="space-y-2.5 mt-6">
              {q.options.map((opt, i) => {
                const isSel = selected === i;
                const isAns = feedback && q.type === "mcq" && feedback.answer === i;
                const isWrong = feedback && isSel && !feedback.correct;
                return (
                  <button key={i} data-testid={`option-${i}`} disabled={!!feedback} onClick={() => setSelected(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors flex items-center gap-3 ${
                      isAns ? "border-emerald-400 bg-emerald-50" : isWrong ? "border-rose-400 bg-rose-50" :
                      isSel ? "border-primary bg-blue-50" : "border-border hover:border-primary/40"
                    }`}>
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono-data flex-shrink-0 ${isSel ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1"><Mathdown text={opt} /></span>
                    {isAns && <Check className="w-4 h-4 text-emerald-600" />}
                    {isWrong && <X className="w-4 h-4 text-rose-600" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6">
              <Input data-testid="numeric-input" type="number" value={numeric} disabled={!!feedback}
                onChange={(e) => setNumeric(e.target.value)} placeholder="Enter your answer" className="font-mono-data h-12 text-lg" />
            </div>
          )}

          {feedback && (
            <div className={`mt-5 rounded-xl border p-4 ${feedback.correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              <p className={`font-display font-semibold flex items-center gap-2 ${feedback.correct ? "text-emerald-700" : "text-rose-700"}`}>
                {feedback.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {feedback.correct ? "Correct!" : `Incorrect · Answer: ${q.type === "numerical" ? feedback.answer : String.fromCharCode(65 + feedback.answer)}`}
              </p>
              <div className="text-sm text-slate-700 mt-2"><Mathdown text={feedback.solution} /></div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {!feedback ? (
              <Button data-testid="submit-answer-button" onClick={submit} className="rounded-full">Check answer</Button>
            ) : (
              <Button data-testid="next-question-button" onClick={next} disabled={idx >= questions.length - 1} className="rounded-full gap-2">
                Next question <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" onClick={() => load(difficulty)} className="rounded-full gap-2 text-muted-foreground">
              <RotateCcw className="w-4 h-4" /> Restart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
