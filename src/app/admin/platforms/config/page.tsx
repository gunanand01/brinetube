"use client";
import { useState, useEffect } from "react";

export default function PlatformConfigs() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const defaultForm = {
    platform: "",
    isActive: true,
    proxyPool: "[]",
    cookies: "",
    rateLimit: 100,
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/platforms/config");
      const data = await res.json();
      if (!data.error) setConfigs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (config: any) => {
    setFormData({
      platform: config.platform,
      isActive: config.isActive,
      proxyPool: config.proxyPool,
      cookies: config.cookies || "",
      rateLimit: config.rateLimit,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (formData.proxyPool.trim()) JSON.parse(formData.proxyPool);
    } catch {
      setMessage("Error: Proxy Pool must be valid JSON array");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/platforms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage(`Config for '${formData.platform}' saved!`);
        fetchConfigs();
        setFormData(defaultForm);
      } else {
        setMessage("Error saving config.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Platform Configurations</h1>

      {message && (
        <div className={`p-4 mb-6 rounded ${message.includes("Error") ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-semibold mb-4">
            {formData.platform ? "Edit Platform" : "Add New Platform"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Platform Name</label>
              <input
                type="text"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                placeholder="e.g., youtube, terabox"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                required
                readOnly={configs.some((c) => c.platform === formData.platform)}
              />
              <p className="text-xs text-gray-400 mt-1">Cannot be changed once created.</p>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-700">
              <span className="text-sm font-medium">Is Active?</span>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rate Limit (req/hour)</label>
              <input
                type="number"
                name="rateLimit"
                value={formData.rateLimit}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Proxy Pool (JSON Array)</label>
              <textarea
                name="proxyPool"
                value={formData.proxyPool}
                onChange={handleChange}
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm font-mono"
                placeholder='["http://user:pass@ip:port"]'
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cookies (Optional)</label>
              <textarea
                name="cookies"
                value={formData.cookies}
                onChange={handleChange}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm font-mono"
                placeholder="Paste session cookies here"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {saving ? "Saving..." : "Save Config"}
            </button>

            {formData.platform && (
              <button
                type="button"
                onClick={() => setFormData(defaultForm)}
                className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel / New
              </button>
            )}
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Configured Platforms</h2>
          {configs.length === 0 ? (
            <div className="bg-slate-800 p-6 rounded-lg text-gray-400 text-center">
              No platforms configured yet.
            </div>
          ) : (
            configs.map((config) => (
              <div key={config.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold capitalize">{config.platform}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${config.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {config.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Rate: {config.rateLimit}/hr | Proxies:{" "}
                    {(() => {
                      try {
                        return JSON.parse(config.proxyPool).length;
                      } catch {
                        return 0;
                      }
                    })()}
                  </p>
                </div>
                <button
                  onClick={() => handleEdit(config)}
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm"
                >
                  Edit
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
