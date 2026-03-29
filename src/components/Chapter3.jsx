import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Constants ─── */
const GRID_MAX = 12;
const PAD = 10;
const RANGE = 100 - PAD * 2;

const clamp = (v) => Math.max(0, Math.min(GRID_MAX, v));
const toLeft = (v) => `${PAD + (clamp(v) / GRID_MAX) * RANGE}%`;
const toBottom = (v) => `${PAD + (clamp(v) / GRID_MAX) * RANGE}%`;
const toLeftNum = (v) => PAD + (clamp(v) / GRID_MAX) * RANGE;
const toTopNum = (v) => 100 - (PAD + (clamp(v) / GRID_MAX) * RANGE);

/* ─── Vector math ─── */
const mag = (v) => Math.hypot(v.x, v.y);
const dot = (a, b) => a.x * b.x + a.y * b.y;
const cosine = (a, b) => {
  const ma = mag(a), mb = mag(b);
  if (ma === 0 || mb === 0) return 0;
  return Math.max(-1, Math.min(1, dot(a, b) / (ma * mb)));
};
const angleDeg = (a, b) => (Math.acos(cosine(a, b)) * 180) / Math.PI;
const euclidean = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/* ─── Animation stage data ─── */
const QUERY_VEC = { x: 4, y: 4, label: 'Query: Smart Cooking', color: '#2563eb' };
const DOC_A = { x: 6, y: 2, label: 'Doc A: Tech News', color: '#ef4444' };
const DOC_B = { x: 10, y: 10, label: 'Doc B: Smart Kitchen Encyclopedia', color: '#10b981' };

/* ─── Interactive stage documents ─── */
const DOCUMENTS = [
  { id: 1, x: 2, y: 10, label: '100 Best Pizza Recipes', short: 'Pizza Recipes', color: '#f59e0b' },
  { id: 2, x: 11, y: 1, label: 'Laptop Buying Guide', short: 'Laptop Guide', color: '#6366f1' },
  { id: 3, x: 5, y: 5, label: 'Quick Smart Fridge Review', short: 'Fridge Review', color: '#0ea5e9' },
  { id: 4, x: 9, y: 9, label: 'The Ultimate Guide to IoT Kitchens', short: 'IoT Kitchens', color: '#10b981' },
  { id: 5, x: 1, y: 0.5, label: 'List of City Parks', short: 'City Parks', color: '#94a3b8' },
];

/* ─── Main Component ─── */
export default function Chapter3({ onBackToCover }) {
  const [stage, setStage] = useState('intro');

  return (
    <section className={`chapter chapter-3${stage === 'intro' ? ' stage-intro-active' : ''}`}>
      <div className="chapter-header">
        <div className="chapter-label">Chapter 3</div>
        <h2 className="chapter-title">A Vector Becomes Similarity</h2>
      </div>

      {stage === 'intro' && <IntroStage onContinue={() => setStage('animation')} />}
      {stage === 'animation' && <AnimationStage onContinue={() => setStage('interactive')} />}
      {stage === 'interactive' && <InteractiveStage onContinue={() => setStage('reflection')} />}
      {stage === 'reflection' && (
        <ReflectionStage
          onBackToCover={onBackToCover}
        />
      )}
    </section>
  );
}

