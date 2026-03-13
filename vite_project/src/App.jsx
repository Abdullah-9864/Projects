import { useState } from "react";

const chapters = [
  { id: "intro", title: "Ch 1 — What Is Flex?", emoji: "📖" },
  { id: "axes", title: "Ch 2 — The Two Axes", emoji: "🧭" },
  { id: "direction", title: "Ch 3 — flex-direction", emoji: "↔️" },
  { id: "justify", title: "Ch 4 — justify-content", emoji: "⬛" },
  { id: "align-items", title: "Ch 5 — align-items", emoji: "📐" },
  { id: "wrap", title: "Ch 6 — flex-wrap", emoji: "🔄" },
  { id: "align-content", title: "Ch 7 — align-content", emoji: "📦" },
  { id: "gap", title: "Ch 8 — gap", emoji: "↔️" },
  { id: "flex-item", title: "Ch 9 — Item Properties", emoji: "🧩" },
  { id: "align-self", title: "Ch 10 — align-self & order", emoji: "🎯" },
  { id: "cheatsheet", title: "Cheat Sheet", emoji: "📋" },
];

const Box = ({ children, style = {}, className = "" }) => (
  <div
    style={{
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      color: "white",
      fontWeight: "700",
      fontSize: "14px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "44px",
      minHeight: "44px",
      padding: "6px",
      boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
      ...style,
    }}
    className={className}
  >
    {children}
  </div>
);

const Container = ({ style = {}, children, label }) => (
  <div style={{ marginBottom: "8px" }}>
    {label && (
      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px", fontFamily: "monospace" }}>
        {label}
      </div>
    )}
    <div
      style={{
        display: "flex",
        background: "#0f172a",
        border: "2px dashed #334155",
        borderRadius: "10px",
        padding: "12px",
        minHeight: "70px",
        gap: "8px",
        ...style,
      }}
    >
      {children}
    </div>
  </div>
);

const Code = ({ children }) => (
  <code style={{
    background: "#1e293b",
    color: "#a78bfa",
    padding: "2px 8px",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "13px",
  }}>
    {children}
  </code>
);

const Prop = ({ name, val }) => (
  <span>
    <span style={{ color: "#7dd3fc" }}>{name}</span>
    <span style={{ color: "#cbd5e1" }}>: </span>
    <span style={{ color: "#86efac" }}>{val}</span>
    <span style={{ color: "#cbd5e1" }}>;</span>
  </span>
);

const CodeBlock = ({ lines }) => (
  <div style={{
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "16px 20px",
    fontFamily: "monospace",
    fontSize: "13px",
    marginBottom: "16px",
    lineHeight: "1.8",
  }}>
    {lines.map((line, i) => (
      <div key={i}>
        {line === "" ? <br /> : typeof line === "string" ? <span style={{ color: "#64748b" }}>{line}</span> : line}
      </div>
    ))}
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 style={{
    color: "#e2e8f0",
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "10px",
    marginTop: "24px",
    borderLeft: "3px solid #6366f1",
    paddingLeft: "10px",
  }}>
    {children}
  </h3>
);

const Note = ({ children }) => (
  <div style={{
    background: "#1e1b4b",
    border: "1px solid #4338ca",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#c7d2fe",
    fontSize: "14px",
    marginBottom: "16px",
    lineHeight: "1.6",
  }}>
    💡 {children}
  </div>
);

const Demo = ({ label, flexStyle, itemSizes }) => {
  const sizes = itemSizes || [1, 1, 1];
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", fontFamily: "monospace" }}>{label}</div>
      <div style={{
        display: "flex",
        background: "#0f172a",
        border: "2px dashed #334155",
        borderRadius: "10px",
        padding: "10px",
        minHeight: "66px",
        gap: "8px",
        ...flexStyle,
      }}>
        {sizes.map((s, i) => (
          <Box key={i} style={{ flex: s, minWidth: s === "auto" ? "auto" : "44px" }}>{i + 1}</Box>
        ))}
      </div>
    </div>
  );
};

