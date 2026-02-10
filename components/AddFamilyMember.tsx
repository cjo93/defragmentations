import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AddFamilyMember: React.FC = () => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('parent');
  const [tags, setTags] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save family member to backend
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-black/80 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col gap-6 w-full max-w-md">
        <h2 className="text-white text-2xl font-bold">Add Family Member</h2>
        <input
          className="bg-white/10 border border-white/20 rounded-lg p-3 text-white"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <select
          className="bg-white/10 border border-white/20 rounded-lg p-3 text-white"
          value={relation}
          onChange={e => setRelation(e.target.value)}
        >
          <option value="parent">Parent</option>
          <option value="grandparent">Grandparent</option>
          <option value="sibling">Sibling</option>
          <option value="child">Child</option>
        </select>
        <input
          className="bg-white/10 border border-white/20 rounded-lg p-3 text-white"
          placeholder="Tags (comma separated, e.g. critical, anxious)"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />
        <button
          type="submit"
          className="bg-white text-black font-bold py-3 rounded-xl hover:bg-white/80 transition"
        >
          Save
        </button>
      </form>
    </div>
  );
};
