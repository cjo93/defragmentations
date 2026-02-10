import React from 'react';

interface FamilyNode {
  id: string;
  label: string;
  tags: string[];
  children?: FamilyNode[];
}

interface FamilyCycleMapProps {
  root: FamilyNode;
}

// Simple genogram-style tree (b/w, glass morphism aesthetic)
export const FamilyCycleMap: React.FC<FamilyCycleMapProps> = ({ root }) => {
  const renderNode = (node: FamilyNode, depth = 0) => (
    <div className="flex flex-col items-center" key={node.id}>
      <div className="bg-black/80 border border-white/10 rounded-xl px-4 py-2 mb-2 shadow-lg">
        <span className="text-white font-bold text-base">{node.label}</span>
        <div className="flex gap-2 mt-1">
          {node.tags.map(tag => (
            <span key={tag} className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full border border-white/20">{tag}</span>
          ))}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="flex gap-8 mt-2">
          {node.children.map(child => renderNode(child, depth + 1))}
        </div>
      )}
    </div>
  );
  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="max-w-3xl w-full flex flex-col items-center">
        {renderNode(root)}
      </div>
    </div>
  );
};
