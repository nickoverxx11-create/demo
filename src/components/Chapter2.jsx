import React, { useState, useRef } from 'react';

const SEMANTIC_DATA = {
  laptop: { technology: 9.2, food: 0.8, description: "Strong technology signal" },
  pizza: { technology: 1.2, food: 9.5, description: "Strong food signal" },
  "smart fridge": { technology: 7.8, food: 6.2, description: "Balances both signals" },
  "recipe app": { technology: 8.1, food: 7.9, description: "Tech meets culinary" },
  park: { technology: 0.5, food: 1.8, description: "Outside current semantic scope" },
  apple: { technology: 4.5, food: 6.8, description: "Multiple interpretations possible" },
  "food blog": { technology: 2.1, food: 8.9, description: "Strong food focus" }
};

const EXAMPLE_SENTENCES = [
  { id: 1, text: "I want a hot pizza.", words: ["pizza"] },
  { id: 2, text: "Eating pizza while coding on my laptop.", words: ["pizza", "recipe app", "laptop"] },
  { id: 3, text: "Cheap laptop for students.", words: ["laptop"] },
  { id: 4, text: "I am walking my dog in the park.", words: ["park"] }
];

const AVAILABLE_TOKENS = ["pizza", "laptop", "smart fridge", "recipe app", "park", "apple", "food blog"];

const MAP_PADDING_PERCENT = 6;
const MAP_RANGE_PERCENT = 100 - MAP_PADDING_PERCENT * 2; // 88
const clamp10 = (v) => Math.max(0, Math.min(10, v));
const mapValueToPercent = (value) =>
  `${MAP_PADDING_PERCENT + (clamp10(value) / 10) * MAP_RANGE_PERCENT}%`;
const toTopPercent = (value) =>
  100 - (MAP_PADDING_PERCENT + (clamp10(value) / 10) * MAP_RANGE_PERCENT);

const getQueryKey = (tokens) => [...tokens].sort().join('|');

const CUSTOM_QUERIES = {
  // Single word (7)
  'apple': "apple nutrition facts",
  'food blog': "popular food blog websites",
  'laptop': "buy a laptop for programming",
  'park': "nice park to walk my dog",
  'pizza': "best pizza near me",
  'recipe app': "best recipe app for beginners",
  'smart fridge': "what is a smart fridge",
  // Two-word (6)
  'laptop|pizza': "eating pizza while using my laptop",
  'apple|park': "eating an apple in the park",
  'apple|smart fridge': "smart fridge storing apples",
  'food blog|recipe app': "food blog with recipe app",
  'laptop|recipe app': "recipe app for laptop",
  'park|pizza': "can I eat pizza in the park",
  // Three-word (5)
  'apple|park|pizza': "picnic in the park with pizza and apple",
  'apple|food blog|recipe app': "food blog apple recipes in recipe app",
  'food blog|laptop|pizza': "writing a pizza food blog on my laptop",
  'laptop|pizza|recipe app': "looking for a recipe app on my laptop to make pizza",
  'laptop|recipe app|smart fridge': "connect laptop to smart fridge recipe app",
  // Four-word (4)
  'apple|food blog|laptop|recipe app': "food blog apple recipes written on laptop with recipe app",
  'apple|food blog|park|pizza': "food blog about eating pizza and apples in the park",
  'apple|laptop|recipe app|smart fridge': "using a recipe app on my laptop with a smart fridge and apples",
  'food blog|laptop|pizza|recipe app': "writing a pizza recipe for my food blog on my laptop",
  // Five-word (3)
  'apple|food blog|laptop|pizza|recipe app': "writing apple pizza recipes for my food blog on my laptop",
  'apple|food blog|laptop|recipe app|smart fridge': "food blog about using a smart fridge and recipe app on a laptop for apples",
  'apple|food blog|park|pizza|recipe app': "food blog recipe app for pizza and apple picnic in the park",
  // Six-word (2)
  'apple|food blog|laptop|pizza|recipe app|smart fridge': "writing a food blog about pizza and apples using a smart fridge and recipe app on my laptop",
  'apple|food blog|laptop|park|pizza|recipe app': "working on my laptop in the park writing a food blog recipe app for pizza and apples",
  // Seven-word (1)
  'apple|food blog|laptop|park|pizza|recipe app|smart fridge': "writing a food blog about pizza and apples using a recipe app on my laptop while testing a smart fridge in the park"
};

