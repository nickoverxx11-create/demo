import React, { useState, useEffect, useRef } from 'react';

const SEMANTIC_DATA = {
  laptop: { technology: 9.2, food: 0.8, description: "Strong technology signal" },
  pizza: { technology: 1.2, food: 9.5, description: "Strong food signal" },
  "smart fridge": { technology: 7.8, food: 6.2, description: "Balances both signals" },
  "recipe app": { technology: 8.1, food: 7.9, description: "Tech meets culinary" },
  park: { technology: 0.5, food: 1.8, description: "Outside current semantic scope" },
  apple: { technology: 4.5, food: 6.8, description: "Multiple interpretations possible" },
  "food blog": { technology: 2.1, food: 8.9, description: "Strong food focus" }
};

const MAP_PADDING_PERCENT = 6;
const MAP_RANGE_PERCENT = 100 - MAP_PADDING_PERCENT * 2;
const AUTO_STAGE_DELAY_MS = 8000;
const GRAVITY_PULL_DURATION_MS = 3400;
const MATCH_THRESHOLD = 0.5;

const clampToSemanticRange = (value) => Math.max(0, Math.min(10, value));
const mapValueToPercent = (value) => `${MAP_PADDING_PERCENT + (clampToSemanticRange(value) / 10) * MAP_RANGE_PERCENT}%`;
const toBottomPercent = (value) => MAP_PADDING_PERCENT + (clampToSemanticRange(value) / 10) * MAP_RANGE_PERCENT;
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

export default function Chapter1() {
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

    const technology = ((xPercent - MAP_PADDING_PERCENT) / MAP_RANGE_PERCENT) * 10;
    const food = ((bottomPercent - MAP_PADDING_PERCENT) / MAP_RANGE_PERCENT) * 10;

    const userPosition = {
      technology: Math.max(0, Math.min(10, technology)),
      food: Math.max(0, Math.min(10, food))
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
    <section className={`chapter chapter-1${stage === 'intro' ? ' stage-intro-active' : ''}`}>
      <div className="chapter-header">
        <div className="chapter-label">Chapter 1</div>
        <h2 className="chapter-title">Mapping Meaning in Semantic Space</h2>
      </div>

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
          placedTerms={placedTerms}
          onContinue={() => setStage('intro')}
        />
      )}
    </section>
  );
}

