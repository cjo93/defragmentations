import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, UserPlus, X, ChevronDown, FileText, Users, AlertCircle } from 'lucide-react';
import {
  FamilyMember,
  addFamilyMember,
  removeFamilyMember,
  loadFamilyMembers,
  parseDocumentText,
  importParsedPersons,
  ParsedPerson,
} from '../services/familyService';

/* ─── Relationship Options ──────────────────────────────────── */
const RELATIONSHIPS = [
  { value: 'Partner', gen: 0 },
  { value: 'Mother', gen: -1 },
  { value: 'Father', gen: -1 },
  { value: 'Sibling', gen: 0 },
  { value: 'Child', gen: 1 },
  { value: 'Grandparent', gen: -2 },
  { value: 'Aunt/Uncle', gen: -1 },
  { value: 'Cousin', gen: 0 },
  { value: 'Friend', gen: 0 },
];

/* ─── Add Member Form ───────────────────────────────────────── */
const AddMemberForm: React.FC<{ onAdd: () => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Partner');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;
    const gen = RELATIONSHIPS.find(r => r.value === relationship)?.gen ?? 0;
    addFamilyMember(name.trim(), relationship, birthDate, birthTime, gen);
    onAdd();
    onClose();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onSubmit={handleSubmit}
      className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-white">Add Family Member</span>
        <button type="button" onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
            required
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-white/20 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">Relationship</label>
          <select
            value={relationship}
            onChange={e => setRelationship(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:border-white/20 outline-none transition-colors appearance-none"
          >
            {RELATIONSHIPS.map(r => (
              <option key={r.value} value={r.value} className="bg-neutral-900">{r.value}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">Birth Date</label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            required
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:border-white/20 outline-none transition-colors [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5">Birth Time <span className="text-neutral-600">(optional)</span></label>
          <input
            type="time"
            value={birthTime}
            onChange={e => setBirthTime(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:border-white/20 outline-none transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!name.trim() || !birthDate}
        className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        Add to Family Map
      </button>
    </motion.form>
  );
};

/* ─── Upload Preview ────────────────────────────────────────── */
const UploadPreview: React.FC<{ parsed: ParsedPerson[]; onImport: () => void; onClose: () => void }> = ({ parsed, onImport, onClose }) => {
  const handleImport = () => {
    importParsedPersons(parsed);
    onImport();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white">Found {parsed.length} people</span>
        <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        {parsed.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div>
              <span className="text-xs text-white font-medium block">{p.name}</span>
              <span className="text-[10px] text-neutral-500">{p.relationship} · {p.birthDate}{p.birthTime ? ` · ${p.birthTime}` : ''}</span>
            </div>
          </div>
        ))}
      </div>

      {parsed.length === 0 && (
        <div className="text-center py-4">
          <AlertCircle className="w-5 h-5 text-neutral-600 mx-auto mb-2" />
          <p className="text-xs text-neutral-500">No birth data found in this document. Try a file with names and dates.</p>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-xs text-neutral-400 hover:bg-white/[0.04] transition-colors">Cancel</button>
        <button
          onClick={handleImport}
          disabled={parsed.length === 0}
          className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-30"
        >
          Import All
        </button>
      </div>
    </motion.div>
  );
};

/* ─── Member Card ───────────────────────────────────────────── */
const MemberCard: React.FC<{ member: FamilyMember; onRemove: (id: string) => void }> = ({ member, onRemove }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] group hover:border-white/[0.08] transition-all">
    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-neutral-400 shrink-0">
      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-xs text-white font-medium block truncate">{member.name}</span>
      <span className="text-[10px] text-neutral-500">{member.relationship} · {member.blueprint?.type || 'Processing...'}</span>
    </div>
    <button
      onClick={() => onRemove(member.id)}
      className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all shrink-0"
      aria-label={`Remove ${member.name}`}
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
export const FamilyManager: React.FC<{ onUpdate?: () => void }> = ({ onUpdate }) => {
  const [members, setMembers] = useState<FamilyMember[]>(loadFamilyMembers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadPreview, setShowUploadPreview] = useState(false);
  const [parsedPersons, setParsedPersons] = useState<ParsedPerson[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    setMembers(loadFamilyMembers());
    onUpdate?.();
  }, [onUpdate]);

  const handleRemove = (id: string) => {
    removeFamilyMember(id);
    refresh();
  };

  /* ── File Upload Handler ──────────────────────────────────── */
  const processFile = useCallback(async (file: File) => {
    let text = '';

    if (file.type === 'application/pdf') {
      // PDF: read as text (basic extraction — works for text-based PDFs)
      // For complex PDFs, we'd need pdf.js, but for MVP plain text extraction works
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Simple PDF text extraction — find text between BT/ET markers
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const rawText = decoder.decode(bytes);
      // Extract readable strings (sequences of printable ASCII)
      const readable = rawText.match(/[\x20-\x7E]{4,}/g);
      text = readable ? readable.join('\n') : '';
    } else {
      // Plain text, .doc (basic), .txt
      text = await file.text();
    }

    if (text.trim()) {
      const parsed = parseDocumentText(text);
      setParsedPersons(parsed);
      setShowUploadPreview(true);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Family Map</span>
          {members.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-400">{members.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all"
            title="Upload family document"
          >
            <Upload className="w-3 h-3" />
            Upload
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <UserPlus className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".txt,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="p-4 space-y-3">
        {/* Drop Zone (when no members) */}
        {members.length === 0 && !showAddForm && !showUploadPreview && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging ? 'border-white/30 bg-white/[0.04]' : 'border-white/[0.06] hover:border-white/[0.12]'
            }`}
            onClick={() => fileRef.current?.click()}
          >
            <FileText className="w-6 h-6 text-neutral-600 mx-auto mb-3" />
            <p className="text-xs text-neutral-400 mb-1">Drop a family document here</p>
            <p className="text-[10px] text-neutral-600">PDF, TXT, or DOC with names and birth dates</p>
            <p className="text-[10px] text-neutral-600 mt-3">— or —</p>
            <button
              onClick={e => { e.stopPropagation(); setShowAddForm(true); }}
              className="mt-3 text-[10px] text-white/60 hover:text-white underline underline-offset-2 transition-colors"
            >
              Add members manually
            </button>
          </div>
        )}

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <AddMemberForm onAdd={refresh} onClose={() => setShowAddForm(false)} />
          )}
        </AnimatePresence>

        {/* Upload Preview */}
        <AnimatePresence>
          {showUploadPreview && (
            <UploadPreview
              parsed={parsedPersons}
              onImport={refresh}
              onClose={() => setShowUploadPreview(false)}
            />
          )}
        </AnimatePresence>

        {/* Member List */}
        {members.length > 0 && (
          <div className="space-y-2">
            {members.map(m => (
              <MemberCard key={m.id} member={m} onRemove={handleRemove} />
            ))}
          </div>
        )}

        {/* Drop zone for when members exist */}
        {members.length > 0 && !showAddForm && !showUploadPreview && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
              isDragging ? 'border-white/30 bg-white/[0.04]' : 'border-white/[0.04] hover:border-white/[0.08]'
            }`}
            onClick={() => fileRef.current?.click()}
          >
            <p className="text-[10px] text-neutral-600">Drop document or click to upload more</p>
          </div>
        )}
      </div>
    </div>
  );
};