export default function Chapter2() {
  const [stage, setStage] = useState('intro'); // intro, visualization, interactive, custom, reflection
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [placedWords, setPlacedWords] = useState([]);
  const [vectorPosition, setVectorPosition] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: intro, 1: words placed, 2: center appears, 3: vector active
  const [selectedTokens, setSelectedTokens] = useState([]);
  const gridRef = useRef(null);

  // Calculate vector as average of word positions
  const calculateVector = (words) => {
    if (words.length === 0) return null;

    let sumTech = 0, sumFood = 0;
    let validWords = [];

    words.forEach(word => {
      if (SEMANTIC_DATA[word]) {
        validWords.push(word);
        sumTech += SEMANTIC_DATA[word].technology;
        sumFood += SEMANTIC_DATA[word].food;
      }
    });

    if (validWords.length === 0) return null;

    return {
      technology: sumTech / validWords.length,
      food: sumFood / validWords.length,
      wordCount: validWords.length,
      words: validWords
    };
  };

  // Handle sentence selection in visualization stage
  const handleSentenceSelect = (sentence) => {
    setSelectedSentence(sentence.id);
    setAnimationPhase(0);
    setPlacedWords([]);

    // Stagger word placements
    sentence.words.forEach((word, index) => {
      setTimeout(() => {
        setPlacedWords(prev => [...prev, word]);
        setAnimationPhase(1);
      }, 300 + index * 400);
    });

    // Show center point
    setTimeout(() => {
      setAnimationPhase(2);
      setVectorPosition(calculateVector(sentence.words));
    }, 300 + sentence.words.length * 400);

    // Activate vector
    setTimeout(() => {
      setAnimationPhase(3);
    }, 300 + sentence.words.length * 400 + 400);
  };

  // Handle token selection for custom builder
  const handleTokenToggle = (token) => {
    setSelectedTokens(prev => {
      const newTokens = prev.includes(token)
        ? prev.filter(t => t !== token)
        : [...prev, token];

      // Immediately update vector
      setVectorPosition(calculateVector(newTokens));
      return newTokens;
    });
  };

  return (
    <section className={`chapter chapter-2${stage === 'intro' ? ' stage-intro-active' : ''}`}>
      <div className="chapter-header">
        <div className="chapter-label">Chapter 2</div>
        <h2 className="chapter-title">Multiple Words Become One Direction</h2>
      </div>

      {stage === 'intro' && (
        <IntroStage onContinue={() => setStage('visualization')} />
      )}

      {stage === 'visualization' && (
        <VisualizationStage
          sentences={EXAMPLE_SENTENCES}
          selectedSentence={
            selectedSentence ? EXAMPLE_SENTENCES.find(s => s.id === selectedSentence) : null
          }
          placedWords={placedWords}
          vectorPosition={vectorPosition}
          animationPhase={animationPhase}
          onSentenceSelect={handleSentenceSelect}
          onContinue={() => setStage('interactive')}
          gridRef={gridRef}
        />
      )}

      {stage === 'interactive' && (
        <InteractiveStage
          onContinue={() => setStage('custom')}
          onCustom={() => setStage('custom')}
        />
      )}

      {stage === 'custom' && (
        <CustomBuilderStage
          availableTokens={AVAILABLE_TOKENS}
          selectedTokens={selectedTokens}
          vectorPosition={vectorPosition}
          queryText={CUSTOM_QUERIES[getQueryKey(selectedTokens)] || null}
          onTokenToggle={handleTokenToggle}
          onContinue={() => setStage('reflection')}
          gridRef={gridRef}
        />
      )}

      {stage === 'reflection' && (
        <ReflectionStage onContinue={() => setStage('intro')} />
      )}
    </section>
  );
}

function IntroStage({ onContinue }) {
  return (
    <div className="chapter-content">
      <div className="intro-section">
        <h3>How Search Engines Read Your Query</h3>
        <p className="chapter-intro">
          A search engine rarely receives just one word. It receives a sentence—a combination of words that together represent your intention.
        </p>
        <p className="chapter-text">
          The system must combine the positions of multiple word meanings into a single direction in semantic space. This direction represents the combined intent of your entire query.
        </p>
        <p className="stage-transition">
          Let's watch how multiple words converge into one vector...
        </p>
        <button className="cta-button" onClick={onContinue}>
          Visualize Query Vectors
        </button>
      </div>
    </div>
  );
}

