import React, { useState, useEffect } from 'react';
import {
  Database,
  Send,
  CheckCircle,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  ChevronRight,
  ExternalLink,
  Lock,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { submitSurveyToBlockchain } from './stellar';

const QUESTIONS = [
  {
    id: 1,
    text: "How optimistic are you about the future of Decentralized Finance (DeFi)?",
    options: ["Extremely Optimistic", "Moderately Optimistic", "Neutral", "Skeptical"],
  },
  {
    id: 2,
    text: "Which blockchain feature do you value the most?",
    options: ["Security", "Scalability", "Decentralization", "Low Fees"],
  },
  {
    id: 3,
    text: "Which Stellar use case excites you the most?",
    options: ["Cross-border Payments", "Tokenization of Assets", "DeFi Protocols", "Digital Identity"],
  },
  {
    id: 4,
    text: "Will blockchain replace traditional banking in the next decade?",
    options: ["Yes, definitely", "Partially", "Unlikely", "No"],
  },
];

const STEP_INTRO = 0;
const STEP_SURVEY = 1;
const STEP_SUBMITTING = 2;
const STEP_SUCCESS = 3;
const STEP_ERROR = 4;

function App() {
  const [step, setStep] = useState(STEP_INTRO);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [txDetails, setTxDetails] = useState(null);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [particles, setParticles] = useState([]);

  // Animated background particles
  useEffect(() => {
    const pts = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * -15,
    }));
    setParticles(pts);
  }, []);

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    const newAnswers = { ...answers, [QUESTIONS[currentQ].id]: option };
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelectedOption(null);
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setStep(STEP_SUBMITTING);
        handleSubmit(newAnswers);
      }
    }, 400);
  };

  const handleSubmit = async (finalAnswers) => {
    try {
      setStatusMsg('Generating cryptographic keypair...');
      await new Promise((r) => setTimeout(r, 500));
      setStatusMsg('Funding ephemeral account via Stellar Friendbot...');
      const result = await submitSurveyToBlockchain(finalAnswers);
      setTxDetails(result);
      setStep(STEP_SUCCESS);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unknown error occurred.');
      setStep(STEP_ERROR);
    }
  };

  return (
    <div className="app-shell">
      {/* Particle background */}
      <div className="particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Nav */}
      <nav className="navbar">
        <div className="nav-brand">
          <Database size={20} />
          <span>STELLAR SURVEY</span>
        </div>
        <div className="nav-meta">
          <div className="status-dot" />
          <span>TESTNET ACTIVE</span>
        </div>
      </nav>

      {/* Main */}
      <main className="main-content">

        {/* ── INTRO ── */}
        {step === STEP_INTRO && (
          <div className="fade-in section-intro">
            <div className="hero-icon-wrap">
              <div className="hero-glow" />
              <Globe size={96} className="hero-icon" />
            </div>

            <h1 className="hero-title">Decentralized Future<br />Insights</h1>
            <p className="hero-sub">
              Participate in the global consensus. Your responses are cryptographically hashed
              and permanently anchored on the <span className="highlight">Stellar Blockchain</span> via a real Testnet transaction.
            </p>

            <button id="start-survey-btn" className="btn-primary pulse-animation" onClick={() => setStep(STEP_SURVEY)}>
              Start Survey <Send size={18} />
            </button>

            <div className="trust-badges">
              <div className="badge"><Lock size={14} /> Data Hashed</div>
              <div className="badge"><ShieldCheck size={14} /> Stellar Testnet</div>
              <div className="badge"><Zap size={14} /> 3–5 Second Finality</div>
            </div>

            <div className="stats-grid">
              <div className="stat-card glass-card">
                <div className="stat-value">12.4K</div>
                <div className="stat-label"><Users size={13} /> Submissions</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-value">4s</div>
                <div className="stat-label"><Zap size={13} /> Avg Finality</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-value">100%</div>
                <div className="stat-label"><BarChart3 size={13} /> Immutable</div>
              </div>
            </div>
          </div>
        )}

        {/* ── SURVEY ── */}
        {step === STEP_SURVEY && (
          <div className="fade-in glass-card survey-card">
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>

            <span className="q-meta">
              Question {currentQ + 1} <span className="q-divider">of</span> {QUESTIONS.length}
            </span>

            <h2 className="q-text">{QUESTIONS[currentQ].text}</h2>

            <div className="options-list">
              {QUESTIONS[currentQ].options.map((opt) => (
                <button
                  key={opt}
                  id={`option-${opt.replace(/\s+/g, '-').toLowerCase()}`}
                  className={`survey-option ${selectedOption === opt ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(opt)}
                >
                  <span>{opt}</span>
                  <ChevronRight size={16} className="opt-arrow" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SUBMITTING ── */}
        {step === STEP_SUBMITTING && (
          <div className="fade-in text-center submitting-section">
            <div className="spinner-wrap">
              <div className="spinner" />
              <div className="spinner-inner" />
            </div>
            <h2 className="submitting-title">Anchoring to Stellar...</h2>
            <p className="submitting-status">{statusMsg || 'Connecting to Horizon Testnet...'}</p>
            <div className="submitting-steps">
              <div className="sub-step">🔑 Ephemeral keypair generated</div>
              <div className="sub-step">💧 Funded via Friendbot</div>
              <div className="sub-step">📡 Broadcasting transaction</div>
              <div className="sub-step">✅ Awaiting ledger confirmation</div>
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === STEP_SUCCESS && txDetails && (
          <div className="fade-in glass-card success-card">
            <div className="success-icon-wrap">
              <CheckCircle size={72} className="success-icon" />
            </div>

            <h2 className="success-title">Submission Immutable</h2>
            <p className="success-sub">
              Your survey has been permanently anchored to the Stellar Testnet ledger.
            </p>

            <div className="tx-details">
              <div className="tx-row">
                <span className="tx-label">TX HASH</span>
                <span className="tx-val tx-hash">{txDetails.hash}</span>
              </div>
              <div className="tx-row">
                <span className="tx-label">LEDGER</span>
                <span className="tx-val">{txDetails.ledger}</span>
              </div>
              <div className="tx-row">
                <span className="tx-label">DATA HASH</span>
                <span className="tx-val">{txDetails.dataHash}</span>
              </div>
              <div className="tx-row">
                <span className="tx-label">TIMESTAMP</span>
                <span className="tx-val">{new Date(txDetails.timestamp).toLocaleString()}</span>
              </div>
              <div className="tx-row">
                <span className="tx-label">NETWORK</span>
                <span className="tx-val">Stellar Testnet</span>
              </div>
            </div>

            <a
              href={txDetails.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-explorer"
              id="view-on-explorer-btn"
            >
              View on Stellar Expert <ExternalLink size={16} />
            </a>

            <div className="verified-badge">
              <ShieldCheck size={16} /> VERIFIED BY STELLAR NETWORK
            </div>

            <button className="btn-ghost" onClick={() => { setStep(STEP_INTRO); setAnswers({}); setCurrentQ(0); }}>
              Take Survey Again
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === STEP_ERROR && (
          <div className="fade-in glass-card error-card">
            <AlertCircle size={64} className="error-icon" />
            <h2 className="error-title">Blockchain Error</h2>
            <p className="error-msg">{error}</p>
            <button className="btn-primary" onClick={() => { setStep(STEP_INTRO); setAnswers({}); setCurrentQ(0); }}>
              Try Again
            </button>
          </div>
        )}

      </main>

      <footer className="footer">
        <p>Built with <span className="highlight">Stellar SDK</span> · Data anchored on Stellar Testnet · &copy; 2026</p>
      </footer>
    </div>
  );
}

export default App;
