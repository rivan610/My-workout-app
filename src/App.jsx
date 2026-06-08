import { useState, useEffect, useRef } from "react";

// ── PERSISTENT STORAGE ──────────────────────────────────────────────────────
const STORAGE_KEY = "loninja_workout_master_v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { logs: {}, weights: {}, notes: {} };
  } catch { return { logs: {}, weights: {}, notes: {} }; }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ── WORKOUT LIBRARY ──────────────────────────────────────────────────────────
const WORKOUTS = {
  18: {
    title: "WELCOME BACK",
    subtitle: "Return · Right arm cautious · 30 min",
    tag: "RETURN",
    tagColor: "#10b981",
    blocks: [
      { label: "WARM-UP", color: "#f97316", exercises: [
        { name: "Easy Walk", detail: "3 min · no incline · get blood moving", sets: 1 },
        { name: "Hip Circle", detail: "10 each direction · slow and deliberate", sets: 1 },
        { name: "Arm Circle (Left full, Right gentle)", detail: "10 forward, 10 back", sets: 1 },
        { name: "Glute Bridge", detail: "12 reps · drive through heels · squeeze at top", sets: 1 },
        { name: "Squat to Stand", detail: "8 reps · hold at bottom · open the hips", sets: 1 },
      ]},
      { label: "BLOCK 1", color: "#3b82f6", rest: 60, exercises: [
        { name: "Barbell Back Squat", detail: "8 reps · lighter than usual · 3 sec down", tracked: true, sets: 3 },
        { name: "KB Goblet Squat (36lb)", detail: "10 reps · 3 sec down · elbows inside knees", sets: 3 },
      ]},
      { label: "BLOCK 2", color: "#a855f7", rest: 45, exercises: [
        { name: "KB Swing (36lb)", detail: "12 reps · hip snap · nothing pressing the vein", sets: 3 },
        { name: "KB Single-Arm Row — Left Only (36lb)", detail: "10 reps left side only · protect right arm", sets: 3 },
        { name: "Cable Face Pull (Rope, High)", detail: "12 reps · light · shoulder health", tracked: true, sets: 3 },
      ]},
      { label: "POSTURE WORK", color: "#10b981", exercises: [
        { name: "Wall Chin Tuck", detail: "10 reps slow · hold 2 sec", sets: 1 },
        { name: "Doorway Chest Opener", detail: "45 sec · breathe deep", sets: 1 },
        { name: "Box Breathing 4×4×4×4", detail: "6 rounds · welcome back", sets: 1 },
      ]},
      { label: "COOL DOWN", color: "#06b6d4", exercises: [
        { name: "Pigeon Pose", detail: "60 sec each side", sets: 1 },
        { name: "Child's Pose with Lat Reach", detail: "45 sec each side", sets: 1 },
      ]},
    ],
  },
  19: {
    title: "PUMP DAY",
    subtitle: "Arms & Back · 80/20 Split · 30 min",
    tag: "ARMS",
    tagColor: "#a855f7",
    blocks: [
      { label: "WARM-UP", color: "#f97316", exercises: [
        { name: "Chin Tucks", detail: "10 reps slow · reverse the screen posture · hold 2 sec at end range", sets: 1 },
        { name: "Arm Circle", detail: "15 forward, 15 back · full range · loosen the shoulder capsule", sets: 1 },
        { name: "Chest Opener / Band Pull-Apart", detail: "15 reps · arms straight out front · pull to a T · activates rear delts", sets: 1 },
        { name: "Wrist Circle + Forearm Stretch", detail: "10 each direction · extend arm · pull fingers back · prep for curls and extensions", sets: 1 },
      ]},
      { label: "BLOCK 1 — TRICEPS", color: "#3b82f6", rest: 45, exercises: [
        { name: "Rope Tricep Pushdown", detail: "15 reps · elbows pinned · flare rope out at bottom · squeeze hard · 3 sec up", tracked: true, sets: 3 },
        { name: "Cable Overhead Tricep Extension (Rope)", detail: "12 reps · face away · rope behind head · elbows close · full stretch at bottom · best long head builder", tracked: true, sets: 3 },
      ]},
      { label: "BLOCK 2 — BICEPS", color: "#a855f7", rest: 45, exercises: [
        { name: "Cable Curl (Low Attachment)", detail: "12 reps · elbows pinned · curl to chin · squeeze at top · 3 sec down · constant tension", tracked: true, sets: 3 },
        { name: "Cable Hammer Curl (Rope, Low)", detail: "12 reps · neutral grip · palms facing each other · hits brachialis · thickens the arm", tracked: true, sets: 3 },
      ]},
      { label: "BLOCK 3 — BACK 20%", color: "#10b981", rest: 45, exercises: [
        { name: "Barbell Bent-Over Row", detail: "8 reps · hinge to 45° · pull to belly button · squeeze lats · 3 sec lower", tracked: true, sets: 2 },
        { name: "Cable Face Pull (Rope, High)", detail: "15 reps · elbows at ear height · pull to forehead · external rotate at end · shoulder health", tracked: true, sets: 2 },
      ]},
      { label: "POSTURE WORK", color: "#ef4444", exercises: [
        { name: "Wall Chin Tuck", detail: "10 reps · hold 2 sec · daily habit", sets: 1 },
        { name: "Doorway Chest Opener", detail: "45 sec · reverse the desk damage", sets: 1 },
      ]},
      { label: "COOL DOWN", color: "#06b6d4", exercises: [
        { name: "Cross-Body Shoulder Stretch", detail: "30 sec each side", sets: 1 },
        { name: "Overhead Tricep Stretch", detail: "30 sec each side · reach arm overhead · pull elbow back", sets: 1 },
        { name: "Supine Bicep Stretch", detail: "30 sec each side · arm out to side · turn head away", sets: 1 },
      ]},
    ],
  },
  20: {
    title: "PUSH DAY",
    subtitle: "Bench · Landmine · Cable · 45 min",
    tag: "PUSH",
    tagColor: "#3b82f6",
    blocks: [
      { label: "WARM-UP", color: "#f97316", exercises: [
        { name: "Arm Circle + Shoulder Roll", detail: "15 forward, 15 back · full range · decompress before pressing", sets: 1 },
        { name: "Band Pull-Apart or Chest Opener", detail: "15 reps · rear delt activation before heavy pressing", sets: 1 },
        { name: "Push-Up (slow)", detail: "10 reps · 3 sec down · groove the pressing pattern before loading", sets: 1 },
        { name: "Hip Circle", detail: "10 each direction", sets: 1 },
      ]},
      { label: "BLOCK 1", color: "#3b82f6", rest: 60, exercises: [
        { name: "Incline Barbell Bench Press", detail: "8 reps · 3 sec down · full range · barbell goes away after this", tracked: true, sets: 4 },
        { name: "Cable Straight-Arm Pulldown (Rope, High)", detail: "12 reps · lats only · 3 sec up · builds pull-up strength · no lower back demand", tracked: true, sets: 4 },
      ]},
      { label: "BLOCK 2", color: "#a855f7", rest: 45, exercises: [
        { name: "Landmine Press (Alternating)", detail: "8 each side · controlled arc · don't rush · shoulder packed down", tracked: true, sets: 3 },
        { name: "Landmine Rotation", detail: "10 each side · rotate from hips · core stays braced · lower back neutral", tracked: true, sets: 3 },
        { name: "KB Farmers Carry — 52lb", detail: "30 steps · shoulders packed · don't lean · gap filler", sets: 3 },
      ]},
      { label: "BLOCK 3", color: "#10b981", rest: 30, exercises: [
        { name: "Rope Tricep Pushdown", detail: "15 reps · elbows pinned · squeeze at bottom · arms are already warmed up", tracked: true, sets: 3 },
        { name: "Cable Face Pull (Rope, High)", detail: "15 reps · shoulder health · never skip this · elbows high", tracked: true, sets: 3 },
        { name: "Arm Sling Hanging Knee Raise", detail: "12 reps · no swinging · exhale on the way up", sets: 3 },
      ]},
      { label: "POSTURE WORK", color: "#ef4444", exercises: [
        { name: "Wall Chin Tuck", detail: "10 reps · hold 2 sec", sets: 1 },
        { name: "Doorway Chest Opener", detail: "45 sec · reverse the bench press", sets: 1 },
        { name: "Anterior Pelvic Tilt Correction", detail: "Lie flat · flatten lower back · hold 10 sec × 6", sets: 1 },
      ]},
      { label: "COOL DOWN", color: "#06b6d4", exercises: [
        { name: "Pigeon Pose", detail: "45 sec each side", sets: 1 },
        { name: "Lat Hang from Pull-Up Bar", detail: "30 sec · decompress the spine", sets: 1 },
        { name: "Cross-Body Shoulder Stretch", detail: "30 sec each side", sets: 1 },
      ]},
    ],
  },
};

  21: {
    title: "SHOULDER SUNDAY",
    subtitle: "V Taper Builder · Lateral Delts · 45 min",
    tag: "SHOULDERS",
    tagColor: "#f59e0b",
    blocks: [
      { label: "WARM-UP", color: "#f97316", exercises: [
        { name: "Arm Circle", detail: "15 forward, 15 back · full range · loosen the shoulder capsule", sets: 1 },
        { name: "Band Pull-Apart", detail: "15 reps · arms straight · pull to T · rear delt activation", sets: 1 },
        { name: "KB Halo (20lb)", detail: "10 each direction · keep elbows close · thoracic and shoulder mobility", sets: 1 },
        { name: "Wall Chin Tuck", detail: "10 reps · posture reset before overhead work", sets: 1 },
      ]},
      { label: "BLOCK 1 — LATERAL DELTS", color: "#f59e0b", rest: 45, exercises: [
        { name: "Cable Lateral Raise (Low, D-Handle)", detail: "15 reps · stand sideways · arm slightly forward · lead with elbow not hand · 3 sec down · best side delt builder", tracked: true, sets: 4, repsPerSet: [15, 15, 12, 12] },
        { name: "Landmine Lateral Raise", detail: "12 reps each side · hold end of bar · raise to shoulder height · elbow soft · constant tension", tracked: true, sets: 4, repsPerSet: [12, 12, 10, 10] },
      ]},
      { label: "BLOCK 2 — OVERHEAD PRESS", color: "#3b82f6", rest: 60, exercises: [
        { name: "Barbell Overhead Press", detail: "8 reps · standing · brace core · bar path straight up · don't flare elbows too wide · builds overall shoulder mass", tracked: true, sets: 4, repsPerSet: [8, 8, 6, 6] },
        { name: "KB Upright Row (36lb)", detail: "12 reps · elbows lead up · hits side and rear delt together · don't shrug at top", sets: 3, repsPerSet: [12, 12, 12] },
      ]},
      { label: "BLOCK 3 — REAR DELTS", color: "#a855f7", rest: 45, exercises: [
        { name: "Cable Face Pull (Rope, High)", detail: "15 reps · elbows at ear height · pull to forehead · external rotate · rear delt and rotator cuff health", tracked: true, sets: 3, repsPerSet: [15, 15, 15] },
        { name: "Cable Reverse Fly (High, D-Handle)", detail: "15 reps · lean forward slightly · arms wide arc · squeeze shoulder blades · rear delt isolation", tracked: true, sets: 3, repsPerSet: [15, 15, 15] },
      ]},
      { label: "POSTURE WORK", color: "#10b981", exercises: [
        { name: "Wall Chin Tuck", detail: "10 reps · hold 2 sec", sets: 1 },
        { name: "Doorway Chest Opener", detail: "45 sec · shoulders just worked hard · open them up", sets: 1 },
      ]},
      { label: "COOL DOWN", color: "#06b6d4", exercises: [
        { name: "Cross-Body Shoulder Stretch", detail: "45 sec each side", sets: 1 },
        { name: "Overhead Tricep Stretch", detail: "30 sec each side · decompresses the shoulder capsule", sets: 1 },
        { name: "Child's Pose with Lat Reach", detail: "45 sec each side", sets: 1 },
      ]},
    ],
  },
  22: {
    title: "LEG DAY",
    subtitle: "Squat · Hinge · Carry · 45 min",
    tag: "LEGS",
    tagColor: "#10b981",
    blocks: [
      { label: "WARM-UP", color: "#f97316", exercises: [
        { name: "Hip Circle", detail: "10 each direction · loosen the hips before loading", sets: 1 },
        { name: "Glute Bridge", detail: "15 reps · drive through heels · activate what squats need", sets: 1 },
        { name: "Goblet Squat Hold (20lb)", detail: "60 sec · elbows push knees out · spread the floor cue", sets: 1 },
        { name: "World's Greatest Stretch", detail: "5 each side · hips, thoracic, hamstrings in one", sets: 1 },
      ]},
      { label: "BLOCK 1 — SQUAT", color: "#10b981", rest: 75, exercises: [
        { name: "Barbell Back Squat", detail: "reps per set shown · 3 sec down · spread the floor · knees out · chest tall", tracked: true, sets: 4, repsPerSet: [8, 6, 6, 5] },
        { name: "Ankle Strap Cable Hip Abduction", detail: "15 each side · glute med superset · keeps knees tracking right", tracked: true, sets: 4, repsPerSet: [15, 15, 15, 15] },
      ]},
      { label: "BLOCK 2 — HINGE", color: "#3b82f6", rest: 60, exercises: [
        { name: "Landmine Romanian Deadlift", detail: "10 each side · hinge hips back · bar guides the arc · 3 sec down · hamstrings load fully", tracked: true, sets: 3, repsPerSet: [10, 10, 8] },
        { name: "Cable Pull-Through (Low, Rope)", detail: "15 reps · face away · rope between legs · drive hips forward · squeeze glutes at top · 2 sec hold", tracked: true, sets: 3, repsPerSet: [15, 15, 15] },
      ]},
      { label: "BLOCK 3 — CARRY & BURN", color: "#a855f7", rest: 30, exercises: [
        { name: "KB Goblet Squat (36lb)", detail: "15 reps · fast pace · 3 sec down · finisher", sets: 3, repsPerSet: [15, 15, 15] },
        { name: "KB Suitcase Carry — 52lb", detail: "30 steps each side · don't lean · core stays tight", sets: 3 },
      ]},
      { label: "POSTURE WORK", color: "#ef4444", exercises: [
        { name: "Anterior Pelvic Tilt Correction", detail: "Lie flat · flatten lower back · hold 10 sec × 6 · legs just hammered the hips", sets: 1 },
        { name: "Wall Chin Tuck", detail: "10 reps · hold 2 sec", sets: 1 },
      ]},
      { label: "COOL DOWN", color: "#06b6d4", exercises: [
        { name: "Pigeon Pose", detail: "60 sec each side · hips earned this", sets: 1 },
        { name: "Low Lunge Hip Flexor Stretch", detail: "45 sec each side", sets: 1 },
        { name: "Standing Hamstring Stretch", detail: "45 sec each side · foot on bench · hinge from hips", sets: 1 },
      ]},
    ],
  },
  23: {
    title: "KB CHAOS",
    subtitle: "Functional · Explosive · 30 min",
    tag: "KB",
    tagColor: "#ef4444",
    blocks: [
      { label: "WARM-UP", color: "#f97316", exercises: [
        { name: "KB Deadlift (36lb)", detail: "10 reps slow · groove the hinge pattern · feel the hip snap", sets: 1 },
        { name: "KB Single-Arm Swing (36lb)", detail: "8 each side · hip snap · let the bell float · warm-up for snatches", sets: 1 },
        { name: "Hip Circle", detail: "10 each direction", sets: 1 },
      ]},
      { label: "BLOCK 1 — POWER", color: "#ef4444", rest: 60, exercises: [
        { name: "KB Swing (36lb)", detail: "15 reps · explosive hip snap · hinge not squat · let the bell float to chest height", sets: 4, repsPerSet: [15, 15, 15, 15] },
        { name: "KB Clean & Press (36lb)", detail: "6 each side · clean to rack · press overhead · lock out · controlled lower", sets: 4, repsPerSet: [6, 6, 6, 6] },
      ]},
      { label: "BLOCK 2 — STRENGTH", color: "#3b82f6", rest: 45, exercises: [
        { name: "KB Goblet Squat (52lb)", detail: "10 reps · heavy bell · 3 sec down · elbows inside knees · drive through heels", sets: 3, repsPerSet: [10, 10, 10] },
        { name: "KB Single-Arm Row (52lb)", detail: "10 each side · chest on bench · full range · squeeze at top", sets: 3, repsPerSet: [10, 10, 10] },
        { name: "KB Farmers Carry (52lb)", detail: "30 steps · go heavy · gap filler", sets: 3 },
      ]},
      { label: "BLOCK 3 — BURN", color: "#a855f7", rest: 30, exercises: [
        { name: "KB Swing (36lb)", detail: "20 reps · this is the finisher · empty the tank", sets: 3, repsPerSet: [20, 20, 20] },
        { name: "KB Lateral Lunge (20lb)", detail: "10 each side · controlled · adductors and glutes", sets: 3, repsPerSet: [10, 10, 10] },
      ]},
      { label: "COOL DOWN", color: "#06b6d4", exercises: [
        { name: "Pigeon Pose", detail: "45 sec each side", sets: 1 },
        { name: "Child's Pose with Lat Reach", detail: "45 sec each side · lats just worked", sets: 1 },
        { name: "Box Breathing 4×4×4×4", detail: "6 rounds · bring the heart rate down", sets: 1 },
      ]},
    ],
  },
  24: {
    title: "PULL HEAVY",
    subtitle: "Rows · Pulls · Hinge · 45 min",
    tag: "PULL",
    tagColor: "#3b82f6",
    blocks: [
      { label: "WARM-UP", color: "#f97316", exercises: [
        { name: "Band Pull-Apart", detail: "15 reps · rear delt activation before heavy rowing", sets: 1 },
        { name: "KB Deadlift (36lb)", detail: "10 reps · groove the hinge · feel the lats engage", sets: 1 },
        { name: "Arm Circle", detail: "10 forward, 10 back", sets: 1 },
        { name: "Squat to Stand", detail: "8 reps · open the hips", sets: 1 },
      ]},
      { label: "BLOCK 1 — BARBELL ROW", color: "#3b82f6", rest: 75, exercises: [
        { name: "Barbell Bent-Over Row", detail: "reps per set shown · hinge to 45° · pull to belly button · squeeze lats · 3 sec lower", tracked: true, sets: 4, repsPerSet: [8, 6, 6, 5] },
        { name: "Cable Straight-Arm Pulldown (Rope, High)", detail: "12 reps · lats only · 3 sec up · pull-up strength builder", tracked: true, sets: 4, repsPerSet: [12, 12, 12, 12] },
      ]},
      { label: "BLOCK 2 — LANDMINE", color: "#a855f7", rest: 60, exercises: [
        { name: "Landmine Meadows Row", detail: "10 each side · stagger stance · pull to hip · rotate at top for full lat engagement", tracked: true, sets: 3, repsPerSet: [10, 10, 10] },
        { name: "Landmine Single-Leg RDL", detail: "8 each side · 3 sec down · balance will challenge you · go lighter · feel the hamstring", tracked: true, sets: 3, repsPerSet: [8, 8, 8] },
        { name: "KB Farmers Carry (52lb)", detail: "30 steps · gap filler · grip strength", sets: 3 },
      ]},
      { label: "BLOCK 3 — CABLE FINISH", color: "#10b981", rest: 30, exercises: [
        { name: "Cable Face Pull (Rope, High)", detail: "15 reps · shoulder health · never skip · elbows high", tracked: true, sets: 3, repsPerSet: [15, 15, 15] },
        { name: "Cable Curl (Low Attachment)", detail: "12 reps · elbows pinned · squeeze at top · 3 sec down", tracked: true, sets: 3, repsPerSet: [12, 12, 12] },
        { name: "Arm Sling Hanging Knee Raise", detail: "12 reps · decompress spine · no swinging", sets: 3, repsPerSet: [12, 12, 12] },
      ]},
      { label: "POSTURE WORK", color: "#ef4444", exercises: [
        { name: "Wall Chin Tuck", detail: "10 reps · hold 2 sec", sets: 1 },
        { name: "Doorway Chest Opener", detail: "45 sec · reverse the pulling", sets: 1 },
      ]},
      { label: "COOL DOWN", color: "#06b6d4", exercises: [
        { name: "Lat Hang from Pull-Up Bar", detail: "30 sec · decompress after heavy rows", sets: 1 },
        { name: "Child's Pose with Lat Reach", detail: "45 sec each side", sets: 1 },
        { name: "Pigeon Pose", detail: "45 sec each side", sets: 1 },
      ]},
    ],
  },
  25: {
    title: "ACTIVE RECOVERY",
    subtitle: "Mobility · Breathwork · Incline Walk · 30 min",
    tag: "RECOVERY",
    tagColor: "#10b981",
    blocks: [
      { label: "FOAM ROLL", color: "#3b82f6", exercises: [
        { name: "Foam Roll — Quads", detail: "60 sec each side · slow · pause on tight spots", sets: 1 },
        { name: "Foam Roll — Upper Back", detail: "60 sec · arms crossed · open the thoracic spine", sets: 1 },
        { name: "KB Glute Smash (36lb)", detail: "45 sec each side · sit on the bell · find the knot", sets: 1 },
        { name: "Foam Roll — Calves", detail: "45 sec each side · cross one leg over", sets: 1 },
      ]},
      { label: "HIP MOBILITY", color: "#a855f7", exercises: [
        { name: "90/90 Hip Switch", detail: "8 each side · controlled · feel the external rotation", sets: 1 },
        { name: "Deep Squat Hip Opener", detail: "60 sec · shift side to side · use cage for support", sets: 1 },
        { name: "Frog Stretch", detail: "60 sec · inner thigh and groin · fights the valgus collapse", sets: 1 },
        { name: "Low Lunge Hip Flexor Stretch", detail: "45 sec each side · hips forward not up", sets: 1 },
      ]},
      { label: "POSTURE RESET", color: "#10b981", exercises: [
        { name: "Wall Chin Tuck", detail: "10 reps · hold 2 sec · daily habit", sets: 1 },
        { name: "Doorway Chest Opener", detail: "45 sec · breathe deep", sets: 1 },
        { name: "Anterior Pelvic Tilt Correction", detail: "Lie flat · flatten lower back · hold 10 sec × 8", sets: 1 },
      ]},
      { label: "BREATHWORK", color: "#06b6d4", exercises: [
        { name: "Physiological Sigh", detail: "Double inhale through nose · long exhale through mouth · 5 reps · fastest way to lower HR", sets: 1 },
        { name: "Box Breathing 4×4×4×4", detail: "Inhale 4 · hold 4 · exhale 4 · hold 4 · 8 rounds · full nervous system reset", sets: 1 },
        { name: "Supine Diaphragmatic Breathing", detail: "Lie flat · hand on belly · 90 sec · belly rises on inhale · parasympathetic reset", sets: 1 },
      ]},
      { label: "CLOSING STRETCH", color: "#f97316", exercises: [
        { name: "Pigeon Pose", detail: "60 sec each side · deepest stretch of the week", sets: 1 },
        { name: "Supine Figure 4", detail: "45 sec each side", sets: 1 },
        { name: "Happy Baby Pose", detail: "60 sec · decompress everything · you earned it", sets: 1 },
      ]},
    ],
  },
};

