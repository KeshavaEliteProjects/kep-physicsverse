import { InlineMath, BlockMath } from "react-katex";

// Lightweight markdown + LaTeX renderer.
// Supports $$block$$, $inline$, **bold**, headings (#, ##), bullet lists (- / *), numbered lists.
export default function Mathdown({ text = "", className = "" }) {
  if (!text) return null;
  // split by block math first
  const blocks = text.split(/(\$\$[\s\S]+?\$\$)/g);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (block.startsWith("$$") && block.endsWith("$$")) {
          const math = block.slice(2, -2).trim();
          return (
            <div key={i} className="my-3 overflow-x-auto">
              <BlockMath math={math} />
            </div>
          );
        }
        return <TextBlock key={i} text={block} />;
      })}
    </div>
  );
}

function TextBlock({ text }) {
  const lines = text.split("\n");
  const out = [];
  let list = [];

  const flush = (key) => {
    if (list.length) {
      out.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 my-2">
          {list.map((l, idx) => (
            <li key={idx}>{renderInline(l)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  lines.forEach((raw, i) => {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) {
      flush(i);
      return;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    flush(i);
    if (line.startsWith("### ")) {
      out.push(<h4 key={i} className="font-display font-semibold text-base mt-3 mb-1">{renderInline(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      out.push(<h3 key={i} className="font-display font-semibold text-lg mt-3 mb-1">{renderInline(line.slice(3))}</h3>);
    } else if (line.startsWith("# ")) {
      out.push(<h2 key={i} className="font-display font-bold text-xl mt-3 mb-1">{renderInline(line.slice(2))}</h2>);
    } else if (numbered) {
      out.push(<p key={i} className="my-1 pl-1">{renderInline(line.trim())}</p>);
    } else {
      out.push(<p key={i} className="my-1.5 leading-relaxed">{renderInline(line)}</p>);
    }
  });
  flush("end");
  return <>{out}</>;
}

function renderInline(text) {
  // split by inline math $...$
  const parts = text.split(/(\$[^$\n]+\$)/g);
  return parts.map((p, i) => {
    if (p.startsWith("$") && p.endsWith("$") && p.length > 2) {
      try {
        return <InlineMath key={i} math={p.slice(1, -1)} />;
      } catch {
        return <span key={i}>{p}</span>;
      }
    }
    return <BoldText key={i} text={p} />;
  });
}

function BoldText({ text }) {
  const segs = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {segs.map((s, i) =>
        s.startsWith("**") && s.endsWith("**") ? (
          <strong key={i} className="font-semibold text-slate-900">{s.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{s}</span>
        )
      )}
    </>
  );
}
