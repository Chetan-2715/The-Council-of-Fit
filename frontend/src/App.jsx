import { useState } from 'react'

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'sleep_hours' || name === 'available_time_minutes' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setLogs([]);
    setDecision(null);

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
    } catch (err) {
      console.error(err);
      alert("Failed to consult the council. Check backend.");
      setStatus('idle');
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0, background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          The Council of Fit
        </h1>
        <p style={{ color: '#94a3b8' }}>Agentic AI Fitness Arbitration System</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Input Column */}
        <div className="glass-card">
          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Your Status</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} />
              </div>
              <div>
                <label>Available Time (mins)</label>
                <input type="number" name="available_time_minutes" value={formData.available_time_minutes} onChange={handleChange} />
              </div>
            </div>

            <label>Primary Goal</label>
            <select name="goal" value={formData.goal} onChange={handleChange}>
              <option>Muscle Building</option>
              <option>Fat Loss</option>
              <option>Endurance</option>
              <option>Flexibility/Recovery</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Sleep (hrs)</label>
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
              {status === 'loading' ? 'Summoning Council...' : 'Consult the Council'}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div style={{ textAlign: 'left' }}>
          {status === 'loading' && (
            <div className="glass-card" style={{ textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="spinner"></div>
              <p>The Council is debating your fate...</p>
            </div>
          )}

          {status === 'complete' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Verdict Card */}
              <div className="glass-card verdict-card">
                <h3 style={{ margin: 0, color: '#94a3b8' }}>THE VERDICT</h3>
                <span className="highlight">{decision.final_plan}</span>
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <span>⏱ {decision.duration_minutes} mins</span>
                  <span>🎯 Confidence: {Math.round(decision.confidence_score * 100)}%</span>
                </div>
                <p style={{ fontStyle: 'italic', color: '#cbd5e1' }}>"{decision.reasoning}"</p>
                <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem', color: '#6ee7b7' }}>
                  ✅ Syncing to Google Calendar...
                </div>
              </div>

              {/* Debate Logs */}
              <div className="chat-container">
                <h3 style={{ marginLeft: '0.5rem' }}>Council Transcript</h3>
                {logs.map((log, index) => {
                  let type = 'coach';
                  if (log.agent.includes('Drill')) type = 'drill';
                  if (log.agent.includes('Zen')) type = 'zen';
                  
                  return (
                    <div key={index} className={`glass-card chat-bubble ${type}`}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>{log.agent}</strong>
                      {log.content}
                    </div>
                  )
                })}
              </div>

            </div>
          )}
          
          {status === 'idle' && (
            <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '4rem' }}>
              Waiting for input...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
