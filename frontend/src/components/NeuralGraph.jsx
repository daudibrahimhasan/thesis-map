import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fields, edges, totalFaculty } from '../data/graphData';
import faculty from '../data/faculty';
import styles from './NeuralGraph.module.css';

/**
 * NeuralGraph — full-viewport canvas visualisation of research fields.
 *
 * Each node = one research field (circle).
 * Node size proportional to faculty count.
 * Edges = straight lines connecting related fields.
 * Nodes bob gently on independent timings.
 * Hover: dims unrelated, brightens connected, shows tooltip.
 * Click: navigates to /database?area=[fieldname].
 */

/* ── Semantic color mapping — each field gets a unique vibrant color ── */
const FIELD_COLORS = {
  ml_ds:      '#2563EB',
  dl:          '#4338CA',
  nlp:         '#D4A95A',
  cv:          '#475569',
  healthcare: '#14B8A6',
  cyber:       '#DC2626',
  se:          '#6366F1',
  iot:         '#0F766E',
  hci:         '#F59E0B',
  xai:         '#CA8A04',
  emerging:    '#7C3AED',
};

function getNodeColor(id) {
  return FIELD_COLORS[id] || '#4F46E5';
}

/* ── Radius from count ── */
function getRadius(count, w) {
  if (w < 760) {
    return 15 + (count / 12) * 45; // More distinct sizes on mobile
  }
  return 24 + (count / 12) * 48; 
}

/* ── Compute available slots from faculty data ── */
function getAvailable(fieldLabel) {
  return faculty.filter(
    f => f.researchAreas.includes(fieldLabel) && f.availableSlots > 0
  ).length;
}

/* ── Layout positions — organic, hand-placed feel ── */
const layoutPositions = {
  ml_ds:      { rx: 0.40, ry: 0.35 },
  healthcare: { rx: 0.25, ry: 0.55 },
  dl:          { rx: 0.60, ry: 0.25 },
  nlp:         { rx: 0.20, ry: 0.32 },
  cv:          { rx: 0.75, ry: 0.35 },
  cyber:       { rx: 0.82, ry: 0.55 },
  se:          { rx: 0.55, ry: 0.70 },
  hci:         { rx: 0.15, ry: 0.72 },
  xai:         { rx: 0.45, ry: 0.52 },
  emerging:    { rx: 0.70, ry: 0.75 },
  iot:         { rx: 0.88, ry: 0.30 },
};

const layoutPositionsMobile = {
  ml_ds:      { rx: 0.50, ry: 0.30 },
  healthcare: { rx: 0.25, ry: 0.48 },
  dl:         { rx: 0.75, ry: 0.18 },
  nlp:        { rx: 0.22, ry: 0.22 },
  cv:         { rx: 0.80, ry: 0.36 },
  cyber:      { rx: 0.75, ry: 0.58 },
  se:         { rx: 0.50, ry: 0.68 },
  hci:        { rx: 0.25, ry: 0.65 },
  xai:        { rx: 0.50, ry: 0.46 },
  emerging:   { rx: 0.72, ry: 0.80 },
  iot:        { rx: 0.28, ry: 0.82 },
};

