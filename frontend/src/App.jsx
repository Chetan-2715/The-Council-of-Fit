import { useState, useEffect, useRef } from 'react'

function App() {
  const [formData, setFormData] = useState({
    age: 25,
    goal: "Muscle Building",
    sleep_hours: 7,
    stress_level: "Medium",
    soreness: "Low",
    available_time_minutes: 60
  });

  const [status, setStatus] = useState('idle'); // idle, loading, complete
  const [logs, setLogs] = useState([]);
  const [decision, setDecision] = useState(null);
  const [loadingText, setLoadingText] = useState("Summoning the Council...");
  const [showDebate, setShowDebate] = useState(false); // <--- NEW STATE FOR COLLAPSE
  const resultsRef = useRef(null);

  // Animated Loading Text Logic
  useEffect(() => {
    if (status === 'loading') {
      const messages = [
        "Drill Sergeant is yelling about intensity...",
        "Zen Master is analyzing your sleep data...",
        "Head Coach is checking your calendar...",
        "Agents are arguing about your rest day...",
        "Drill Sergeant is demanding more burpees...",
        "Zen Master is suggesting meditation..."
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
    setShowDebate(false); // Reset debate visibility on new search

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

  const formatPoints = (text) => {
    if (!text) return null;
    const points = text.split(/(?:\r\n|\r|\n|(?<=[.!?])\s+)/).filter(p => p.trim().length > 3);
    return (
      <ul className="point-list">
        {points.map((point, i) => <li key={i}>{point.trim()}</li>)}
      </ul>
    );
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
        {/* INPUT SECTION */}
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
        <div ref={resultsRef} style={{ textAlign: 'left', minHeight: '50vh' }}>

          {/* LOADING STATE */}
          {status === 'loading' && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
              <p style={{ color: '#a78bfa', fontWeight: '500', fontSize: '1.1rem', animation: 'fadeIn 0.5s' }}>
                {loadingText}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                (Please wait while agents debate...)
              </p>
            </div>
          )}

          {/* COMPLETE STATE */}
          {status === 'complete' && decision && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>

              {/* Verdict Card */}
              <div className="glass-card verdict-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: '#a78bfa', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Final Verdict</h3>
                  <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>Confidence: {Math.round(decision.confidence_score * 100)}%</span>
                </div>

                <div className="final-plan-list">
                  {formatPoints(decision.final_plan)}
                </div>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1', marginTop: '1rem' }}>
                  <span>⏱ Duration: {decision.duration_minutes} mins</span>
                </div>

                <div className="reasoning-text">
                  "{decision.reasoning}"
                </div>
              </div>

              {/* ---------------- NEW SECTION: MEET THE COUNCIL ---------------- */}
              <div style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meet the Council Members:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

                  {/* Drill Sergeant Profile */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                    <strong style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>Drill Sergeant</strong>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Cares about <b>Intensity</b> & <b>Consistency</b>. Hates excuses.</span>
                  </div>

                  {/* Zen Master Profile */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                    <strong style={{ color: '#10b981', fontSize: '0.8rem', display: 'block' }}>Zen Master</strong>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Cares about <b>Recovery</b> & <b>Longevity</b>. Prioritizes sleep.</span>
                  </div>

                </div>
              </div>

              {/* ---------------- COLLAPSIBLE DEBATE SECTION ---------------- */}
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <button
                  onClick={() => setShowDebate(!showDebate)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #334155',
                    fontSize: '0.8rem',
                    padding: '0.5rem 1rem',
                    width: 'auto',
                    color: '#94a3b8'
                  }}
                >
                  {showDebate ? " Hide Debate Transcript ▴" : "📜 Click to see the debate ▾"}
                </button>
              </div>

              {/* Only show logs if showDebate is true */}
              {showDebate && (
                <div className="chat-container" style={{ animation: 'fadeIn 0.3s ease' }}>
                  {logs.map((log, index) => {
                    let type = 'coach';
                    if (log.agent.includes('Drill')) type = 'drill';
                    if (log.agent.includes('Zen')) type = 'zen';

                    return (
                      <div key={index} className={`glass-card chat-bubble ${type}`}>
                        <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem', opacity: 0.7 }}>
                          {log.agent}
                        </strong>
                        {formatPoints(log.content)}
                      </div>
                    )
                  })}
                </div>
              )}

            </div>
          )}

          {status === 'idle' && (
            <div style={{ opacity: 0.3, textAlign: 'center', paddingTop: '4rem', fontSize: '0.9rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏛️</div>
              Waiting for user vitals...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App