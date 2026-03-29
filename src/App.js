import React, { useState, useEffect, useCallback } from 'react';
import CoverSection from './components/CoverSection';
import Chapter1 from './components/Chapter1';
import Chapter2 from './components/Chapter2';
import Chapter3 from './components/Chapter3';

const PAGES = ['cover', 'chapter1', 'chapter2', 'chapter3'];

function App() {
  const [page, setPage] = useState(0); // 0=cover, 1=ch1, 2=ch2, 3=ch3

  /* Lock scroll globally */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const goUp = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goDown = useCallback(() => setPage((p) => Math.min(PAGES.length - 1, p + 1)), []);

  return (
    <div className="App">
      {page === 0 && <CoverSection onEnter={() => setPage(1)} />}
      {page === 1 && <Chapter1 onNext={() => setPage(2)} />}
      {page === 2 && <Chapter2 onNext={() => setPage(3)} />}
      {page === 3 && <Chapter3 onBackToCover={() => setPage(0)} />}

      {/* Arrow navigation — only shown on chapters, not cover */}
      {page >= 1 && (
        <nav className="page-nav">
          <button
            className="page-nav-arrow"
            onClick={goUp}
            disabled={page <= 1}
            aria-label="Previous chapter"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 9L7 4L12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className="page-nav-dots">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`page-nav-dot${page === n ? ' active' : ''}`}
                onClick={() => setPage(n)}
                aria-label={`Chapter ${n}`}
              />
            ))}
          </div>

          <button
            className="page-nav-arrow"
            onClick={goDown}
            disabled={page >= PAGES.length - 1}
            aria-label="Next chapter"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5L7 10L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;