/* ─── Intro ─── */
function IntroStage({ onContinue }) {
  return (
    <div className="chapter-content">
      <motion.div className="intro-hero"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <motion.span className="intro-hero-number"
          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}>03</motion.span>
        <motion.div className="intro-hero-line"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
        <motion.h3 className="intro-hero-title"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}>From Vectors to Relevance</motion.h3>
        <motion.p className="intro-hero-body"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}>
          The machine now has a query vector and many document vectors.
          The natural intuition says: the closest tip wins.
        </motion.p>
        <motion.p className="intro-hero-sub"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}>
          Let&apos;s test that assumption — and discover what the machine really uses.
        </motion.p>
        <motion.button className="intro-hero-btn" onClick={onContinue}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          Begin the Demonstration
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ─── Animation Stage: Angle Beats Distance ─── */
function AnimationStage({ onContinue }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setPhase(1), 2200));
    timers.push(setTimeout(() => setPhase(2), 5400));
    timers.push(setTimeout(() => setPhase(3), 9000));
    return () => timers.forEach(clearTimeout);
  }, []);

  const distAQ = euclidean(QUERY_VEC, DOC_A).toFixed(1);
  const distBQ = euclidean(QUERY_VEC, DOC_B).toFixed(1);
  const angleAQ = angleDeg(QUERY_VEC, DOC_A).toFixed(1);
  const angleBQ = angleDeg(QUERY_VEC, DOC_B).toFixed(1);

  return (
    <motion.div className="ch3-stage-wrapper ch3-anim-layout"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="ch3-anim-left">
        <div className="ch3-stage-header" style={{ textAlign: 'left' }}>
          <span className="ch3-stage-badge">Demonstrate</span>
        
          <p className="ch3-stage-subtitle">Watch how the machine ranks two documents against one query &mdash; proximity can be deceiving.</p>
        </div>

        <div className="ch3-narration-stack">
          {/* Phase 0 — Query */}
          <motion.div className="ch3-narration-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <span className="ch3-narration-badge" style={{ background: QUERY_VEC.color }}>Query</span>
            <p>&ldquo;Smart Cooking&rdquo; &mdash; a short vector combining Tech and Food.</p>
          </motion.div>

          {/* Phase 1 — Doc A */}
          {phase >= 1 && (
            <motion.div className="ch3-narration-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="ch3-narration-badge" style={{ background: DOC_A.color }}>Doc A</span>
              <p>Physically close (dist: {distAQ}) but pointing another way (angle: {angleAQ}&deg;).</p>
            </motion.div>
          )}

          {/* Phase 2 — Doc B */}
          {phase >= 2 && (
            <motion.div className="ch3-narration-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="ch3-narration-badge" style={{ background: DOC_B.color }}>Doc B</span>
              <p>Farther away (dist: {distBQ}) but points in the <strong>same direction</strong> (angle: {angleBQ}&deg;).</p>
            </motion.div>
          )}

          {/* Phase 3 — Result */}
          {phase >= 3 && (
            <motion.div className="ch3-narration-card ch3-result-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="ch3-result-title">The Ranking</p>
              <div className="ch3-rank-row">
                <span className="ch3-rank">#1</span>
                <span className="ch3-rank-dot" style={{ background: DOC_B.color }} />
                <span>Doc B &mdash; Same direction</span>
              </div>
              <div className="ch3-rank-row">
                <span className="ch3-rank">#2</span>
                <span className="ch3-rank-dot" style={{ background: DOC_A.color }} />
                <span>Doc A &mdash; Close but misaligned</span>
              </div>
              <p className="ch3-result-insight">
                Search engines measure the <strong>angle</strong>, not the distance. A long book and a short
                sentence can mean the exact same thing if their vectors align.
              </p>
            </motion.div>
          )}
        </div>

      </div>

      <div className="ch3-anim-right">
        <div className="coordinate-grid interactive ch3-grid">
          <div className="axis x-axis"><span className="axis-label">Technology</span></div>
          <div className="axis y-axis"><span className="axis-label">Food</span></div>
          <div className="grid-lines" />

          <div className="match-origin-dot" style={{ left: `${PAD}%`, bottom: `${PAD}%` }} />

          <svg className="ch3-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Query vector — always visible */}
            <motion.line
              x1={toLeftNum(0)} y1={toTopNum(0)}
              x2={toLeftNum(QUERY_VEC.x)} y2={toTopNum(QUERY_VEC.y)}
              stroke={QUERY_VEC.color} strokeWidth="0.8"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Doc A vector + distance dashed line + angle arc */}
            {phase >= 1 && (
              <>
                <motion.line
                  x1={toLeftNum(0)} y1={toTopNum(0)}
                  x2={toLeftNum(DOC_A.x)} y2={toTopNum(DOC_A.y)}
                  stroke={DOC_A.color} strokeWidth="0.7"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1 }}
                />
                <motion.line
                  x1={toLeftNum(QUERY_VEC.x)} y1={toTopNum(QUERY_VEC.y)}
                  x2={toLeftNum(DOC_A.x)} y2={toTopNum(DOC_A.y)}
                  stroke="rgba(239,68,68,0.45)" strokeWidth="0.4" strokeDasharray="1.2 0.8"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.7 }}
                />
                <motion.text
                  x={(toLeftNum(QUERY_VEC.x) + toLeftNum(DOC_A.x)) / 2}
                  y={(toTopNum(QUERY_VEC.y) + toTopNum(DOC_A.y)) / 2 - 1.5}
                  fill="#ef4444" fontSize="2.8" textAnchor="middle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  dist: {distAQ}
                </motion.text>
                <motion.path
                  d={`M ${toLeftNum(0) + 5},${toTopNum(0)} A 5 5 0 0 1 ${toLeftNum(0) + 3.5},${toTopNum(0) - 3.5}`}
                  fill="none" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="0.8 0.5"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ delay: 1.0, duration: 0.8 }}
                />
                <motion.text
                  x={toLeftNum(0) + 8} y={toTopNum(0) - 1}
                  fill="#ef4444" fontSize="2.4" fontWeight="600"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                >
                  {angleAQ}&deg;
                </motion.text>
              </>
            )}

            {/* Doc B vector + angle arc */}
            {phase >= 2 && (
              <>
                <motion.line
                  x1={toLeftNum(0)} y1={toTopNum(0)}
                  x2={toLeftNum(DOC_B.x)} y2={toTopNum(DOC_B.y)}
                  stroke={DOC_B.color} strokeWidth="0.7"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.path
                  d={`M ${toLeftNum(0) + 4},${toTopNum(0)} A 4 4 0 0 1 ${toLeftNum(0) + 2.8},${toTopNum(0) - 2.8}`}
                  fill="none" stroke="#10b981" strokeWidth="0.6"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 1.0, duration: 1.2 }}
                />
                <motion.text
                  x={toLeftNum(0) + 6.5} y={toTopNum(0) - 4}
                  fill="#10b981" fontSize="2.6" fontWeight="700"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                >
                  {angleBQ}&deg;
                </motion.text>
              </>
            )}

            {/* Winner highlight */}
            {phase >= 3 && (
              <motion.line
                x1={toLeftNum(0)} y1={toTopNum(0)}
                x2={toLeftNum(DOC_B.x)} y2={toTopNum(DOC_B.y)}
                stroke="#10b981" strokeWidth="1.6" opacity="0.5"
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                transition={{ duration: 0.8 }}
              />
            )}
          </svg>

          {/* Vector tip labels */}
          <motion.div className="ch3-vec-label" style={{ left: toLeft(QUERY_VEC.x), bottom: toBottom(QUERY_VEC.y), color: QUERY_VEC.color }}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
            {QUERY_VEC.label}
          </motion.div>
          {phase >= 1 && (
            <motion.div className="ch3-vec-label" style={{ left: toLeft(DOC_A.x), bottom: toBottom(DOC_A.y), color: DOC_A.color }}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
              {DOC_A.label}
            </motion.div>
          )}
          {phase >= 2 && (
            <motion.div className="ch3-vec-label" style={{ left: toLeft(DOC_B.x), bottom: toBottom(DOC_B.y), color: DOC_B.color }}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
              {DOC_B.label}
            </motion.div>
          )}

          {/* Tip dots */}
          <div className="ch3-tip-dot" style={{ left: toLeft(QUERY_VEC.x), bottom: toBottom(QUERY_VEC.y), background: QUERY_VEC.color }} />
          {phase >= 1 && <div className="ch3-tip-dot" style={{ left: toLeft(DOC_A.x), bottom: toBottom(DOC_A.y), background: DOC_A.color }} />}
          {phase >= 2 && <div className="ch3-tip-dot" style={{ left: toLeft(DOC_B.x), bottom: toBottom(DOC_B.y), background: DOC_B.color }} />}

          {/* Winner ring */}
          {phase >= 3 && (
            <motion.div
              style={{
                position: 'absolute', left: toLeft(DOC_B.x), bottom: toBottom(DOC_B.y),
                width: 22, height: 22, borderRadius: '50%',
                border: '2px solid #10b981',
                transform: 'translate(-11px, 11px)',
                pointerEvents: 'none'
              }}
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </div>

        {phase >= 3 && (
          <motion.button className="intro-hero-btn" onClick={onContinue}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            Try the Search Engine Simulator
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Interactive Stage: Search Engine Simulator ─── */
const TASKS = [
  { id: 1, target: 4, label: 'Make "IoT Kitchens" rank #1', hint: 'Aim toward high Tech + high Food.' },
  { id: 2, target: 5, label: 'Make "City Parks" rank #1', hint: 'Aim toward the bottom-left corner — low on both axes.' },
];

function InteractiveStage({ onContinue }) {
  const gridRef = useRef(null);
  const [queryPos, setQueryPos] = useState({ x: 6, y: 6 });
  const [locked, setLocked] = useState(false);
  const [taskIdx, setTaskIdx] = useState(0);
  const [taskDone, setTaskDone] = useState([false, false]);

  const currentTask = TASKS[taskIdx];
  const allDone = taskDone.every(Boolean);

  const ranked = useMemo(() => {
    return DOCUMENTS
      .map((doc) => ({
        ...doc,
        similarity: cosine(queryPos, { x: doc.x, y: doc.y }),
        angle: angleDeg(queryPos, { x: doc.x, y: doc.y }),
      }))
      .sort((a, b) => b.similarity - a.similarity);
  }, [queryPos]);

  /* Check if current task target is #1 */
  useEffect(() => {
    if (!locked) return;
    if (ranked[0]?.id === currentTask.target && !taskDone[taskIdx]) {
      setTaskDone((prev) => { const next = [...prev]; next[taskIdx] = true; return next; });
    }
  }, [ranked, locked, currentTask.target, taskIdx, taskDone]);

  const handleMouseMove = useCallback((e) => {
    if (locked) return;
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const bottomPct = 100 - yPct;
    const gx = ((xPct - PAD) / RANGE) * GRID_MAX;
    const gy = ((bottomPct - PAD) / RANGE) * GRID_MAX;
    setQueryPos({ x: Math.max(0.5, Math.min(GRID_MAX, gx)), y: Math.max(0.5, Math.min(GRID_MAX, gy)) });
  }, [locked]);

  const handleClick = useCallback(() => {
    setLocked((prev) => !prev);
  }, []);

  const handleNextTask = () => {
    if (taskIdx < TASKS.length - 1) {
      setTaskIdx(taskIdx + 1);
      setLocked(false);
    }
  };

  /* Cone geometry */
  const qAngle = Math.atan2(queryPos.y, queryPos.x);
  const coneHalf = (20 * Math.PI) / 180;
  const coneLen = 14;
  const cone1 = { x: Math.cos(qAngle - coneHalf) * coneLen, y: Math.sin(qAngle - coneHalf) * coneLen };
  const cone2 = { x: Math.cos(qAngle + coneHalf) * coneLen, y: Math.sin(qAngle + coneHalf) * coneLen };

  return (
    <motion.div className="ch3-stage-wrapper ch3-sim-layout"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="ch3-sim-left">
        <div className="ch3-stage-header" style={{ textAlign: 'left' }}>
          <span className="ch3-stage-badge">Interactive</span>
          <h3 className="ch3-stage-title">Search Engine Simulator</h3>
          <p className="ch3-stage-subtitle">Move your mouse over the grid &mdash; click to <strong>lock</strong> the vector, click again to <strong>unlock</strong>.</p>
        </div>

        {/* Task progress pills */}
        <div className="ch3-task-pills">
          {TASKS.map((t, i) => (
            <span key={t.id} className={`ch3-task-pill${taskDone[i] ? ' done' : i === taskIdx ? ' active' : ''}`}>
              {taskDone[i] && <svg width="12" height="12" viewBox="0 0 18 18" fill="none"><path d="M4 9l4 4 6-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              Task {t.id}
            </span>
          ))}
        </div>

        {/* Task card */}
        <div className="ch3-task-card">
          <p className="ch3-task-label">Task {currentTask.id} of {TASKS.length}</p>
          <p className="ch3-task-goal"><strong>{currentTask.label}</strong></p>
          <p className="ch3-task-hint">{currentTask.hint}</p>
          {taskDone[taskIdx] && (
            <motion.div className="ch3-task-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>{taskIdx < TASKS.length - 1 ? 'Done! Move on to the next task.' : 'Both tasks complete!'}</span>
            </motion.div>
          )}
          {taskDone[taskIdx] && !allDone && (
            <motion.button className="intro-hero-btn ch3-next-task-btn" onClick={handleNextTask}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Next Task
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.button>
          )}
        </div>

        {/* Lock status */}
        <div className={`ch3-lock-status${locked ? ' locked' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            {locked ? (
              <><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>
            ) : (
              <><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7a5 5 0 019.9-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>
            )}
          </svg>
          {locked ? 'Vector locked \u2014 click grid to unlock' : 'Moving \u2014 click grid to lock'}
        </div>

        {/* Leaderboard */}
        <div className="ch3-leaderboard">
          <p className="ch3-leaderboard-title">Live Ranking</p>
          <AnimatePresence>
            {ranked.map((doc, i) => (
              <motion.div
                key={doc.id}
                className={`ch3-leaderboard-row${i === 0 ? ' top' : ''}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              >
                <span className="ch3-lb-rank">#{i + 1}</span>
                <span className="ch3-lb-dot" style={{ background: doc.color }} />
                <span className="ch3-lb-name">{doc.short}</span>
                <span className="ch3-lb-score">{doc.similarity.toFixed(3)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      <div className="ch3-sim-right">
        <div
          className="coordinate-grid interactive ch3-grid"
          ref={gridRef}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ cursor: locked ? 'pointer' : 'crosshair' }}
        >
          <div className="axis x-axis"><span className="axis-label">Technology</span></div>
          <div className="axis y-axis"><span className="axis-label">Food</span></div>
          <div className="grid-lines" />

          <div className="ch3-formula-box">
            <p className="ch3-formula-label">Cosine Similarity</p>
            <div className="ch3-formula-math">
              <span className="ch3-formula-cos">cos(<i>&theta;</i>)</span>
              <span className="ch3-formula-eq">=</span>
              <span className="ch3-formula-frac">
                <span className="ch3-frac-num"><b>A</b> &middot; <b>B</b></span>
                <span className="ch3-frac-den">&#x2016;<b>A</b>&#x2016; &#x2016;<b>B</b>&#x2016;</span>
              </span>
            </div>
          </div>

          <div className="match-origin-dot" style={{ left: `${PAD}%`, bottom: `${PAD}%` }} />

          <svg className="ch3-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Similarity cone */}
            <polygon
              points={`${toLeftNum(0)},${toTopNum(0)} ${toLeftNum(cone1.x)},${toTopNum(cone1.y)} ${toLeftNum(cone2.x)},${toTopNum(cone2.y)}`}
              fill="rgba(37,99,235,0.06)"
              stroke="none"
            />

            {/* All 5 document vectors from origin */}
            {DOCUMENTS.map((doc) => (
              <line
                key={`vec-${doc.id}`}
                x1={toLeftNum(0)} y1={toTopNum(0)}
                x2={toLeftNum(doc.x)} y2={toTopNum(doc.y)}
                stroke={doc.color} strokeWidth="0.6" opacity="0.65"
              />
            ))}

            {/* Query vector */}
            <line
              x1={toLeftNum(0)} y1={toTopNum(0)}
              x2={toLeftNum(queryPos.x)} y2={toTopNum(queryPos.y)}
              stroke="#2563eb" strokeWidth="1"
            />
          </svg>

          {/* Document point labels */}
          {DOCUMENTS.map((doc) => (
            <div key={doc.id} className="ch3-doc-point" style={{ left: toLeft(doc.x), bottom: toBottom(doc.y) }}>
              <div className="ch3-doc-dot" style={{ background: doc.color }} />
              <span className="ch3-doc-name">{doc.short}</span>
            </div>
          ))}

          {/* Query dot with glow */}
          <div className="ch3-query-dot" style={{ left: toLeft(queryPos.x), bottom: toBottom(queryPos.y) }}>
            <div className={`ch3-query-glow${locked ? ' locked' : ''}`} />
          </div>
        </div>

        {/* Continue after all tasks */}
        {allDone && (
          <motion.button className="intro-hero-btn" onClick={onContinue}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            Continue to Reflection
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Reflection ─── */
function ReflectionStage({ onBackToCover }) {
  return (
    <motion.div className="ch3-stage-wrapper"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <div className="ch3-stage-header">
        <span className="ch3-stage-badge">Reflection</span>
        <h3 className="ch3-stage-title">You Just Built a Search Engine</h3>
        <p className="ch3-stage-subtitle">
          Three chapters, one idea: language is geometry. Here is how the
          pieces fit together.
        </p>
      </div>

      <div className="ch3-insight-grid">
        <motion.div className="ch3-insight-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h4>Chapter 1: Embeddings</h4>
          <p>
            Words are given precise coordinates in a semantic space. Each word occupies a unique position
            based on its meaning.
          </p>
        </motion.div>
        <motion.div className="ch3-insight-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h4>Chapter 2: Intent</h4>
          <p>
            Sentences are the average of their word positions, forming a single direction &mdash; your query
            vector that represents combined meaning.
          </p>
        </motion.div>
        <motion.div className="ch3-insight-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h4>Chapter 3: Similarity</h4>
          <p>
            Machines find answers by measuring which stored documents point in the same direction as
            your query &mdash; using cosine similarity, not endpoint distance.
          </p>
        </motion.div>
      </div>

      <motion.p className="ch3-stage-hint"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
        This is exactly how modern AI, like ChatGPT and Google Search, understands human language.
        It doesn&apos;t read words &mdash; it navigates geometry.
      </motion.p>

      <motion.button className="intro-hero-btn" onClick={onBackToCover}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        Thanks for Reading!
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>
    </motion.div>
  );
}
