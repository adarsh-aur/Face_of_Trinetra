import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated particle background — simulates graph nodes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r:  Math.random() * 2 + 1,
      });
    }

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw edges between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 179, 237, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth   = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 179, 237, 0.6)';
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={styles.root}>
      {/* Animated graph background */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <span style={styles.navDot} />
          <span style={styles.navTitle}>Trinetra</span>
        </div>
        <div style={styles.navLinks}>
          <a href="https://github.com/Its-Arie/Face_of_Trinetra" target="_blank" rel="noreferrer" style={styles.navLink}>
            GitHub
          </a>
          <button style={styles.navBtn} onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main style={styles.hero}>
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          Multi-Cloud Threat Intelligence — Active
        </div>

        <h1 style={styles.h1}>
          Intelligent Threat Detection
          <br />
          <span style={styles.h1Accent}>Across Every Cloud</span>
        </h1>

        <p style={styles.subtitle}>
          Trinetra uses heterogeneous Graph Neural Networks to detect, explain, and
          report security threats across AWS, Azure, and GCP — in real time.
        </p>

        <div style={styles.ctaGroup}>
          <button style={styles.ctaPrimary} onClick={() => navigate('/login')}>
            Launch Dashboard
          </button>
          <button style={styles.ctaSecondary} onClick={() => navigate('/register')}>
            Create Account
          </button>
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          {STATS.map((s) => (
            <div key={s.label} style={styles.statCard}>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Features */}
      <section style={styles.features}>
        {FEATURES.map((f) => (
          <div key={f.title} style={styles.featureCard}>
            <div style={styles.featureIcon}>{f.icon}</div>
            <h3 style={styles.featureTitle}>{f.title}</h3>
            <p style={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Cloud badges */}
      <section style={styles.cloudRow}>
        {['AWS', 'Azure', 'GCP'].map((c) => (
          <div key={c} style={styles.cloudBadge}>{c}</div>
        ))}
      </section>

      <footer style={styles.footer}>
        <span>Trinetra &copy; 2025 — Final Year B.Tech Research Project</span>
        <span style={{ opacity: 0.4, marginLeft: 16 }}>Sister Nivedita University</span>
      </footer>
    </div>
  );
}

const STATS = [
  { value: '37',   label: 'Graph Nodes' },
  { value: '205',  label: 'Relationships' },
  { value: '3',    label: 'Cloud Providers' },
  { value: '10',   label: 'Pipeline Stages' },
];

const FEATURES = [
  {
    icon: '⬡',
    title: 'GNN-Based Detection',
    desc:  'RGCN structural scoring + GRU temporal modeling + FT-Transformer fusion produces explainable threat scores for every entity.',
  },
  {
    icon: '◈',
    title: 'SHAP Explainability',
    desc:  'Every threat score is backed by SHAP attribution values showing exactly which features drove the model decision.',
  },
  {
    icon: '◎',
    title: 'Live Graph View',
    desc:  'Real-time heterogeneous graph pulled directly from Neo4j AuraDB — nodes, edges, attack paths, and severity scores.',
  },
  {
    icon: '⬖',
    title: 'Multi-Cloud Coverage',
    desc:  'Ingests CloudTrail, Azure Monitor, and GCP Audit Logs through a unified normalization pipeline.',
  },
];

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight:       '100vh',
    background:      '#060d1a',
    color:           '#e2e8f0',
    fontFamily:      'system-ui, -apple-system, sans-serif',
    overflowX:       'hidden',
    position:        'relative',
  },
  canvas: {
    position:   'fixed',
    top:        0,
    left:       0,
    width:      '100%',
    height:     '100%',
    zIndex:     0,
    pointerEvents: 'none',
  },

  // Nav
  nav: {
    position:       'relative',
    zIndex:         10,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '20px 48px',
    borderBottom:   '1px solid rgba(99,179,237,0.1)',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: 10 },
  navDot: {
    width:        10,
    height:       10,
    borderRadius: '50%',
    background:   '#63b3ed',
    display:      'inline-block',
    boxShadow:    '0 0 8px #63b3ed',
  },
  navTitle:  { fontSize: 20, fontWeight: 700, letterSpacing: '0.04em', color: '#fff' },
  navLinks:  { display: 'flex', alignItems: 'center', gap: 24 },
  navLink: {
    color:          '#94a3b8',
    textDecoration: 'none',
    fontSize:       14,
    transition:     'color .2s',
  },
  navBtn: {
    padding:      '8px 20px',
    background:   'rgba(99,179,237,0.12)',
    border:       '1px solid rgba(99,179,237,0.3)',
    borderRadius: 8,
    color:        '#63b3ed',
    cursor:       'pointer',
    fontSize:     14,
    fontWeight:   500,
    transition:   'background .2s',
  },

  // Hero
  hero: {
    position:   'relative',
    zIndex:     10,
    maxWidth:   760,
    margin:     '0 auto',
    padding:    '100px 24px 64px',
    textAlign:  'center',
  },
  badge: {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            8,
    padding:        '6px 14px',
    borderRadius:   20,
    border:         '1px solid rgba(74,222,128,0.3)',
    background:     'rgba(74,222,128,0.06)',
    color:          '#4ade80',
    fontSize:       12,
    fontWeight:     500,
    marginBottom:   28,
    letterSpacing:  '0.03em',
  },
  badgeDot: {
    width:        6,
    height:       6,
    borderRadius: '50%',
    background:   '#4ade80',
    display:      'inline-block',
    animation:    'pulse 2s infinite',
  },
  h1: {
    fontSize:      'clamp(2rem, 5vw, 3.4rem)',
    fontWeight:    700,
    lineHeight:    1.15,
    marginBottom:  20,
    color:         '#f1f5f9',
    letterSpacing: '-0.01em',
  },
  h1Accent: { color: '#63b3ed' },
  subtitle: {
    fontSize:     'clamp(1rem, 2vw, 1.15rem)',
    color:        '#94a3b8',
    lineHeight:   1.7,
    marginBottom: 40,
    maxWidth:     600,
    margin:       '0 auto 40px',
  },
  ctaGroup: { display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 64 },
  ctaPrimary: {
    padding:      '14px 32px',
    background:   '#2563eb',
    border:       'none',
    borderRadius: 10,
    color:        '#fff',
    fontWeight:   600,
    fontSize:     15,
    cursor:       'pointer',
    transition:   'background .2s, transform .15s',
  },
  ctaSecondary: {
    padding:      '14px 32px',
    background:   'transparent',
    border:       '1px solid rgba(99,179,237,0.3)',
    borderRadius: 10,
    color:        '#63b3ed',
    fontWeight:   600,
    fontSize:     15,
    cursor:       'pointer',
    transition:   'background .2s',
  },

  // Stats
  statsRow: {
    display:   'flex',
    gap:       16,
    justifyContent: 'center',
    flexWrap:  'wrap',
    marginTop: 20,
  },
  statCard: {
    padding:      '20px 28px',
    background:   'rgba(255,255,255,0.03)',
    border:       '1px solid rgba(99,179,237,0.12)',
    borderRadius: 12,
    display:      'flex',
    flexDirection:'column',
    alignItems:   'center',
    minWidth:     110,
  },
  statValue: { fontSize: 28, fontWeight: 700, color: '#63b3ed' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' },

  // Features
  features: {
    position:       'relative',
    zIndex:         10,
    display:        'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap:            20,
    maxWidth:       1000,
    margin:         '0 auto',
    padding:        '0 24px 80px',
  },
  featureCard: {
    padding:      '28px 24px',
    background:   'rgba(255,255,255,0.025)',
    border:       '1px solid rgba(99,179,237,0.1)',
    borderRadius: 14,
    transition:   'border-color .2s',
  },
  featureIcon:  { fontSize: 24, marginBottom: 14, color: '#63b3ed' },
  featureTitle: { fontSize: 15, fontWeight: 600, marginBottom: 10, color: '#e2e8f0' },
  featureDesc:  { fontSize: 13, color: '#64748b', lineHeight: 1.65 },

  // Cloud badges
  cloudRow: {
    position:       'relative',
    zIndex:         10,
    display:        'flex',
    justifyContent: 'center',
    gap:            16,
    paddingBottom:  60,
  },
  cloudBadge: {
    padding:      '8px 22px',
    border:       '1px solid rgba(99,179,237,0.2)',
    borderRadius: 20,
    fontSize:     13,
    fontWeight:   600,
    color:        '#94a3b8',
    background:   'rgba(99,179,237,0.05)',
    letterSpacing:'0.04em',
  },

  // Footer
  footer: {
    position:   'relative',
    zIndex:     10,
    textAlign:  'center',
    padding:    '24px',
    borderTop:  '1px solid rgba(99,179,237,0.08)',
    fontSize:   12,
    color:      '#475569',
  },
};