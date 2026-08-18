import React, { useState } from 'react';
import { 
  AlertTriangle, Camera, Upload, MapPin, CheckCircle2, 
  Sparkles, RefreshCw, Send, ShieldAlert, Image as ImageIcon 
} from 'lucide-react';
import { reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ReportIncidentPage = ({ onNavigate }) => {
  const { currentCoords, user } = useAuth();
  const [formData, setFormData] = useState({
    incident_type: 'FLOOD',
    description: '',
    latitude: currentCoords ? currentCoords.latitude : 10.0889,
    longitude: currentCoords ? currentCoords.longitude : 77.0595,
    location_name: 'Munnar Sector 4',
    severity: 'MODERATE',
    affected_people_count: 5,
    image_url: ''
  });

  const [imagePreview, setImagePreview] = useState('');
  const [aiClassification, setAiClassification] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successReport, setSuccessReport] = useState(null);

  const sampleHazardImages = [
    { label: "Flooded Street / Waterlogging", url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80", type: "FLOOD" },
    { label: "Mountain Landslide & Mud", url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80", type: "LANDSLIDE" },
    { label: "Urban Fire & Smoke", url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80", type: "FIRE" }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const data = new FormData();
      data.append('file', file);
      const res = await reportsAPI.uploadPhoto(data);
      setFormData(prev => ({ ...prev, image_url: res.data.url }));
      setAiClassification({
        hazard: res.data.ai_detected_hazard,
        confidence: res.data.ai_confidence
      });
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setImagePreview(sample.url);
    setFormData(prev => ({
      ...prev,
      image_url: sample.url,
      incident_type: sample.type
    }));
    setAiClassification({
      hazard: sample.type,
      confidence: 0.94
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await reportsAPI.submitReport(formData);
      setSuccessReport(res.data);
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Report Civic Calamity / Hazard</h1>
        <p className="text-xs text-slate-400 mt-1">
          Crowdsourced incident photos are classified by AI and transmitted in real-time to disaster response officers.
        </p>
      </div>

      {successReport ? (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Incident Report Submitted Successfully</h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            Report Reference <strong className="text-sky-400 font-mono">#REP-{successReport.id}</strong> has been logged and queued for emergency verification.
          </p>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Incident Type:</span>
              <strong className="text-white">{successReport.incident_type}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">AI Hazard Match:</span>
              <strong className="text-emerald-400">{successReport.ai_detected_hazard} ({Math.round(successReport.ai_confidence * 100)}%)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">PENDING VERIFICATION</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => { setSuccessReport(null); setImagePreview(''); setAiClassification(null); }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Report Another Incident
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          {/* Incident Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Calamity / Incident Type</label>
              <select
                value={formData.incident_type}
                onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="FLOOD">🌊 Urban Flooding / Inundation</option>
                <option value="LANDSLIDE">⛰️ Landslide / Slope Collapse / Mudflow</option>
                <option value="WATERLOGGING">🌧️ Severe Waterlogging</option>
                <option value="FALLEN_TREE">🌳 Fallen Tree / Blocked Arterial Road</option>
                <option value="FIRE">🔥 Structural Fire / Wildfire Smoke</option>
                <option value="STRUCTURAL_DAMAGE">🏚️ Bridge / Building Structural Crack</option>
                <option value="OTHER">⚠️ Other Civic Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="LOW">Low (Minor disruption)</option>
                <option value="MODERATE">Moderate (Requires municipal attention)</option>
                <option value="HIGH">High (Immediate hazard to transport/property)</option>
                <option value="CRITICAL">Critical (Life-threatening danger)</option>
              </select>
            </div>
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">Location Name / Landmark</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="e.g. Mattupetty Dam Road, Old Munnar"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">GPS Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">GPS Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Incident Description & Field Observations</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe road blockage, rising water depth, soil movement, or stranded citizens..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Photo Upload & AI Classifier */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Attach Incident Photograph (AI Hazard Verified)</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <label className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center transition-colors bg-slate-900/60">
                <Upload className="w-8 h-8 text-sky-400 mb-2" />
                <span className="text-xs font-semibold text-white">Click to Upload Camera Photo</span>
                <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WebP up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Sample Photo Selector for Fast Demo Testing */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Or select test evidence image:
                </span>
                <div className="space-y-1.5">
                  {sampleHazardImages.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(s)}
                      className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 flex items-center justify-between transition-colors"
                    >
                      <span>{s.label}</span>
                      <span className="text-[10px] font-mono text-sky-400">Select →</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Photo Preview & AI Detection Results */}
            {imagePreview && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={imagePreview}
                  alt="Hazard Preview"
                  className="w-32 h-24 object-cover rounded-xl border border-slate-700"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-sky-400 font-bold">
                    <Sparkles className="w-4 h-4" /> AI Computer Vision Hazard Classifier
                  </div>
                  {aiClassification ? (
                    <div className="text-xs text-slate-300">
                      Detected Hazard: <strong className="text-emerald-400 font-bold">{aiClassification.hazard}</strong>
                      <span className="text-slate-500 font-mono ml-2">({Math.round(aiClassification.confidence * 100)}% Confidence)</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Analyzing uploaded pixels...</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? 'Submitting Geotagged Hazard Report...' : 'Transmit Incident Report to Disaster Cell'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReportIncidentPage;
