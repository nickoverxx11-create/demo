import React from 'react';

export default function CoverSection() {
  const scrollToNext = () => {
    const nextSection = document.querySelector('.chapter-1');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="cover-section">
      <div className="grid-background"></div>
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
        <button className="cta-button" onClick={scrollToNext}>
          Enter the Machine
        </button>
      </div>
    </header>
  );
}