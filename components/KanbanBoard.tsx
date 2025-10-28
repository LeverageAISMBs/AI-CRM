
import React from 'react';
import { Deal, DealStage } from '../types';
import KanbanColumn from './KanbanColumn';
import { DEAL_STAGES_ORDERED } from '../constants';

interface KanbanBoardProps {
  deals: Deal[];
  onDrop: (toStage: DealStage) => void;
  onDragStart: (id: string, fromStage: DealStage) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ deals, onDrop, onDragStart }) => {
  return (
    <div className="flex h-full w-full p-4 md:p-6 space-x-4 overflow-x-auto">
      {DEAL_STAGES_ORDERED.map(stage => (
        <KanbanColumn
          key={stage}
          stage={stage}
          deals={deals.filter(deal => deal.stage === stage)}
          onDrop={onDrop}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
