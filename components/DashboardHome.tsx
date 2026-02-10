import { initiateCheckout } from '../services/payment';
import React, { useEffect, useState } from 'react';
import { FamilyCycleMap } from './FamilyCycleMap';
import { PanicButton } from './PanicButton';
import { TruceLink } from './TruceLink';
import { useNavigate } from 'react-router-dom';
import { loadFamilyMembers, FamilyMember } from '../services/familyService';

// Helper to convert flat family list to tree structure for FamilyCycleMap
function buildFamilyTree(members: FamilyMember[]): any {
  if (!members.length) return null;
  // Find self (generation 0, or fallback to first member)
  const self = members.find(m => m.generation === 0) || members[0];
  function buildNode(member: FamilyMember): any {
    const children = members.filter(m => m.generation === member.generation + 1);
    return {
      id: member.id,
      label: member.name,
      tags: member.blueprint?.tags || [],
      children: children.map(buildNode)
    };
  }
  return buildNode(self);
}

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [familyTree, setFamilyTree] = useState<any>(null);

  useEffect(() => {
    const members = loadFamilyMembers();
    setFamilyTree(buildFamilyTree(members));
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
      <PanicButton />
      <div className="w-full max-w-2xl flex flex-col gap-8 items-center p-8">
        <h1 className="text-white text-3xl font-bold mb-2">Your Family Cycle Map</h1>
        {familyTree ? <FamilyCycleMap root={familyTree} /> : <div className="text-white/60">No family data yet.</div>}
        <TruceLink />
        <div className="flex flex-col gap-4 mt-8 w-full">
          <div className="flex gap-4">
            <button
              className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-white/80 transition"
              onClick={() => navigate('/add-family')}
            >
              Add Family Member
            </button>
            <button
              className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-white/80 transition"
              onClick={() => navigate('/conflict-room')}
            >
              Resolve a Conflict
            </button>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              className="bg-[#E2E2E8] text-black font-bold py-3 px-6 rounded-xl hover:bg-[#E2E2E8]/80 transition"
              onClick={() => initiateCheckout('BLUEPRINT')}
            >
              Buy Blueprint ($29)
            </button>
            <button
              className="bg-[#E2E2E8] text-black font-bold py-3 px-6 rounded-xl hover:bg-[#E2E2E8]/80 transition"
              onClick={() => initiateCheckout('ORBIT')}
            >
              Subscribe to Orbit ($19/mo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
