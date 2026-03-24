import React, { useMemo, useState, useEffect, useRef } from 'react';

const ChapterSection = ({ title, children, className = '' }) => (
  <section className={`chapter-section ${className}`}>
    {title && <h3 className="section-title">{title}</h3>}
    {children}
  </section>
);

const modeLabels = {
  distance: 'Distance mode highlights endpoint proximity.',
  angle: 'Angle mode highlights directional alignment.',
};

const defaultScenarios = {
  pizza: {
    query: { id: 'query', dx: 4, dy: 3, color: '#00d8ff', label: 'Query (pizza)' },
    docs: [
      { id: 'pizza-short', dx: 2, dy: 1.4, color: '#78ff47', label: 'Short pizza doc' },
      { id: 'pizza-long', dx: 7, dy: 5.3, color: '#4dcc0f', label: 'Long pizza doc' },
      { id: 'laptop', dx: 1.8, dy: -2.4, color: '#ff4b4b', label: 'Laptop doc' },
    ],
  },
  mix: {
    query: { id: 'query', dx: 3.6, dy: 2.8, color: '#00d8ff', label: 'Query (food+tech)' },
    docs: [
      { id: 'pizza', dx: 2.5, dy: 1.8, color: '#78ff47', label: 'Pizza doc' },
      { id: 'laptop-short', dx: 2.7, dy: 2.3, color: '#ff4b4b', label: 'Short laptop doc' },
      { id: 'garden', dx: -2.2, dy: 2.4, color: '#d1ff44', label: 'Garden doc' },
    ],
  },
  offTopic: {
    query: { id: 'query', dx: 4.2, dy: 3.1, color: '#00d8ff', label: 'Query (pizza)' },
    docs: [
      { id: 'pizza', dx: 2.2, dy: 1.6, color: '#78ff47', label: 'Pizza doc' },
      { id: 'laptop', dx: 1.8, dy: -2.3, color: '#ff4b4b', label: 'Laptop doc' },
      { id: 'history', dx: -2.5, dy: 1.1, color: '#ffd64d', label: 'History doc' },
    ],
  },
};

const vectorMath = {
  distance: (a, b) => Math.hypot(a.dx - b.dx, a.dy - b.dy),
  magnitude: a => Math.hypot(a.dx, a.dy),
  dot: (a, b) => a.dx * b.dx + a.dy * b.dy,
  cosine: (a, b) => {
    const magA = vectorMath.magnitude(a);
    const magB = vectorMath.magnitude(b);
    if (magA === 0 || magB === 0) return 0;
    return Math.max(-1, Math.min(1, vectorMath.dot(a, b) / (magA * magB)));
  },
  angle: (a, b) => {
    const cos = vectorMath.cosine(a, b);
    return (Math.acos(cos) * 180) / Math.PI;
  },
};

const ModeToggle = ({ mode, setMode }) => (
  <div className="mode-toggle">
    <button type="button" className={`toggle-btn ${mode === 'distance' ? 'active' : ''}`} onClick={() => setMode('distance')}>
      Distance mode
    </button>
    <button type="button" className={`toggle-btn ${mode === 'angle' ? 'active' : ''}`} onClick={() => setMode('angle')}>
      Angle mode
    </button>
  </div>
);

const ScenarioSelector = ({ scenario, setScenario }) => (
  <div className="scenario-selector">
    {Object.keys(defaultScenarios).map(k => (
      <button key={k} type="button" className={scenario === k ? 'active' : ''} onClick={() => setScenario(k)}>
        {k === 'pizza' ? 'Pizza' : k === 'mix' ? 'Mixed' : 'Off-topic'}
      </button>
    ))}
  </div>
);

const FormulaBlock = () => (
  <div className="formula-block">
    <div className="formula-title">Cosine similarity rule</div>
    <div className="formula">cos(θ) = (A · B) / (||A|| ||B||)</div>
    <p>Same direction over magnitude. The machine compares alignment to find meaning.</p>
  </div>
);

const FeedbackPanel = ({ message }) => (
  <div className="feedback-panel">
    <p>{message}</p>
  </div>
);

const MetricsPanel = ({ query, docs }) => (
  <div className="metrics-panel">
    <h4>Live similarity metrics</h4>
    {docs.map(doc => {
      const dist = vectorMath.distance(query, doc);
      const angle = vectorMath.angle(query, doc);
      const cosine = vectorMath.cosine(query, doc);
      return (
        <div key={doc.id} className="metric-row">
          <strong>{doc.label}</strong>
          <div className="metric-values">
            <span>distance: {dist.toFixed(2)}</span>
            <span>angle: {angle.toFixed(1)}°</span>
            <span>cosine: {cosine.toFixed(3)}</span>
          </div>
        </div>
      );
    })}
  </div>
);