function IntroStage({ onContinue }) {
  return (
    <div className="chapter-content">
      <div className="intro-section">
        <p className="chapter-intro">
          Before a machine can compare words, it must first decide where they belong in a space.
          Words are not just symbols—they occupy positions in a multidimensional semantic map.
        </p>
        <p className="stage-transition">
          To understand this, we'll explore how concepts pull words like gravity...
        </p>
        <button className="cta-button" onClick={onContinue}>
          Begin Mapping
        </button>
      </div>
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
  const remainingTerms = gravityTerms.filter(term => !pulledGravityTerms.includes(term) && term !== activeGravityTerm);

  return (
    <div className="chapter-content">
      <div className="gravity-section">
        <h3>Semantic Gravity</h3>
        <p>Watch how words are pulled by conceptual forces before becoming coordinates.</p>

        <div className="gravity-field">
          <div className="attractor technology-zone">
            <div className="zone-glow"></div>
            <span>Technology</span>
          </div>
          <div className="attractor food-zone">
            <div className="zone-glow"></div>
            <span>Food</span>
          </div>

          {remainingTerms.map((term, index) => (
            <div
              key={term}
              className="gravity-term-preview"
              style={{
                left: '50%',
                top: `${34 + index * 11}%`
              }}
            >
              <span>{term}</span>
            </div>
          ))}

          {pulledGravityTerms.map(term => (
            <div
              key={`pulled-${term}`}
              className="gravity-term-preview gravity-term-landed"
              style={{
                left: getSemanticPosition(term).left,
                top: getSemanticPosition(term).top
              }}
            >
              <span>{term}</span>
            </div>
          ))}

          {activeGravityTerm && (
            <div
              key={activeGravityTerm}
              className="floating-term"
              data-term={activeGravityTerm}
              style={{
                '--start-left': '50%',
                '--start-top': `${34 + gravityStep * 11}%`,
                '--target-left': getSemanticPosition(activeGravityTerm).left,
                '--target-top': getSemanticPosition(activeGravityTerm).top
              }}
            >
              <span>{activeGravityTerm}</span>
              <div className="term-trail"></div>
            </div>
          )}
        </div>

        <div className="term-selector">
          {nextGravityTerm ? (
            <button className="term-button" onClick={onPullStart} disabled={Boolean(activeGravityTerm)}>
              {activeGravityTerm ? 'Pulling...' : `Pull ${nextGravityTerm}`}
            </button>
          ) : (
            <button className="term-button" onClick={onContinue}>
              Continue to coordinates
            </button>
          )}
        </div>

        {(activeGravityTerm || nextGravityTerm) && (
          <p className="stage-transition">
            {activeGravityTerm
              ? `${activeGravityTerm} is being pulled toward ${getGravityDirection(activeGravityTerm)}.`
              : `${nextGravityTerm} will be pulled toward ${getGravityDirection(nextGravityTerm)} next.`}
          </p>
        )}
      </div>
    </div>
  );
}

function TransitionStage({ onComplete }) {
  const pulledTerms = ['laptop', 'pizza', 'smart fridge', 'park'];

  useEffect(() => {
    const timer = setTimeout(onComplete, AUTO_STAGE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="chapter-content">
      <div className="transition-section">
        <div className="coordinate-grid emerging">
          <div className="axis x-axis">
            <span className="axis-label">Technology</span>
          </div>
          <div className="axis y-axis">
            <span className="axis-label">Food</span>
          </div>
          <div className="grid-lines"></div>

          {pulledTerms.map(term => (
            <div
              key={term}
              className="emerging-point"
              style={{
                left: getSemanticPosition(term).left,
                bottom: getSemanticPosition(term).bottom
              }}
            >
              <span className="emerging-label">{term}</span>
            </div>
          ))}
        </div>
        <p className="transition-text">
          Once the machine measures these pulls, it can turn them into coordinates.
        </p>
        <p className="stage-transition">
          Now you can place words yourself and see how the machine interprets them...
        </p>
        <div className="system-microcopy">&gt; COORDINATE SYSTEM ACTIVATED</div>
      </div>
    </div>
  );
}

function InteractionStage({
  placedTerms, currentSliders, draggedTerm, selectedTermForSliders,
  lastPlacedTerm, onDragStart, onDrop, onSliderChange,
  onTermSelectForSliders, gridRef, onComplete, getTermPosition
}) {
  const availableTerms = Object.keys(SEMANTIC_DATA).filter(term => !placedTerms[term]);

  return (
    <div className="chapter-content">
      <div className="interaction-left">
        <h3>Interactive Mapping</h3>
        <p>
          Drag terms onto the semantic map to see where they belong.
          The machine will show its interpretation after your placement.
        </p>

        <div className="term-palette">
          <h4>Available Terms:</h4>
          <div className="term-cards">
            {availableTerms.map(term => (
              <div
                key={term}
                className="term-card"
                draggable
                onDragStart={() => onDragStart(term)}
              >
                {term}
              </div>
            ))}
          </div>
        </div>

        <div className="slider-controls">
          <h4>Refine Coordinates:</h4>

          {Object.keys(placedTerms).length > 0 && (
            <div className="term-selector-sliders">
              <p>Select term to adjust:</p>
              <div className="placed-term-buttons">
                {Object.keys(placedTerms).map(term => (
                  <button
                    key={term}
                    className={`placed-term-button ${selectedTermForSliders === term ? 'active' : ''}`}
                    onClick={() => onTermSelectForSliders(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="slider-group">
            <label>Technology relevance: {currentSliders.technology.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={currentSliders.technology}
              onChange={(e) => onSliderChange('technology', parseFloat(e.target.value))}
              disabled={!selectedTermForSliders}
            />
          </div>
          <div className="slider-group">
            <label>Food relevance: {currentSliders.food.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={currentSliders.food}
              onChange={(e) => onSliderChange('food', parseFloat(e.target.value))}
              disabled={!selectedTermForSliders}
            />
          </div>

          {selectedTermForSliders && placedTerms[selectedTermForSliders] && (
            <div className={`match-status ${placedTerms[selectedTermForSliders].matched ? 'success' : 'pending'}`}>
              <strong>{selectedTermForSliders}</strong>
              <span>
                Distance to machine point: {getPositionDistance(
                  placedTerms[selectedTermForSliders].user,
                  placedTerms[selectedTermForSliders].machine
                ).toFixed(2)}
              </span>
              <span>
                {placedTerms[selectedTermForSliders].matched
                  ? 'Matched! Great placement.'
                  : 'Keep adjusting sliders until this term matches.'}
              </span>
            </div>
          )}
        </div>

        {Object.keys(placedTerms).length >= 3 && (
          <div>
            <p className="stage-transition">
              You've built a semantic space! Let's reflect on what this means...
            </p>
            <button className="reflection-button" onClick={onComplete}>
              View Reflection
            </button>
          </div>
        )}
      </div>

      <div className="interaction-right">
        <div
          className="coordinate-grid interactive"
          ref={gridRef}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="axis x-axis">
            <span className="axis-label">Technology</span>
          </div>
          <div className="axis y-axis">
            <span className="axis-label">Food</span>
          </div>
          <div className="grid-lines"></div>

          {/* Center glow for weak-fit terms */}
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

            return (
              <React.Fragment key={term}>
                {/* User placement - hollow circle */}
                <div
                  className={`plotted-point user-placement ${positions.matched ? 'matched' : ''} ${term.replace(' ', '-')}`}
                  style={{
                    left: mapValueToPercent(userPos.technology),
                    bottom: mapValueToPercent(userPos.food)
                  }}
                >
                  <span className="point-label">{term}</span>
                  <span className="coordinates">[{userPos.technology.toFixed(1)}, {userPos.food.toFixed(1)}]</span>
                </div>

                {/* Machine placement - filled glowing circle */}
                {isRevealed && (
                  <div
                    className={`plotted-point machine-placement ${term.replace(' ', '-')}`}
                    style={{
                      left: mapValueToPercent(machinePos.technology),
                      bottom: mapValueToPercent(machinePos.food)
                    }}
                  >
                    <span className="point-label">{term}</span>
                    <span className="coordinates">[{machinePos.technology.toFixed(1)}, {machinePos.food.toFixed(1)}]</span>
                  </div>
                )}

                {/* Connecting line between user and machine placement */}
                {isRevealed && (
                  <svg className="connecting-line" style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                  }}>
                    <line
                      x1={mapValueToPercent(userPos.technology)}
                      y1={`${100 - (MAP_PADDING_PERCENT + (clampToSemanticRange(userPos.food) / 10) * MAP_RANGE_PERCENT)}%`}
                      x2={mapValueToPercent(machinePos.technology)}
                      y2={`${100 - (MAP_PADDING_PERCENT + (clampToSemanticRange(machinePos.food) / 10) * MAP_RANGE_PERCENT)}%`}
                      stroke={positions.matched ? '#6eff8d' : 'var(--accent-color)'}
                      strokeWidth="2"
                      strokeDasharray={positions.matched ? '0' : '5,5'}
                      opacity={positions.matched ? '0.95' : '0.6'}
                    />
                  </svg>
                )}

                {positions.showSuccess && (
                  <div
                    className="match-success-burst"
                    style={{
                      left: mapValueToPercent(machinePos.technology),
                      bottom: mapValueToPercent(machinePos.food)
                    }}
                  >
                    <span>Matched!</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Cluster glow effects */}
          {Object.keys(placedTerms).length > 2 && (
            <div className="cluster-glow tech-cluster">
              <div className="cluster-effect"></div>
            </div>
          )}
          {Object.keys(placedTerms).length > 2 && (
            <div className="cluster-glow food-cluster">
              <div className="cluster-effect"></div>
            </div>
          )}
        </div>

        {lastPlacedTerm && placedTerms[lastPlacedTerm] && (
          <div className="feedback-panel map-feedback-panel">
            <h4>Term Analysis: {lastPlacedTerm}</h4>
            <p className="feedback-description">
              {SEMANTIC_DATA[lastPlacedTerm].description}
            </p>
            <div className="position-comparison">
              <div className="user-position">
                <span className="position-label">Your placement:</span>
                <span className="coordinates">
                  [{placedTerms[lastPlacedTerm].user.technology.toFixed(1)}, {placedTerms[lastPlacedTerm].user.food.toFixed(1)}]
                </span>
              </div>
              {placedTerms[lastPlacedTerm].revealed && (
                <div className="machine-position">
                  <span className="position-label">Machine interpretation:</span>
                  <span className="coordinates">
                    [{placedTerms[lastPlacedTerm].machine.technology.toFixed(1)}, {placedTerms[lastPlacedTerm].machine.food.toFixed(1)}]
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReflectionStage({ placedTerms, onContinue }) {
  return (
    <div className="chapter-content">
      <div className="reflection-section">
        <h3>Reflection: Words Become Coordinates</h3>
        <p>
          You have just transformed intuitive judgments into machine-readable coordinates.
          Each word now has a measurable position in semantic space.
        </p>

        <div className="completed-map">
          <div className="coordinate-grid final">
            <div className="axis x-axis">
              <span className="axis-label">Technology</span>
            </div>
            <div className="axis y-axis">
              <span className="axis-label">Food</span>
            </div>
            <div className="grid-lines"></div>

            {Object.entries(placedTerms).map(([term, positions]) => {
              const pos = positions.machine; // Show final machine positions
              return (
                <div
                  key={term}
                  className={`final-point ${term.replace(' ', '-')}`}
                  style={{
                    left: mapValueToPercent(pos.technology),
                    bottom: mapValueToPercent(pos.food)
                  }}
                >
                  <span>{term}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="transition-prompt">
          If one word becomes one point, what happens when a whole sentence enters the machine?
        </p>

        <button className="cta-button" onClick={onContinue}>
          Continue to Chapter 2
        </button>
      </div>
    </div>
  );
}