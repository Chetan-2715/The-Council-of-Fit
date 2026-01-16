import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { callAgent } from './api/gemini';
import { AGENT_PROMPTS } from './agents/prompts';
import './App.css';

function App() {
  const [step, setStep] = useState('input'); // input, processing, results
  const [wizardStep, setWizardStep] = useState(0); // 0 to 4 for input sections

  const [formData, setFormData] = useState({
    feeling: '',
    heartRate: '',
    stress: 'Medium',
    sleepHours: 7,
    sleepMinutes: 0,
    injuries: '',
    equipment: [],
    goal: 'Just want to stay active',
    notes: ''
  });

  const [councilOpinions, setCouncilOpinions] = useState({});
  const [finalVerdict, setFinalVerdict] = useState(null);

  const SECTIONS = [
    "Feeling", "Health Signals", "Equipment", "Goal", "Notes"
  ];
  const TOTAL_STEPS = SECTIONS.length;

  const nextStep = () => {
    if (!validateStep(wizardStep)) return alert("Please fill in the required fields to continue.");
    if (wizardStep < TOTAL_STEPS - 1) setWizardStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (wizardStep > 0) setWizardStep(prev => prev - 1);
  };

  const validateStep = (currentStep) => {
    if (currentStep === 0 && !formData.feeling) return false;
    return true;
  };

  const jumpToStep = (index) => {
    // Only allow jumping if previous mandatory steps are met
    if (index > wizardStep && !validateStep(wizardStep)) return alert("Complete the current step first.");
    setWizardStep(index);
  };

  const EQUIPMENT_OPTIONS = [
    "No equipment (bodyweight)", "Dumbbells", "Barbell",
    "Resistance bands", "Bench", "Treadmill/Cardio", "Full Gym"
  ];

  const FEELING_OPTIONS = [
    "Energetic", "Slightly tired", "Very tired",
    "Muscle soreness", "Joint pain", "Stressed but motivated"
  ];

  const handleEquipmentChange = (item) => {
    setFormData(prev => {
      const exists = prev.equipment.includes(item);
      if (exists) return { ...prev, equipment: prev.equipment.filter(e => e !== item) };
      return { ...prev, equipment: [...prev.equipment, item] };
    });
  };

  const runCouncil = async () => {
    if (!formData.feeling) return alert("Please select how you are feeling!");

    setStep('processing');
    setCouncilOpinions({});
    setFinalVerdict(null);

    // 1. Initial Independent Analysis
    const agents = Object.keys(AGENT_PROMPTS).filter(name => name !== 'Risk & Conflict Resolver');

    const opinions = {};

    // We run them in parallel. Rate limits are handled by Dual Clients logic in api/gemini.js
    const promises = agents.map(async (agentName) => {
      const response = await callAgent(agentName, AGENT_PROMPTS[agentName], formData);
      return { name: agentName, response };
    });

    try {
      const results = await Promise.all(promises);
      results.forEach(r => opinions[r.name] = r.response);
      setCouncilOpinions({ ...opinions });

      // 2. Conflict Resolution
      const resolverName = 'Risk & Conflict Resolver';
      const resolution = await callAgent(
        resolverName,
        AGENT_PROMPTS[resolverName],
        formData,
        opinions
      );

      setFinalVerdict(resolution);
      setStep('results');

    } catch (e) {
      console.error(e);
      alert("Something went wrong invoking the Council.");
      setStep('input');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>🏛️ The Council of Fit</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Human + Machine Decision Support System
        </p>
      </header>

      {step === 'input' && (
        <div className="input-flow animate-fade-in">

          {/* Stepper Navigation */}
          <div className="stepper-nav">
            {SECTIONS.map((label, idx) => (
              <div key={idx}
                className={`step-indicator ${wizardStep === idx ? 'active' : ''} ${wizardStep > idx ? 'completed' : ''}`}
                onClick={() => jumpToStep(idx)}
              >
                <div className="step-bubble">{idx + 1}</div>
                <div className="step-label">{label}</div>
              </div>
            ))}
          </div>

          <div style={{ minHeight: '300px' }}>
            {wizardStep === 0 && (
              <div className="glass-card animate-slide-in">
                <h2>How are you feeling? <span style={{ fontSize: '0.8em', color: 'var(--secondary)' }}>(Required)</span></h2>
                <div className="checkbox-grid">
                  {FEELING_OPTIONS.map(opt => (
                    <div key={opt}
                      className={`checkbox-item ${formData.feeling === opt ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, feeling: opt })}
                      style={{ background: formData.feeling === opt ? 'rgba(0, 242, 234, 0.2)' : '' }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 1 && (
              <div className="glass-card animate-slide-in">
                <h2>Health Signals <span style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}>(Optional)</span></h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Resting HR (bpm)</label>
                    <input type="number"
                      min="0"
                      value={formData.heartRate}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val < 0) return;
                        setFormData({ ...formData, heartRate: e.target.value })
                      }}
                      placeholder="e.g. 60"
                    />
                  </div>
                  <div>
                    <label>Sleep Duration</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div className="counter-input">
                        <button onClick={() => setFormData(prev => ({ ...prev, sleepHours: Math.max(0, prev.sleepHours - 1) }))}>-</button>
                        <input type="number" value={formData.sleepHours} readOnly />
                        <button onClick={() => setFormData(prev => ({ ...prev, sleepHours: Math.min(24, prev.sleepHours + 1) }))}>+</button>
                      </div>
                      <span>h</span>
                      <div className="counter-input">
                        <button onClick={() => setFormData(prev => ({ ...prev, sleepMinutes: Math.max(0, prev.sleepMinutes - 10) }))}>-</button>
                        <input type="number" value={formData.sleepMinutes} readOnly />
                        <button onClick={() => setFormData(prev => ({ ...prev, sleepMinutes: Math.min(59, prev.sleepMinutes + 10) }))}>+</button>
                      </div>
                      <span>m</span>
                    </div>
                  </div>
                  <div>
                    <label>Stress Level</label>
                    <select value={formData.stress} onChange={e => setFormData({ ...formData, stress: e.target.value })}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div>
                    <label>Injuries / Pain?</label>
                    <input type="text"
                      value={formData.injuries}
                      onChange={e => setFormData({ ...formData, injuries: e.target.value })}
                      placeholder="e.g. Right knee"
                    />
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="glass-card animate-slide-in">
                <h2>Available Equipment <span style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}>(Optional)</span></h2>
                <div className="checkbox-grid">
                  {EQUIPMENT_OPTIONS.map(eq => (
                    <div key={eq} className="checkbox-item" onClick={() => handleEquipmentChange(eq)}>
                      <input type="checkbox" checked={formData.equipment.includes(eq)} readOnly />
                      <span>{eq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="glass-card animate-slide-in">
                <h2>Your Goal <span style={{ fontSize: '0.6em', color: 'var(--secondary)' }}>(Required)</span></h2>
                <select value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })}>
                  <option>Build strength</option>
                  <option>Fat loss</option>
                  <option>Light recovery workout</option>
                  <option>Mobility / stretching</option>
                  <option>Cardio</option>
                  <option>Wait to stay active</option>
                </select>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="glass-card animate-slide-in">
                <h2>Any Notes? <span style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}>(Optional)</span></h2>
                <textarea
                  rows="3"
                  placeholder="I feel good but my knee is slightly painful..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            )}
          </div>

          <div className="wizard-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={prevStep} disabled={wizardStep === 0} style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
              Back
            </button>

            {wizardStep < TOTAL_STEPS - 1 ? (
              <button className="primary-btn" style={{ flex: 1 }} onClick={nextStep}>
                Next
              </button>
            ) : (
              <button className="primary-btn" style={{ flex: 1 }} onClick={runCouncil}>
                Summon the Council
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="processing-state">
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <h2>The Council is Deliberating...</h2>
            <div className="loading-pulse">Analyzing Biometrics...</div>
            <br />
            <div className="loading-pulse" style={{ animationDelay: '0.5s' }}>Consulting Safety Protocols...</div>
            <br />
            <div className="loading-pulse" style={{ animationDelay: '1s' }}>Optimizing for Goals...</div>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div className="results-view animate-fade-in">

          <div className="glass-card">
            <h3>📝 User Summary</h3>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
              <li><strong>Feeling:</strong> {formData.feeling}</li>
              {formData.heartRate && <li><strong>HR:</strong> {formData.heartRate} bpm</li>}
              <li><strong>Sleep:</strong> {formData.sleepHours}h {formData.sleepMinutes}m</li>
              <li><strong>Stress:</strong> {formData.stress}</li>
              <li><strong>Goal:</strong> {formData.goal}</li>
              <li><strong>Equipment:</strong> {formData.equipment.length > 0 ? formData.equipment.join(", ") : "None"}</li>
            </ul>
          </div>

          <div className="glass-card conflict-resolver">
            <h2>⚖️ The Verdict (Conflict Resolution)</h2>
            <div className="markdown-content">
              <ReactMarkdown>{finalVerdict}</ReactMarkdown>
            </div>
          </div>

          <h3>Council Opinions</h3>
          <div className="agent-grid">
            {Object.entries(councilOpinions).map(([name, opinion]) => (
              <div key={name} className="agent-card">
                <div className="agent-name">{name}</div>
                <div className="agent-role">{AGENT_PROMPTS[name].match(/Focus: (.*)/)?.[1] || "Advisor"}</div>
                <div className="markdown-content">
                  <ReactMarkdown>{opinion}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ marginTop: '2rem', textAlign: 'center', border: '1px solid var(--primary)' }}>
            <h2>Your Choice</h2>
            <p>The Council has spoken. These are suggestions, not commands. Choose what feels right for you today.</p>
            <button onClick={() => setStep('input')} style={{ marginTop: '1rem' }}>
              Start New Session
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default App;