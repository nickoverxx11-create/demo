import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Chapter1.css';
// Asset paths (adjust as needed)
const FOOD_GIF = require('../image/food.gif');
const TECH_GIF = require('../image/tech.gif');
const PIZZA_IMG = require('../image/pizza.png');
const LAPTOP_IMG = require('../image/laptop.png');
const FRIDGE_IMG = require('../image/fridge.png');
const PARK_IMG = require('../image/park.png');
const FOODBLOG_IMG = require('../image/foodblog.png');
const RECIPEAPP_IMG = require('../image/recipeapp.png');
const APPLE_IMG = require('../image/apple.png');

// Map term -> image for richer UI
const TERM_IMAGE_MAP = {
  laptop: LAPTOP_IMG,
  pizza: PIZZA_IMG,
  'smart fridge': FRIDGE_IMG,
  park: PARK_IMG,
  apple: APPLE_IMG,
  'food blog': FOODBLOG_IMG,
  'recipe app': RECIPEAPP_IMG
};

const SEMANTIC_DATA = {
  laptop: { technology: 9.2, food: 0.8, description: "Strong technology signal" },
  pizza: { technology: 1.2, food: 9.5, description: "Strong food signal" },
  laptop: {
    technology: 9.2,
    food: 0.8,
    description: "Strong technology signal. A laptop is a pure digital tool. Unless you're looking up a recipe, it has almost zero food essence, placing it deep in the tech corner."
  },
  pizza: {
    technology: 1.2,
    food: 9.5,
    description: "Strong food signal. Pizza is a biological necessity (and delight). It sits at the opposite end of the spectrum from a laptop, with almost no technical pull."
  },
  "smart fridge": {
    technology: 7.8,
    food: 6.2,
    description: "Balances both signals. This is a 'hybrid' term: an appliance for food whose 'smart' features pull it toward the technology axis, placing it in the middle ground."
  },
  "recipe app": { technology: 8.1, food: 7.9, description: "Tech meets culinary. It is a digital tool (Technology) entirely dedicated to cooking (Food), placing it high on both axes as a perfect \"intersection\" word." },
  park: {
    technology: 0.5,
    food: 1.8,
    description: "Semantic outlier. A park is a place of nature; with only Food and Tech axes, it feels lost and needs a 'Nature' dimension to find its true home."
  },
  apple: {
    technology: 4.5,
    food: 6.8,
    description: "Semantic ambiguity. Is it a fruit or a trillion-dollar tech company? This word is pulled by two very different meanings, making its coordinate a compromise."
  },
  "food blog": {
    technology: 2.1,
    food: 8.9,
    description: "Digital culinary space. While a blog is a technical platform, its intent is food-focused; it leans toward food but stays higher on the tech axis than a raw ingredient like pizza."
  }
};

const MAP_PADDING_PERCENT = 6;
const MAP_RANGE_PERCENT = 100 - MAP_PADDING_PERCENT * 2;
const AUTO_STAGE_DELAY_MS = 8000;
const GRAVITY_PULL_DURATION_MS = 4200;
const MATCH_THRESHOLD = 0.5;

// Maximum coordinate value (support datasets using 12x12 coordinates)
const COORDINATE_MAX = 12;

const clampToSemanticRange = (value) => Math.max(0, Math.min(COORDINATE_MAX, value));
const mapValueToPercent = (value) => `${MAP_PADDING_PERCENT + (clampToSemanticRange(value) / COORDINATE_MAX) * MAP_RANGE_PERCENT}%`;
const toBottomPercent = (value) => MAP_PADDING_PERCENT + (clampToSemanticRange(value) / COORDINATE_MAX) * MAP_RANGE_PERCENT;
const getSemanticPosition = (term) => {
  const data = SEMANTIC_DATA[term];
  const left = mapValueToPercent(data.technology);
  const bottomNumeric = toBottomPercent(data.food);
  const bottom = `${bottomNumeric}%`;
  const top = `${100 - bottomNumeric}%`;
  return { left, bottom, top };
};