function VisualizationStage({
  sentences,
  selectedSentence,
  placedWords,
  vectorPosition,
  animationPhase,
  onSentenceSelect,
  onContinue,
  gridRef
}) {
  const showCenterPoint = animationPhase >= 2;
  const showVectorArrow = animationPhase >= 3;

  return (
    <div className="chapter-content">
      <div className="visualization-left">
        <h3>Sentence to Vector</h3>
        <p>Select a sentence to see how the machine combines its words into a single direction.</p>

        <div className="sentence-selector">
          <h4>Example Sentences:</h4>
          <div className="sentence-buttons">
            {sentences.map(sentence => (
              <button
                key={sentence.id}
                className={`sentence-button ${selectedSentence?.id === sentence.id ? 'active' : ''}`}
                onClick={() => onSentenceSelect(sentence)}
              >
                {sentence.text}
              </button>
            ))}
          </div>
        </div>

        {selectedSentence && (
          <div className="vector-info-panel">
            <h4>Query Vector</h4>
            <p className="query-text">"{selectedSentence.text}"</p>
            
            <div className="vector-components">
              <p className="component-label">Words in query:</p>
              <div className="word-list">
                {selectedSentence.words.map((word, idx) => (
                  <div key={idx} className="word-tag">{word}</div>
                ))}
              </div>
            </div>

            {vectorPosition && (
              <div className="vector-coordinates">
                <p className="coord-label">Combined direction:</p>
                <span className="coord-value">
                  [{vectorPosition.technology.toFixed(1)}, {vectorPosition.food.toFixed(1)}]
                </span>
              </div>
            )}

            {animationPhase >= 1 && (
              <p className="transition-text">
                {animationPhase < 2 && "Placing words on the map..."}
                {animationPhase === 2 && "Finding the center of meaning..."}
                {animationPhase >= 3 && "Vector formed! This arrow represents your query intent."}
              </p>
            )}
          </div>
        )}

        {selectedSentence && animationPhase >= 3 && (
          <div>
            <p className="stage-transition">
              Ready to build your own query? Let's construct a sentence token by token...
            </p>
            <button className="reflection-button" onClick={onContinue}>
              Create Your Own Query
            </button>
          </div>
        )}
      </div>

      <div className="visualization-right">
        <div
          className="coordinate-grid interactive"
          ref={gridRef}
        >
          <div className="axis x-axis">
            <span className="axis-label">Technology</span>
          </div>
          <div className="axis y-axis">
            <span className="axis-label">Food</span>
          </div>
          <div className="grid-lines"></div>

          {/* Placed word points with staggered animation */}
          {placedWords.map((word, idx) => {
            const pos = SEMANTIC_DATA[word];
            const animationDelay = idx * 0.4;
            return (
              <div
                key={word + idx}
                className="word-point"
                style={{
                  left: mapValueToPercent(pos.technology),
                  bottom: mapValueToPercent(pos.food),
                  animationDelay: `${animationDelay}s`
                }}
              >
                <span className="word-label">{word}</span>
              </div>
            );
          })}

          {/* Center point - fades in when vector is calculated */}
          {showCenterPoint && vectorPosition && (
            <div
              className={`center-point ${showVectorArrow ? 'active' : ''}`}
              style={{
                left: mapValueToPercent(vectorPosition.technology),
                bottom: mapValueToPercent(vectorPosition.food)
              }}
            >
              <div className="center-glow"></div>
            </div>
          )}

          {/* Vector arrow from origin to vector position */}
          {showVectorArrow && vectorPosition && (
            <svg className="vector-arrow-svg" style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}>
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#00ff00" />
                </marker>
              </defs>
              <line
                x1="0"
                y1="100%"
                x2={mapValueToPercent(vectorPosition.technology)}
                y2={`${toTopPercent(vectorPosition.food)}%`}
                stroke="#00ff00"
                strokeWidth="3"
                markerEnd="url(#arrowhead)"
                className="vector-line"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

function InteractiveStage({ onContinue, onCustom }) {
  return (
    <div className="chapter-content">
      <div className="interactive-section">
        <h3>Understanding Query Vectors</h3>
        <p>
          Notice how the vector direction changes based on the words in the query?
        </p>
        <ul className="insight-list">
          <li><strong>Food-heavy queries</strong> produce vectors pointing upward.</li>
          <li><strong>Technology-heavy queries</strong> produce vectors pointing right.</li>
          <li><strong>Mixed queries</strong> produce diagonal vectors.</li>
          <li><strong>Out-of-scope queries</strong> produce short vectors near the origin.</li>
        </ul>
        <p className="transition-prompt">
          Each word contributes equally to the final direction. The machine doesn't care about word order—only the combined meaning matters.
        </p>
        <p className="stage-transition">
          Ready to build your own query? Select tokens to watch the vector update in real-time...
        </p>
        <button className="cta-button" onClick={onCustom}>
          Build a Custom Query
        </button>
      </div>
    </div>
  );
}

function CustomBuilderStage({
  availableTokens,
  selectedTokens,
  vectorPosition,
  queryText,
  onTokenToggle,
  onContinue,
  gridRef
}) {
  return (
    <div className="chapter-content">
      <div className="builder-left">
        <h3>Custom Query Builder</h3>
        <p>Select tokens to build a query. Watch the vector update as you add or remove words.</p>

        <div className="token-palette">
          <h4>Word Tokens:</h4>
          <div className="token-buttons">
            {availableTokens.map(token => (
              <button
                key={token}
                className={`token-button ${selectedTokens.includes(token) ? 'active' : ''}`}
                onClick={() => onTokenToggle(token)}
              >
                {token}
              </button>
            ))}
          </div>
        </div>

        {selectedTokens.length > 0 && (
          <div className="query-builder-info">
            <h4>Your Query</h4>
            <div className="query-display">
              {selectedTokens.map((token, idx) => (
                <div key={idx} className="query-word">
                  {token}
                  <button
                    className="remove-btn"
                    onClick={() => onTokenToggle(token)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {queryText && (
              <div className="query-sentence-display">
                <p className="query-sentence-label">As a query:</p>
                <p className="query-sentence-text">“{queryText}”</p>
              </div>
            )}

            {vectorPosition && (
              <div className="vector-result">
                <p className="result-label">Query Vector:</p>
                <span className="result-coords">
                  [{vectorPosition.technology.toFixed(1)}, {vectorPosition.food.toFixed(1)}]
                </span>
                <p className="result-meaning">
                  {vectorPosition.technology > 6 && vectorPosition.food < 4
                    ? "Technology-focused query"
                    : vectorPosition.food > 6 && vectorPosition.technology < 4
                    ? "Food-focused query"
                    : vectorPosition.technology > 5 && vectorPosition.food > 5
                    ? "Mixed tech and food query"
                    : "Generalist query"}
                </p>
              </div>
            )}

            <p className="stage-transition">
              Each word you add shifts the vector. The machine is learning your intent...
            </p>
            <button className="reflection-button" onClick={onContinue}>
              Reflect on Vectors
            </button>
          </div>
        )}

        {selectedTokens.length === 0 && (
          <p className="empty-state">Select tokens to build your query...</p>
        )}
      </div>

      <div className="builder-right">
        <div className="coordinate-grid interactive" ref={gridRef}>
          <div className="axis x-axis">
            <span className="axis-label">Technology</span>
          </div>
          <div className="axis y-axis">
            <span className="axis-label">Food</span>
          </div>
          <div className="grid-lines"></div>

          {/* Selected tokens as points */}
          {selectedTokens.map((token, idx) => {
            const pos = SEMANTIC_DATA[token];
            return (
              <div
                key={token}
                className="word-point active"
                style={{
                  left: mapValueToPercent(pos.technology),
                  bottom: mapValueToPercent(pos.food)
                }}
              >
                <span className="word-label">{token}</span>
              </div>
            );
          })}

          {/* Center point showing combined vector */}
          {selectedTokens.length > 0 && vectorPosition && (
            <>
              <div
                className="center-point active"
                style={{
                  left: mapValueToPercent(vectorPosition.technology),
                  bottom: mapValueToPercent(vectorPosition.food)
                }}
              >
                <div className="center-glow"></div>
              </div>

              {/* Vector arrow */}
              <svg className="vector-arrow-svg" style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}>
                <defs>
                  <marker
                    id="arrowhead-builder"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#00ff00" />
                  </marker>
                </defs>
                <line
                  x1="0"
                  y1="100%"
                  x2={mapValueToPercent(vectorPosition.technology)}
                  y2={`${toTopPercent(vectorPosition.food)}%`}
                  stroke="#00ff00"
                  strokeWidth="3"
                  markerEnd="url(#arrowhead-builder)"
                  className="vector-line"
                />
              </svg>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ReflectionStage({ onContinue }) {
  return (
    <div className="chapter-content">
      <div className="reflection-section">
        <h3>Reflection: From Words to Direction</h3>
        <p>
          The machine does not remember your sentence as text. Instead, it transforms your words into a single vector—a direction in semantic space that represents your intent.
        </p>
        <p>
          Multiple words become one arrow pointing toward the meaning you're searching for. This vector captures the combined essence of your query without preserving word order or individual words.
        </p>

        <div className="reflection-insights">
          <div className="insight-card">
            <h4>What is a Query Vector?</h4>
            <p>
              A query vector is the average position of all words in your search. It's a single point that summarizes your combined meaning.
            </p>
          </div>
          <div className="insight-card">
            <h4>Why Average?</h4>
            <p>
              By averaging word positions, the machine treats all words equally. Your first word is as important as your last. The result is a stable representation of your intent.
            </p>
          </div>
        </div>

        <p className="transition-prompt">
          Now that the machine has a vector for your query, how does it compare it to documents to find the best matches?
        </p>

        <button className="cta-button" onClick={onContinue}>
          Continue to Chapter 3
        </button>
      </div>
    </div>
  );
}