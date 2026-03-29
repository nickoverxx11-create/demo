import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const PIZZA_IMG = require('../image/pizza.png');
const LAPTOP_IMG = require('../image/laptop.png');
const FRIDGE_IMG = require('../image/fridge.png');
const PARK_IMG = require('../image/park.png');
const APPLE_IMG = require('../image/apple.png');
const RECIPEAPP_IMG = require('../image/recipeapp.png');

const TERM_IMAGE_MAP = {
  laptop: LAPTOP_IMG,
  pizza: PIZZA_IMG,
  'smart fridge': FRIDGE_IMG,
  park: PARK_IMG,
  apple: APPLE_IMG,
  'recipe app': RECIPEAPP_IMG,
  'food blog': RECIPEAPP_IMG
};

const TERM_IMAGE_STYLE_MAP = {
  pizza: 'term-image-food',
  laptop: 'term-image-device',
  'smart fridge': 'term-image-appliance'
};

const SEMANTIC_DATA = {
  laptop: { technology: 9.2, food: 0.8, description: 'Strong technology signal' },
  pizza: { technology: 1.2, food: 9.5, description: 'Strong food signal' },
  'smart fridge': { technology: 7.8, food: 6.2, description: 'Balances both signals' },
  'recipe app': { technology: 8.1, food: 7.9, description: 'Tech meets culinary' },
  park: { technology: 0.5, food: 1.8, description: 'Outside current semantic scope' },
  apple: { technology: 4.5, food: 6.8, description: 'Multiple interpretations possible' },
  'food blog': { technology: 2.1, food: 8.9, description: 'Strong food focus' }
};

const EXAMPLE_SENTENCES = [
  {
    id: 1,
    title: 'The Simple Intent (1 Term)',
    text: 'I want a pizza.',
    words: ['pizza'],
    analysis:
      "When you use one word, the machine has a 100% clear target. The intent is 'sharp' and points directly at the source."
  },
  {
    id: 2,
    title: 'The Hybrid Intent (2 Terms)',
    text: 'I am using my laptop to buy a pizza.',
    words: ['laptop', 'pizza'],
    analysis:
      "Adding 'Laptop' creates a second pull. The machine finds the middle ground between Food and Technology. This is where online ordering lives."
  },
  {
    id: 3,
    title: 'The Complex Intent (3 Terms)',
    text: 'My laptop is on top of the fridge near the pizza.',
    words: ['laptop', 'smart fridge', 'pizza'],
    analysis:
      "With three words, we create a semantic area. The machine calculates the geometric center of your thoughts. The intent becomes broader at the intersection of Home, Tech, and Food."
  }
];

const MATCH_TEST_SENTENCES = [
  {
    id: 'tech-core',
    title: 'The Pure Tech Pull',
    sentence: 'My laptop needs a software update.',
    target: { x: 11, y: 2 },
    badge: 'Tech Core',
    vectorLogic: 'Points to High Tech (11,2).',
    visual: 'Long, sharp arrow reaching into the technology side.',
    why: 'Laptop and software update carry strong technology signal with almost no food signal.',
    terms: ['laptop']
  },
  {
    id: 'food-core',
    title: 'The Pure Food Pull',
    sentence: 'I am baking a pepperoni pizza.',
    target: { x: 1, y: 11 },
    badge: 'Food Core',
    vectorLogic: 'Points to High Food (1,11).',
    visual: 'Long, sharp arrow aimed into the food side.',
    why: 'Baking and pizza are culinary terms with no meaningful technology pull.',
    terms: ['pizza']
  },
  {
    id: 'digital-food',
    title: 'The Balanced Hybrid',
    sentence: 'I am browsing a recipe app on my laptop.',
    target: { x: 6, y: 9 },
    badge: 'Digital Food',
    vectorLogic: 'Points to Center-Top (6,9).',
    visual: 'Arrow splits the difference and lands in upper center.',
    why: 'Recipe pulls toward food while app and laptop pull toward technology, creating balance.',
    terms: ['recipe app', 'laptop']
  },
  {
    id: 'home-utility',
    title: 'The Domestic Utility',
    sentence: 'The smart fridge is keeping the apples cold.',
    target: { x: 8, y: 5 },
    badge: 'Home Utility',
    vectorLogic: 'Points to Mid-Right (8,5).',
    visual: 'Shorter, steady arrow toward a home-tech region.',
    why: 'Smart fridge adds tech weight and apples add food weight, keeping the vector mid-range.',
    terms: ['smart fridge', 'apple']
  },
  {
    id: 'low-relevance',
    title: 'The Outlier (Low Signal)',
    sentence: 'I am sitting on a bench in the park.',
    target: { x: 4, y: 1 },
    badge: 'Low Relevance',
    vectorLogic: 'Points to Bottom (4,1).',
    visual: 'Very short, faint arrow staying near origin.',
    why: 'Park has low relevance in a food-tech map, so the vector remains close to (0,0).',
    terms: ['park']
  }
];

