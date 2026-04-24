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
  Coins
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
  }
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
      setStatusMsg('Connecting to Stellar Network...');
      await new Promise(r => setTimeout(r, 500));
      setStatusMsg('Anchoring survey hash to ledger...');
      const result = await submitSurveyToBlockchain(finalAnswers);
      
      setStatusMsg('Issuing SURVEY reward tokens...');
      await new Promise(r => setTimeout(r, 800));
      
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
      <div className="particles"></div>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

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

      <main className="main-content">
        {step === STEP_INTRO && (
          <div className="fade-in section-intro">
            <div className="hero-icon-wrap">
              <div className="hero-glow" />
              <Globe size={96} className="hero-icon" />
            </div>
            <h1 className="hero-title">Decentralized Future<br />Insights</h1>
            <p className="hero-sub">
              Participate in the global consensus. Your responses are anchored on Stellar, and you will receive <span className="highlight">SURVEY tokens</span> as a reward for your participation.
            </p>
            <button className="btn-primary pulse-animation" onClick={() => setStep(STEP_SURVEY)}>
              Start Survey <Send size={18} />
            </button>
            <div className="trust-badges">
              <div className="badge"><Lock size={14} /> Soroban Optimized</div>
              <div className="badge"><Coins size={14} /> Token Rewards</div>
              <div className="badge"><ShieldCheck size={14} /> Immutable Audit</div>
            </div>
          </div>
        )}

        {step === STEP_SURVEY && (
          <div className="fade-in glass-card survey-card">
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="q-meta">Question {currentQ + 1} of {QUESTIONS.length}</span>
            <h2 className="q-text">{QUESTIONS[currentQ].text}</h2>
            <div className="options-list">
              {QUESTIONS[currentQ].options.map((opt) => (
                <button
                  key={opt}
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

        {step === STEP_SUBMITTING && (
          <div className="fade-in text-center submitting-section">
            <div className="spinner-wrap">
              <div className="spinner" />
              <div className="spinner-inner" />
            </div>
            <h2 className="submitting-title">Stellar Processing...</h2>
            <p className="submitting-status">{statusMsg}</p>
          </div>
        )}

        {step === STEP_SUCCESS && txDetails && (
          <div className="fade-in glass-card success-card">
            <div className="success-icon-wrap">
              <CheckCircle size={72} className="success-icon" />
            </div>
            <h2 className="success-title">Insights Anchored</h2>
            <p className="success-sub">Transaction confirmed on the Stellar Network.</p>

            <div className="tx-details">
              <div className="tx-row">
                <span className="tx-label">TX HASH</span>
                <span className="tx-val tx-hash">{txDetails.hash}</span>
              </div>
              <div className="tx-row">
                <span className="tx-label">REWARD</span>
                <span className="tx-val text-primary font-bold">1.0 {txDetails.reward?.assetCode} Minted</span>
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
            >
              View on Stellar Expert <ExternalLink size={16} />
            </a>

            <div className="verified-badge">
              <ShieldCheck size={16} /> VERIFIED BY STELLAR CONSENSUS
            </div>
          </div>
        )}

        {step === STEP_ERROR && (
          <div className="fade-in glass-card error-card">
            <AlertCircle size={64} className="error-icon" />
            <h2 className="error-title">Submission Error</h2>
            <p className="error-msg">{error}</p>
            <button className="btn-primary" onClick={() => setStep(STEP_INTRO)}>Try Again</button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with <span className="highlight">Stellar SDK & Soroban</span> · &copy; 2026</p>
      </footer>
    </div>
  );
}

export default App;
