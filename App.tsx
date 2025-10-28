
import React, { useState, useCallback } from 'react';
import { Page, Deal, DealStage, DraggableItem } from './types';
import { mockDeals } from './constants';
import Sidebar from './components/Sidebar';
import AIAssistant from './components/AIAssistant';
import KanbanBoard from './components/KanbanBoard';
import { IconMenu, IconX, IconBot } from './components/Icons';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activePage, setActivePage] = useState<Page>(Page.Deals);
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);

  const handleDrop = useCallback((toStage: DealStage) => {
    if (!draggedItem) return;
    
    setDeals(prevDeals =>
      prevDeals.map(deal =>
        deal.id === draggedItem.id ? { ...deal, stage: toStage } : deal
      )
    );
    setDraggedItem(null);
  }, [draggedItem]);
  
  const handleDragStart = useCallback((id: string, fromStage: DealStage) => {
    setDraggedItem({ id, fromStage });
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case Page.Deals:
        return <KanbanBoard deals={deals} onDrop={handleDrop} onDragStart={handleDragStart} />;
      case Page.Contacts:
        return <div className="p-8 text-center"><h1 className="text-3xl font-bold">Contacts Page</h1><p className="mt-2 text-gray-400">Manage your contacts and prospects here.</p></div>;
      case Page.Calendar:
        return <div className="p-8 text-center"><h1 className="text-3xl font-bold">Calendar Page</h1><p className="mt-2 text-gray-400">View and manage your schedule.</p></div>;
      default:
        return <div className="p-8 text-center"><h1 className="text-3xl font-bold">{activePage}</h1><p className="mt-2 text-gray-400">This feature is coming soon.</p></div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar isOpen={isSidebarOpen} activePage={activePage} setActivePage={setActivePage} />

      <div className="flex-1 flex flex-col transition-all duration-300" style={{ marginLeft: isSidebarOpen ? '256px' : '72px' }}>
        <header className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-20">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            {isSidebarOpen ? <IconX /> : <IconMenu />}
          </button>
          <h1 className="text-xl font-semibold">{activePage}</h1>
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <IconBot />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-800/50">
          {renderContent()}
        </main>
      </div>

      <AIAssistant isOpen={isAssistantOpen} setIsOpen={setIsAssistantOpen} />
    </div>
  );
};

export default App;