const MATCH_ARROW_COLORS = {
  'tech-core': '#3b82f6',
  'food-core': '#ef4444',
  'digital-food': '#8b5cf6',
  'home-utility': '#0ea5a2',
  'low-relevance': '#64748b'
};

const MAP_PADDING_PERCENT = 6;
const MAP_RANGE_PERCENT = 100 - MAP_PADDING_PERCENT * 2;
const MAP_MAX = 12;

const clamp10 = (v) => Math.max(0, Math.min(10, v));
const mapValueToPercent = (value) =>
  `${MAP_PADDING_PERCENT + (clamp10(value) / 10) * MAP_RANGE_PERCENT}%`;
const toTopPercent = (value) =>
  100 - (MAP_PADDING_PERCENT + (clamp10(value) / 10) * MAP_RANGE_PERCENT);

const clamp12 = (v) => Math.max(0, Math.min(MAP_MAX, v));
const mapValue12ToPercent = (value) =>
  `${MAP_PADDING_PERCENT + (clamp12(value) / MAP_MAX) * MAP_RANGE_PERCENT}%`;
const toTopPercent12 = (value) =>
  100 - (MAP_PADDING_PERCENT + (clamp12(value) / MAP_MAX) * MAP_RANGE_PERCENT);

const VIZ_PADDING_PERCENT = 11;
const VIZ_RANGE_PERCENT = 100 - VIZ_PADDING_PERCENT * 2;
const mapValueToVizPercent = (value) =>
  `${VIZ_PADDING_PERCENT + (clamp10(value) / 10) * VIZ_RANGE_PERCENT}%`;
const toTopVizPercent = (value) =>
  100 - (VIZ_PADDING_PERCENT + (clamp10(value) / 10) * VIZ_RANGE_PERCENT);
const mapValueToVizNum = (value) =>
  VIZ_PADDING_PERCENT + (clamp10(value) / 10) * VIZ_RANGE_PERCENT;
const toTopVizNum = (value) =>
  100 - (VIZ_PADDING_PERCENT + (clamp10(value) / 10) * VIZ_RANGE_PERCENT);

const mapValueToNum = (value) =>
  MAP_PADDING_PERCENT + (clamp10(value) / 10) * MAP_RANGE_PERCENT;
const toTopNum = (value) =>
  100 - (MAP_PADDING_PERCENT + (clamp10(value) / 10) * MAP_RANGE_PERCENT);

const TERM_SEQUENCE_TIMINGS = {
  1: { words: 280, center: 1200, arrow: 2300, analysis: 3200, done: 3500 },
  2: { words: 280, geometry: 1100, center: 1900, arrow: 2800, analysis: 3600, done: 3920 },
  3: { words: 280, geometry: 1100, center: 1900, arrow: 2800, analysis: 3600, done: 3920 }
};

function getTermImage(term) {
  return TERM_IMAGE_MAP[term] || PIZZA_IMG;
}

function getTermImageClass(term) {
  return TERM_IMAGE_STYLE_MAP[term] || 'term-image-generic';
}

const TERM_SENTENCE_VARIANTS = {
  laptop: ['laptop'],
  pizza: ['pizza'],
  'smart fridge': ['smart fridge', 'fridge']
};

