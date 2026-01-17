import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { callPanel, callResolver } from './api/gemini';
// import { AGENT_PROMPTS } from './agents/prompts'; // No longer needed directly here
import { AGENT_PROMPTS } from './agents/prompts'; // Keeping for UI card labels if needed, or we can mock them. Actually let's keep it but we might need to adjust the UI mapping.
// Wait, the UI uses AGENT_PROMPTS keys for mapping. Let's fix that.
// The new architecture returns a mapped object in runCouncil, so we iterate over councilOpinions keys directly.
// The UI uses AGENT_PROMPTS[name] to get the role description.
// We should update the UI to not rely on AGENT_PROMPTS for roles if the keys change, but I kept the keys same in formattedOpinions.
// However, I should make sure AGENT_PROMPTS is still imported or define a static map for titles.

import Loader from './Loader';
import LightRays from './LightRays';
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
  const [disagreementsFound, setDisagreementsFound] = useState(false);
  const [dataMissing, setDataMissing] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // Toggle for advisor cards
  const [showSummary, setShowSummary] = useState(false); // Toggle for main discussion

  // Helper to extract specific sections from the Markdown verdict
  const getSafeOptions = (text) => {
    if (!text) return null;
    // Look for ## Safe Options until the next ## header or end of string
    const match = text.match(/## Safe Options([\s\S]*?)(?=##|$)/i);
    return match ? match[1].trim() : null;
  };

  const safeOptionsContent = getSafeOptions(finalVerdict);

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
    setDisagreementsFound(false); // Reset flags
    setDataMissing(false);
    setShowDetails(false); // Reset details toggle
    setShowSummary(false); // Reset summary toggle

    // Context Construction
    const userContext = {
      feelingToday: formData.feeling,
      healthSignals: {
        heartRate: formData.heartRate,
        sleep: `${formData.sleepHours}h ${formData.sleepMinutes}m`,
        stress: formData.stress,
        injuries: formData.injuries
      },
      equipmentAvailable: formData.equipment,
      goalToday: formData.goal,
      extraNotes: formData.notes
    };

    try {
      // 1. STEP ONE: THE PANEL (Single Call)
      console.log("Calling Panel...");
      const panelResults = await callPanel(userContext);

      if (panelResults.error) throw new Error(panelResults.error);

      // Map structured JSON to display format for UI
      const formattedOpinions = {
        "Body Safety Advisor": panelResults.bodySafetyAdvisor?.summary + "\n\n**Reasoning:** " + panelResults.bodySafetyAdvisor?.reasoning,
        "Energy & Recovery Advisor": panelResults.energyRecoveryAdvisor?.summary + "\n\n**Reasoning:** " + panelResults.energyRecoveryAdvisor?.reasoning,
        "Health & Stress Advisor": panelResults.healthStressAdvisor?.summary + "\n\n**Reasoning:** " + panelResults.healthStressAdvisor?.reasoning,
        "Equipment & Feasibility Advisor": "Suggested: " + panelResults.equipmentAdvisor?.availableEquipment?.join(", "),
        "Goal Optimization Advisor": panelResults.goalAdvisor?.goalAlignment + "\n\n" + panelResults.goalAdvisor?.suggestedFocus,
        "Consistency & Motivation Advisor": panelResults.motivationAdvisor?.motivationState + "\n\n" + panelResults.motivationAdvisor?.sustainabilityAdvice
      };

      setCouncilOpinions(formattedOpinions);

      // 2. STEP TWO: THE RESOLVER (Single Call)
      console.log("Calling Resolver...");
      const resolutionMarkdown = await callResolver(userContext, panelResults);

      setFinalVerdict(resolutionMarkdown);

      // Simple keyword detection for flags (since Resolver now returns Markdown, not JSON)
      if (resolutionMarkdown.toLowerCase().includes("disagree")) {
        setDisagreementsFound(true);
      }
      if (resolutionMarkdown.toLowerCase().includes("missing")) {
        setDataMissing(true);
      }

      setStep('results');

    } catch (e) {
      console.error(e);
      alert("Something went wrong invoking the Council. Please try again.");
      setStep('input');
    }
  };

  return (
    <div className="app-container">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <LightRays
          raysColor="#00f2ea"
          raysOrigin="top-center"
          raysSpeed={0.4}
          lightSpread={1.2}
          rayLength={1.5}
          fadeDistance={1.0}
        />
      </div>
      <header>
        <h1><span className="emoji-fix">🏛️</span> The Council of Fit</h1>
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

          <div>
            {wizardStep === 0 && (
              <div className="glass-card animate-slide-in">
                <h2>How are you feeling? <span style={{ fontSize: '0.8em', color: 'var(--secondary)' }}></span></h2>
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
                <h2>Health Signals <span style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}></span></h2>
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
                <h2>Available Equipment <span style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}></span></h2>
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
                <h2>Your Goal <span style={{ fontSize: '0.6em', color: 'var(--secondary)' }}></span></h2>
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
                <h2>Any Notes? <span style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}></span></h2>
                <textarea
                  rows="3"
                  placeholder="I feel good but my knee is slightly painful..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            )}
          </div>

          <div className="wizard-actions">
            <button
              className="secondary-btn"
              onClick={prevStep}
              style={{ visibility: wizardStep === 0 ? 'hidden' : 'visible' }}
            >
              Back
            </button>

            {wizardStep < TOTAL_STEPS - 1 ? (
              <button className="primary-btn" onClick={nextStep}>
                Next
              </button>
            ) : (
              <button className="primary-btn" onClick={runCouncil}>
                Summon the Council
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="processing-state" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <div className="glass-card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3rem',
            padding: '3rem',
            flexDirection: 'row',
            maxWidth: '800px',
            width: '100%'
          }}>
            {/* Left Side: New Graphic Loader */}
            <div style={{ flex: '0 0 auto' }}>
              <Loader />
            </div>

            {/* Right Side: Text Updates */}
            <div style={{ flex: 1, borderLeft: '1px solid var(--glass-border)', paddingLeft: '3rem' }}>
              <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>The Council is Deliberating...</h2>
              <div className="loading-pulse" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Analyzing Biometrics...</div>
              <div className="loading-pulse" style={{ animationDelay: '0.5s', fontSize: '1.2rem', marginBottom: '1rem' }}>Consulting Safety Protocols...</div>
              <div className="loading-pulse" style={{ animationDelay: '1s', fontSize: '1.2rem' }}>Optimizing for Goals...</div>
            </div>
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

          <div className="glass-card" style={{ border: '1px solid var(--primary)', background: 'rgba(0, 242, 234, 0.05)' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>✅ Recommended Action Plan</h2>
            <div className="markdown-content">
              {safeOptionsContent ? (
                <ReactMarkdown>{safeOptionsContent}</ReactMarkdown>
              ) : (
                <p>See full discussion below.</p>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <button
              className="secondary-btn"
              onClick={() => setShowSummary(prev => !prev)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {showSummary ? "Hide Council Discussion Summary ▲" : "Show Council Discussion Summary ▼"}
            </button>
          </div>

          {showSummary && (
            <div className="glass-card conflict-resolver animate-fade-in">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                ⚖️ Council Discussion Summary
                {(disagreementsFound || dataMissing) && (
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                    {disagreementsFound && (
                      <span style={{ background: '#ff0055', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                        ⚠ DISAGREEMENTS FOUND
                      </span>
                    )}
                    {dataMissing && (
                      <span style={{ background: '#eab308', color: 'black', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                        ⚠ DATA MISSING
                      </span>
                    )}
                  </div>
                )}
              </h2>

              <div className="markdown-content">
                <ReactMarkdown>{finalVerdict}</ReactMarkdown>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <button
              className="secondary-btn"
              onClick={() => setShowDetails(prev => !prev)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {showDetails ? "Hide Individual Opinions ▲" : "Show Individual Opinions ▼"}
            </button>
          </div>

          {showDetails && (
            <div className="animate-fade-in">
              <h3>Council Opinions</h3>
              <div className="agent-grid">
                {Object.entries(councilOpinions).map(([name, opinion]) => (
                  <div key={name} className="agent-card">
                    <div className="agent-name">{name}</div>
                    <div className="agent-role">{AGENT_PROMPTS && AGENT_PROMPTS[name] ? (AGENT_PROMPTS[name].match(/Focus: (.*)/)?.[1] || "Advisor") : "Advisor"}</div>
                    <div className="markdown-content">
                      <ReactMarkdown>{opinion}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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