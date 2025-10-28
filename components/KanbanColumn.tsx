
import React, { useState } from 'react';
import { Deal, DealStage } from '../types';
import DealCard from './DealCard';

interface KanbanColumnProps {
  stage: DealStage;
  deals: Deal[];
  onDrop: (toStage: DealStage) => void;
  onDragStart: (id: string, fromStage: DealStage) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, deals, onDrop, onDragStart }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(stage);
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-72 md:w-80 flex-shrink-0 bg-gray-800 rounded-xl transition-all duration-300 ${isDragOver ? 'bg-gray-700/80' : ''}`}
    >
      <div className="p-4 border-b border-gray-700/50 sticky top-0 bg-gray-800 rounded-t-xl z-10">
        <h2 className="font-semibold text-lg flex justify-between items-center">
          <span>{stage}</span>
          <span className="text-sm font-normal text-gray-400 bg-gray-700 px-2 py-1 rounded-full">{deals.length}</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Total Value: ${totalValue.toLocaleString()}
        </p>
      </div>
      <div className="flex-1 p-2 space-y-3 overflow-y-auto">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} onDragStart={onDragStart} />
        ))}
        <div className={`min-h-[8px] transition-all duration-300 ${isDragOver ? 'min-h-[100px]' : ''}`}></div>
      </div>
    </div>
  );
};

export default KanbanColumn;
