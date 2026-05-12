import React, { useState, useRef, useCallback } from 'react';
import NeuralGraph from '../components/NeuralGraph';
import DotNav from '../components/DotNav';
import styles from './HomePage.module.css';

/**
 * HomePage — the graph IS the page.
 * Full viewport neural graph below the nav.
 * DotNav on the left side, linked to graph nodes.
 */
export default function HomePage() {
  const [hoveredField, setHoveredField] = useState(null);
  const graphRef = useRef(null);

  /* When DotNav hovers a dot, highlight the graph node */
  const handleDotHover = useCallback((fieldId) => {
    setHoveredField(fieldId);
    // Try to trigger graph highlight externally
    const canvas = document.getElementById('neural-graph-canvas');
    if (canvas && canvas._setExternalHover) {
      canvas._setExternalHover(fieldId);
    }
  }, []);

  /* When graph hovers a node, highlight the dot */
  const handleGraphHover = useCallback((fieldId) => {
    setHoveredField(fieldId);
  }, []);

  return (
    <div className={styles.page}>
      <DotNav activeField={hoveredField} onHover={handleDotHover} />
      <NeuralGraph ref={graphRef} onHoverField={handleGraphHover} />
    </div>
  );
}
