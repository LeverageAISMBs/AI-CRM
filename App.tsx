
import React, { useState, useCallback } from 'react';
import { Page, Deal, DealStage, DraggableItem, ContactRecord, Column, CalendarEvent } from './types';
import { mockDeals, mockContacts, DEFAULT_CONTACT_COLUMNS, mockCalendarEvents } from './constants';
import Sidebar from './components/Sidebar';
import AIAssistant from './components/AIAssistant';
import KanbanBoard from './components/KanbanBoard';
import SalesTrainerPage from './components/SalesTrainerPage';
import ContactsPage from './components/ContactsPage';
import CalendarPage from './components/CalendarPage';
import MapSearchPage from './components/MapSearchPage';
import DealFormModal from './components/DealFormModal';
import ContactFormModal from './components/ContactFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import ImportContactsModal from './components/ImportContactsModal';
import { IconMenu, IconX, IconBot } from './components/Icons';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activePage, setActivePage] = useState<Page>(Page.Deals);
  
  // State
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [contacts, setContacts] = useState<ContactRecord[]>(mockContacts);
  const [columns, setColumns] = useState<Column[]>(DEFAULT_CONTACT_COLUMNS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);

  // Modal State
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  const [newDealStage, setNewDealStage] = useState<DealStage | undefined>(undefined);
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<ContactRecord | null>(null);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Confirmation Modal State
  const [confirmationState, setConfirmationState] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);


  // Deal Handlers
  const handleOpenCreateDealModal = (stage: DealStage) => {
    setDealToEdit(null);
    setNewDealStage(stage);
    setIsDealModalOpen(true);
  };

  const handleOpenEditDealModal = (deal: Deal) => {
    setDealToEdit(deal);
    setNewDealStage(undefined);
    setIsDealModalOpen(true);
  };

  const handleCloseDealModal = () => {
    setIsDealModalOpen(false);
    setDealToEdit(null);
    setNewDealStage(undefined);
  };

  const handleSaveDeal = (dealData: Deal) => {
    const exists = deals.some(d => d.id === dealData.id);
    setDeals(exists ? deals.map(d => d.id === dealData.id ? dealData : d) : [...deals, dealData]);
    handleCloseDealModal();
  };

  const handleDeleteDeal = (dealId: string) => {
    setDealToDelete(dealId);
    setConfirmationState({
        isOpen: true,
        title: 'Delete Deal',
        message: 'Are you sure? This will permanently remove the deal.',
        onConfirm: () => handleConfirmDeleteDeal()
    });
  };
  
  const handleConfirmDeleteDeal = () => {
    if (dealToDelete) {
      setDeals(deals.filter(d => d.id !== dealToDelete));
    }
    handleCancelDelete();
  };

  // Contact Handlers
  const handleOpenCreateContactModal = () => {
      setContactToEdit(null);
      setIsContactModalOpen(true);
  };

  const handleOpenEditContactModal = (contact: ContactRecord) => {
      setContactToEdit(contact);
      setIsContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
      setIsContactModalOpen(false);
      setContactToEdit(null);
  };

  const handleSaveContact = (contactData: ContactRecord) => {
      const exists = contacts.some(c => c.id === contactData.id);
      setContacts(exists ? contacts.map(c => c.id === contactData.id ? contactData : c) : [...contacts, contactData]);
      handleCloseContactModal();
  };

  const handleDeleteContact = (contactId: string) => {
    setContactToDelete(contactId);
    setConfirmationState({
        isOpen: true,
        title: 'Delete Contact',
        message: 'Are you sure? This action cannot be undone.',
        onConfirm: () => handleConfirmDeleteContact()
    });
  };

  const handleConfirmDeleteContact = () => {
      if(contactToDelete) {
          setContacts(contacts.filter(c => c.id !== contactToDelete));
      }
      handleCancelDelete();
  };

  // Generic Cancel Handler for Confirmation Modal
  const handleCancelDelete = () => {
    setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    setDealToDelete(null);
    setContactToDelete(null);
  };

  // Contact Page Specific Handlers
  const handleAddColumn = (newColumn: Column) => {
    if (!columns.find(c => c.key === newColumn.key || c.label === newColumn.label)) {
        setColumns([...columns, newColumn]);
    } else {
        alert("A column with this name or key already exists.");
    }
  };
  
  const handleOpenImportModal = () => setIsImportModalOpen(true);
  const handleCloseImportModal = () => setIsImportModalOpen(false);

  const handleImportContacts = (importedContacts: ContactRecord[], newColumns: Column[]) => {
      setContacts(prev => [...prev, ...importedContacts]);
      
      const uniqueNewColumns = newColumns.filter(nc => !columns.some(c => c.key === nc.key));
      if (uniqueNewColumns.length > 0) {
          setColumns(prev => [...prev, ...uniqueNewColumns]);
      }

      handleCloseImportModal();
  };


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
        return (
          <KanbanBoard 
            deals={deals} 
            onDrop={handleDrop} 
            onDragStart={handleDragStart}
            onAddDeal={handleOpenCreateDealModal}
            onEditDeal={handleOpenEditDealModal}
            onDeleteDeal={handleDeleteDeal}
          />
        );
      case Page.Trainer:
        return <SalesTrainerPage />;
      case Page.Contacts:
        return (
          <ContactsPage 
            contacts={contacts}
            columns={columns}
            onAddContact={handleOpenCreateContactModal}
            onEditContact={handleOpenEditContactModal}
            onDeleteContact={handleDeleteContact}
            onAddColumn={handleAddColumn}
            onOpenImportModal={handleOpenImportModal}
          />
        );
      case Page.Calendar:
        return <CalendarPage events={calendarEvents} />;
      case Page.Map:
        return <MapSearchPage />;
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
      
      <DealFormModal 
        isOpen={isDealModalOpen}
        onClose={handleCloseDealModal}
        onSave={handleSaveDeal}
        dealToEdit={dealToEdit}
        initialStage={newDealStage}
      />
      
       <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={handleCloseContactModal}
        onSave={handleSaveContact}
        contactToEdit={contactToEdit}
      />
      
      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onImport={handleImportContacts}
        existingColumns={columns}
      />

      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={handleCancelDelete}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
      />
    </div>
  );
};

export default App;