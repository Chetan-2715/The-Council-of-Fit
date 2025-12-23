import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown' // <--- 1. NEW IMPORT
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    age: 25,
    goal: "Muscle Building",
    sleep_hours: 7,
    stress_level: "Medium",
    soreness: "Low",
    available_time_minutes: 60
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
    setFormData(prev => ({
      ...prev,
      [name]: ['age', 'sleep_hours', 'available_time_minutes'].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setLogs([]);
    setDecision(null);
    setShowDebate(false);

    try {
      const response = await fetch('http://localhost:8000/api/consult_council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
            <label>Primary Goal</label>
            <select name="goal" value={formData.goal} onChange={handleChange}>
              <option>Muscle Building</option>
              <option>Fat Loss</option>
              <option>Endurance</option>
              <option>Recovery</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} />
              </div>
              <div>
                <label>Time (min)</label>
                <input type="number" name="available_time_minutes" value={formData.available_time_minutes} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label>Sleep</label>
                <input type="number" step="0.5" name="sleep_hours" value={formData.sleep_hours} onChange={handleChange} />
              </div>
              <div>
                <label>Stress</label>
                <select name="stress_level" value={formData.stress_level} onChange={handleChange}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Extreme</option>
                </select>
              </div>
              <div>
                <label>Soreness</label>
                <select name="soreness" value={formData.soreness} onChange={handleChange}>
                  <option>None</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Summoning...' : 'Start Session'}
            </button>
          </form>
        </div>

        {/* RESULTS SECTION */}
        <div ref={resultsRef} style={{ textAlign: 'left', minHeight: 'auto' }}>

          {status === 'loading' && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
              <p style={{ color: '#a78bfa', fontWeight: '500', fontSize: '1.1rem', animation: 'fadeIn 0.5s' }}>{loadingText}</p>
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
              {showDebate ? "Hide Debate Transcript ▴" : "📜 Click to see the debate ▾"}
            </button>
          </div>

          {/* DEBATE LOGS */}
          {showDebate && (
            <div className="chat-container">
              {logs.map((log, index) => {
                let type = 'coach';
                if (log.agent.includes('Drill')) type = 'drill';
                if (log.agent.includes('Zen')) type = 'zen';

                return (
                  <div key={index} className={`glass-card chat-bubble ${type}`}>
                    <strong className="agent-name">
                      {log.agent}
                    </strong>
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
  )
}

export default App