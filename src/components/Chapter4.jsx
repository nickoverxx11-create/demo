import React, { useMemo, useState, useEffect, useRef } from 'react';

const ChapterSection = ({ title, children, className = '' }) => (
  <section className={`chapter-section ${className}`}>
    {title && <h3 className="section-title">{title}</h3>}
    {children}
  </section>
);

const defaultDocuments = [
  { id: 'pizza-recipe', title: 'Pizza Recipe for Beginners', snippet: 'Learn to make fresh pizza at home...', color: '#78ff47' },
  { id: 'pizza-munich', title: 'Best Pizza in Munich', snippet: 'A guide to top pizzerias in the city...', color: '#4dcc0f' },
  { id: 'laptop-guide', title: 'Laptop Buying Guide', snippet: 'Choose the right laptop for your needs...', color: '#ff4b4b' },
  { id: 'cafe-coding', title: 'Coding at a Café', snippet: 'Tips for remote work in public spaces...', color: '#ff8c42' },
  { id: 'bread-history', title: 'History of Italian Bread', snippet: 'The origins of traditional baking...', color: '#d1ff44' },
];

const queryScenarios = {
  pizza: {
    title: 'Query: Pizza Recipe',
    dx: 7,
    dy: 8,
    color: '#00d8ff',
  },
  tech: {
    title: 'Query: Laptop Tech',
    dx: 8,
    dy: 1.5,
    color: '#00d8ff',
  },
  mixed: {
    title: 'Query: Pizza + Laptop',
    dx: 7.5,
    dy: 4.5,
    color: '#00d8ff',
  },
};

const documentVectors = {
  'pizza-recipe': { dx: 6.5, dy: 8.2, type: 'food' },
  'pizza-munich': { dx: 7.2, dy: 7.8, type: 'food' },
  'laptop-guide': { dx: 8.2, dy: 1.2, type: 'tech' },
  'cafe-coding': { dx: 7.5, dy: 2.5, type: 'mixed' },
  'bread-history': { dx: 5.8, dy: 7.5, type: 'food' },
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
};

const ScenarioSelector = ({ scenario, setScenario }) => (
  <div className="scenario-selector">
    {Object.keys(queryScenarios).map(k => (
      <button key={k} type="button" className={scenario === k ? 'active' : ''} onClick={() => setScenario(k)}>
        {k === 'pizza' ? 'Pizza' : k === 'tech' ? 'Tech' : 'Mixed'}
      </button>
    ))}
  </div>
);

const ResultCard = ({ doc, rank, score, isHighlighted, onHover }) => (
  <div
    className={`result-card ${isHighlighted ? 'highlighted' : ''} rank-${rank}`}
    onMouseEnter={() => onHover(doc.id)}
    onMouseLeave={() => onHover(null)}
  >
    <div className="result-rank">#{rank}</div>
    <div className="result-content">
      <h4 className="result-title">{doc.title}</h4>
      <p className="result-snippet">{doc.snippet}</p>
    </div>
    <div className="result-score">
      <div className="score-bar" style={{ width: `${Math.max(20, score * 100)}%` }} />
      <span className="score-value">{(score * 100).toFixed(0)}%</span>
    </div>
  </div>
);

const ResultsList = ({ rankedResults, highlightedResult, onResultHover }) => (
  <div className="results-list">
    <h4>Search Results (Ranked by Similarity)</h4>
    {rankedResults.map((item, idx) => (
      <ResultCard
        key={item.doc.id}
        doc={item.doc}
        rank={idx + 1}
        score={item.score}
        isHighlighted={highlightedResult === item.doc.id}
        onHover={onResultHover}
      />
    ))}
  </div>
);