const ComparisonCanvas = ({ query, docs, mode, onDocDrag, selectedDoc }) => {
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  const toSvgPoint = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 14 - 1;
    const y = ((clientY - rect.top) / rect.height) * 12 - 1;
    return { x, y };
  };

  const handlePointerMove = e => {
    if (!dragging) return;
    const pt = toSvgPoint(e.clientX, e.clientY);
    if (!pt) return;
    onDocDrag(dragging, { dx: Math.max(-1.5, Math.min(12.5, pt.x)), dy: Math.max(-1.5, Math.min(10.5, pt.y)) });
  };

  return (
    <div className="comparison-canvas" onPointerMove={handlePointerMove} onPointerUp={() => setDragging(null)} onPointerLeave={() => setDragging(null)}>
      <svg ref={svgRef} viewBox="-1 -1 14 12" className="vector-svg">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#ffffff" />
          </marker>
          <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M1 0 L0 0 0 1" fill="none" stroke="rgba(0,255,255,0.15)" strokeWidth="0.02" />
          </pattern>
        </defs>
        <rect x="-1" y="-1" width="14" height="12" fill="url(#grid)" />
        <line x1="-1" y1="-1" x2="13" y2="-1" stroke="rgba(0,255,255,0.2)" strokeWidth="0.03" />
        <line x1="-1" y1="-1" x2="-1" y2="11" stroke="rgba(0,255,255,0.2)" strokeWidth="0.03" />

        <g className="vector-group origin">
          <circle cx="0" cy="0" r="0.2" fill="#00d8ff" />
          <text x="0.2" y="-0.2" fill="#00d8ff" fontSize="0.35">origin</text>
        </g>

        {[query, ...docs].map((v, index) => {
          const isQuery = v.id === 'query';
          const angle = isQuery ? 0 : vectorMath.angle(query, v);
          const arcPath = `M 0 0 A 1.4 1.4 0 ${angle > 180 ? 1 : 0} 1 ${Math.cos((angle * Math.PI) / 180) * 1.4} ${Math.sin((angle * Math.PI) / 180) * 1.4}`;
          const dotted = mode === 'distance' && !isQuery;
          const arcVisible = mode === 'angle' && !isQuery;
          return (
            <g key={v.id} className={`vector-item ${isQuery ? 'query' : v.id.includes('pizza') ? 'similar' : 'dissimilar'}`}>
              <line x1="0" y1="0" x2={v.dx} y2={v.dy} stroke={v.color} strokeWidth={isQuery ? 0.18 : 0.14} markerEnd="url(#arrowhead)" className="vector-line" />

              {dotted && (
                <line x1={v.dx} y1={v.dy} x2={query.dx} y2={query.dy} stroke="rgba(255,255,255,0.25)" strokeDasharray="0.15 0.1" strokeWidth="0.05" />
              )}

              {arcVisible && (
                <path d={arcPath} fill="none" stroke="#ffef6b" strokeWidth="0.065" className="angle-arc" />
              )}

              <circle cx={v.dx} cy={v.dy} r={0.17} fill={v.color} className="draggable-handle" onPointerDown={() => !isQuery && setDragging(v.id)} />
              <text x={v.dx + 0.25} y={v.dy - 0.25} fill={v.color} fontSize="0.35">{v.label}</text>
              {!isQuery && <text x={v.dx + 0.25} y={v.dy + 0.1} fill="#b5d9ff" fontSize="0.3">angle {angle.toFixed(1)}°</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const InsightIntro = ({ onContinue }) => (
  <div className="intro-section">
    <p className="chapter-intro">The machine now has a query vector and many document vectors. The natural intuition says: closest tip wins.</p>
    <p className="stage-transition">Let’s test that assumption and then discover what the machine really uses.</p>
    <button type="button" className="cta-button" onClick={onContinue}>
      Start intuition stage
    </button>
  </div>
);

const PredictionStage = ({ query, docs, onDocPredict, predictedId }) => (
  <div className="prediction-stage">
    <p className="stage-label">PREDICT BEST MATCH</p>
    <p className="stage-subtitle">Which document appears closest to query endpoint?</p>
    <div className="doc-buttons">
      {docs.map(doc => (
        <button key={doc.id} type="button" onClick={() => onDocPredict(doc.id)} className={predictedId === doc.id ? 'selected' : ''}>
          {doc.label}
        </button>
      ))}
    </div>
  </div>
);

const ReflectionStage = () => (
  <div className="reflection-stage">
    <h4>Reflection</h4>
    <p>
      Relevance is about alignment. A document that points in the same direction as the query can be highly relevant even if its endpoint is farther.
    </p>
    <p>If the machine can measure similarity, it can now rank results.</p>
  </div>
);

export default function Chapter3() {
  const [stage, setStage] = useState('intro');
  const [subStage, setSubStage] = useState(0);
  const [mode, setMode] = useState('distance');
  const [scenario, setScenario] = useState('pizza');
  const [predicted, setPredicted] = useState(null);

  const defaultScenario = defaultScenarios[scenario];
  const [docs, setDocs] = useState(defaultScenario.docs);
  const [query, setQuery] = useState(defaultScenario.query);

  useEffect(() => {
    setQuery(defaultScenarios[scenario].query);
    setDocs(defaultScenarios[scenario].docs);
    setPredicted(null);
    setSubStage(0);
  }, [scenario]);

  const onDocDrag = (id, { dx, dy }) => {
    setDocs(prev => prev.map(doc => (doc.id === id ? { ...doc, dx, dy } : doc)));
  };

  const onPredict = id => {
    setPredicted(id);
    setStage('reveal');
    setSubStage(0);
  };

  const computedDocs = useMemo(() => docs.map(doc => ({
    ...doc,
    distance: vectorMath.distance(query, doc),
    angle: vectorMath.angle(query, doc),
    cosine: vectorMath.cosine(query, doc),
  })), [query, docs]);

  const bestDistance = [...computedDocs].sort((a, b) => a.distance - b.distance)[0]?.id;
  const bestAngle = [...computedDocs].sort((a, b) => a.angle - b.angle)[0]?.id;

  const feedbackMessage = useMemo(() => {
    if (stage === 'intuition') {
      return 'DISTANCE SCAN READY';
    }
    if (stage === 'reveal') {
      return 'The machine does not trust raw endpoint distance. It compares direction.';
    }
    if (stage === 'interactive') {
      if (subStage === 0) {
        return 'Try switching between distance and angle modes.';
      }
      if (subStage === 1) {
        return 'Change the scenario to see different vector arrangements.';
      }
      if (subStage === 2) {
        return 'Live metrics show how similarity is calculated.';
      }
      if (subStage === 3) {
        return 'Drag document vectors to explore different alignments.';
      }
      return modeLabels[mode];
    }
    return modeLabels[mode];
  }, [stage, subStage, mode]);

  return (
    <section className={`chapter chapter-3${stage === 'intro' ? ' stage-intro-active' : ''}`}>
      <div className="chapter-header">
        <div className="chapter-label">Chapter 3</div>
        <h2 className="chapter-title">Cosine Similarity: Beyond Endpoint Distance</h2>
        <p className="chapter-subtitle">The machine now learns which paths are semantically aligned.</p>
      </div>

      {stage === 'intro' && (
        <ChapterSection className="stage-intro">
          <InsightIntro onContinue={() => setStage('intuition')} />
        </ChapterSection>
      )}

      {stage === 'intuition' && (
        <ChapterSection title="Intuition Stage" className="stage-intuition">
          <p>Pick the document that looks closest in endpoint terms.</p>
          <PredictionStage query={query} docs={docs} onDocPredict={onPredict} predictedId={predicted} />
          <p className="microcopy">PREDICT BEST MATCH • DISTANCE SCAN READY</p>
        </ChapterSection>
      )}

      {stage === 'reveal' && (
        <ChapterSection title="Reveal Stage" className="stage-reveal">
          <p>The machine now reveals direction-based comparison.</p>
          <ComparisonCanvas query={query} docs={docs} mode={stage === 'reveal' ? 'angle' : mode} onDocDrag={onDocDrag} selectedDoc={predicted} />
          <FormulaBlock />
        </ChapterSection>
      )}

      {stage === 'interactive' && (
        <ChapterSection title="Interactive Comparison" className="stage-interactive">
          <div className="two-column">
            <div className="controls-col">
              {subStage === 0 && <ModeToggle mode={mode} setMode={setMode} />}
              {subStage === 1 && <ScenarioSelector scenario={scenario} setScenario={setScenario} />}
              {subStage === 2 && <MetricsPanel query={query} docs={docs} />}
              {subStage === 3 && <FeedbackPanel message={feedbackMessage} />}
              {subStage === 4 && (
                <div className="path-suggestion">
                  <p>{predicted ? `You predicted ${predicted}.` : 'Try predicting first to compare.'}</p>
                  <p>Best distance: {bestDistance}; best alignment: {bestAngle}</p>
                </div>
              )}
            </div>
            <div className="canvas-col">
              <ComparisonCanvas query={query} docs={docs} mode={mode} onDocDrag={subStage >= 3 ? onDocDrag : () => {}} selectedDoc={predicted} />
            </div>
          </div>
          {subStage < 4 ? (
            <button type="button" className="next-btn" onClick={() => setSubStage(prev => prev + 1)}>
              Next step
            </button>
          ) : (
            <button type="button" className="next-btn" onClick={() => setStage('reflection')}>
              Continue to reflection
            </button>
          )}
        </ChapterSection>
      )}

      {stage === 'reflection' && (
        <ChapterSection title="Reflection" className="stage-reflection">
          <ReflectionStage />
        </ChapterSection>
      )}
    </section>
  );
}
