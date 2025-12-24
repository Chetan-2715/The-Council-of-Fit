import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown' // <--- 1. NEW IMPORT
import './App.css'

import Antigravity from './Antigravity'; // <--- NEW IMPORT
import { GridScan } from './GridScan'; // <--- NEW IMPORT

function App() {
  /* 
     1. FIX: Initialize numeric fields as strings to prevent leading '0' glitches 
     during typing (e.g., "05"). We parse them back to numbers on submit.
  */
  const [formData, setFormData] = useState({
    age: "25",
    goal: "Muscle Building",
    sleep_hours: "7",
    stress_level: "Medium",
    soreness: "Low",
    available_time_minutes: "60"
  });

  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [decision, setDecision] = useState(null);
  const [loadingText, setLoadingText] = useState("Summoning the Council...");
  const [showDebate, setShowDebate] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (status === 'loading') {
      const messages = [
        "Drill Sergeant is yelling about intensity...",
        "Zen Master is analyzing your sleep data...",
        "Head Coach is checking your calendar...",
        "Agents are arguing about your rest day..."
      ];
      let i = 0;
      setLoadingText(messages[0]);
      const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingText(messages[i]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // FIX: Just update the string value directly. 
    // This allows "0", "", "05" (temporarily) without fighting the cursor.
    // HTML5 input type="number" prevents non-numeric input anyway.

    let sanitizedValue = value;

    // Prevent negative numbers for specific fields
    if (['age', 'sleep_hours', 'available_time_minutes'].includes(name)) {
      if (Number(value) < 0) return; // Ignore negative inputs
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setLogs([]);
    setDecision(null);
    setShowDebate(false);

    // FIX: Parse numbers here before sending
    const payload = {
      ...formData,
      age: Number(formData.age),
      sleep_hours: Number(formData.sleep_hours),
      available_time_minutes: Number(formData.available_time_minutes)
    };

    try {
      const response = await fetch('http://localhost:8000/api/consult_council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('API Failed');

      const data = await response.json();
      setLogs(data.logs);
      setDecision(data.decision);
      setStatus('complete');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    } catch (err) {
      console.error(err);
      alert("Failed to consult the council. Check backend terminal.");
      setStatus('idle');
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, opacity: 0.8 }}>
        <Antigravity
          count={400}
          magnetRadius={8}
          ringRadius={8}
          waveSpeed={1.5}
          waveAmplitude={3}
          particleSize={1.5}
          lerpSpeed={0.1}
          color={'#8b5cf6'}
          autoAnimate={false}
          particleVariance={15}
          fieldStrength={15}
        />
      </div>
      <div className="container">
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            THE COUNCIL OF FIT
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.5rem 0' }}>Agentic Consensus Engine • CrewAI</p>
        </header>

        <div className="main-grid">
          {/* INPUT FORM */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1rem', color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>📋 User Vitals</h2>
            <form onSubmit={handleSubmit}>
              <label>🎯 Primary Goal</label>
              <select name="goal" value={formData.goal} onChange={handleChange}>
                <option>Muscle Building</option>
                <option>Fat Loss</option>
                <option>Endurance</option>
                <option>Recovery</option>
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <label>🎂 Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} />
                </div>
                <div>
                  <label>⏰ Time (min)</label>
                  <input type="number" name="available_time_minutes" value={formData.available_time_minutes} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <div>
                  <label>🌙 Sleep</label>
                  <input type="number" step="0.5" name="sleep_hours" value={formData.sleep_hours} onChange={handleChange} />
                </div>
                <div>
                  <label>🤯 Stress</label>
                  <select name="stress_level" value={formData.stress_level} onChange={handleChange}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Extreme</option>
                  </select>
                </div>
                <div>
                  <label>🤕 Soreness</label>
                  <select name="soreness" value={formData.soreness} onChange={handleChange}>
                    <option>None</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? '⚡ Summoning...' : '🔥 Start Session'}
              </button>
            </form>
          </div>

          {/* RESULTS SECTION */}
          <div ref={resultsRef} style={{ textAlign: 'left', minHeight: 'auto' }}>

            {status === 'loading' && (
              <div className="glass-card" style={{
                textAlign: 'center',
                padding: '0',
                position: 'relative',
                height: '300px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                  <GridScan
                    scanColor="#8b5cf6"
                    linesColor="#2e1065"
                    gridScale={0.2}
                    scanDuration={2.5}
                    scanGlow={1.5}
                    enablePost={true}
                  />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{
                    color: '#e2e8f0',
                    fontWeight: '600',
                    fontSize: '1.2rem',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    background: 'rgba(0, 0, 0, 0.6)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.5s'
                  }}>
                    {loadingText}
                  </p>
                </div>
              </div>
            )}

            {status === 'complete' && decision && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>

                {/* FINAL VERDICT CARD */}
                <div className="glass-card verdict-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, color: '#a78bfa', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Final Verdict</h3>
                    <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>Confidence: {Math.round(decision.confidence_score * 100)}%</span>
                  </div>

                  {/* 2. USE REACT MARKDOWN HERE TOO */}
                  <div className="final-plan-list">
                    <ReactMarkdown>{decision.final_plan}</ReactMarkdown>
                  </div>

                  <div className="reasoning-text">"{decision.reasoning}"</div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* FULL WIDTH BOTTOM SECTION FOR DEBATE LOGS */}
        {status === 'complete' && decision && (
          <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease' }}>

            {/* TOGGLE BUTTON */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <button
                onClick={() => setShowDebate(!showDebate)}
                className="debate-toggle"
              >
                <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
                <span className="text">{showDebate ? "📜 Hide Debate" : "📜 View Debate"}</span>
                <span className="circle" />
                <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
              </button>
            </div>

            {/* DEBATE LOGS */}
            {showDebate && (
              <div className="chat-container">
                {logs.map((log, index) => {
                  let type = 'coach';
                  let avatar = '⚖️'; // Default for Head Coach

                  if (log.agent.includes('Drill')) {
                    type = 'drill';
                    avatar = '🪖';
                  }
                  if (log.agent.includes('Zen')) {
                    type = 'zen';
                    avatar = '🧘';
                  }

                  return (
                    <div key={index} className={`glass-card chat-bubble ${type}`}>
                      <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexDirection: type === 'zen' ? 'row-reverse' : 'row' }}>
                        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{avatar}</span>
                        <strong className="agent-name" style={{ margin: 0 }}>
                          {log.agent}
                        </strong>
                      </div>
                      {/* 3. THIS FIXES THE **BOLD** TEXT */}
                      <div className="markdown-content">
                        <ReactMarkdown>{log.content}</ReactMarkdown>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default App