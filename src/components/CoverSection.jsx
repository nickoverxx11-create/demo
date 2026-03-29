import React from 'react';
import cat1 from '../image/1.png';
import cat2 from '../image/2.png';
import cat3 from '../image/3.png';


export default function CoverSection({ onEnter }) {
  return (
    <header className="cover-section">
      <div className="grid-background"></div>

      {/* Artist credit badge — top-right */}
      <div className="cover-creator-badge" aria-label="Creator: Zihan">
        <img src={cat3} alt="Zihan" className="cover-creator-avatar" />
        <span className="cover-creator-text">creator <em>zihan</em></span>
      </div>

      <img src={cat1} alt="" className="cover-cat cover-cat-1" aria-hidden="true" />
      <img src={cat2} alt="" className="cover-cat cover-cat-2" aria-hidden="true" />
     
      <div className="content">
        <p className="eyebrow">An Interactive Guide to the Vector Space Model</p>
        <h1 className="main-title">
          The Meaning Machine:
          <br />
          How Search Engines Read Your Mind
        </h1>
        <p className="intro-text">
          Discover how search engines transform human language into mathematical vectors,
          creating a semantic map where meaning becomes geometry and queries become directions.
        </p>
        <button className="cta-button" onClick={onEnter}>
          Enter the Machine
        </button>
      </div>
    </header>
  );
}