// Add more workouts as needed — same structure
const UPCOMING = [
  { day: 26, title: "SHOULDER SUNDAY", subtitle: "V Taper · Lateral Delts · 45 min", tag: "COMING SOON", tagColor: "#555" },
  { day: 27, title: "PUSH DAY", subtitle: "Bench · Landmine · Cable · 45 min", tag: "COMING SOON", tagColor: "#555" },
  { day: 28, title: "KB CHAOS", subtitle: "Functional · Explosive · 30 min", tag: "COMING SOON", tagColor: "#555" },
];

// ── AUDIO ────────────────────────────────────────────────────────────────────
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + i * 0.12 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.6);
    });
  } catch {}
}

let _ctx = null;
function unlockAudio() {
  try {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === "suspended") _ctx.resume();
    const b = _ctx.createBuffer(1, 1, 22050);
    const s = _ctx.createBufferSource(); s.buffer = b; s.connect(_ctx.destination); s.start(0);
  } catch {}
}

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function RestTimer({ seconds, label, onClose }) {
  const [rem, setRem] = useState(seconds);
  const [running, setRunning] = useState(true);
  const ref = useRef(null);
  const chimed = useRef(false);

  useEffect(() => {
    if (running && rem > 0) ref.current = setInterval(() => setRem(r => r - 1), 1000);
    else if (rem === 0 && !chimed.current) { chimed.current = true; setRunning(false); playChime(); }
    return () => clearInterval(ref.current);
  }, [running, rem]);

  const pct = ((seconds - rem) / seconds) * 100;
  const circ = 2 * Math.PI * 54;
  const mm = String(Math.floor(rem / 60)).padStart(2, "0");
  const ss = String(rem % 60).padStart(2, "0");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 28, padding: "40px 48px", textAlign: "center", minWidth: 280 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 20, textTransform: "uppercase" }}>Rest — {label}</div>
        <div style={{ position: "relative", width: 128, height: 128, margin: "0 auto 28px" }}>
          <svg width="128" height="128" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="64" cy="64" r="54" fill="none" stroke="#1a1a1a" strokeWidth="8" />
            <circle cx="64" cy="64" r="54" fill="none" stroke={rem === 0 ? "#10b981" : "#3b82f6"} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - (circ * pct) / 100} style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 700, color: rem === 0 ? "#10b981" : "#fff", letterSpacing: 2 }}>{rem === 0 ? "GO" : `${mm}:${ss}`}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setRunning(r => !r)} style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: 10, padding: "10px 20px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>{running ? "Pause" : "Resume"}</button>
          <button onClick={onClose} style={{ background: "#3b82f6", border: "none", color: "#fff", borderRadius: 10, padding: "10px 20px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>Done</button>
        </div>
      </div>
    </div>
  );
}

