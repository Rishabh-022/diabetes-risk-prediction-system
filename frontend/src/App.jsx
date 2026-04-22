import { useState, useRef } from 'react'
import axios from 'axios'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    age: '',
    phone: '',
    pin: '',
    bmi: '',
    high_bp: '0',
    phys_activity: '1',
    fruits: '1',
    veggies: '1'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [trend, setTrend] = useState(null);
  const [phoneStatus, setPhoneStatus] = useState(null);
  const [isNewPatient, setIsNewPatient] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef();
  const chartRef = useRef();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneBlur = async () => {
    if (formData.phone && formData.phone.length === 10) {
      try {
        const response = await axios.post('http://localhost:5000/api/check-phone', {
          phone: formData.phone
        });
        setPhoneStatus(response.data);
      } catch (err) {
        console.error("Could not check phone", err);
      }
    } else {
      setPhoneStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.pin.length !== 4) {
      alert("PIN must be exactly 4 digits");
      return;
    }
    
    setLoading(true);
    setResult(null);
    setHistory([]);
    setTrend(null);

    try {
      const payload = {
        age: parseInt(formData.age),
        phone: formData.phone,
        pin: formData.pin,
        bmi: parseFloat(formData.bmi),
        high_bp: parseInt(formData.high_bp),
        phys_activity: parseInt(formData.phys_activity),
        fruits: parseInt(formData.fruits),
        veggies: parseInt(formData.veggies)
      };

      const response = await axios.post('http://localhost:5000/api/calculate-risk', payload);
      setResult(response.data);
      setIsNewPatient(response.data.is_new_patient);
      
      try {
        const historyResponse = await axios.post('http://localhost:5000/api/history', {
          phone: payload.phone,
          pin: payload.pin
        });
        setHistory(historyResponse.data.data);
        setTrend(historyResponse.data.trend);
      } catch (historyErr) {
        if (historyErr.response?.status === 401) {
          console.error("History locked - incorrect PIN");
        }
      }
      
    } catch (error) {
      console.error("Error calculating risk", error);
      
      if (error.response?.status === 401) {
        alert("🔒 ACCESS DENIED: Incorrect PIN for this phone number.\n\nPlease enter the correct 4-digit PIN or use a different phone number.");
      } else {
        alert("Error: Ensure Python and Node.js servers are running!");
      }
    }
    setLoading(false);
  };

  const formatChartData = (historyData) => {
    return historyData
      .map(record => ({
        date: new Date(record.date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        }),
        fullDate: new Date(record.date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        risk: record.risk_percentage,
        timestamp: new Date(record.date).getTime()
      }))
      .reverse(); 
  };

  const getChartStats = (chartData) => {
    if (chartData.length === 0) return null;
    
    const risks = chartData.map(d => d.risk);
    const min = Math.min(...risks);
    const max = Math.max(...risks);
    const avg = (risks.reduce((a, b) => a + b, 0) / risks.length).toFixed(1);
    const first = risks[0];
    const last = risks[risks.length - 1];
    const change = (last - first).toFixed(1);
    const percentChange = ((last - first) / first * 100).toFixed(1);
    
    return { min, max, avg, first, last, change, percentChange };
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const risk = payload[0].value;
      let riskLevel = 'Low';
      let color = '#22c55e';
      if (risk >= 66) {
        riskLevel = 'High';
        color = '#ef4444';
      } else if (risk >= 33) {
        riskLevel = 'Moderate';
        color = '#eab308';
      }
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{payload[0].payload.fullDate}</p>
          <p className="tooltip-risk" style={{ color }}>
            <strong>{risk}%</strong> - {riskLevel} Risk
          </p>
        </div>
      );
    }
    return null;
  };

  const downloadPDF = async () => {
    const element = reportRef.current;
    
    if (!element) {
      console.error("Report element not found");
      return;
    }

    setIsGeneratingPDF(true);
    const originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'wait';

    try {
      
      const canvas = await html2canvas(element, { 
        scale: 3,                  
        backgroundColor: '#ffffff',   
        logging: false,               
        allowTaint: true,            
        useCORS: true,              
        windowWidth: 900,             
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.results-dashboard');
          if (clonedElement) {
            clonedElement.style.width = '750px';
            clonedElement.style.maxWidth = '750px';
          }
        }
      });
      

      const imgData = canvas.toDataURL('image/png', 1.0);
      
 
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
     
      const margin = 15;
      const contentWidth = pdfWidth - (margin * 2);
      
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      
      pdf.setFontSize(18);
      pdf.setTextColor(30, 64, 175);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Health Risk Assessment Report', pdfWidth / 2, margin + 5, { align: 'center' });
      
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(margin, margin + 10, pdfWidth - margin, margin + 10);
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pdfWidth / 2, margin + 16, { align: 'center' });
      pdf.text(`Patient ID: ${formData.phone.substring(0, 6)}XXXX`, pdfWidth / 2, margin + 22, { align: 'center' });
      pdf.text(`Report Type: Diabetes Risk Assessment (CDC Dataset)`, pdfWidth / 2, margin + 28, { align: 'center' });
      
     
      const imageYPosition = margin + 35;
      pdf.addImage(imgData, 'PNG', margin, imageYPosition, contentWidth, contentHeight);
      
      const footerY = pdfHeight - 12;
      
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 5, pdfWidth - margin, footerY - 5);
      
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        'This report is AI-generated using CDC diabetes health indicators and should be reviewed by a qualified healthcare professional.',
        pdfWidth / 2, footerY, { align: 'center' }
      );
      pdf.text(
        '© AI Health Risk Tracker • HIPAA-Inspired Security • Version 3.0',
        pdfWidth / 2, footerY + 5, { align: 'center' }
      );
      
      pdf.text(`Page 1 of 1`, pdfWidth - margin, footerY + 5, { align: 'right' });
      
      const filename = `Diabetes_Risk_Report_${formData.phone.substring(0, 6)}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      console.log('✅ Layout-locked Ultra-HD PDF generated successfully!');
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      document.body.style.cursor = originalCursor;
      setIsGeneratingPDF(false);
    }
  };

  const getGaugeColor = (risk) => {
    if (risk < 33) return '#22c55e';
    if (risk < 66) return '#eab308';
    return '#ef4444';
  };

  const getRiskLevel = (risk) => {
    if (risk < 33) return 'Low Risk';
    if (risk < 66) return 'Moderate Risk';
    return 'High Risk';
  };

  const getTrendInfo = (trendType) => {
    switch(trendType) {
      case 'improving':
        return { icon: '📉', text: 'Your risk is decreasing! Keep up the good work!', color: '#22c55e' };
      case 'worsening':
        return { icon: '📈', text: 'Your risk is increasing. Consider consulting a doctor.', color: '#ef4444' };
      case 'stable':
        return { icon: '📊', text: 'Your risk is stable.', color: '#eab308' };
      default:
        return null;
    }
  };

  const chartData = formatChartData(history);
  const chartStats = getChartStats(chartData);

  return (
    <div className="app-wrapper">
      <div className="bg-pattern"></div>
      
      <div className="container">
        <div className="header">
          <div className="medical-badge">
            <span className="cross">+</span>
          </div>
          <h1>
            <span className="title-light">AI</span>
            <span className="title-bold"> Health Risk </span>
            <span className="title-light">Tracker</span>
          </h1>
          <p className="subtitle">CDC Diabetes Risk Assessment • HIPAA-Inspired Security</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Patient Health Profile</h2>
            <p>Enter your information for an instant AI-powered risk assessment</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label>
                  <span className="label-icon">📅</span> Age
                </label>
                <input 
                  type="number" 
                  name="age" 
                  required 
                  value={formData.age} 
                  onChange={handleInputChange} 
                  placeholder="e.g., 45" 
                />
              </div>

              <div className="input-group">
                <label>
                  <span className="label-icon">📱</span> WhatsApp Number
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  value={formData.phone} 
                  onChange={handleInputChange}
                  onBlur={handlePhoneBlur}
                  placeholder="10-digit number" 
                  maxLength="10"
                  pattern="[0-9]{10}"
                />
                {phoneStatus && (
                  <small className={`phone-status ${phoneStatus.exists ? 'returning' : 'new'}`}>
                    {phoneStatus.exists ? '🔐 Returning Patient' : '🆕 New Patient'}
                  </small>
                )}
              </div>

              <div className="input-group">
                <label>
                  <span className="label-icon">🔒</span> Security PIN
                </label>
                <input 
                  type="password" 
                  name="pin" 
                  required 
                  maxLength="4"
                  pattern="\d{4}"
                  value={formData.pin} 
                  onChange={handleInputChange} 
                  placeholder={phoneStatus?.exists ? "Enter your 4-digit PIN" : "Create 4-digit PIN"} 
                />
                <small className="pin-hint">
                  {phoneStatus?.exists 
                    ? "Enter your existing PIN to access your records" 
                    : "Create a PIN to secure your medical history"}
                </small>
              </div>

              <div className="input-group">
                <label>
                  <span className="label-icon">⚖️</span> BMI (Body Mass Index)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  name="bmi" 
                  required 
                  value={formData.bmi} 
                  onChange={handleInputChange} 
                  placeholder="e.g., 25.5" 
                />
              </div>

              <div className="input-group">
                <label>
                  <span className="label-icon">❤️</span> High Blood Pressure?
                </label>
                <select name="high_bp" value={formData.high_bp} onChange={handleInputChange}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div className="input-group">
                <label>
                  <span className="label-icon">🏃</span> Physical Activity?
                </label>
                <select name="phys_activity" value={formData.phys_activity} onChange={handleInputChange}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div className="input-group">
                <label>
                  <span className="label-icon">🍎</span> Eat Fruits Daily?
                </label>
                <select name="fruits" value={formData.fruits} onChange={handleInputChange}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div className="input-group">
                <label>
                  <span className="label-icon">🥦</span> Eat Vegetables Daily?
                </label>
                <select name="veggies" value={formData.veggies} onChange={handleInputChange}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying & Analyzing...
                </>
              ) : (
                '→ Calculate Risk Score'
              )}
            </button>
          </form>
        </div>

        {}
        {result && (
          <div 
            className={`results-dashboard ${result.risk_percentage > 50 ? 'high-risk-theme' : ''}`}
            ref={reportRef}
          >
            <div className="dashboard-header">
              <h2>Your Diabetes Risk Assessment</h2>
              <p>Based on CDC population data analysis</p>
              {isNewPatient && (
                <div className="new-patient-badge">
                  🎉 New Patient Registered • PIN Secured
                </div>
              )}
            </div>

            <div className="risk-meter-container">
              <div className="risk-pointer-container">
                <div 
                  className="risk-pointer" 
                  style={{ left: `${Math.min(100, Math.max(0, result.risk_percentage))}%` }}
                >
                  <div className="pointer-label">{result.risk_percentage}%</div>
                  ▼
                </div>
              </div>
              <div className="risk-track"></div>
              <div className="risk-labels">
                <span>🟢 Safe</span>
                <span>🟡 Warning</span>
                <span>🔴 Critical</span>
              </div>
            </div>

            <div className="risk-badge" style={{ backgroundColor: getGaugeColor(result.risk_percentage) }}>
              <span className="risk-label">{getRiskLevel(result.risk_percentage)}</span>
              <span className="risk-value">{result.risk_percentage}%</span>
            </div>

            {}
            {trend && (
              <div className="trend-indicator" style={{ 
                backgroundColor: getTrendInfo(trend)?.color + '15',
                borderLeftColor: getTrendInfo(trend)?.color 
              }}>
                <span className="trend-icon">{getTrendInfo(trend)?.icon}</span>
                <span className="trend-text">{getTrendInfo(trend)?.text}</span>
              </div>
            )}

            {}
            {history.length >= 2 && (
              <div className="trend-graph-section" ref={chartRef}>
                <div className="graph-header">
                  <h3>
                    <span>📈</span> Risk Trend Analysis
                    <span className="lock-icon" title="Secured with PIN">🔒</span>
                  </h3>
                  <p className="graph-subtitle">Your health journey over time</p>
                </div>
                
                {}
                {chartStats && (
                  <div className="stats-cards">
                    <div className="stat-card">
                      <span className="stat-label">Current</span>
                      <span className="stat-value" style={{ color: getGaugeColor(chartStats.last) }}>
                        {chartStats.last}%
                      </span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Change</span>
                      <span className={`stat-value ${chartStats.change >= 0 ? 'increase' : 'decrease'}`}>
                        {chartStats.change > 0 ? '↑' : '↓'} {Math.abs(chartStats.change)}%
                      </span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Average</span>
                      <span className="stat-value">{chartStats.avg}%</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Range</span>
                      <span className="stat-value">{chartStats.min}% - {chartStats.max}%</span>
                    </div>
                  </div>
                )}

                {}
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="33%" stopColor="#eab308" stopOpacity={0.2}/>
                          <stop offset="66%" stopColor="#22c55e" stopOpacity={0.1}/>
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6"/>
                          <stop offset="100%" stopColor="#8b5cf6"/>
                        </linearGradient>
                      </defs>
                      
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                        label={{ 
                          value: 'Risk %', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fontSize: 11, fill: '#64748b' }
                        }}
                      />
                      
                      <Tooltip content={<CustomTooltip />} />
                      
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span style={{ color: '#1e293b', fontWeight: 600 }}>{value}</span>}
                      />
                      
                      <ReferenceLine y={33} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.5} />
                      <ReferenceLine y={66} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} />
                      
                      <Area 
                        type="monotone" 
                        dataKey="risk" 
                        fill="url(#riskGradient)" 
                        stroke="none"
                        name="Risk Zone"
                        isAnimationActive={false}  
                      />
                      
                      <Line 
                        type="monotone" 
                        dataKey="risk" 
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        dot={{ 
                          fill: '#3b82f6', 
                          strokeWidth: 2, 
                          r: 5,
                          stroke: '#fff'
                        }}
                        activeDot={{ 
                          r: 8, 
                          fill: '#8b5cf6',
                          stroke: '#fff',
                          strokeWidth: 3
                        }}
                        name="Your Risk Score"
                        isAnimationActive={false} 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-legend-custom">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#22c55e' }}></span>
                    <span>Low Risk (&lt;33%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#eab308' }}></span>
                    <span>Moderate Risk (33-66%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                    <span>High Risk (&gt;66%)</span>
                  </div>
                </div>
              </div>
            )}

            {}
            {result.breakdown && (
              <div className="explainable-ai-section">
                <h3>🧠 AI Diagnosis Breakdown</h3>
                <p className="breakdown-subtitle">What is driving your risk score?</p>
                
                <div className="breakdown-list">
                  {result.breakdown.map((item, index) => (
                    <div key={index} className="breakdown-item">
                      <div className="breakdown-header">
                        <span>{item.feature}</span>
                        <span>{item.contribution}%</span>
                      </div>
                      <div className="breakdown-bar-bg">
                        <div 
                          className="breakdown-bar-fill" 
                          style={{ width: `${item.contribution}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {}
            {history.length > 1 && (
              <div className="history-section">
                <h3>
                  <span>📋</span> 
                  Assessment History
                  <span className="lock-icon" title="Secured with PIN">🔒</span>
                </h3>
                <p className="history-subtitle">Your complete assessment records</p>
                
                <div className="history-list">
                  {history.map((record, index) => (
                    <div key={index} className={`history-card ${index === 0 ? 'latest-record' : ''}`}>
                      <div className="history-date">
                        {new Date(record.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric'
                        })}
                        {index === 0 && <span className="latest-badge">Latest</span>}
                      </div>
                      <div className={`history-score ${record.risk_percentage > 50 ? 'text-red' : 'text-green'}`}>
                        {record.risk_percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {}
            {result.alert_sent && (
              <div className="alert-banner">
                <span className="alert-icon">⚠️</span>
                <div className="alert-content">
                  <strong>High Risk Alert Dispatched</strong>
                  <p>A WhatsApp notification has been sent to your registered number.</p>
                </div>
              </div>
            )}

            <button 
              onClick={downloadPDF} 
              className="download-btn"
              disabled={isGeneratingPDF}
            >
              <span className="download-icon">📄</span>
              {isGeneratingPDF ? 'Generating Crystal-Clear Report...' : 'Download Official Medical Report (PDF)'}
            </button>

            <p className="disclaimer">
              * This is an AI-powered statistical estimate and does not constitute a medical diagnosis. 
              Please consult a healthcare professional.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App