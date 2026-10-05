"use client";
import { useState, useEffect } from "react";

export default function AppearanceSettings() {
  const [formData, setFormData] = useState({
    siteName: "BrineTube",
    tagline: "Stream & Download Media Directly",
    primaryColor: "#3b82f6",
    backgroundColor: "#0f172a",
    logoUrl: "",
    fontFamily: "Inter",
    borderRadius: "0.5rem",
    maintenanceMode: false,
    downloadEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings/site")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setFormData(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) setMessage("Settings saved! Refresh to see changes.");
      else setMessage("Error saving settings.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-white">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Appearance & Site Config</h1>
      {message && (
        <div className={`p-4 mb-6 rounded ${message.includes("Error") ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <input type="text" name="siteName" value={formData.siteName} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tagline</label>
            <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer" />
              <input type="text" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <div className="flex items-center gap-3">
              <input type="color" name="backgroundColor" value={formData.backgroundColor} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer" />
              <input type="text" name="backgroundColor" value={formData.backgroundColor} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <select name="fontFamily" value={formData.fontFamily} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2">
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Roboto">Roboto</option>
              <option value="system-ui">System Default</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Border Radius</label>
            <select name="borderRadius" value={formData.borderRadius} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2">
              <option value="0">0px (Square)</option>
              <option value="0.25rem">Small (4px)</option>
              <option value="0.5rem">Medium (8px)</option>
              <option value="1rem">Large (16px)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Logo URL (Optional)</label>
            <input type="text" name="logoUrl" value={formData.logoUrl || ""} onChange={handleChange} placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 rounded p-2" />
          </div>
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded border border-slate-700">
            <span className="font-medium">Video Download Feature</span>
            <input type="checkbox" name="downloadEnabled" checked={formData.downloadEnabled} onChange={handleChange} className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded border border-slate-700">
            <span className="font-medium">Maintenance Mode</span>
            <input type="checkbox" name="maintenanceMode" checked={formData.maintenanceMode} onChange={handleChange} className="w-6 h-6" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors mt-6">
          {saving ? "Saving..." : "Save Appearance Settings"}
        </button>
      </form>
    </div>
  );
}