const SemanticMap = ({ query, documents, highlightedResult }) => {
  const svgRef = useRef(null);

  return (
    <div className="semantic-map">
      <svg ref={svgRef} viewBox="-1 -1 14 12" className="map-svg">
        <defs>
          <marker id="arrow-map" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#ffffff" />
          </marker>
          <pattern id="grid-map" width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M1 0 L0 0 0 1" fill="none" stroke="rgba(0,255,255,0.15)" strokeWidth="0.02" />
          </pattern>
        </defs>
        <rect x="-1" y="-1" width="14" height="12" fill="url(#grid-map)" />
        <line x1="-1" y1="-1" x2="13" y2="-1" stroke="rgba(0,255,255,0.2)" strokeWidth="0.03" />
        <line x1="-1" y1="-1" x2="-1" y2="11" stroke="rgba(0,255,255,0.2)" strokeWidth="0.03" />

        <g className="origin-group">
          <circle cx="0" cy="0" r="0.15" fill="#00d8ff" />
        </g>

        {/* Document vectors */}
        {documents.map(doc => {
          const vec = documentVectors[doc.id];
          const isHighlighted = highlightedResult === doc.id;
          return (
            <g key={doc.id} className={`doc-vector ${isHighlighted ? 'highlighted' : ''}`}>
              <line x1="0" y1="0" x2={vec.dx} y2={vec.dy} stroke={doc.color} strokeWidth={isHighlighted ? 0.2 : 0.13} markerEnd="url(#arrow-map)" className="map-line" />
              <circle cx={vec.dx} cy={vec.dy} r={0.14} fill={doc.color} className={`doc-point ${isHighlighted ? 'glow' : ''}`} />
              <text x={vec.dx + 0.25} y={vec.dy - 0.25} fill={doc.color} fontSize="0.3" fontFamily="Courier New">
                {doc.title.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Query vector */}
        <g className="query-vector">
          <line x1="0" y1="0" x2={query.dx} y2={query.dy} stroke={query.color} strokeWidth="0.22" markerEnd="url(#arrow-map)" className="map-line query-line" />
          <circle cx={query.dx} cy={query.dy} r={0.18} fill={query.color} className="query-point" />
          <text x={query.dx + 0.25} y={query.dy - 0.25} fill={query.color} fontSize="0.35" fontWeight="bold">
            QUERY
          </text>
        </g>
      </svg>
    </div>
  );
};

const FeedbackPanel = ({ message }) => (
  <div className="feedback-panel">
    <p>{message}</p>
  </div>
);

const IntroStage = ({ onContinue }) => (
  <div className="intro-section">
    <p className="chapter-intro">
      Words become points. Sentences become vectors. Vectors can be compared by similarity. Now the machine takes the final step: it ranks all documents by how closely they align with your query.
    </p>
    <p className="stage-transition">This is how search results are born.</p>
    <button type="button" className="cta-button" onClick={onContinue}>
      Make a prediction
    </button>
  </div>
);

const PredictionStage = ({ documents, onDocPredict, predicted }) => (
  <div className="prediction-content">
    <p className="stage-label">RANKING PREDICTION READY</p>
    <p className="stage-subtitle">Which result should rank first?</p>
    <div className="doc-buttons">
      {documents.map(doc => (
        <button key={doc.id} type="button" onClick={() => onDocPredict(doc.id)} className={predicted === doc.id ? 'selected' : ''}>
          {doc.title}
        </button>
      ))}
    </div>
  </div>
);

const ReflectionStage = () => (
  <div className="reflection-content">
    <h4>Reflection: Ranking is Geometry</h4>
    <p>
      Search results are not chosen by intuition. They are computed by comparing vectors and ordering by similarity score.
    </p>
    <p>
      The machine never understood your sentence like a person. It translated it into geometry, compared directions, and ranked the closest meanings first.
    </p>
    <p className="transition-final">
      This is how the meaning machine reads your mind.
    </p>
  </div>
);

export default function Chapter4() {
  const [stage, setStage] = useState('intro');
  const [subStage, setSubStage] = useState(0);
  const [scenario, setScenario] = useState('pizza');
  const [predicted, setPredicted] = useState(null);
  const [highlightedResult, setHighlightedResult] = useState(null);
  const [rankings, setRankings] = useState([]);

  const query = queryScenarios[scenario];

  const computeRankings = (queryVec) => {
    const ranked = defaultDocuments
      .map(doc => {
        const docVec = documentVectors[doc.id];
        const score = vectorMath.cosine(queryVec, docVec);
        return { doc, score };
      })
      .sort((a, b) => b.score - a.score);
    return ranked;
  };

  useEffect(() => {
    setRankings(computeRankings(query));
    setPredicted(null);
    setSubStage(0);
  }, [scenario, query]);

  const feedbackMessage = useMemo(() => {
    if (stage === 'prediction') {
      return 'RANKING PREDICTION READY • SELECT TOP RESULT';
    }
    if (stage === 'reveal') {
      return 'The machine compares every document to the query, then sorts by similarity.';
    }
    if (stage === 'interactive') {
      if (subStage === 0) {
        return 'Change query scenarios to see how rankings change.';
      }
      if (highlightedResult) {
        const result = rankings.find(r => r.doc.id === highlightedResult);
        if (result) {
          return result.score > 0.7
            ? 'Strong alignment - this result is highly relevant.'
            : result.score > 0.4
            ? 'Moderate alignment - some semantic connection.'
            : 'Weak alignment - limited relevance to query.';
        }
      }
      return 'Hover over results to see similarity alignment';
    }
    return '';
  }, [stage, subStage, highlightedResult, rankings]);

  return (
    <section className={`chapter chapter-4${stage === 'intro' ? ' stage-intro-active' : ''}`}>
      <div className="chapter-header">
        <div className="chapter-label">Chapter 4</div>
        <h2 className="chapter-title">From Similarity to Ranking</h2>
        <p className="chapter-subtitle">How vector comparison becomes a search result page.</p>
      </div>

      {stage === 'intro' && (
        <ChapterSection className="stage-intro">
          <IntroStage onContinue={() => setStage('prediction')} />
        </ChapterSection>
      )}

      {stage === 'prediction' && (
        <ChapterSection title="Prediction Stage" className="stage-prediction">
          <p>Query: {query.title}</p>
          <PredictionStage documents={defaultDocuments} onDocPredict={setPredicted} predicted={predicted} />
          {predicted && (
            <button type="button" className="next-btn" onClick={() => setStage('reveal')}>
              Watch the machine rank
            </button>
          )}
        </ChapterSection>
      )}

      {stage === 'reveal' && (
        <ChapterSection title="Ranking Reveal" className="stage-reveal">
          <p>The machine scores each document against the query vector.</p>
          <div className="two-column-reveal">
            <div className="map-col">
              <SemanticMap query={query} documents={defaultDocuments} highlightedResult={null} />
            </div>
            <div className="results-col">
              <ResultsList rankedResults={rankings} highlightedResult={null} onResultHover={() => {}} />
            </div>
          </div>
          <button type="button" className="next-btn" onClick={() => setStage('interactive')}>
            Explore interactively
          </button>
        </ChapterSection>
      )}

      {stage === 'interactive' && (
        <ChapterSection title="Interactive Ranking" className="stage-interactive">
          {subStage === 0 && (
            <div className="controls-section">
              <h4>Change Query Scenario</h4>
              <ScenarioSelector scenario={scenario} setScenario={setScenario} />
              <FeedbackPanel message={feedbackMessage} />
            </div>
          )}

          {subStage === 1 && (
            <>
              <div className="controls-section">
                <h4>Change Query Scenario</h4>
                <ScenarioSelector scenario={scenario} setScenario={setScenario} />
                <FeedbackPanel message={feedbackMessage} />
              </div>

              <div className="two-column">
                <div className="map-col">
                  <SemanticMap
                    query={query}
                    documents={defaultDocuments}
                    highlightedResult={highlightedResult}
                  />
                </div>
                <div className="results-col">
                  <ResultsList
                    rankedResults={rankings}
                    highlightedResult={highlightedResult}
                    onResultHover={setHighlightedResult}
                  />
                </div>
              </div>
            </>
          )}

          {subStage < 1 ? (
            <button type="button" className="next-btn" onClick={() => setSubStage(1)}>
              Show ranking visualization
            </button>
          ) : (
            <button type="button" className="next-btn" onClick={() => setStage('reflection')}>
              Final reflection
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