export default function NeuralGraph({ onHoverField }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const animRef = useRef(null);

  // Node positions (absolute px), computed on mount / resize
  const nodesRef = useRef([]);
  const [tooltip, setTooltip] = useState(null);
  const hoveredRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const loadPhase = useRef(0); // 0..1 for entrance animation
  const startTime = useRef(null);
  const lastTime = useRef(null);
  const edgesStateRef = useRef(edges.map(e => ({ ...e, currentAlpha: 0, currentWidth: 1 })));

  /* ── Build node objects ── */
  const buildNodes = useCallback((w, h) => {
    const isMobile = w < 760;
    const positions = isMobile ? layoutPositionsMobile : layoutPositions;

    return fields.map(f => {
      const lp = positions[f.id] || { rx: 0.5, ry: 0.5 };
      return {
        ...f,
        x: lp.rx * w,
        y: lp.ry * h,
        baseX: lp.rx * w,
        baseY: lp.ry * h,
        r: getRadius(f.count, w),
        color: getNodeColor(f.id),
        available: getAvailable(f.label),
        bobOffset: Math.random() * Math.PI * 2,
        bobSpeed: 0.15 + Math.random() * 0.15,   // much slower for 6s float
        bobAmp: 3 + Math.random() * 5,
        currentScale: 0,
        currentOpacity: 0,
        currentYOff: 0,
      };
    });
  }, []);

  /* ── Resize handler ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      nodesRef.current = buildNodes(rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [buildNodes]);

  /* ── Draw loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    startTime.current = performance.now();

    const draw = (now) => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (!startTime.current) startTime.current = now;
      if (!lastTime.current) lastTime.current = now;
      const dt = Math.min((now - lastTime.current) / 1000, 0.05); // cap dt
      lastTime.current = now;

      // Entrance phase (0 → 1 over 1.2s)
      const elapsed = (now - startTime.current) / 1000;
      loadPhase.current = Math.min(elapsed / 1.2, 1);
      const lp = loadPhase.current;

      const nodes = nodesRef.current;
      const hId = hoveredRef.current;

      // Connected node IDs for hovered
      const connectedIds = new Set();
      if (hId) {
        connectedIds.add(hId);
        edges.forEach(e => {
          if (e.from === hId) connectedIds.add(e.to);
          if (e.to === hId) connectedIds.add(e.from);
        });
      }

      // Update bob positions
      const t = now / 1000;
      nodes.forEach(n => {
        n.y = n.baseY + Math.sin(t * n.bobSpeed + n.bobOffset) * n.bobAmp;
      });

      const nodeMap = {};
      nodes.forEach(n => { nodeMap[n.id] = n; });

      // ── Draw edges ──
      edgesStateRef.current.forEach((e, i) => {
        const a = nodeMap[e.from];
        const b = nodeMap[e.to];
        if (!a || !b) return;

        // Stagger entrance
        const edgeDelay = 0.6 + i * 0.03;
        const edgeAlpha = Math.max(0, Math.min((elapsed - edgeDelay) / 0.4, 1));
        if (edgeAlpha <= 0) return;

        const strength = e.strength || 2;
        let baseAlpha = 0.28;
        let baseWidth = 1.5;

        if (strength === 3) { baseAlpha = 0.45; baseWidth = 2.2; }
        if (strength === 1) { baseAlpha = 0.12; baseWidth = 0.8; }

        let targetAlpha = baseAlpha * edgeAlpha;
        let targetLineW = baseWidth;

        if (hId) {
          const isConnected = connectedIds.has(e.from) && connectedIds.has(e.to);
          if (isConnected) {
            targetAlpha = strength === 3 ? 0.75 : (strength === 1 ? 0.3 : 0.6);
            targetLineW = baseWidth * 1.6;
          } else {
            targetAlpha = 0.05;
          }
        }

        // lerp
        e.currentAlpha += (targetAlpha - e.currentAlpha) * 0.15;
        e.currentWidth += (targetLineW - e.currentWidth) * 0.15;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(120, 140, 220, ${e.currentAlpha})`;
        if (hId && (connectedIds.has(e.from) && connectedIds.has(e.to))) {
           ctx.strokeStyle = `rgba(90, 110, 255, ${e.currentAlpha})`;
        }
        ctx.lineWidth = e.currentWidth;
        ctx.stroke();
      });

      // ── Draw nodes ──
      nodes.forEach((n, i) => {
        // Stagger entrance
        const nodeDelay = i * 0.06;
        const nodeProgress = Math.max(0, Math.min((elapsed - nodeDelay) / 0.5, 1));
        if (nodeProgress <= 0) return;

        const easedScale = 1 - Math.pow(1 - nodeProgress, 3); // ease-out cubic
        let targetScale = easedScale;
        let targetOpacity = nodeProgress;
        let targetYOff = 0;

        if (hId) {
          if (n.id === hId) {
            targetScale = easedScale * 1.06;
            targetYOff = -6;
            targetOpacity = 1;
          } else if (connectedIds.has(n.id)) {
            targetOpacity = 0.9;
          } else {
            targetOpacity = 0.15;
          }
        }

        // Lerp
        n.currentScale += (targetScale - n.currentScale) * 0.15;
        n.currentOpacity += (targetOpacity - n.currentOpacity) * 0.15;
        n.currentYOff += (targetYOff - n.currentYOff) * 0.15;

        const r = n.r * n.currentScale;
        const drawY = n.y + n.currentYOff;
        const opacity = n.currentOpacity;

        // Node circle - Premium soft glossy sphere
        ctx.beginPath();
        ctx.arc(n.x, drawY, r, 0, Math.PI * 2);
        ctx.globalAlpha = opacity;

        // Fill with linear-gradient approximation for 145deg
        const grad = ctx.createLinearGradient(n.x - r, drawY - r, n.x + r, drawY + r);
        const baseColor = n.color;
        grad.addColorStop(0, lighten(baseColor, 35));
        grad.addColorStop(1, baseColor);
        
        const shadowAlpha = Math.min(0.22, 0.12 + n.currentScale * 0.1);
        ctx.shadowColor = hexToRgba('#3B82F6', shadowAlpha);
        ctx.shadowOffsetY = 10 * n.currentScale;
        ctx.shadowBlur = 30 * n.currentScale;
        
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner highlight for a soft glassy sheen
        ctx.shadowColor = 'transparent';
        ctx.beginPath();
        ctx.arc(n.x, drawY - r*0.4, r*0.5, 0, Math.PI * 2);
        const highlightGrad = ctx.createRadialGradient(n.x, drawY - r*0.5, 0, n.x, drawY - r*0.4, r*0.5);
        highlightGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
        highlightGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = highlightGrad;
        ctx.fill();

        // Subtle border
        ctx.beginPath();
        ctx.arc(n.x, drawY, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 2;
        
        // 10px small, 24px big
        const fontSize = Math.max(10, r * 0.42);
        const fontWeight = 700;
        ctx.font = `${fontWeight} ${fontSize}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillStyle = '#0F172A';
        ctx.fillText(n.label, n.x, drawY);

        ctx.shadowColor = 'transparent';
        ctx.globalAlpha = 1;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  /* ── Mouse interaction ── */
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const nodes = nodesRef.current;
    let found = null;

    for (const n of nodes) {
      const dx = mx - n.x;
      const dy = my - n.y;
      if (dx * dx + dy * dy <= n.r * n.r) {
        found = n;
        break;
      }
    }

    if (found) {
      canvas.style.cursor = 'pointer';
      hoveredRef.current = found.id;
      setHovered(found.id);
      setTooltip({
        label: found.fullName || found.label,
        count: found.count,
        available: found.available,
        x: found.x,
        y: found.y - found.r - 16,
      });
      if (onHoverField) onHoverField(found.id);
    } else {
      canvas.style.cursor = 'default';
      hoveredRef.current = null;
      setHovered(null);
      setTooltip(null);
      if (onHoverField) onHoverField(null);
    }
  }, [onHoverField]);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const nodes = nodesRef.current;
    for (const n of nodes) {
      const dx = mx - n.x;
      const dy = my - n.y;
      if (dx * dx + dy * dy <= n.r * n.r) {
        navigate(`/database?area=${encodeURIComponent(n.label)}`);
        return;
      }
    }
  }, [navigate]);

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = null;
    setHovered(null);
    setTooltip(null);
    if (onHoverField) onHoverField(null);
  }, [onHoverField]);

  /* ── External highlight from DotNav ── */
  useEffect(() => {
    // Expose a method for DotNav to trigger hover externally
    if (canvasRef.current) {
      canvasRef.current._setExternalHover = (id) => {
        hoveredRef.current = id;
        setHovered(id);
        if (id) {
          const node = nodesRef.current.find(n => n.id === id);
          if (node) {
            setTooltip({
              label: node.fullName || node.label,
              count: node.count,
              available: node.available,
              x: node.x,
              y: node.y - node.r - 16,
            });
          }
        } else {
          setTooltip(null);
        }
      };
    }
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
        id="neural-graph-canvas"
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className={styles.tooltipTitle}>{tooltip.label}</div>
          <div className={styles.tooltipMeta}>
            <strong>{tooltip.count} Faculty members</strong><br/>
            Actively researching in this field.
          </div>
        </div>
      )}

      {/* Bottom stat */}
      <div className={styles.bottomStat}>
        {totalFaculty} faculty · click any field to explore
      </div>
    </div>
  );
}

/* ── Helpers ── */
function lighten(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `rgb(${r},${g},${b})`;
}

function hexToRgba(hex, alpha) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}