function renderGuideSentence(sentence) {
  if (!sentence) return null;

  let segments = [{ text: sentence.text, term: null }];

  sentence.words.forEach((term) => {
    const variants = TERM_SENTENCE_VARIANTS[term] || [term];
    segments = segments.flatMap((seg) => {
      if (seg.term) return [seg];

      const raw = seg.text;
      const lower = raw.toLowerCase();
      let pickIndex = -1;
      let pickVariant = '';

      variants.forEach((variant) => {
        const idx = lower.indexOf(variant.toLowerCase());
        if (idx !== -1 && (pickIndex === -1 || idx < pickIndex)) {
          pickIndex = idx;
          pickVariant = raw.slice(idx, idx + variant.length);
        }
      });

      if (pickIndex === -1) return [seg];

      const before = raw.slice(0, pickIndex);
      const match = raw.slice(pickIndex, pickIndex + pickVariant.length);
      const after = raw.slice(pickIndex + pickVariant.length);

      const out = [];
      if (before) out.push({ text: before, term: null });
      out.push({ text: match, term });
      if (after) out.push({ text: after, term: null });
      return out;
    });
  });

  return (
    <>
      {segments.map((seg, idx) =>
        seg.term ? (
          <img
            key={`${seg.text}-${idx}`}
            src={getTermImage(seg.term)}
            alt={seg.term}
            className="sentence-guide-inline-icon"
            title={seg.term}
          />
        ) : (
          <span key={`${seg.text}-${idx}`}>{seg.text}</span>
        )
      )}
    </>
  );
}

export default function Chapter2({ onNext }) {
  const [stage, setStage] = useState('intro');
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [vectorPosition, setVectorPosition] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [clickedSentences, setClickedSentences] = useState([]);
  const [placedWords, setPlacedWords] = useState([]);
  const [nextSentence, setNextSentence] = useState(1);
  const gridRef = useRef(null);
  const animationTimersRef = useRef([]);

  const clearAnimationTimers = () => {
    animationTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    animationTimersRef.current = [];
  };

  const queueAnimationStep = (delay, callback) => {
    const timerId = window.setTimeout(callback, delay);
    animationTimersRef.current.push(timerId);
  };

  useEffect(() => clearAnimationTimers, []);

  useEffect(() => {
    if (stage !== 'visualization') return;
    if (selectedSentence) return;
    const firstSentence = EXAMPLE_SENTENCES.find((s) => s.id === nextSentence);
    if (firstSentence) {
      startSentenceAnimation(firstSentence);
    }
  }, [stage, selectedSentence, nextSentence]);

  const startSentenceAnimation = (sentence) => {
    clearAnimationTimers();
    setSelectedSentence(sentence.id);
    setAnimationPhase(0);
    setVectorPosition(null);
    setPlacedWords([]);

    if (sentence.id === 1) {
      const timing = TERM_SEQUENCE_TIMINGS[1];
      queueAnimationStep(timing.words, () => {
        setPlacedWords(['pizza']);
        setAnimationPhase(1);
      });
      queueAnimationStep(timing.center, () => {
        setVectorPosition(SEMANTIC_DATA.pizza);
        setAnimationPhase(3);
      });
      queueAnimationStep(timing.arrow, () => {
        setAnimationPhase(4);
      });
      queueAnimationStep(timing.analysis, () => {
        setAnimationPhase(5);
      });
      queueAnimationStep(timing.done, () => {
        setClickedSentences((prev) => (prev.includes(1) ? prev : [...prev, 1]));
      });
      return;
    }

    if (sentence.id === 2) {
      const timing = TERM_SEQUENCE_TIMINGS[2];
      queueAnimationStep(timing.words, () => {
        setPlacedWords(['laptop', 'pizza']);
        setAnimationPhase(1);
      });
      queueAnimationStep(timing.geometry, () => {
        setAnimationPhase(2);
      });
      queueAnimationStep(timing.center, () => {
        const p0 = SEMANTIC_DATA.laptop;
        const p1 = SEMANTIC_DATA.pizza;
        const midpoint = {
          technology: (p0.technology + p1.technology) / 2,
          food: (p0.food + p1.food) / 2
        };
        setVectorPosition(midpoint);
        setAnimationPhase(3);
      });
      queueAnimationStep(timing.arrow, () => {
        setAnimationPhase(4);
      });
      queueAnimationStep(timing.analysis, () => {
        setAnimationPhase(5);
      });
      queueAnimationStep(timing.done, () => {
        setClickedSentences((prev) => (prev.includes(2) ? prev : [...prev, 2]));
      });
      return;
    }

    if (sentence.id === 3) {
      const timing = TERM_SEQUENCE_TIMINGS[3];
      queueAnimationStep(timing.words, () => {
        setPlacedWords(['laptop', 'smart fridge', 'pizza']);
        setAnimationPhase(1);
      });
      queueAnimationStep(timing.geometry, () => {
        setAnimationPhase(2);
      });
      queueAnimationStep(timing.center, () => {
        const a = SEMANTIC_DATA.laptop;
        const b = SEMANTIC_DATA['smart fridge'];
        const c = SEMANTIC_DATA.pizza;
        const centroid = {
          technology: (a.technology + b.technology + c.technology) / 3,
          food: (a.food + b.food + c.food) / 3
        };
        setVectorPosition(centroid);
        setAnimationPhase(3);
      });
      queueAnimationStep(timing.arrow, () => {
        setAnimationPhase(4);
      });
      queueAnimationStep(timing.analysis, () => {
        setAnimationPhase(5);
      });
      queueAnimationStep(timing.done, () => {
        setClickedSentences((prev) => (prev.includes(3) ? prev : [...prev, 3]));
      });
    }
  };

  const handleSentenceSelect = (sentence) => {
    if (sentence.id !== nextSentence) return;
    if (animationPhase > 0 && animationPhase < 4) return;
    startSentenceAnimation(sentence);
  };

  const handleAdvanceSentence = () => {
    if (nextSentence >= EXAMPLE_SENTENCES.length) return;

    const targetId = nextSentence + 1;
    const targetSentence = EXAMPLE_SENTENCES.find((s) => s.id === targetId);
    setNextSentence(targetId);

    if (targetSentence) {
      startSentenceAnimation(targetSentence);
    }
  };

  return (
    <section className={`chapter chapter-2${stage === 'intro' ? ' stage-intro-active' : ''}`}>
      <div className="chapter-header">
        <div className="chapter-label">Chapter 2</div>
        <h2 className="chapter-title">Multiple Words Become One Direction</h2>
      </div>

      {stage === 'intro' && <IntroStage onContinue={() => setStage('visualization')} />}

      {stage === 'visualization' && (
        <VisualizationStage
          sentences={EXAMPLE_SENTENCES}
          selectedSentence={
            selectedSentence ? EXAMPLE_SENTENCES.find((s) => s.id === selectedSentence) : null
          }
          placedWords={placedWords}
          vectorPosition={vectorPosition}
          animationPhase={animationPhase}
          onContinue={() => setStage('interactive')}
          onAdvanceSentence={handleAdvanceSentence}
          gridRef={gridRef}
          clickedSentences={clickedSentences}
          nextSentence={nextSentence}
        />
      )}

      {stage === 'interactive' && <InteractiveStage onContinue={() => setStage('match')} />}

      {stage === 'match' && <MatchTestStage onContinue={() => setStage('reflection')} />}

      {stage === 'reflection' && (
        <ReflectionStage
          onContinue={onNext}
        />
      )}
    </section>
  );
}

