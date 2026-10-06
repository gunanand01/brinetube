'use client';

import { useState, useEffect } from 'react';

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'textarea' | 'number';
  placeholder?: string;
}

export default function ProviderTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    slug: '',
    label: '',
    description: '',
    enabled: true,
    configFields: [] as ConfigField[],
  };
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    const d = await fetch('/api/provider-types').then((r) => r.json());
    setTypes(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
    setMessage('');
  }

  function openEdit(t: any) {
    setForm({
      slug: t.slug,
      label: t.label,
      description: t.description || '',
      enabled: t.enabled,
      configFields: JSON.parse(t.configFields || '[]'),
    });
    setEditing(t);
    setShowForm(true);
    setMessage('');
  }

  async function save() {
    if (!form.slug || !form.label) {
      setMessage('Slug and label required');
      return;
    }

    setSaving(true);
    const method = editing ? 'PATCH' : 'POST';
    const body = editing ? { ...form, id: editing.id } : form;

    const res = await fetch('/api/provider-types', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (res.ok) {
      setMessage(editing ? 'Type updated!' : 'Type added!');
      setShowForm(false);
      load();
    } else {
      const d = await res.json();
      setMessage(d.error || 'Error saving');
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this type? Providers using it may break.')) return;
    await fetch(`/api/provider-types?id=${id}`, { method: 'DELETE' });
    load();
  }

  function addField() {
    setForm({
      ...form,
      configFields: [
        ...form.configFields,
        { key: '', label: '', type: 'text', placeholder: '' },
      ],
    });
  }

  function updateField(index: number, field: Partial<ConfigField>) {
    const updated = [...form.configFields];
    updated[index] = { ...updated[index], ...field };
    setForm({ ...form, configFields: updated });
  }

  function removeField(index: number) {
    setForm({
      ...form,
      configFields: form.configFields.filter((_, i) => i !== index),
    });
  }

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Provider Types</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage provider types and their config fields. No code change needed to add new types.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          + Add Type
        </button>
      </div>

      {message && (
        <div className="p-4 mb-6 rounded bg-blue-500/20 text-blue-400">
          {message}
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editing ? 'Edit Type' : 'Add New Type'}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-neutral-400 block mb-1">
                Slug (lowercase, no spaces)
              </label>
              <input
                className="input"
                value={form.slug}
                onChange={(e) =>
                  setForm({ ...form, slug: e.target.value.toLowerCase().trim() })
                }
                placeholder="e.g., my_custom_api"
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400 block mb-1">
                Label (display name)
              </label>
              <input
                className="input"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g., My Custom API"
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400 block mb-1">
                Description (optional)
              </label>
              <input
                className="input"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Short description"
              />
            </div>

            {/* Config Fields Builder */}
            <div className="border-t border-neutral-800 pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold">
                  Config Fields (what admin fills for this type)
                </label>
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={addField}
                >
                  + Add Field
                </button>
              </div>

              {form.configFields.length === 0 ? (
                <p className="text-xs text-neutral-500 py-3">
                  No fields yet. Click &quot;+ Add Field&quot; to add.
                </p>
              ) : (
                <div className="space-y-2">
                  {form.configFields.map((f, i) => (
                    <div
                      key={i}
                      className="bg-neutral-900 p-3 rounded border border-neutral-800"
                    >
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          className="input text-xs"
                          placeholder="key (e.g., url)"
                          value={f.key}
                          onChange={(e) =>
                            updateField(i, { key: e.target.value })
                          }
                        />
                        <input
                          className="input text-xs"
                          placeholder="Label (e.g., URL)"
                          value={f.label}
                          onChange={(e) =>
                            updateField(i, { label: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <select
                          className="input text-xs"
                          value={f.type}
                          onChange={(e) =>
                            updateField(i, {
                              type: e.target.value as ConfigField['type'],
                            })
                          }
                        >
                          <option value="text">Text</option>
                          <option value="password">Password</option>
                          <option value="textarea">Textarea</option>
                          <option value="number">Number</option>
                        </select>
                        <input
                          className="input text-xs"
                          placeholder="Placeholder (optional)"
                          value={f.placeholder || ''}
                          onChange={(e) =>
                            updateField(i, { placeholder: e.target.value })
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="text-xs text-red-400 hover:text-red-300"
                        onClick={() => removeField(i)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label className="text-sm">Enabled</label>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Save'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {types.length === 0 ? (
          <div className="card text-center text-neutral-400 py-8">
            No types. Click &quot;+ Add Type&quot; to create one.
          </div>
        ) : (
          types.map((t) => {
            const fields = JSON.parse(t.configFields || '[]');
            return (
              <div key={t.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold">{t.label}</h3>
                      <span className="text-xs bg-neutral-800 px-2 py-1 rounded font-mono">
                        {t.slug}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          t.enabled
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {t.enabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-sm text-neutral-400 mb-2">
                        {t.description}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500">
                      <strong>Fields:</strong>{' '}
                      {fields.length > 0
                        ? fields.map((f: any) => f.key).join(', ')
                        : 'none'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-secondary text-xs"
                      onClick={() => openEdit(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger text-xs"
                      onClick={() => del(t.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
