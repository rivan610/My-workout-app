import { useState, useEffect, useRef } from "react";

const PREVIOUS_WEIGHTS = {
  "Barbell Bent-Over Row": "25lb each side",
  "Cable Face Pull (Rope, High)": null,
  "Rope Tricep Pushdown": null,
  "Cable Curl (Low Attachment)": null,
  "Cable Overhead Tricep Extension (Rope)": null,
  "Landmine Press (Alternating)": "35lb plate",
};

const TARGETS = {
  "Barbell Bent-Over Row": "30lb each side",
  "Landmine Press (Alternating)": "40lb plate",
};

const PLATE_OPTIONS = [5, 10, 25, 35, 45];

const workout = {
  warmup: {
    label: "WARM-UP",
    sublabel: "4 min — desk detox + arm activation",
    color: "#f97316",
    exercises: [
      { name: "Chin Tucks", detail: "10 reps slow · reverse the screen posture · hold 2 sec at end range", sets: 1, trackWeight: false },
      { name: "Arm Circle", detail: "15 forward, 15 back · full range · loosen the shoulder capsule before loading the arms", sets: 1, trackWeight: false },
      { name: "Band Pull-Apart or Chest Opener", detail: "15 reps · arms straight out front · pull to a T · activates rear delts before pulling", sets: 1, trackWeight: false },
      { name: "Wrist Circle + Forearm Stretch", detail: "10 each direction · extend arm · pull fingers back · prep the wrists and forearms for curls and extensions", sets: 1, trackWeight: false },
    ],
  },
  blocks: [
    {
      label: "BLOCK 1",
      sublabel: "Triceps · 3 sets · cable superset",
      color: "#3b82f6",
      rest: 45,
      rounds: 3,
      exercises: [
        { name: "Rope Tricep Pushdown", detail: "15 reps · elbows pinned to sides · flare rope out at bottom · squeeze hard · 3 sec up", sets: 3, trackWeight: true, weightType: "cable" },
        { name: "Cable Overhead Tricep Extension (Rope)", detail: "12 reps · face away from cable · rope behind head · elbows close · full stretch at bottom · long head of tricep · best mass builder", sets: 3, trackWeight: true, weightType: "cable" },
      ],
    },
    {
      label: "BLOCK 2",
      sublabel: "Biceps · 3 sets · cable superset",
      color: "#a855f7",
      rest: 45,
      rounds: 3,
      exercises: [
        { name: "Cable Curl (Low Attachment)", detail: "12 reps · straight bar or rope · elbows pinned · curl to chin · squeeze at top · 3 sec down · constant tension vs dumbbells", sets: 3, trackWeight: true, weightType: "cable" },
        { name: "Cable Hammer Curl (Rope, Low)", detail: "12 reps · neutral grip · rope palms facing each other · hits brachialis and brachioradialis · thickens the arm", sets: 3, trackWeight: true, weightType: "cable" },
      ],
    },
    {
      label: "BLOCK 3",
      sublabel: "Back 20% · 2 sets · close it out",
      color: "#10b981",
      rest: 45,
      rounds: 2,
      exercises: [
        { name: "Barbell Bent-Over Row", detail: "8 reps · hinge to 45° · pull to belly button · squeeze lats · 3 sec lower · target: 30lb each side", sets: 2, trackWeight: true, weightType: "barbell" },
        { name: "Cable Face Pull (Rope, High)", detail: "15 reps · elbows at ear height · pull to forehead · external rotate at end · shoulder health · rear delts", sets: 2, trackWeight: true, weightType: "cable" },
      ],
    },
    {
      label: "POSTURE WORK",
      sublabel: "3 min · non-negotiable",
      color: "#ef4444",
      rest: 0,
      rounds: 1,
      exercises: [
        { name: "Wall Chin Tuck", detail: "10 reps · head, shoulders, hips against wall · pull chin straight back · hold 2 sec", sets: 1, trackWeight: false },
        { name: "Doorway Chest Opener", detail: "45 sec · elbows at 90° · breathe into the chest · reverse the desk damage", sets: 1, trackWeight: false },
      ],
    },
  ],
  cooldown: {
    label: "COOL DOWN",
    sublabel: "3 min — arms and upper back",
    color: "#06b6d4",
    exercises: [
      { name: "Cross-Body Shoulder Stretch", detail: "30 sec each side · arms just worked hard", sets: 1, trackWeight: false },
      { name: "Overhead Tricep Stretch", detail: "30 sec each side · reach arm overhead · pull elbow back with other hand · full tricep stretch", sets: 1, trackWeight: false },
      { name: "Supine Bicep Stretch", detail: "30 sec each side · lie face down · arm out to side · turn head away · full bicep and forearm release", sets: 1, trackWeight: false },
    ],
  },
};

function playDoneSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + i * 0.12 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.6);
    });
  } catch {}
}

let globalCtx = null;
function unlockAudio() {
  try {
    if (!globalCtx) globalCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (globalCtx.state === "suspended") globalCtx.resume();
    const buf = globalCtx.createBuffer(1, 1, 22050);
    const src = globalCtx.createBufferSource();
    src.buffer = buf;
    src.connect(globalCtx.destination);
    src.start(0);
  } catch {}
}

function TimerModal({ seconds, label, onClose }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef(null);
  const soundedRef = useRef(false);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => setRemaining((r) => r - 1), 1000);
    } else if (remaining === 0) {
      setRunning(false);
      if (!soundedRef.current) { soundedRef.current = true; playDoneSound(); }
    }
    return () => clearInterval(intervalRef.current);
  }, [running, remaining]);

  const pct = ((seconds - remaining) / seconds) * 100;
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const circumference = 2 * Math.PI * 54;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 24, padding: "40px 48px", textAlign: "center", minWidth: 280 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: 4, color: "#666", marginBottom: 24, textTransform: "uppercase" }}>Rest — {label}</div>
        <div style={{ position: "relative", width: 128, height: 128, margin: "0 auto 28px" }}>
          <svg width="128" height="128" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="64" cy="64" r="54" fill="none" stroke="#1e1e1e" strokeWidth="8" />
            <circle cx="64" cy="64" r="54" fill="none" stroke={remaining === 0 ? "#10b981" : "#3b82f6"} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * pct) / 100} style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 700, color: remaining === 0 ? "#10b981" : "#fff", letterSpacing: 2 }}>{remaining === 0 ? "GO" : `${mins}:${secs}`}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setRunning((r) => !r)} style={{ background: "#1e1e1e", border: "1px solid #333", color: "#fff", borderRadius: 10, padding: "10px 20px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>{running ? "Pause" : "Resume"}</button>
          <button onClick={onClose} style={{ background: "#3b82f6", border: "none", color: "#fff", borderRadius: 10, padding: "10px 20px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>Done</button>
        </div>
      </div>
    </div>
  );
}

function WeightLogger({ exerciseName, color, weights, onWeightChange }) {
  const prev = PREVIOUS_WEIGHTS[exerciseName];
  const target = TARGETS[exerciseName];
  const [mode, setMode] = useState("plates");
  const currentPlates = weights?.plates || [];
  const currentLbs = weights?.lbs || "";
  const totalPlateWeight = currentPlates.reduce((a, b) => a + b, 0);
  const displayWeight = mode === "plates" ? (currentPlates.length > 0 ? `${totalPlateWeight}lb plates` : null) : (currentLbs ? `${currentLbs}lb` : null);

  const togglePlate = (plate) => {
    const existing = [...currentPlates];
    const idx = existing.indexOf(plate);
    if (idx >= 0) existing.splice(idx, 1); else existing.push(plate);
    onWeightChange({ plates: existing, lbs: currentLbs });
  };

  return (
    <div style={{ marginTop: 10, background: "#111", border: `1px solid ${color}22`, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
        {prev ? (
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#f59e0b", display: "flex", gap: 4 }}>
            <span style={{ opacity: 0.7 }}>↑ Last:</span>
            <span style={{ fontWeight: 600 }}>{prev}</span>
          </div>
        ) : (
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#555" }}>First time — log it today</div>
        )}
        {target && (
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#10b981", display: "flex", gap: 4 }}>
            <span style={{ opacity: 0.7 }}>🎯 Target:</span>
            <span style={{ fontWeight: 700 }}>{target}</span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {["plates", "lbs"].map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{ background: mode === m ? color + "33" : "transparent", border: `1px solid ${mode === m ? color : "#2a2a2a"}`, color: mode === m ? color : "#555", borderRadius: 6, padding: "3px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>{m === "plates" ? "Plates" : "Total lbs"}</button>
        ))}
        {displayWeight && <div style={{ marginLeft: "auto", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#10b981", letterSpacing: 1, alignSelf: "center" }}>{displayWeight}</div>}
      </div>
      {mode === "plates" ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PLATE_OPTIONS.map((plate) => {
            const count = currentPlates.filter(p => p === plate).length;
            return (
              <button key={plate} onClick={() => togglePlate(plate)} style={{ background: count > 0 ? color + "22" : "#1a1a1a", border: `1px solid ${count > 0 ? color : "#2a2a2a"}`, color: count > 0 ? color : "#555", borderRadius: 8, padding: "6px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", position: "relative", minWidth: 44, textAlign: "center" }}>
                {plate}
                {count > 1 && <span style={{ position: "absolute", top: -6, right: -6, background: color, color: "#000", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>}
              </button>
            );
          })}
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, color: "#333", alignSelf: "center", marginLeft: 4 }}>tap · again for 2×</div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="number" placeholder="0" value={currentLbs} onChange={(e) => onWeightChange({ plates: currentPlates, lbs: e.target.value })} style={{ background: "#1a1a1a", border: `1px solid ${color}44`, color: "#fff", borderRadius: 8, padding: "6px 12px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, width: 80, textAlign: "center", outline: "none" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#555" }}>lb</span>
        </div>
      )}
    </div>
  );
}

function SetDot({ checked, onClick, color }) {
  return (
    <div onClick={onClick} style={{ width: 28, height: 28, borderRadius: "50%", cursor: "pointer", border: `2px solid ${checked ? color : "#333"}`, background: checked ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
      {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  );
}

function ExerciseRow({ exercise, color, blockKey, exIdx, checked, onToggle, weights, onWeightChange }) {
  const allDone = checked.every(Boolean);
  return (
    <div style={{ background: allDone ? `${color}10` : "#0d0d0d", border: `1px solid ${allDone ? color + "44" : "#1a1a1a"}`, borderRadius: 12, padding: "13px 16px", transition: "all 0.3s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 600, color: allDone ? "#555" : "#e5e5e5", letterSpacing: 0.5, textDecoration: allDone ? "line-through" : "none", transition: "all 0.3s" }}>{exercise.name}</div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#444", marginTop: 3, lineHeight: 1.6 }}>{exercise.detail}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, marginTop: 2 }}>
          {checked.map((c, i) => <SetDot key={i} checked={c} color={color} onClick={() => onToggle(blockKey, exIdx, i)} />)}
        </div>
      </div>
      {exercise.trackWeight && <WeightLogger exerciseName={exercise.name} color={color} weights={weights} onWeightChange={onWeightChange} />}
    </div>
  );
}

function Section({ section, isBlock, blockKey, checkedSets, onToggle, onTimer, exerciseWeights, onWeightChange }) {
  const totalSets = section.exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = section.exercises.reduce((a, e, ei) => a + (checkedSets[blockKey]?.[ei] || []).filter(Boolean).length, 0);
  const allDone = doneSets === totalSets;

  return (
    <div style={{ marginBottom: 20, background: "#0a0a0a", border: `1px solid ${allDone ? section.color + "55" : "#1a1a1a"}`, borderRadius: 16, overflow: "hidden", transition: "border-color 0.3s" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #141414", display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg, ${section.color}18 0%, transparent 100%)` }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: section.color }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 3, color: section.color, textTransform: "uppercase" }}>{section.label}</span>
          </div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#555", marginLeft: 18, marginTop: 2 }}>{section.sublabel}{isBlock && ` · ${section.rest}s rest`}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#444", letterSpacing: 1 }}>{doneSets}/{totalSets}</span>
          {isBlock && <button onClick={() => onTimer(section.rest, section.label)} style={{ background: section.color + "22", border: `1px solid ${section.color}55`, color: section.color, borderRadius: 8, padding: "6px 12px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>⏱ Rest</button>}
        </div>
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {section.exercises.map((ex, ei) => (
          <ExerciseRow key={ei} exercise={ex} color={section.color} blockKey={blockKey} exIdx={ei} checked={checkedSets[blockKey]?.[ei] || Array(ex.sets).fill(false)} onToggle={onToggle} weights={exerciseWeights[`${blockKey}-${ei}`]} onWeightChange={(w) => onWeightChange(`${blockKey}-${ei}`, w)} />
        ))}
      </div>
    </div>
  );
}

export default function WorkoutTracker() {
  const [checkedSets, setCheckedSets] = useState({});
  const [timer, setTimer] = useState(null);
  const [exerciseWeights, setExerciseWeights] = useState({});

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const unlock = () => { unlockAudio(); document.removeEventListener("touchstart", unlock); };
    document.addEventListener("touchstart", unlock);
    return () => document.removeEventListener("touchstart", unlock);
  }, []);

  const handleWeightChange = (key, w) => setExerciseWeights((prev) => ({ ...prev, [key]: w }));

  const handleToggle = (blockKey, exIdx, setIdx) => {
    setCheckedSets((prev) => {
      const block = { ...(prev[blockKey] || {}) };
      const section = blockKey === "WARM-UP" ? workout.warmup : blockKey === "COOL DOWN" ? workout.cooldown : workout.blocks.find(b => b.label === blockKey);
      const ex = [...(block[exIdx] || Array(section.exercises[exIdx].sets).fill(false))];
      ex[setIdx] = !ex[setIdx];
      block[exIdx] = ex;
      return { ...prev, [blockKey]: block };
    });
  };

  const allSections = [workout.warmup, ...workout.blocks, workout.cooldown];
  const totalSets = allSections.reduce((a, s) => a + s.exercises.reduce((b, e) => b + e.sets, 0), 0);
  const doneSets = Object.values(checkedSets).reduce((a, block) => a + Object.values(block).reduce((b, arr) => b + arr.filter(Boolean).length, 0), 0);
  const progress = Math.round((doneSets / totalSets) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "'Barlow', sans-serif", padding: "0 0 60px" }}>
      <div style={{ padding: "32px 20px 20px", background: "linear-gradient(180deg, #111 0%, #080808 100%)", borderBottom: "1px solid #141414", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 4, textTransform: "uppercase" }}>Arms & Back · 30 min · Day 19</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, letterSpacing: 1, lineHeight: 1 }}>PUMP DAY</div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#a855f7", marginTop: 4 }}>80% arms · 20% back · post-work · cables dominate</div>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#555", letterSpacing: 2 }}>PROGRESS</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: progress === 100 ? "#10b981" : "#a855f7", letterSpacing: 2 }}>{progress}%</span>
            </div>
            <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? "#10b981" : "linear-gradient(90deg, #3b82f6, #a855f7)", borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 0" }}>
        <Section section={workout.warmup} isBlock={false} blockKey="WARM-UP" checkedSets={checkedSets} onToggle={handleToggle} onTimer={() => {}} exerciseWeights={exerciseWeights} onWeightChange={handleWeightChange} />
        {workout.blocks.map((block) => (
          <Section key={block.label} section={block} isBlock={block.label !== "POSTURE WORK"} blockKey={block.label} checkedSets={checkedSets} onToggle={handleToggle} onTimer={(s, l) => setTimer({ secs: s, label: l })} exerciseWeights={exerciseWeights} onWeightChange={handleWeightChange} />
        ))}
        <Section section={workout.cooldown} isBlock={false} blockKey="COOL DOWN" checkedSets={checkedSets} onToggle={handleToggle} onTimer={() => {}} exerciseWeights={exerciseWeights} onWeightChange={handleWeightChange} />

        {progress === 100 && (
          <div style={{ textAlign: "center", padding: "32px 20px" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: "#10b981", letterSpacing: 3, marginBottom: 8 }}>💪 DAY 19 DONE</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#555", letterSpacing: 2 }}>ARMS PUMPED. BACK SOLID. LOG YOUR WEIGHTS.</div>
          </div>
        )}
      </div>

      {timer && <TimerModal seconds={timer.secs} label={timer.label} onClose={() => setTimer(null)} />}
    </div>
  );
}