function IntroStage({ onContinue }) {
  return (
    <div className="chapter-content">
      <motion.div className="intro-hero"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <motion.span className="intro-hero-number"
          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}>02</motion.span>
        <motion.div className="intro-hero-line"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
        <motion.h3 className="intro-hero-title"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}>Your Words Have a Direction</motion.h3>
        <motion.p className="intro-hero-body"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}>
          Nobody types a single word into a search bar. You write a thought — a mix of words
          that, together, point toward exactly what you mean.
        </motion.p>
        <motion.p className="intro-hero-sub"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}>
          The machine reads each word as a position in semantic space, then finds the centre.
          That centre becomes one arrow: your <strong>query vector</strong>.
        </motion.p>
        <motion.button className="intro-hero-btn" onClick={onContinue}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          See It in Action
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </motion.div>
    </div>
  );
}

function VisualizationStage({
  sentences,
  selectedSentence,
  placedWords,
  vectorPosition,
  animationPhase,
  onAdvanceSentence,
  onContinue,
  gridRef,
  clickedSentences,
  nextSentence
}) {
  const showCenterPoint = animationPhase >= 3;
  const showVectorArrow = animationPhase >= 4;
  const showAnalysis = animationPhase >= 5;
  const showGeometry = animationPhase >= 2;
  const currentGuideSentence = sentences.find((s) => s.id === nextSentence) || null;
  const isCurrentCompleted =
    !!currentGuideSentence &&
    clickedSentences.includes(currentGuideSentence.id) &&
    selectedSentence?.id === currentGuideSentence.id &&
    animationPhase >= 5;
  const canAdvanceSentence = isCurrentCompleted && nextSentence < sentences.length;

  let connectorLine = null;
  let arrowTarget = null;
  let trianglePoints = null;

  if (selectedSentence) {
    const words = selectedSentence.words || [];
    if (words.length === 1) {
      arrowTarget = vectorPosition;
    } else if (words.length === 2) {
      const p0 = SEMANTIC_DATA[words[0]];
      const p1 = SEMANTIC_DATA[words[1]];
      if (p0 && p1) {
        connectorLine = { a: p0, b: p1 };
        arrowTarget = vectorPosition;
      }
    } else {
      trianglePoints = words
        .map((word) => SEMANTIC_DATA[word])
        .filter(Boolean)
        .map((p) => `${mapValueToVizNum(p.technology)},${toTopVizNum(p.food)}`)
        .join(' ');
      arrowTarget = vectorPosition;
    }
  }

  const allClicked =
    sentences && sentences.length > 0 && sentences.every((s) => clickedSentences.includes(s.id));

  return (
    <motion.div className="ch2-stage-wrapper ch2-viz-layout"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="ch2-viz-left">
        <div className="ch2-stage-header" style={{ textAlign: 'left' }}>
          <span className="ch2-stage-badge">Visualize</span>
          <h3 className="ch2-stage-title">Sentence to Vector</h3>
          <p className="ch2-stage-subtitle">Follow the guide and run each sentence to see how intent evolves.</p>
        </div>

        <div className="ch2-guide-card">
          {currentGuideSentence ? (
            <>
              <p className="ch2-guide-sentence">{renderGuideSentence(currentGuideSentence)}</p>
              {canAdvanceSentence && (
                <motion.button className="ch2-guide-next" onClick={onAdvanceSentence}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  aria-label="Next sentence">
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.button>
              )}
            </>
          ) : (
            <>
              <p className="ch2-guide-kicker">Guide complete</p>
              <h4 className="ch2-guide-done-title">All 3 sentence vectors explored.</h4>
              <p className="ch2-guide-done-body">The map now shows how single, dual, and triple term intent is combined.</p>
            </>
          )}
        </div>

        {animationPhase >= 1 && (
          <motion.div className="ch2-phase-toast"
            key={animationPhase}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {animationPhase < 2 && 'Placing words on the map...'}
            {animationPhase === 2 && selectedSentence?.words?.length === 2 && 'Connecting the two points...'}
            {animationPhase === 2 && selectedSentence?.words?.length === 3 && 'Building the triangle from three points...'}
            {animationPhase === 2 && selectedSentence?.words?.length === 1 && 'Locking the point location...'}
            {animationPhase === 3 && 'Center point appears...'}
            {animationPhase === 4 && 'Drawing vector from origin to center...'}
            {animationPhase >= 5 && 'Showing sentence analysis...'}
          </motion.div>
        )}

        {showAnalysis && vectorPosition && selectedSentence && (
          <motion.div className="ch2-analysis-card"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="ch2-analysis-label">Sentence Analysis</p>
            <div className="ch2-analysis-terms">
              {selectedSentence.words.map((w, i) => (
                <div key={`${w}-${i}`} className="ch2-analysis-term">
                  <img src={getTermImage(w)} alt={w} className={`ch2-analysis-thumb ${getTermImageClass(w)}`} />
                  <span className="ch2-analysis-term-name">{w}</span>
                </div>
              ))}
            </div>
            <div className="ch2-analysis-divider" />
            <p className="ch2-analysis-text">{selectedSentence.analysis}</p>
          </motion.div>
        )}
      </div>

      <div className="ch2-viz-right">
        <div className="coordinate-grid interactive" ref={gridRef}>
          <div className="axis x-axis"><span className="axis-label">Technology</span></div>
          <div className="axis y-axis"><span className="axis-label">Food</span></div>
          <div className="grid-lines"></div>

          {placedWords.map((word, idx) => {
            const pos = SEMANTIC_DATA[word];
            if (!pos) return null;
            const animationDelay = idx * 0.4;
            const src =
              word === 'pizza' ? PIZZA_IMG
              : word === 'laptop' ? LAPTOP_IMG
              : word === 'smart fridge' ? FRIDGE_IMG
              : word === 'park' ? PARK_IMG
              : word === 'apple' ? APPLE_IMG
              : RECIPEAPP_IMG;

            return (
              <motion.img
                key={word + idx}
                src={src}
                alt={word}
                initial={{ opacity: 0, scale: 0.76, y: 18, rotate: idx % 2 === 0 ? -8 : 8, filter: 'blur(5px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.65, delay: animationDelay, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  left: mapValueToVizPercent(pos.technology),
                  bottom: mapValueToVizPercent(pos.food),
                  width: 60, height: 60,
                  objectFit: 'cover', borderRadius: 16,
                  transform: 'translate(-50%, -60%)',
                  willChange: 'transform, opacity, filter',
                  boxShadow: '0 16px 30px rgba(25, 39, 69, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.72)',
                  background: 'rgba(255, 255, 255, 0.88)'
                }}
                className={getTermImageClass(word)}
              />
            );
          })}

          {showCenterPoint && vectorPosition && (
            <motion.div
              className={`center-point ${showVectorArrow ? 'active' : ''}`}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: showVectorArrow ? 1.14 : 1 }}
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
              style={{ left: mapValueToVizPercent(vectorPosition.technology), bottom: mapValueToVizPercent(vectorPosition.food) }}>
              <div className="center-glow"></div>
            </motion.div>
          )}

          {(showGeometry || showVectorArrow) && (
            <>
              {trianglePoints && showGeometry && (
                <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  viewBox="0 0 100 100" preserveAspectRatio="none">
                  <motion.polygon points={trianglePoints} className="chapter2-triangle-shape"
                    initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} />
                </svg>
              )}
              <svg className="vector-arrow-svg"
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', animation: showVectorArrow ? undefined : 'none' }}>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#000" />
                  </marker>
                </defs>
                {connectorLine && showGeometry && (
                  <motion.line
                    x1={mapValueToVizPercent(connectorLine.a.technology)} y1={`${toTopVizPercent(connectorLine.a.food)}%`}
                    x2={mapValueToVizPercent(connectorLine.b.technology)} y2={`${toTopVizPercent(connectorLine.b.food)}%`}
                    stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" opacity={0.9}
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
                )}
                {showVectorArrow && arrowTarget && (
                  <motion.line
                    key={`arrow-${selectedSentence?.id || 0}`}
                    x1={mapValueToVizPercent(0)} y1={`${toTopVizPercent(0)}%`}
                    x2={mapValueToVizPercent(arrowTarget.technology)} y2={`${toTopVizPercent(arrowTarget.food)}%`}
                    stroke="#000" strokeWidth="3" markerEnd="url(#arrowhead)" className="vector-line"
                    initial={{ x2: mapValueToVizPercent(0), y2: `${toTopVizPercent(0)}%`, opacity: 0.9 }}
                    animate={{ x2: mapValueToVizPercent(arrowTarget.technology), y2: `${toTopVizPercent(arrowTarget.food)}%`, opacity: 1 }}
                    transition={{ duration: 1.05, ease: [0.25, 0.1, 0.25, 1] }} />
                )}
              </svg>
            </>
          )}
        </div>

        {allClicked && animationPhase >= 4 && (
          <motion.button className="intro-hero-btn" onClick={onContinue}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ marginTop: 16 }}>
            Continue
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function InteractiveStage({ onContinue }) {
  return (
    <motion.div className="ch2-stage-wrapper"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="ch2-stage-header">
        <span className="ch2-stage-badge">Concept</span>
        <h3 className="ch2-stage-title">What Does a Query Vector Look Like?</h3>
        <p className="ch2-stage-subtitle">The arrow changes direction depending on which words dominate your query. Think of it as a compass needle pulled by meaning.</p>
      </div>

      <div className="ch2-concept-grid">
        <motion.div className="ch2-concept-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h4>&#127829; Food-heavy</h4>
          <p>The arrow points <strong>upward</strong> &mdash; pulled toward the Food axis.</p>
        </motion.div>
        <motion.div className="ch2-concept-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h4>&#128187; Tech-heavy</h4>
          <p>The arrow points <strong>right</strong> &mdash; pulled toward the Technology axis.</p>
        </motion.div>
        <motion.div className="ch2-concept-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h4>&#8599; Mixed</h4>
          <p>The arrow goes <strong>diagonal</strong> &mdash; both forces pulling equally.</p>
        </motion.div>
        <motion.div className="ch2-concept-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <h4>&#127744; Out of scope</h4>
          <p>The arrow stays <strong>short, near the centre</strong> &mdash; weak signal in both dimensions.</p>
        </motion.div>
      </div>

      <motion.p className="ch2-stage-hint"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
        Every word pulls equally &mdash; it&rsquo;s not what you say first, it&rsquo;s what you say <em>most</em>.
      </motion.p>

      <motion.button className="intro-hero-btn" onClick={onContinue}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        Test Your Intuition
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>
    </motion.div>
  );
}