const getGravityDirection = (term) => {
  const { technology, food } = SEMANTIC_DATA[term];
  if (food - technology > 1) return 'Food';
  if (technology - food > 1) return 'Technology';
  return 'Balanced';
};

const getPositionDistance = (a, b) => Math.hypot(a.technology - b.technology, a.food - b.food);
const isPositionMatched = (a, b) => getPositionDistance(a, b) <= MATCH_THRESHOLD;

export default function Chapter1({ onNext }) {
  const gravityTerms = ['laptop', 'pizza', 'smart fridge', 'park'];
  const [stage, setStage] = useState('intro'); // intro, gravity, transition, interaction, reflection
  const [gravityStep, setGravityStep] = useState(0);
  const [activeGravityTerm, setActiveGravityTerm] = useState(null);
  const [pulledGravityTerms, setPulledGravityTerms] = useState([]);
  const [placedTerms, setPlacedTerms] = useState({}); // {term: {user: {technology, food}, machine: {technology, food}, revealed: boolean}}
  const [currentSliders, setCurrentSliders] = useState({ technology: 5, food: 5 });
  const [draggedTerm, setDraggedTerm] = useState(null);
  const [selectedTermForSliders, setSelectedTermForSliders] = useState(null);
  const [lastPlacedTerm, setLastPlacedTerm] = useState(null);
  const gridRef = useRef(null);

  const nextGravityTerm = gravityStep < gravityTerms.length ? gravityTerms[gravityStep] : null;

  const handleGravityPull = () => {
    if (stage !== 'gravity' || activeGravityTerm || !nextGravityTerm) return;

    setActiveGravityTerm(nextGravityTerm);
    setTimeout(() => {
      setPulledGravityTerms(prev => [...prev, nextGravityTerm]);
      setGravityStep(prev => prev + 1);
      setActiveGravityTerm(null);
    }, GRAVITY_PULL_DURATION_MS);
  };

  const handleDragStart = (term) => {
    setDraggedTerm(term);
  };

  const handleDrop = (event) => {
    if (!draggedTerm || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    const bottomPercent = 100 - yPercent;

    const technology = ((xPercent - MAP_PADDING_PERCENT) / MAP_RANGE_PERCENT) * COORDINATE_MAX;
    const food = ((bottomPercent - MAP_PADDING_PERCENT) / MAP_RANGE_PERCENT) * COORDINATE_MAX;

    const userPosition = {
      technology: Math.max(0, Math.min(COORDINATE_MAX, technology)),
      food: Math.max(0, Math.min(COORDINATE_MAX, food))
    };

    setPlacedTerms(prev => ({
      ...prev,
      [draggedTerm]: {
        user: userPosition,
        machine: SEMANTIC_DATA[draggedTerm],
        revealed: true,
        matched: isPositionMatched(userPosition, SEMANTIC_DATA[draggedTerm]),
        showSuccess: false
      }
    }));

    setSelectedTermForSliders(draggedTerm);
    setCurrentSliders(userPosition);
    setLastPlacedTerm(draggedTerm);

    setDraggedTerm(null);
  };

  const handleSliderChange = (axis, value) => {
    const selected = selectedTermForSliders;
    setCurrentSliders(prev => ({ ...prev, [axis]: value }));

    // If a term is selected for sliders, update its position
    if (selected && placedTerms[selected]) {
      const currentEntry = placedTerms[selected];
      const nextUser = { ...currentEntry.user, [axis]: value };
      const matched = isPositionMatched(nextUser, currentEntry.machine);
      const justMatched = !currentEntry.matched && matched;

      setPlacedTerms(prev => ({
        ...prev,
        [selected]: {
          ...prev[selected],
          user: nextUser,
          matched,
          showSuccess: justMatched ? true : prev[selected].showSuccess
        }
      }));

      if (justMatched) {
        setTimeout(() => {
          setPlacedTerms(prev => {
            if (!prev[selected]) return prev;
            return {
              ...prev,
              [selected]: {
                ...prev[selected],
                showSuccess: false
              }
            };
          });
        }, 1000);
      }
    }
  };

  const handleTermSelectForSliders = (term) => {
    setSelectedTermForSliders(term);
    if (placedTerms[term]) {
      setCurrentSliders(placedTerms[term].user);
    }
  };

  const getTermPosition = (term) => {
    if (placedTerms[term]) {
      return placedTerms[term].revealed ? placedTerms[term].machine : placedTerms[term].user;
    }
    return null;
  };

  return (
    <section
      className={`chapter chapter-1${stage === 'intro' ? ' stage-intro-active' : ''}`}
      style={{
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        margin: 0,
        padding: '4rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div className="chapter-header">
        <div className="chapter-label">Chapter 1</div>
        <h2 className="chapter-title">Mapping Meaning in Semantic Space</h2>
      </div>

      <div className="chapter-content" style={{
        flex: stage === 'intro' ? undefined : 1,
        width: '100%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: stage === 'intro' ? 'flex-start' : 'center',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}>
        {stage === 'intro' && (
          <IntroStage onContinue={() => {
            setGravityStep(0);
            setActiveGravityTerm(null);
            setPulledGravityTerms([]);
            setStage('gravity');
          }} />
        )}

        {stage === 'gravity' && (
          <SemanticGravityStage
            gravityTerms={gravityTerms}
            gravityStep={gravityStep}
            activeGravityTerm={activeGravityTerm}
            pulledGravityTerms={pulledGravityTerms}
            nextGravityTerm={nextGravityTerm}
            onPullStart={handleGravityPull}
            onContinue={() => setStage('transition')}
          />
        )}

        {stage === 'transition' && (
          <TransitionStage
            onComplete={() => setStage('interaction')}
          />
        )}

        {stage === 'interaction' && (
          <InteractionStage
            placedTerms={placedTerms}
            currentSliders={currentSliders}
            draggedTerm={draggedTerm}
            selectedTermForSliders={selectedTermForSliders}
            lastPlacedTerm={lastPlacedTerm}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onSliderChange={handleSliderChange}
            onTermSelectForSliders={handleTermSelectForSliders}
            gridRef={gridRef}
            onComplete={() => setStage('reflection')}
            getTermPosition={getTermPosition}
          />
        )}

        {stage === 'reflection' && (
          <ReflectionStage
            onContinue={onNext}
          />
        )}
      </div>
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
          transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}>01</motion.span>
        <motion.div className="intro-hero-line"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
        <motion.h3 className="intro-hero-title"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}>Mapping Meaning</motion.h3>
        <motion.p className="intro-hero-body"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}>
          Before a machine can compare words, it must decide where they belong in a space.
          Words aren&rsquo;t just symbols — they occupy positions in a semantic map.
        </motion.p>
        <motion.p className="intro-hero-sub"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}>
          We&rsquo;ll map words by how strongly they&rsquo;re pulled toward{' '}
          <strong>Food</strong>
          <img src={FOOD_GIF} alt="" className="intro-inline-gif" />
          {' '}and{' '}
          <strong>Technology</strong>
          <img src={TECH_GIF} alt="" className="intro-inline-gif" />
        </motion.p>
        <motion.button className="intro-hero-btn" onClick={onContinue}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          Begin Mapping
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </motion.div>
    </div>
  );
}

function SemanticGravityStage({
  gravityTerms,
  gravityStep,
  activeGravityTerm,
  pulledGravityTerms,
  nextGravityTerm,
  onPullStart,
  onContinue
}) {
  const [animStep, setAnimStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [accepted, setAccepted] = useState({ pizza: false, laptop: false });
  const [parkShown, setParkShown] = useState(false);
  const [fridgeShown, setFridgeShown] = useState(false);

  useEffect(() => {
    setAnimStep(0);
    setAnimating(false);
    setAccepted({ pizza: false, laptop: false });
    setParkShown(false);
    setFridgeShown(false);
  }, []);

  const parkPos = { left: '42%', top: '25%' };
  const fridgePos = { left: '58%', top: '25%' };

  const [instruction, setInstruction] = useState('');
  const handleFindHomes = () => {
    if (animStep !== 0) return;
    setAnimStep(1);
    setAnimating(true);
    setInstruction('Pulling pizza toward its cluster\u2026');
    setTimeout(() => {
      setAccepted(a => ({ ...a, pizza: true }));
      setInstruction('Pizza is food. It finds its home in the Food cluster.');
      setTimeout(() => {
        setAnimStep(2);
        setInstruction('Pulling laptop toward its cluster\u2026');
        setTimeout(() => {
          setAccepted(a => ({ ...a, laptop: true }));
          setInstruction('Laptop is technology. It finds its home in the Technology cluster.');
          setTimeout(() => {
            setAnimStep(3);
            setInstruction('Where do these belong? Some words don\u2019t fit neatly into just Food or Technology. A semantic map gives each word an exact position so we can compare them fairly.');
            setTimeout(() => setParkShown(true), 500);
            setTimeout(() => setFridgeShown(true), 1200);
            setAnimating(false);
          }, 2600);
        }, 2600);
      }, 2600);
    }, 2600);
  };

  return (
    <motion.div className="ch1-stage-wrapper"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="ch1-stage-header">
        <span className="ch1-stage-badge">Explore</span>
        <h3 className="ch1-stage-title">Finding a Concept Home</h3>
        <p className="ch1-stage-subtitle">Where does a word go when it&rsquo;s looking for its family?</p>
      </div>
      <div className="ch1-gravity-canvas">
        <img src={FOOD_GIF} alt="Food" className="ch1-cluster-icon ch1-cluster-left" />
        <img src={TECH_GIF} alt="Tech" className="ch1-cluster-icon ch1-cluster-right" />

        {animStep === 1 && !accepted.pizza && (
          <motion.div className="ch1-anim-term"
            initial={{ left: '50%', top: '50%', x: '-50%', y: '-50%', opacity: 1 }}
            animate={{ left: '12%', top: '50%', x: '-50%', y: '-50%', opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}>
            <img src={PIZZA_IMG} alt="pizza" className="ch1-anim-img" />
            <span className="ch1-anim-label">pizza</span>
          </motion.div>
        )}

        {animStep === 2 && !accepted.laptop && (
          <motion.div className="ch1-anim-term"
            initial={{ left: '50%', top: '50%', x: '-50%', y: '-50%', opacity: 1 }}
            animate={{ left: '88%', top: '50%', x: '-50%', y: '-50%', opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}>
            <img src={LAPTOP_IMG} alt="laptop" className="ch1-anim-img" />
            <span className="ch1-anim-label">laptop</span>
          </motion.div>
        )}

        {animStep === 3 && (
          <>
            {parkShown && (
              <motion.div className="ch1-reveal-term"
                style={{ left: parkPos.left, top: parkPos.top }}
                initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                transition={{ duration: 0.45 }}>
                <img src={PARK_IMG} alt="park" className="ch1-reveal-img" />
                <span className="ch1-reveal-label">park</span>
              </motion.div>
            )}
            {fridgeShown && (
              <motion.div className="ch1-reveal-term"
                style={{ left: fridgePos.left, top: fridgePos.top }}
                initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                transition={{ duration: 0.45, delay: 0.08 }}>
                <img src={FRIDGE_IMG} alt="fridge" className="ch1-reveal-img" />
                <span className="ch1-reveal-label">smart fridge</span>
              </motion.div>
            )}

            {parkShown && fridgeShown && (
              <motion.button className="intro-hero-btn ch1-canvas-btn" onClick={onContinue}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                Continue
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.button>
            )}
          </>
        )}

        {instruction && (
          <motion.div className="ch1-instruction-toast"
            key={instruction}
            initial={{ opacity: 0, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.35 }}>
            {instruction}
          </motion.div>
        )}

        {animStep === 0 && !animating && (
          <motion.button className="intro-hero-btn ch1-canvas-btn" onClick={handleFindHomes}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            Find Homes
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function TransitionStage({ onComplete }) {
  const pulledTerms = ['laptop', 'pizza', 'smart fridge', 'park'];

  useEffect(() => {
    const timer = setTimeout(onComplete, AUTO_STAGE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div className="ch1-stage-wrapper"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="ch1-stage-header">
        <span className="ch1-stage-badge">Transition</span>
       
        <p className="ch1-stage-subtitle">Once the machine measures these pulls, it turns them into coordinates.</p>
      </div>
      <div className="ch1-transition-grid-wrap">
        <div className="coordinate-grid emerging">
          <div className="axis x-axis"><span className="axis-label">Technology</span></div>
          <div className="axis y-axis"><span className="axis-label">Food</span></div>
          <div className="grid-lines"></div>
          {pulledTerms.map(term => (
            <div key={term} className="emerging-point"
              style={{ left: getSemanticPosition(term).left, bottom: getSemanticPosition(term).bottom }}>
              <span className="emerging-label">{term}</span>
            </div>
          ))}
        </div>
      </div>
      <motion.p className="ch1-transition-hint"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}>
        Now you can place words yourself and see how the machine interprets them&hellip;
      </motion.p>
    </motion.div>
  );
}

function InteractionStage({
  placedTerms, currentSliders, draggedTerm, selectedTermForSliders,
  lastPlacedTerm, onDragStart, onDrop, onSliderChange,
  onTermSelectForSliders, gridRef, onComplete, getTermPosition
}) {
  const availableTerms = Object.keys(SEMANTIC_DATA).filter(term => !placedTerms[term]);

  const getDistanceCategory = (d) => {
    if (d <= 1.5) return { label: 'Direct Hit', color: '#16a34a', meaning: "You found its exact home." };
    if (d <= 4) return { label: 'Close By', color: '#f59e0b', meaning: "You're in the right neighborhood." };
    return { label: 'Lost', color: '#ef4444', meaning: "You're in the wrong country." };
  };

  return (
    <motion.div className="ch1-stage-wrapper ch1-interaction-layout"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="ch1-interact-left">
        <div className="ch1-stage-header" style={{ textAlign: 'left' }}>
          <span className="ch1-stage-badge">Interactive</span>
          <h3 className="ch1-stage-title">Place the Words</h3>
          <p className="ch1-stage-subtitle">Drag terms onto the map. The machine reveals its interpretation. You only have one chance.</p>
        </div>

        <div className="ch1-term-palette">
          <p className="ch1-palette-label">Available Terms</p>
          <div className="ch1-term-cards">
            {availableTerms.map(term => (
              <div key={term} className="ch1-term-card" draggable onDragStart={() => onDragStart(term)}>
                <img src={TERM_IMAGE_MAP[term] || PIZZA_IMG} alt={term} className="ch1-term-thumb" />
                <span className="ch1-term-name">{term}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedTermForSliders && placedTerms[selectedTermForSliders] && (
          <motion.div className="ch1-analysis-card"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="ch1-analysis-header">
              <img src={TERM_IMAGE_MAP[selectedTermForSliders] || PIZZA_IMG} alt={selectedTermForSliders} className="ch1-analysis-thumb" />
              <div>
                <h4 className="ch1-analysis-name">{selectedTermForSliders}</h4>
                <p className="ch1-analysis-desc">{SEMANTIC_DATA[selectedTermForSliders].description}</p>
              </div>
            </div>
            {(() => {
              const entry = placedTerms[selectedTermForSliders];
              const dist = getPositionDistance(entry.user, entry.machine);
              const cat = getDistanceCategory(dist);
              return (
                <div className="ch1-analysis-result">
                  <span className="ch1-result-badge" style={{ background: cat.color }}>{cat.label}</span>
                  <span className="ch1-result-meaning">{cat.meaning}</span>
                </div>
              );
            })()}
          </motion.div>
        )}
      </div>

      <div className="ch1-interact-right">
        <div className="coordinate-grid interactive" ref={gridRef}
          onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
          <div className="map-legend">
            <div className="legend-item"><div className="legend-dot" /> <div className="legend-label">Your guess</div></div>
            <div className="legend-item"><div className="legend-machine-dot" /> <div className="legend-label">Machine</div></div>
          </div>
          <div className="axis x-axis"><span className="axis-label">Technology</span></div>
          <div className="axis y-axis"><span className="axis-label">Food</span></div>
          <div className="grid-lines"></div>

          {lastPlacedTerm === 'park' && (
            <div className="center-glow">
              <div className="glow-effect"></div>
              <span className="glow-text">Outside current semantic scope</span>
            </div>
          )}

          {Object.entries(placedTerms).map(([term, positions]) => {
            const userPos = positions.user;
            const machinePos = positions.machine;
            const isRevealed = positions.revealed;
            const isSelected = selectedTermForSliders === term;
            return (
              <React.Fragment key={term}>
                <div
                  className={`plotted-point user-placement ${positions.matched ? 'matched' : ''} ${term.replace(' ', '-')} ${isSelected ? 'selected' : ''} ${selectedTermForSliders ? (isSelected ? '' : 'muted') : ''}`}
                  onClick={() => onTermSelectForSliders(term)}
                  style={{ left: mapValueToPercent(userPos.technology), bottom: mapValueToPercent(userPos.food), cursor: 'pointer' }}>
                  <div className="point-dot" />
                  {isSelected && <img src={TERM_IMAGE_MAP[term] || PIZZA_IMG} alt={term} className="point-image user-image" />}
                </div>
                {isRevealed && (
                  <div
                    className={`plotted-point machine-placement ${term.replace(' ', '-')} ${isSelected ? 'selected' : ''} ${selectedTermForSliders ? (isSelected ? '' : 'muted') : ''}`}
                    onClick={() => onTermSelectForSliders(term)}
                    style={{ left: mapValueToPercent(machinePos.technology), bottom: mapValueToPercent(machinePos.food), cursor: 'pointer' }}>
                    <div className="point-dot machine-dot" />
                    {isSelected && <img src={TERM_IMAGE_MAP[term] || PIZZA_IMG} alt={term} className="point-image machine-image" />}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {Object.keys(placedTerms).length > 2 && <div className="cluster-glow tech-cluster"><div className="cluster-effect"></div></div>}
          {Object.keys(placedTerms).length > 2 && <div className="cluster-glow food-cluster"><div className="cluster-effect"></div></div>}
        </div>

        <motion.button className="intro-hero-btn" onClick={onComplete} style={{ marginTop: 18 }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          View Reflection
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </div>
    </motion.div>
  );
}

function ReflectionStage({ onContinue }) {
  return (
    <motion.div className="ch1-stage-wrapper"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <div className="ch1-stage-header">
        <span className="ch1-stage-badge">Reflection</span>
        <h3 className="ch1-stage-title">Words Become Coordinates</h3>
        <p className="ch1-stage-subtitle">
          Every word has been given a precise location in semantic space. The machine doesn&rsquo;t read
          words &mdash; it reads positions, and positions can be measured and compared.
        </p>
      </div>

      <div className="ch1-insight-grid">
        <motion.div className="ch1-insight-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h4>What is an Embedding?</h4>
          <p>An embedding turns a word into a set of numbers &mdash; its coordinates. Words with similar meanings end up near each other in this space.</p>
        </motion.div>
        <motion.div className="ch1-insight-card"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h4>Why Two Axes?</h4>
          <p>Food and Technology are just two dimensions to illustrate the idea. Real models use hundreds or thousands of dimensions to capture the full richness of meaning.</p>
        </motion.div>
      </div>

      <motion.p className="ch1-transition-hint"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        If one word becomes one point, what happens when a whole sentence enters the machine?
      </motion.p>

      <motion.button className="intro-hero-btn" onClick={onContinue}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        Continue to Chapter 2
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>
    </motion.div>
  );
}