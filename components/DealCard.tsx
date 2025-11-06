
import React from 'react';
import { Deal, DealStage } from '../types';
import { IconEdit, IconTrash } from './Icons';

interface DealCardProps {
  deal: Deal;
  onDragStart: (id: string, fromStage: DealStage) => void;
  onEdit: (deal: Deal) => void;
  onDelete: (dealId: string) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onDragStart, onEdit, onDelete }) => {
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    onDragStart(deal.id, deal.stage);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const priorityColor = {
    High: 'border-l-red-500',
    Medium: 'border-l-yellow-500',
    Low: 'border-l-blue-500',
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(deal);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(deal.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`bg-gray-900 p-4 rounded-lg shadow-lg cursor-grab active:cursor-grabbing border-l-4 ${priorityColor[deal.priority]} hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-200 group relative`}
    >
      <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleEdit}
          className="p-1.5 rounded-md text-gray-400 bg-gray-800/50 hover:bg-gray-700 hover:text-white"
          aria-label={`Edit ${deal.title}`}
        >
          <IconEdit className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-md text-gray-400 bg-gray-800/50 hover:bg-gray-700 hover:text-red-400"
          aria-label={`Delete ${deal.title}`}
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>

      <h3 className="font-bold text-md mb-2 pr-16">{deal.title}</h3>
      <p className="text-green-400 font-semibold text-lg mb-2">${deal.value.toLocaleString()}</p>
      <div className="flex items-center text-sm text-gray-400 mb-3">
        <img src={deal.contact.avatarUrl} alt={deal.contact.name} className="w-6 h-6 rounded-full mr-2" />
        <span>{deal.contact.name}, {deal.contact.company}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {deal.tags.map(tag => (
          <span key={tag.id} className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${tag.color}`}>
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DealCard;