const PLATES = [5, 10, 25, 35, 45];

// Cross-day weight lookup — finds last logged weight for an exercise by name across all days
function findLastWeight(allLogs, exerciseName) {
  let lastDate = null;
  let lastWeight = null;
  Object.entries(allLogs).forEach(([dayKey, dayLog]) => {
    if (!dayLog.completedAt || !dayLog.weights || !dayLog.exerciseNames) return;
    Object.entries(dayLog.exerciseNames).forEach(([key, name]) => {
      if (name === exerciseName && dayLog.weights[key]) {
        const d = new Date(dayLog.completedAt);
        if (!lastDate || d > lastDate) {
          lastDate = d;
          lastWeight = dayLog.weights[key];
        }
      }
    });
  });
  return lastWeight;
}

function WeightLogger({ id, color, lastWeight, onSave, setLabel }) {
  const [mode, setMode] = useState("lbs");
  const [plates, setPlates] = useState(lastWeight?.plates || []);
  const [lbs, setLbs] = useState(lastWeight?.lbs || "");

  const togglePlate = (p) => {
    const arr = [...plates];
    const i = arr.indexOf(p);
    if (i >= 0) arr.splice(i, 1); else arr.push(p);
    setPlates(arr);
    onSave({ plates: arr, lbs });
  };

  const total = plates.reduce((a, b) => a + b, 0);
  const display = mode === "plates" ? (plates.length > 0 ? `${total}lb` : null) : (lbs ? `${lbs}lb` : null);

  return (
    <div style={{ marginTop: 8, background: "#0d0d0d", border: `1px solid ${color}22`, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 2, color: "#555", textTransform: "uppercase" }}>{setLabel}</span>
        {lastWeight && (
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#f59e0b" }}>
            ↑ Last: <strong>{lastWeight.lbs ? `${lastWeight.lbs}lb` : lastWeight.plates?.length > 0 ? `${lastWeight.plates.reduce((a,b)=>a+b,0)}lb` : "—"}</strong>
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {["lbs", "plates"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ background: mode === m ? color + "33" : "transparent", border: `1px solid ${mode === m ? color : "#2a2a2a"}`, color: mode === m ? color : "#555", borderRadius: 6, padding: "3px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>{m === "plates" ? "Plates" : "lbs"}</button>
        ))}
        {display && <div style={{ marginLeft: "auto", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#10b981", alignSelf: "center" }}>{display} ✓</div>}
      </div>
      {mode === "plates" ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PLATES.map(p => {
            const cnt = plates.filter(x => x === p).length;
            return (
              <button key={p} onClick={() => togglePlate(p)} style={{ background: cnt > 0 ? color + "22" : "#1a1a1a", border: `1px solid ${cnt > 0 ? color : "#2a2a2a"}`, color: cnt > 0 ? color : "#555", borderRadius: 8, padding: "6px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", position: "relative", minWidth: 44, textAlign: "center" }}>
                {p}{cnt > 1 && <span style={{ position: "absolute", top: -6, right: -6, background: color, color: "#000", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{cnt}</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="number" placeholder="0" value={lbs} onChange={e => { setLbs(e.target.value); onSave({ plates, lbs: e.target.value }); }} style={{ background: "#1a1a1a", border: `1px solid ${color}44`, color: "#fff", borderRadius: 8, padding: "6px 12px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, width: 80, textAlign: "center", outline: "none" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#555" }}>lb</span>
        </div>
      )}
    </div>
  );
}

function SetDot({ done, onClick, color }) {
  return (
    <div onClick={onClick} style={{ width: 28, height: 28, borderRadius: "50%", cursor: "pointer", border: `2px solid ${done ? color : "#333"}`, background: done ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
      {done && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  );
}

function WorkoutView({ dayNum, workout, data, onUpdate, onBack, onComplete, allLogs }) {
  const [timer, setTimer] = useState(null);

  const toggleSet = (blockIdx, exIdx, setIdx) => {
    const next = JSON.parse(JSON.stringify(data));
    if (!next.sets) next.sets = {};
    const key = `${blockIdx}-${exIdx}`;
    const numSets = workout.blocks[blockIdx].exercises[exIdx].sets || 1;
    const arr = [...(next.sets[key] || Array(numSets).fill(false))];
    arr[setIdx] = !arr[setIdx];
    next.sets[key] = arr;
    onUpdate(next);
  };

  const saveWeight = (blockIdx, exIdx, setIdx, w) => {
    const next = JSON.parse(JSON.stringify(data));
    if (!next.weights) next.weights = {};
    if (!next.exerciseNames) next.exerciseNames = {};
    const key = `${blockIdx}-${exIdx}-${setIdx}`;
    next.weights[key] = w;
    // Save exercise name for cross-day lookup
    next.exerciseNames[key] = workout.blocks[blockIdx].exercises[exIdx].name;
    onUpdate(next);
  };

  const totalSets = workout.blocks.reduce((a, b) => a + b.exercises.reduce((c, ex) => c + (ex.sets || 1), 0), 0);
  const doneSets = workout.blocks.reduce((a, b, bi) => a + b.exercises.reduce((c, ex, ei) => {
    const numSets = ex.sets || 1;
    const arr = (data.sets || {})[`${bi}-${ei}`] || [];
    return c + arr.slice(0, numSets).filter(Boolean).length;
  }, 0), 0);
  const progress = Math.round((doneSets / totalSets) * 100);
  const allDone = doneSets === totalSets;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "'Barlow', sans-serif", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 16px", background: "linear-gradient(180deg, #111 0%, #080808 100%)", borderBottom: "1px solid #141414", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#555", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: 3, cursor: "pointer", textTransform: "uppercase", marginBottom: 12, padding: 0 }}>← Back</button>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 2, textTransform: "uppercase" }}>Day {dayNum} · {workout.subtitle}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, fontWeight: 900, letterSpacing: 1, lineHeight: 1 }}>{workout.title}</div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#555", letterSpacing: 2 }}>PROGRESS</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: allDone ? "#10b981" : "#3b82f6", letterSpacing: 2 }}>{progress}%</span>
            </div>
            <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: allDone ? "#10b981" : "linear-gradient(90deg, #3b82f6, #a855f7)", borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 0" }}>
        {/* Banner */}
        {workout.banner && (
          <div style={{ background: workout.banner.color + "15", border: `1px solid ${workout.banner.color}33`, borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: workout.banner.color, letterSpacing: 2, marginBottom: 4 }}>KEY CUE</div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#888", lineHeight: 1.5 }}>{workout.banner.text}</div>
          </div>
        )}

        {/* Blocks */}
        {workout.blocks.map((block, bi) => {
          const blockDone = block.exercises.every((ex, ei) => {
            const arr = (data.sets || {})[`${bi}-${ei}`] || [];
            return arr[0] === true;
          });
          return (
            <div key={bi} style={{ marginBottom: 20, background: "#0a0a0a", border: `1px solid ${blockDone ? block.color + "55" : "#1a1a1a"}`, borderRadius: 16, overflow: "hidden", transition: "border-color 0.3s" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #141414", display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg, ${block.color}18 0%, transparent 100%)` }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: block.color }} />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 3, color: block.color, textTransform: "uppercase" }}>{block.label}</span>
                  </div>
                  {block.rest && <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#555", marginLeft: 18, marginTop: 2 }}>{block.rest}s rest between sets</div>}
                </div>
                {block.rest && (
                  <button onClick={() => setTimer({ secs: block.rest, label: block.label })} style={{ background: block.color + "22", border: `1px solid ${block.color}55`, color: block.color, borderRadius: 8, padding: "5px 12px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>⏱ Rest</button>
                )}
              </div>
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {block.exercises.map((ex, ei) => {
                  const numSets = ex.sets || 1;
                  const setArr = (data.sets || {})[`${bi}-${ei}`] || Array(numSets).fill(false);
                  const allSetsDone = setArr.length >= numSets && setArr.slice(0, numSets).every(Boolean);
                  const someSetsDone = setArr.some(Boolean);
                  const lastWeight = ex.tracked ? findLastWeight(allLogs, ex.name) : null;
                  const repsPerSet = ex.repsPerSet || Array(numSets).fill(ex.reps || null);
                  return (
                    <div key={ei} style={{ background: allSetsDone ? `${block.color}10` : "#0d0d0d", border: `1px solid ${allSetsDone ? block.color + "44" : someSetsDone ? block.color + "22" : "#1a1a1a"}`, borderRadius: 12, padding: "13px 16px", transition: "all 0.3s" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 600, color: allSetsDone ? "#555" : "#e5e5e5", letterSpacing: 0.5, textDecoration: allSetsDone ? "line-through" : "none", transition: "all 0.3s" }}>{ex.name}</div>
                          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#444", marginTop: 3, lineHeight: 1.5 }}>{ex.detail}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, marginTop: 2 }}>
                          {Array(numSets).fill(0).map((_, si) => (
                            <div key={si} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                              {repsPerSet[si] && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#555", letterSpacing: 1 }}>{repsPerSet[si]}r</span>}
                              <SetDot done={!!setArr[si]} color={block.color} onClick={() => toggleSet(bi, ei, si)} />
                            </div>
                          ))}
                        </div>
                      </div>
                      {ex.tracked && (
                        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                          {Array(numSets).fill(0).map((_, si) => (
                            <WeightLogger
                              key={si}
                              id={`${bi}-${ei}-${si}`}
                              color={block.color}
                              lastWeight={si === 0 ? lastWeight : (data.weights || {})[`${bi}-${ei}-${si}`] || lastWeight}
                              setLabel={`Set ${si + 1}${repsPerSet[si] ? ` · ${repsPerSet[si]} reps` : ""}`}
                              onSave={w => saveWeight(bi, ei, si, w)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Complete button */}
        {allDone && !data.completedAt && (
          <button onClick={() => { onComplete(); }} style={{ width: "100%", background: "linear-gradient(135deg, #10b981, #059669)", border: "none", color: "#000", borderRadius: 14, padding: "18px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 900, letterSpacing: 4, cursor: "pointer", textTransform: "uppercase", marginBottom: 16 }}>
            ✓ Mark Day {dayNum} Complete
          </button>
        )}

        {data.completedAt && (
          <div style={{ textAlign: "center", padding: "24px 20px", border: "1px solid #10b98133", borderRadius: 14, background: "#10b98108", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: "#10b981", letterSpacing: 3 }}>🔥 DAY {dayNum} COMPLETE</div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#555", marginTop: 6 }}>Logged {new Date(data.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
          </div>
        )}
      </div>

      {timer && <RestTimer seconds={timer.secs} label={timer.label} onClose={() => setTimer(null)} />}
    </div>
  );
}

function StatsView({ logs, onBack }) {
  const completed = Object.entries(logs).filter(([, d]) => d.completedAt);
  const totalDays = completed.length;

  // Group by month
  const byMonth = {};
  completed.forEach(([day, d]) => {
    const date = new Date(d.completedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push({ day, date });
  });

  const months = Object.keys(byMonth).sort().reverse();

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "'Barlow', sans-serif", paddingBottom: 60 }}>
      <div style={{ padding: "28px 20px 16px", background: "linear-gradient(180deg, #111 0%, #080808 100%)", borderBottom: "1px solid #141414", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#555", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: 3, cursor: "pointer", textTransform: "uppercase", marginBottom: 12, padding: 0 }}>← Back</button>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, fontWeight: 900, letterSpacing: 1 }}>PROGRESS</div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 0" }}>
        {/* Total */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "TOTAL DAYS", value: totalDays, color: "#10b981" },
            { label: "THIS MONTH", value: byMonth[Object.keys(byMonth).sort().reverse()[0]]?.length || 0, color: "#3b82f6" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#0a0a0a", border: `1px solid ${color}33`, borderRadius: 14, padding: "20px 18px" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 42, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#555", letterSpacing: 3, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Monthly breakdown */}
        {months.map(month => {
          const days = byMonth[month];
          const [year, mo] = month.split("-");
          const label = new Date(+year, +mo - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
          return (
            <div key={month} style={{ marginBottom: 20, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #141414", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: 2 }}>{label.toUpperCase()}</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#10b981", letterSpacing: 1 }}>{days.length} sessions</span>
              </div>
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                {days.sort((a, b) => +a.day - +b.day).map(({ day, date }) => (
                  <div key={day} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#111", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#e5e5e5", letterSpacing: 1 }}>Day {day} — {WORKOUTS[day]?.title || "Workout"}</span>
                    </div>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#555" }}>{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {totalDays === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#333" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, letterSpacing: 3 }}>NO SESSIONS LOGGED YET</div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, marginTop: 8 }}>Complete a workout to start tracking</div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickLogCard({ onLog, recentWalks }) {
  const [mins, setMins] = useState("20");
  const [feel, setFeel] = useState(null);
  const [logged, setLogged] = useState(false);

  const FEELS = [
    { label: "Easy", color: "#10b981", emoji: "😌" },
    { label: "Good", color: "#3b82f6", emoji: "💪" },
    { label: "Hard", color: "#f59e0b", emoji: "🔥" },
    { label: "Brutal", color: "#ef4444", emoji: "💀" },
  ];

  const handleLog = () => {
    if (!mins) return;
    onLog(+mins, feel);
    setLogged(true);
    setTimeout(() => setLogged(false), 2500);
  };

  const todayWalks = recentWalks.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div style={{ marginBottom: 24, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #141414", background: "linear-gradient(135deg, #ef444418 0%, transparent 100%)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#ef4444", textTransform: "uppercase" }}>Quick Log</span>
        </div>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#555" }}>Incline walk · cardio · active recovery</span>
      </div>
      <div style={{ padding: "14px 16px" }}>
        {logged ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: "#10b981", letterSpacing: 3 }}>✓ LOGGED</div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#555", marginTop: 4 }}>Nice work. Keep it up.</div>
          </div>
        ) : (
          <>
            {/* Duration */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 8, textTransform: "uppercase" }}>Duration</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["10", "15", "20", "30", "45"].map(m => (
                  <button key={m} onClick={() => setMins(m)} style={{ flex: 1, background: mins === m ? "#ef444422" : "#111", border: `1px solid ${mins === m ? "#ef4444" : "#222"}`, color: mins === m ? "#ef4444" : "#555", borderRadius: 8, padding: "8px 4px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{m}m</button>
                ))}
              </div>
            </div>

            {/* Feel */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 8, textTransform: "uppercase" }}>How'd it feel? <span style={{ color: "#333" }}>(optional)</span></div>
              <div style={{ display: "flex", gap: 8 }}>
                {FEELS.map(f => (
                  <button key={f.label} onClick={() => setFeel(feel === f.label ? null : f.label)} style={{ flex: 1, background: feel === f.label ? f.color + "22" : "#111", border: `1px solid ${feel === f.label ? f.color : "#222"}`, color: feel === f.label ? f.color : "#555", borderRadius: 8, padding: "8px 4px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 16 }}>{f.emoji}</div>
                    <div style={{ letterSpacing: 1, marginTop: 2 }}>{f.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleLog} style={{ width: "100%", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", color: "#fff", borderRadius: 10, padding: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 3, cursor: "pointer", textTransform: "uppercase" }}>
              Log {mins}min Walk
            </button>
          </>
        )}

        {/* Today's walks */}
        {todayWalks.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #141414" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#333", marginBottom: 6, textTransform: "uppercase" }}>Today</div>
            {todayWalks.map(w => (
              <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#555" }}>🚶 {w.mins} min incline walk</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#333" }}>{w.feel || ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function MasterApp() {
  const [appData, setAppData] = useState(loadData);
  const [screen, setScreen] = useState("home"); // home | workout | stats
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const unlock = () => { unlockAudio(); document.removeEventListener("touchstart", unlock); };
    document.addEventListener("touchstart", unlock);
    return () => document.removeEventListener("touchstart", unlock);
  }, []);

  const updateDayData = (day, data) => {
    const next = { ...appData, logs: { ...appData.logs, [day]: data } };
    setAppData(next);
    saveData(next);
  };

  const completeDay = (day) => {
    const existing = appData.logs[day] || {};
    updateDayData(day, { ...existing, completedAt: new Date().toISOString() });
  };

  const logWalk = (mins, feel) => {
    const key = `walk_${Date.now()}`;
    const next = {
      ...appData,
      walks: [...(appData.walks || []), {
        id: key, mins, feel,
        date: new Date().toISOString(),
      }]
    };
    setAppData(next);
    saveData(next);
  };

  const totalWalks = (appData.walks || []).length;

  const availableDays = Object.keys(WORKOUTS).map(Number).sort((a, b) => a - b);
  const completedDays = Object.entries(appData.logs).filter(([, d]) => d.completedAt).map(([d]) => +d);
  const totalDone = completedDays.length;

  if (screen === "workout" && activeDay && WORKOUTS[activeDay]) {
    return (
      <WorkoutView
        dayNum={activeDay}
        workout={WORKOUTS[activeDay]}
        data={appData.logs[activeDay] || {}}
        onUpdate={data => updateDayData(activeDay, data)}
        onBack={() => setScreen("home")}
        onComplete={() => completeDay(activeDay)}
        allLogs={appData.logs}
      />
    );
  }

  if (screen === "stats") {
    return <StatsView logs={appData.logs} onBack={() => setScreen("home")} />;
  }

  // HOME
  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "'Barlow', sans-serif", paddingBottom: 80 }}>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ padding: "36px 20px 24px", background: "linear-gradient(180deg, #0f0f0f 0%, #080808 100%)", borderBottom: "1px solid #111" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 5, color: "#555", marginBottom: 4, textTransform: "uppercase" }}>LO Ninja · Fat Loss Program</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 900, letterSpacing: 1, lineHeight: 1, marginBottom: 4 }}>MASTER TRACKER</div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#444" }}>Weights save between sessions · progress tracked automatically</div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            {[
              { label: "WORKOUTS", value: totalDone, color: "#10b981" },
              { label: "WALKS", value: totalWalks, color: "#ef4444" },
              { label: "TOTAL", value: totalDone + totalWalks, color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, background: "#0d0d0d", border: `1px solid ${color}22`, borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#444", letterSpacing: 3, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Quick Log Card */}
        <QuickLogCard onLog={logWalk} recentWalks={appData.walks || []} />

        {/* Available workouts */}
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: 4, color: "#555", marginBottom: 14, textTransform: "uppercase" }}>Your Workouts</div>

        {availableDays.map((day, idx) => {
          const w = WORKOUTS[day];
          const log = appData.logs[day] || {};
          const isDone = !!log.completedAt;
          const inProgress = !isDone && Object.keys(log.sets || {}).length > 0;
          const totalEx = w.blocks.reduce((a, b) => a + b.exercises.reduce((c, ex) => c + (ex.sets || 1), 0), 0);
          const doneEx = w.blocks.reduce((a, b, bi) => a + b.exercises.reduce((c, ex, ei) => {
            const numSets = ex.sets || 1;
            const arr = (log.sets || {})[`${bi}-${ei}`] || [];
            return c + arr.slice(0, numSets).filter(Boolean).length;
          }, 0), 0);
          const pct = totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : 0;

          return (
            <div key={day} onClick={() => { setActiveDay(day); setScreen("workout"); }} style={{ marginBottom: 12, background: isDone ? "#0d0d0d" : "#0a0a0a", border: `1px solid ${isDone ? "#10b98133" : "#1a1a1a"}`, borderRadius: 16, padding: "16px 18px", cursor: "pointer", animation: `fadeUp 0.3s ease ${idx * 0.05}s both`, transition: "border-color 0.2s, transform 0.15s", position: "relative", overflow: "hidden" }}>
              {isDone && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #10b981, #059669)" }} />}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: isDone ? "#10b981" : w.tagColor, border: `1px solid ${isDone ? "#10b98133" : w.tagColor + "33"}`, borderRadius: 4, padding: "2px 8px", textTransform: "uppercase" }}>{isDone ? "COMPLETE" : w.tag}</span>
                    {inProgress && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 2, color: "#f59e0b" }}>IN PROGRESS</span>}
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: isDone ? "#555" : "#e5e5e5", letterSpacing: 1, lineHeight: 1 }}>DAY {day} — {w.title}</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#444", marginTop: 4 }}>{w.subtitle}</div>
                  {isDone && <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#10b981", marginTop: 6 }}>Completed {new Date(log.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: isDone ? "#10b981" : "#222", letterSpacing: 1 }}>{isDone ? "✓" : `${day}`}</div>
              </div>
              {inProgress && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #3b82f6, #a855f7)", borderRadius: 2 }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Upcoming */}
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: 4, color: "#333", marginTop: 8, marginBottom: 14, textTransform: "uppercase" }}>Coming Soon</div>
        {UPCOMING.map(u => (
          <div key={u.day} style={{ marginBottom: 10, background: "#060606", border: "1px solid #111", borderRadius: 16, padding: "16px 18px", opacity: 0.5 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#444", marginBottom: 4, textTransform: "uppercase" }}>{u.tag}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: "#333", letterSpacing: 1 }}>DAY {u.day} — {u.title}</div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#333", marginTop: 3 }}>{u.subtitle}</div>
          </div>
        ))}

        {/* Stats button */}
        <button onClick={() => setScreen("stats")} style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a", color: "#888", borderRadius: 14, padding: "16px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 4, cursor: "pointer", textTransform: "uppercase", marginTop: 8 }}>
          📊 View Progress & Stats
        </button>
      </div>
    </div>
  );
}
