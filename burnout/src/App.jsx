import React, { useState } from "react";
import "./App.css";

const QUESTIONS = [
  { id: "sleep_quality", text: "I sleep well and wake up feeling rested.", dimension: "sleep", reverse: true },
  { id: "sleep_problems", text: "Recently, I have trouble falling asleep or staying asleep because of work or study.", dimension: "sleep", reverse: false },
  { id: "motivation_drop", text: "I feel less motivated to work or study than I used to.", dimension: "motivation", reverse: false },
  { id: "dread_mornings", text: "I often feel a sense of dread when I think about the upcoming work/study day.", dimension: "emotion", reverse: false },
  { id: "cynicism", text: "I feel more negative or cynical about my work or studies.", dimension: "emotion", reverse: false },
  { id: "concentration", text: "I find it hard to concentrate or make decisions.", dimension: "workload", reverse: false },
  { id: "overwhelmed", text: "I feel overwhelmed by the amount of work I have.", dimension: "workload", reverse: false },
  { id: "exhaustion_end_of_day", text: "At the end of the day, I feel completely emotionally and physically exhausted.", dimension: "emotion", reverse: false },
  { id: "enjoyment", text: "I still enjoy parts of my work/study and find them meaningful.", dimension: "motivation", reverse: true },
  { id: "detachment", text: "I feel detached from the people I work or study with (e.g., classmates, colleagues).", dimension: "emotion", reverse: false },
];

const OPTIONS = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Always" },
];

function getRiskLevel(normalizedScore) {
  if (normalizedScore < 0.33)
    return { label: "Low risk", color: "#16a34a", description: "Your answers suggest a low current risk of burnout. Keep maintaining healthy habits and balance." };
  else if (normalizedScore < 0.66)
    return { label: "Moderate risk", color: "#f97316", description: "There are some signs of stress that could grow into burnout if ignored. It may help to adjust workload and add rest." };
  else
    return { label: "High risk", color: "#dc2626", description: "Your answers suggest several burnout indicators. Consider reaching out for support and making concrete changes to your schedule and habits." };
}

function generateAdvice(dimensionScores) {
  const advice = [];
  if (dimensionScores.sleep > 0.5)
    advice.push("• Sleep: Try to set a fixed sleep schedule, limit screens before bed, and avoid taking work into late-night hours.");
  if (dimensionScores.workload > 0.5)
    advice.push("• Workload: Break tasks into smaller pieces, prioritize the most important ones, and talk with your supervisor/teacher if expectations feel unrealistic.");
  if (dimensionScores.motivation > 0.5)
    advice.push("• Motivation: Reconnect with your long-term goals, celebrate small wins, and include activities you enjoy during the week.");
  if (dimensionScores.emotion > 0.5)
    advice.push("• Emotions: Practice short breaks, breathing exercises, or journaling. Consider talking to a trusted friend, mentor, or counselor.");
  if (advice.length === 0)
    advice.push("You seem relatively balanced right now. Continue checking in with yourself regularly and protect your rest, boundaries, and social connections.");
  return advice;
}

export default function App() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const allAnswered = QUESTIONS.every((q) => answers[q.id]);
    if (!allAnswered) {
      setError("Please answer all questions before viewing your result.");
      return;
    }

    let rawTotal = 0;
    const dims = { sleep: 0, motivation: 0, workload: 0, emotion: 0 };
    const dimsCount = { sleep: 0, motivation: 0, workload: 0, emotion: 0 };

    QUESTIONS.forEach((q) => {
      let v = answers[q.id];
      if (q.reverse) v = 6 - v;
      rawTotal += v;
      dims[q.dimension] += v;
      dimsCount[q.dimension] += 1;
    });

    const normalized = (rawTotal - QUESTIONS.length) / (QUESTIONS.length * 4);
    const risk = getRiskLevel(normalized);
    const dimensionScores = {};
    Object.keys(dims).forEach((d) => {
      const minDim = dimsCount[d] * 1;
      const maxDim = dimsCount[d] * 5;
      const val = (dims[d] - minDim) / (maxDim - minDim);
      dimensionScores[d] = val;
    });
    const advice = generateAdvice(dimensionScores);

    setResult({ normalized, risk, dimensionScores, advice });
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setError("");
  };

  const percentage = result ? Math.round(result.normalized * 100) : 0;
  const riskColor = result ? result.risk.color : "#22c55e";

  return (
    <div className="app">
      <div className="card">
        <header className="card-header">
          {/* Added title and author */}
          <h1>CPIS 393: Assignment 3 — Occupational Burnout</h1>
          <p className="prepared-by">Prepared by: <strong>Leoun Aldhaban</strong></p>

          <h2 className="main-title">Burnout Self-Assessment</h2>
          <p className="subtitle">Answer a few questions about your recent experience.</p>
        </header>

        <form onSubmit={handleSubmit} className="questions">
          {QUESTIONS.map((q, index) => (
            <div key={q.id} className="question-row">
              <div className="question-text">
                <span className="question-number">{index + 1}.</span>
                <span>{q.text}</span>
              </div>
              <div className="options">
                {OPTIONS.map((opt) => (
                  <label key={opt.value} className="option-label">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.value}
                      checked={answers[q.id] === opt.value}
                      onChange={() => handleAnswerChange(q.id, opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button type="submit" className="primary-btn">View My Risk Level</button>
            {submitted && (
              <button type="button" className="secondary-btn" onClick={handleReset}>Start Over</button>
            )}
          </div>
        </form>

        {submitted && result && (
          <section className="results">
            <h2>Your Burnout Risk</h2>

            <div className="risk-bar-wrapper">
              <div className="risk-bar-bg">
                <div className="risk-bar-fill" style={{ width: `${percentage}%`, backgroundColor: riskColor }} />
              </div>
              <div className="risk-bar-labels">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
              <p className="risk-score">
                Score: <strong>{percentage}%</strong> –{" "}
                <span style={{ color: riskColor, fontWeight: 600 }}>{result.risk.label}</span>
              </p>
            </div>

            <p className="risk-description">{result.risk.description}</p>

            <div className="dimensions">
              <h3>Areas to watch</h3>
              <ul>
                <li><strong>Sleep:</strong> {(result.dimensionScores.sleep * 100).toFixed(0)}% risk</li>
                <li><strong>Workload / Focus:</strong> {(result.dimensionScores.workload * 100).toFixed(0)}% risk</li>
                <li><strong>Motivation / Meaning:</strong> {(result.dimensionScores.motivation * 100).toFixed(0)}% risk</li>
                <li><strong>Emotions / Cynicism:</strong> {(result.dimensionScores.emotion * 100).toFixed(0)}% risk</li>
              </ul>
            </div>

            <div className="advice">
              <h3>Personalized Tips</h3>
              {result.advice.map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