function MatchTestStage({ onContinue }) {
  const [matched, setMatched] = useState({});
  const [activeSentenceId, setActiveSentenceId] = useState(null);
  const [wrongTargetId, setWrongTargetId] = useState(null);
  const [wrongSentenceShake, setWrongSentenceShake] = useState(false);
  const [selectedMatchItem, setSelectedMatchItem] = useState(null);
  const [successTooltip, setSuccessTooltip] = useState(null);

  const allMatched = MATCH_TEST_SENTENCES.every((s) => matched[s.id]);
  const matchedCount = Object.keys(matched).length;

  const handleSentenceClick = (id) => {
    if (matched[id]) {
      setSelectedMatchItem(MATCH_TEST_SENTENCES.find((s) => s.id === id) || null);
      return;
    }
    setActiveSentenceId(activeSentenceId === id ? null : id);
    setSelectedMatchItem(null);
    setSuccessTooltip(null);
  };

  const handleTargetClick = (targetId) => {
    if (!activeSentenceId) return;
    if (matched[targetId]) return;

    if (activeSentenceId === targetId) {
      const item = MATCH_TEST_SENTENCES.find((s) => s.id === activeSentenceId);
      setMatched((prev) => ({ ...prev, [activeSentenceId]: true }));
      setSelectedMatchItem(item || null);
      setSuccessTooltip({ id: targetId, text: item?.title || '' });
      setActiveSentenceId(null);
      setWrongTargetId(null);
      setTimeout(() => setSuccessTooltip(null), 2200);
    } else {
      setWrongTargetId(targetId);
      setWrongSentenceShake(true);
      setTimeout(() => { setWrongTargetId(null); setWrongSentenceShake(false); }, 550);
    }
  };

  const BADGE_COLORS = {
    'tech-core': '#6366f1',
    'food-core': '#f59e0b',
    'digital-food': '#8b5cf6',
    'home-utility': '#0ea5e9',
    'low-relevance': '#94a3b8',
  };

  return (
    <motion.div className="ch2-stage-wrapper ch2-match-layout"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="ch2-match-left">
        <div className="ch2-stage-header" style={{ textAlign: 'left' }}>
          <span className="ch2-stage-badge">Challenge</span>
          <h3 className="ch2-stage-title">Match Test</h3>
          <p className="ch2-stage-subtitle">Pick a sentence card below, then tap its matching target on the map.</p>
        </div>

        <div className="ch2-progress-row">
          <div className="ch2-progress-track">
            <div className="ch2-progress-fill" style={{ width: `${(matchedCount / MATCH_TEST_SENTENCES.length) * 100}%` }} />
          </div>
          <span className="ch2-progress-label">{matchedCount}/{MATCH_TEST_SENTENCES.length}</span>
        </div>

        {!allMatched ? (
          <div className="ch2-match-cards">
            {MATCH_TEST_SENTENCES.map((item) => {
              const isMatched = matched[item.id];
              const isActive = activeSentenceId === item.id;
              const shaking = wrongSentenceShake && isActive;
              const color = BADGE_COLORS[item.id] || '#7093e3';

              return (
                <button key={item.id} type="button"
                  className={`match-card${isActive ? ' active' : ''}${isMatched ? ' matched' : ''}${shaking ? ' shake' : ''}`}
                  style={isActive ? { borderColor: color, '--card-accent': color } : undefined}
                  onClick={() => handleSentenceClick(item.id)}>
                  <span className="match-card-badge" style={{ background: color }}>{item.badge}</span>
                  <span className="match-card-text">{item.sentence}</span>
                  {isMatched && <span className="match-card-check">&#10003;</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <motion.div className="ch2-match-complete"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="ch2-complete-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="ch2-complete-text">
              <h4>All 5 Sentences Matched</h4>
              <p>Each sentence pointed to a different region of the map. The direction of the arrow depends entirely on which words carry the strongest signal.</p>
            </div>
            <motion.button className="intro-hero-btn" onClick={onContinue}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Continue to Reflection
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.button>
          </motion.div>
        )}
      </div>

      <div className="ch2-match-right">
        {selectedMatchItem && (
          <motion.div className="ch2-match-detail-top"
            key={selectedMatchItem.id}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="ch2-match-detail-badge"
              style={{ background: BADGE_COLORS[selectedMatchItem.id] || '#7093e3' }}>
              {selectedMatchItem.badge}
            </div>
            <div className="ch2-match-detail-content">
              <h4>{selectedMatchItem.title}</h4>
              <p>{selectedMatchItem.why}</p>
            </div>
          </motion.div>
        )}
        <div className="match-grid-fixed">
          <div className="coordinate-grid interactive chapter2-match-grid">
            <div className="axis x-axis"><span className="axis-label">Technology</span></div>
            <div className="axis y-axis"><span className="axis-label">Food</span></div>
            <div className="grid-lines"></div>

            <div className="match-origin-dot"
              style={{ left: `${MAP_PADDING_PERCENT}%`, bottom: `${MAP_PADDING_PERCENT}%` }} />

            <svg className="match-arrows-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <marker id="arrowhead-match" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
                </marker>
                <marker id="arrowhead-matched" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#16a34a" />
                </marker>
              </defs>
              {MATCH_TEST_SENTENCES.map((item) => {
                const tx = MAP_PADDING_PERCENT + (clamp12(item.target.x) / MAP_MAX) * MAP_RANGE_PERCENT;
                const ty = 100 - (MAP_PADDING_PERCENT + (clamp12(item.target.y) / MAP_MAX) * MAP_RANGE_PERCENT);
                const ox = MAP_PADDING_PERCENT;
                const oy = 100 - MAP_PADDING_PERCENT;
                const isMatched = matched[item.id];
                return (
                  <line key={`arrow-${item.id}`}
                    x1={ox} y1={oy} x2={tx} y2={ty}
                    stroke={isMatched ? (BADGE_COLORS[item.id] || '#16a34a') : '#94a3b8'}
                    strokeWidth={isMatched ? 0.8 : 0.55}
                    markerEnd={isMatched ? 'url(#arrowhead-matched)' : 'url(#arrowhead-match)'}
                    opacity={isMatched ? 1 : 0.45}
                    strokeDasharray={isMatched ? '0' : '1.5 1'} />
                );
              })}
            </svg>

            {MATCH_TEST_SENTENCES.map((item) => {
              const isMatched = matched[item.id];
              const isWrong = wrongTargetId === item.id;
              const hasActive = !!activeSentenceId;
              const color = BADGE_COLORS[item.id] || '#7093e3';
              return (
                <button key={`target-${item.id}`} type="button"
                  className={`match-target-dot${isMatched ? ' matched' : ''}${isWrong ? ' wrong' : ''}${hasActive && !isMatched ? ' hoverable' : ''}`}
                  style={{
                    left: mapValue12ToPercent(item.target.x),
                    bottom: mapValue12ToPercent(item.target.y),
                    ...(isMatched ? { borderColor: color, background: `${color}18` } : {})
                  }}
                  onClick={() => handleTargetClick(item.id)}>
                  {successTooltip?.id === item.id && (
                    <span className="match-tooltip">{successTooltip.text}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ReflectionStage({ onContinue }) {
  return (
    <motion.div className="ch2-stage-wrapper"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <div className="ch2-stage-header">
        <span className="ch2-stage-badge">Reflection</span>
        <h3 className="ch2-stage-title">From Words to Direction</h3>
        <p className="ch2-stage-subtitle">
          Multiple words become one arrow pointing toward the meaning you are searching for. This vector
          captures the combined essence of your query.
        </p>
      </div>

      <div className="ch2-insight-grid">
        <motion.div className="ch2-insight-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h4>What is a Query Vector?</h4>
          <p>A query vector is the average position of all words in your search. It is a single point that
            summarizes your combined meaning.</p>
        </motion.div>
        <motion.div className="ch2-insight-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h4>Why Average?</h4>
          <p>By averaging word positions, the machine treats all words equally. Your first word is as
            important as your last. The result is a stable representation of your intent.</p>
        </motion.div>
      </div>

      <motion.p className="ch2-stage-hint"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        Now that the machine has a vector for your query, how does it compare it to documents to find the
        best matches?
      </motion.p>

      <motion.button className="intro-hero-btn" onClick={onContinue}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        Continue to Chapter 3
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>
    </motion.div>
  );
}