// ─── CHAPTERS ──────────────────────────────────────────────────────────────────

const ChapterIntro = () => (
  <div>
    <p style={{ color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px" }}>
      Before Flexbox, laying things out in CSS was painful — floats, clearfixes, hacks. Flexbox is a <strong style={{ color: "#e2e8f0" }}>layout system</strong> that lets you arrange items in a row or column, and control how they're spaced, sized, and aligned — all with simple properties.
    </p>

    <Note>Flexbox works on a <strong>parent-child</strong> relationship. The parent is the <strong>flex container</strong>. The children are <strong>flex items</strong>.</Note>

    <SectionTitle>How to activate it</SectionTitle>
    <CodeBlock lines={[
      <><span style={{ color: "#f472b6" }}>.container</span> <span style={{ color: "#cbd5e1" }}>{"{"}</span></>,
      <>&nbsp;&nbsp;<Prop name="display" val="flex" /></>,
      <><span style={{ color: "#cbd5e1" }}>{"}"}</span></>,
    ]} />

    <p style={{ color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px" }}>
      That one line turns <Code>.container</Code> into a flex container. Its children automatically become flex items and line up in a row.
    </p>

    <SectionTitle>Before vs After</SectionTitle>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      <div>
        <div style={{ color: "#f87171", fontSize: "12px", marginBottom: "6px", fontFamily: "monospace" }}>❌ display: block (default)</div>
        <div style={{ background: "#0f172a", border: "2px dashed #334155", borderRadius: "10px", padding: "10px" }}>
          <Box style={{ marginBottom: "8px", display: "block", minWidth: "100%", textAlign: "center" }}>1</Box>
          <Box style={{ marginBottom: "8px", display: "block", minWidth: "100%", textAlign: "center" }}>2</Box>
          <Box style={{ display: "block", minWidth: "100%", textAlign: "center" }}>3</Box>
        </div>
      </div>
      <div>
        <div style={{ color: "#86efac", fontSize: "12px", marginBottom: "6px", fontFamily: "monospace" }}>✅ display: flex</div>
        <div style={{ background: "#0f172a", border: "2px dashed #334155", borderRadius: "10px", padding: "10px", display: "flex", gap: "8px" }}>
          <Box>1</Box><Box>2</Box><Box>3</Box>
        </div>
      </div>
    </div>
  </div>
);

const ChapterAxes = () => (
  <div>
    <p style={{ color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px" }}>
      This is the most important mental model in Flexbox. There are always <strong style={{ color: "#e2e8f0" }}>two axes</strong> — understanding these makes everything else make sense.
    </p>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
      <div style={{ background: "#0f172a", border: "2px solid #6366f1", borderRadius: "12px", padding: "16px" }}>
        <div style={{ color: "#a78bfa", fontWeight: "700", marginBottom: "8px", fontSize: "15px" }}>Main Axis →</div>
        <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.7" }}>
          The direction items are placed. Controlled by <Code>flex-direction</Code>.<br /><br />
          Default: <strong style={{ color: "#e2e8f0" }}>left → right</strong>
        </div>
      </div>
      <div style={{ background: "#0f172a", border: "2px solid #ec4899", borderRadius: "12px", padding: "16px" }}>
        <div style={{ color: "#f9a8d4", fontWeight: "700", marginBottom: "8px", fontSize: "15px" }}>Cross Axis ↓</div>
        <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.7" }}>
          Perpendicular to the main axis. Always 90° from it.<br /><br />
          Default: <strong style={{ color: "#e2e8f0" }}>top → bottom</strong>
        </div>
      </div>
    </div>

    <div style={{ background: "#0f172a", border: "2px dashed #334155", borderRadius: "12px", padding: "20px", position: "relative", marginBottom: "20px" }}>
      {/* Arrow for main axis */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <Box>1</Box><Box>2</Box><Box>3</Box>
        <div style={{ color: "#a78bfa", fontSize: "20px" }}>→</div>
        <span style={{ color: "#a78bfa", fontSize: "12px", fontWeight: "700" }}>MAIN AXIS</span>
      </div>
      {/* Arrow for cross axis */}
      <div style={{ position: "absolute", right: "20px", top: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        <div style={{ color: "#f9a8d4", fontSize: "20px" }}>↓</div>
        <span style={{ color: "#f9a8d4", fontSize: "11px", fontWeight: "700", writingMode: "horizontal-tb" }}>CROSS AXIS</span>
      </div>
    </div>

    <Note>
      <strong>Key rule:</strong> <Code>justify-content</Code> always controls the <strong>main axis</strong>. <Code>align-items</Code> always controls the <strong>cross axis</strong>. If you change <Code>flex-direction</Code>, both axes flip too!
    </Note>
  </div>
);

const ChapterDirection = () => {
  const [dir, setDir] = useState("row");
  const dirs = ["row", "row-reverse", "column", "column-reverse"];
  return (
    <div>
      <p style={{ color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px" }}>
        <Code>flex-direction</Code> sets which direction the main axis runs — meaning, which direction your items are laid out.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {dirs.map(d => (
          <button key={d} onClick={() => setDir(d)} style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "13px",
            background: dir === d ? "#6366f1" : "#1e293b",
            color: dir === d ? "white" : "#94a3b8",
            fontWeight: dir === d ? "700" : "400",
            transition: "all 0.2s",
          }}>{d}</button>
        ))}
      </div>

      <div style={{
        display: "flex",
        background: "#0f172a",
        border: "2px dashed #334155",
        borderRadius: "10px",
        padding: "12px",
        minHeight: "120px",
        gap: "8px",
        flexDirection: dir,
        transition: "all 0.3s",
        alignItems: "flex-start",
      }}>
        <Box>1</Box><Box>2</Box><Box>3</Box>
      </div>

      <div style={{ marginTop: "12px" }}>
        <CodeBlock lines={[
          <><span style={{ color: "#f472b6" }}>.container</span> <span style={{ color: "#cbd5e1" }}>{"{"}</span></>,
          <>&nbsp;&nbsp;<Prop name="display" val="flex" /></>,
          <>&nbsp;&nbsp;<Prop name="flex-direction" val={dir} /></>,
          <><span style={{ color: "#cbd5e1" }}>{"}"}</span></>,
        ]} />
      </div>

      <Note>When direction is <Code>column</Code>, the main axis is now <strong>vertical</strong>. So <Code>justify-content</Code> now controls vertical spacing and <Code>align-items</Code> controls horizontal!</Note>
    </div>
  );
};

const ChapterJustify = () => {
  const [val, setVal] = useState("flex-start");
  const options = ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"];
  return (
    <div>
      <p style={{ color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px" }}>
        <Code>justify-content</Code> distributes items along the <strong style={{ color: "#a78bfa" }}>main axis</strong> (horizontal by default). It answers: "where do the items go, and how is the leftover space divided?"
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {options.map(o => (
          <button key={o} onClick={() => setVal(o)} style={{
            padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            fontFamily: "monospace", fontSize: "12px",
            background: val === o ? "#6366f1" : "#1e293b",
            color: val === o ? "white" : "#94a3b8",
            fontWeight: val === o ? "700" : "400",
            transition: "all 0.2s",
          }}>{o}</button>
        ))}
      </div>

      <div style={{
        display: "flex",
        background: "#0f172a",
        border: "2px dashed #334155",
        borderRadius: "10px",
        padding: "12px",
        justifyContent: val,
        gap: "8px",
        transition: "all 0.3s",
      }}>
        <Box>1</Box><Box>2</Box><Box>3</Box>
      </div>

      <div style={{ marginTop: "12px" }}>
        <CodeBlock lines={[
          <>&nbsp;&nbsp;<Prop name="justify-content" val={val} /></>,
        ]} />
      </div>

      <div style={{ marginTop: "16px" }}>
        {[
          ["flex-start", "Items bunch up at the start (default)"],
          ["flex-end", "Items bunch up at the end"],
          ["center", "Items centered in the middle"],
          ["space-between", "First item at start, last at end, equal gaps between"],
          ["space-around", "Equal space on each side of every item (edge gaps are half)"],
          ["space-evenly", "Equal space between ALL items AND edges"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: "10px", marginBottom: "6px", alignItems: "flex-start" }}>
            <Code>{k}</Code>
            <span style={{ color: "#64748b", fontSize: "13px" }}>— {v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChapterAlignItems = () => {
  const [val, setVal] = useState("stretch");
  const options = ["stretch", "flex-start", "flex-end", "center", "baseline"];
  return (
    <div>
      <p style={{ color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px" }}>
        <Code>align-items</Code> controls items along the <strong style={{ color: "#f9a8d4" }}>cross axis</strong> (vertical by default). Think of it as the vertical version of <Code>justify-content</Code>.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {options.map(o => (
          <button key={o} onClick={() => setVal(o)} style={{
            padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            fontFamily: "monospace", fontSize: "12px",
            background: val === o ? "#ec4899" : "#1e293b",
            color: val === o ? "white" : "#94a3b8",
            transition: "all 0.2s",
          }}>{o}</button>
        ))}
      </div>

      <div style={{
        display: "flex",
        background: "#0f172a",
        border: "2px dashed #334155",
        borderRadius: "10px",
        padding: "12px",
        alignItems: val,
        gap: "8px",
        height: "120px",
        transition: "all 0.3s",
      }}>
        <Box>1</Box>
        <Box style={{ height: "50px" }}>2</Box>
        <Box style={{ fontSize: "20px", height: "70px" }}>3</Box>
      </div>

      <div style={{ marginTop: "12px" }}>
        <CodeBlock lines={[<>&nbsp;&nbsp;<Prop name="align-items" val={val} /></>]} />
      </div>

      <Note>Items have different heights in the demo so you can see the effect clearly. <Code>stretch</Code> (default) makes items fill the container height. <Code>baseline</Code> aligns text baselines.</Note>

      <div style={{ marginTop: "12px" }}>
        {[
          ["stretch", "Stretch items to fill container height (default)"],
          ["flex-start", "Items align to the top"],
          ["flex-end", "Items align to the bottom"],
          ["center", "Items center vertically"],
          ["baseline", "Items align by text baseline"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: "10px", marginBottom: "6px", alignItems: "flex-start" }}>
            <Code>{k}</Code>
            <span style={{ color: "#64748b", fontSize: "13px" }}>— {v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChapterWrap = () => {
  const [wrap, setWrap] = useState("nowrap");
  return (
    <div>
      <p style={{ color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px" }}>
        By default, flex items all try to fit in <strong style={{ color: "#e2e8f0" }}>one line</strong> — they shrink to fit and never wrap. <Code>flex-wrap</Code> changes that.
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["nowrap", "wrap", "wrap-reverse"].map(o => (
          <button key={o} onClick={() => setWrap(o)} style={{
            padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            fontFamily: "monospace", fontSize: "12px",
            background: wrap === o ? "#6366f1" : "#1e293b",
            color: wrap === o ? "white" : "#94a3b8",
            transition: "all 0.2s",
          }}>{o}</button>
        ))}
      </div>

      <div style={{
        display: "flex",
        background: "#0f172a",
        border: "2px dashed #334155",
        borderRadius: "10px",
        padding: "12px",
        flexWrap: wrap,
        gap: "8px",
        transition: "all 0.3s",
      }}>
        {[1,2,3,4,5,6,7].map(n => <Box key={n} style={{ minWidth: "60px" }}>{n}</Box>)}
      </div>

      <div style={{ marginTop: "12px" }}>
        <CodeBlock lines={[<>&nbsp;&nbsp;<Prop name="flex-wrap" val={wrap} /></>]} />
      </div>

      <Note><Code>nowrap</Code> (default) — items shrink to fit, even if tiny. <Code>wrap</Code> — items spill onto new lines. <Code>wrap-reverse</Code> — new lines appear above, not below.</Note>
    </div>
  );
};

const ChapterAlignContent = () => {
  const [val, setVal] = useState("flex-start");
  const options = ["flex-start", "flex-end", "center", "space-between", "space-around", "stretch"];
  return (
    <div>
      <p style={{ color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px" }}>
        <Code>align-content</Code> is like <Code>justify-content</Code> but for <strong style={{ color: "#e2e8f0" }}>multiple rows</strong>. It only works when <Code>flex-wrap: wrap</Code> is active and there are multiple lines.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {options.map(o => (
          <button key={o} onClick={() => setVal(o)} style={{
            padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            fontFamily: "monospace", fontSize: "12px",
            background: val === o ? "#6366f1" : "#1e293b",
            color: val === o ? "white" : "#94a3b8",
            transition: "all 0.2s",
          }}>{o}</button>
        ))}
      </div>

      <div style={{
        display: "flex",
        background: "#0f172a",
        border: "2px dashed #334155",
        borderRadius: "10px",
        padding: "12px",
        flexWrap: "wrap",
        alignContent: val,
        gap: "8px",
        height: "180px",
        transition: "all 0.3s",
      }}>
        {[1,2,3,4,5,6].map(n => <Box key={n} style={{ minWidth: "60px" }}>{n}</Box>)}
      </div>

      <div style={{ marginTop: "12px" }}>
        <CodeBlock lines={[
          <>&nbsp;&nbsp;<Prop name="flex-wrap" val="wrap" /></>,
          <>&nbsp;&nbsp;<Prop name="align-content" val={val} /></>,
        ]} />
      </div>
    </div>
  );
};

const ChapterGap = () => {
  const [gap, setGap] = useState(8);
  return (
    <div>
      <p style={{ color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px" }}>
        <Code>gap</Code> adds spacing <strong style={{ color: "#e2e8f0" }}>between items</strong> — not outside the container. It replaced the old <Code>margin</Code> hack and it's clean and beautiful.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <span style={{ color: "#94a3b8", fontSize: "14px" }}>gap: {gap}px</span>
        <input type="range" min="0" max="40" value={gap} onChange={e => setGap(Number(e.target.value))}
          style={{ accentColor: "#6366f1", width: "160px" }} />
      </div>

      <div style={{
        display: "flex",
        background: "#0f172a",
        border: "2px dashed #334155",
        borderRadius: "10px",
        padding: "12px",
        gap: `${gap}px`,
        flexWrap: "wrap",
        transition: "all 0.2s",
      }}>
        <Box>1</Box><Box>2</Box><Box>3</Box><Box>4</Box>
      </div>

      <div style={{ marginTop: "12px" }}>
        <CodeBlock lines={[<>&nbsp;&nbsp;<Prop name="gap" val={`${gap}px`} /></>]} />
      </div>

      <Note>You can also write <Code>gap: 10px 20px</Code> — first value is row gap, second is column gap. Or use <Code>row-gap</Code> and <Code>column-gap</Code> separately.</Note>
    </div>
  );
};

const ChapterFlexItem = () => {
  const [grow, setGrow] = useState([1, 1, 1]);
  // const [basis, setBasis] = useState("auto");

  const updateGrow = (i, val) => {
    const next = [...grow];
    next[i] = Number(val);
    setGrow(next);
  };

  return (
    <div>
      <p style={{ color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px" }}>
        So far we've controlled the <em>container</em>. Now let's control individual <strong style={{ color: "#e2e8f0" }}>items</strong>. Three key properties:
      </p>

      <SectionTitle>flex-grow</SectionTitle>
      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.7", marginBottom: "12px" }}>
        How much of the <strong style={{ color: "#e2e8f0" }}>leftover space</strong> should this item take? It's a ratio. If all items are <Code>1</Code>, they share space equally. If one is <Code>2</Code>, it gets twice as much.
      </p>

      <div style={{ marginBottom: "12px" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Box style={{ minWidth: "28px", minHeight: "28px", fontSize: "12px" }}>{i + 1}</Box>
            <span style={{ color: "#64748b", fontSize: "13px", minWidth: "90px" }}>flex-grow: {grow[i]}</span>
            <input type="range" min="0" max="4" value={grow[i]} onChange={e => updateGrow(i, e.target.value)}
              style={{ accentColor: "#6366f1", width: "120px" }} />
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        background: "#0f172a",
        border: "2px dashed #334155",
        borderRadius: "10px",
        padding: "12px",
        gap: "8px",
      }}>
        {grow.map((g, i) => <Box key={i} style={{ flex: g || "0 0 44px" }}>{i + 1}</Box>)}
      </div>

      <SectionTitle>flex-shrink</SectionTitle>
      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.7", marginBottom: "12px" }}>
        When the container is <strong style={{ color: "#e2e8f0" }}>too small</strong>, how much should this item shrink? Default is <Code>1</Code> (all shrink equally). Set to <Code>0</Code> to prevent shrinking.
      </p>

      <div style={{ display: "flex", gap: "8px", background: "#0f172a", border: "2px dashed #334155", borderRadius: "10px", padding: "12px", width: "200px" }}>
        <Box style={{ flexShrink: 1 }}>shrink=1</Box>
        <Box style={{ flexShrink: 0 }}>shrink=0</Box>
      </div>
      <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>Container forced narrow — item 2 doesn't shrink</div>

      <SectionTitle>flex-basis</SectionTitle>
      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.7", marginBottom: "12px" }}>
        The <strong style={{ color: "#e2e8f0" }}>starting size</strong> of an item before leftover space is distributed. Like <Code>width</Code> but for flex items.
      </p>

      <Demo label={`flex-basis: 100px (items start at 100px, then grow)`}
        flexStyle={{ justifyContent: "flex-start" }}
        itemSizes={["auto"]} />
      <div style={{ display: "flex", background: "#0f172a", border: "2px dashed #334155", borderRadius: "10px", padding: "12px", gap: "8px" }}>
        <Box style={{ flexBasis: "100px" }}>1</Box>
        <Box style={{ flexBasis: "100px" }}>2</Box>
        <Box style={{ flexBasis: "50px" }}>3</Box>
      </div>
      <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>1=100px, 2=100px, 3=50px flex-basis</div>

      <SectionTitle>The flex shorthand</SectionTitle>
      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.7", marginBottom: "12px" }}>
        You can combine all three into one:
      </p>
      <CodeBlock lines={[
        <span style={{ color: "#64748b" }}>/* flex: grow shrink basis */</span>,
        <><span style={{ color: "#7dd3fc" }}>flex</span><span style={{ color: "#cbd5e1" }}>: </span><span style={{ color: "#86efac" }}>1 1 auto</span><span style={{ color: "#cbd5e1" }}>;</span>&nbsp;<span style={{ color: "#64748b" }}>/* grow, shrink, auto basis */</span></>,
        <><span style={{ color: "#7dd3fc" }}>flex</span><span style={{ color: "#cbd5e1" }}>: </span><span style={{ color: "#86efac" }}>1</span><span style={{ color: "#cbd5e1" }}>;</span>&nbsp;<span style={{ color: "#64748b" }}>/* shorthand for flex: 1 1 0 */</span></>,
        <><span style={{ color: "#7dd3fc" }}>flex</span><span style={{ color: "#cbd5e1" }}>: </span><span style={{ color: "#86efac" }}>none</span><span style={{ color: "#cbd5e1" }}>;</span>&nbsp;<span style={{ color: "#64748b" }}>/* flex: 0 0 auto — rigid item */</span></>,
      ]} />
    </div>
  );
};

const ChapterAlignSelf = () => {
  const [selfVal, setSelfVal] = useState("auto");
  const [orderDemo, setOrderDemo] = useState(false);
  const options = ["auto", "flex-start", "flex-end", "center", "stretch"];

  return (
    <div>
      <SectionTitle>align-self</SectionTitle>
      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.7", marginBottom: "12px" }}>
        <Code>align-self</Code> overrides <Code>align-items</Code> for a <strong style={{ color: "#e2e8f0" }}>specific item</strong>. All other items follow the container's <Code>align-items</Code>.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
        {options.map(o => (
          <button key={o} onClick={() => setSelfVal(o)} style={{
            padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            fontFamily: "monospace", fontSize: "12px",
            background: selfVal === o ? "#ec4899" : "#1e293b",
            color: selfVal === o ? "white" : "#94a3b8",
          }}>{o}</button>
        ))}
      </div>

      <div style={{
        display: "flex",
        background: "#0f172a",
        border: "2px dashed #334155",
        borderRadius: "10px",
        padding: "12px",
        gap: "8px",
        height: "120px",
        alignItems: "flex-end",
      }}>
        <Box>1</Box>
        <Box style={{ alignSelf: selfVal, background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}>★2</Box>
        <Box>3</Box>
      </div>

      <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>Container has align-items: flex-end. Item 2 has align-self: {selfVal}</div>

      <SectionTitle>order</SectionTitle>
      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.7", marginBottom: "12px" }}>
        <Code>order</Code> changes the <strong style={{ color: "#e2e8f0" }}>visual order</strong> of items without changing the HTML. Default is <Code>0</Code>. Lower numbers come first.
      </p>

      <button onClick={() => setOrderDemo(!orderDemo)} style={{
        padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer",
        background: "#6366f1", color: "white", fontFamily: "monospace", fontSize: "13px", marginBottom: "12px",
      }}>
        {orderDemo ? "Reset Order" : "Apply order: -1 to item 3"}
      </button>

      <div style={{ display: "flex", background: "#0f172a", border: "2px dashed #334155", borderRadius: "10px", padding: "12px", gap: "8px" }}>
        <Box>1 (order:0)</Box>
        <Box>2 (order:0)</Box>
        <Box style={{ order: orderDemo ? -1 : 0, background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>3 {orderDemo ? "(order:-1)" : "(order:0)"}</Box>
      </div>

      {orderDemo && <div style={{ color: "#fbbf24", fontSize: "12px", marginTop: "4px" }}>Item 3 now visually appears first! (HTML order unchanged)</div>}
    </div>
  );
};

const CheatSheet = () => {
  const section = (title, color, items) => (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ color, fontWeight: "700", fontSize: "14px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>{title}</div>
      {items.map(([prop, vals]) => (
        <div key={prop} style={{ marginBottom: "8px" }}>
          <Code>{prop}</Code>
          <div style={{ marginLeft: "12px", marginTop: "4px" }}>
            {vals.map(v => <div key={v} style={{ color: "#64748b", fontSize: "12px", fontFamily: "monospace", lineHeight: "1.7" }}>→ {v}</div>)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          {section("Container Properties", "#a78bfa", [
            ["display", ["flex", "inline-flex"]],
            ["flex-direction", ["row | row-reverse", "column | column-reverse"]],
            ["flex-wrap", ["nowrap | wrap | wrap-reverse"]],
            ["justify-content", ["flex-start | flex-end | center", "space-between | space-around | space-evenly"]],
            ["align-items", ["stretch | flex-start | flex-end", "center | baseline"]],
            ["align-content", ["flex-start | flex-end | center", "space-between | space-around | stretch"]],
            ["gap", ["8px", "10px 20px (row col)"]],
          ])}
        </div>
        <div>
          {section("Item Properties", "#f9a8d4", [
            ["flex-grow", ["0 (default, no grow)", "1 (grow equally)", "2 (grow 2x more)"]],
            ["flex-shrink", ["1 (default, shrinks)", "0 (never shrink)"]],
            ["flex-basis", ["auto (default)", "100px | 50% | 0"]],
            ["flex", ["1  (= 1 1 0)", "0 0 auto (= none)", "grow shrink basis"]],
            ["align-self", ["auto | flex-start | flex-end", "center | stretch"]],
            ["order", ["0 (default)", "-1 (goes first)", "1 (goes last)"]],
          ])}
        </div>
      </div>

      <Note>
        The most common combos: <Code>display: flex</Code> + <Code>justify-content: center</Code> + <Code>align-items: center</Code> = perfectly centered. Use this constantly.
      </Note>
    </div>
  );
};

const chapterContent = {
  intro: <ChapterIntro />,
  axes: <ChapterAxes />,
  direction: <ChapterDirection />,
  justify: <ChapterJustify />,
  "align-items": <ChapterAlignItems />,
  wrap: <ChapterWrap />,
  "align-content": <ChapterAlignContent />,
  gap: <ChapterGap />,
  "flex-item": <ChapterFlexItem />,
  "align-self": <ChapterAlignSelf />,
  cheatsheet: <CheatSheet />,
};

export default function FlexBook() {
  const [active, setActive] = useState("intro");

  return (
    <div style={{
      background: "#020617",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: "flex",
    }}>
      {/* Sidebar */}
      <div style={{
        width: "220px",
        minWidth: "220px",
        background: "#0a0f1e",
        borderRight: "1px solid #1e293b",
        padding: "20px 0",
        overflowY: "auto",
      }}>
        <div style={{
          padding: "0 16px 20px",
          borderBottom: "1px solid #1e293b",
          marginBottom: "8px",
        }}>
          <div style={{ color: "#6366f1", fontWeight: "900", fontSize: "18px" }}>FLEXBOX</div>
          <div style={{ color: "#334155", fontSize: "12px" }}>The Complete Guide</div>
        </div>
        {chapters.map(ch => (
          <button key={ch.id} onClick={() => setActive(ch.id)} style={{
            width: "100%",
            padding: "10px 16px",
            background: active === ch.id ? "#1e1b4b" : "transparent",
            border: "none",
            borderLeft: active === ch.id ? "3px solid #6366f1" : "3px solid transparent",
            color: active === ch.id ? "#c7d2fe" : "#475569",
            textAlign: "left",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: active === ch.id ? "700" : "400",
            transition: "all 0.2s",
          }}>
            {ch.emoji} {ch.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "32px", overflowY: "auto", maxWidth: "680px" }}>
        <div style={{
          color: "#6366f1",
          fontSize: "11px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "2px",
          marginBottom: "8px",
        }}>
          {chapters.find(c => c.id === active)?.emoji} {chapters.find(c => c.id === active)?.title}
        </div>

        {chapterContent[active]}

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #1e293b" }}>
          {chapters.findIndex(c => c.id === active) > 0 ? (
            <button onClick={() => setActive(chapters[chapters.findIndex(c => c.id === active) - 1].id)} style={{
              padding: "8px 16px", borderRadius: "6px", border: "1px solid #334155",
              background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "13px",
            }}>← Prev</button>
          ) : <div />}
          {chapters.findIndex(c => c.id === active) < chapters.length - 1 && (
            <button onClick={() => setActive(chapters[chapters.findIndex(c => c.id === active) + 1].id)} style={{
              padding: "8px 16px", borderRadius: "6px", border: "none",
              background: "#6366f1", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "700",
            }}>Next →</button>
          )}
        </div>
      </div>
    </div>
  );
}
