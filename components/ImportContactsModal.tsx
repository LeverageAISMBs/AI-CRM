import React, { useState, useCallback } from 'react';
import { ContactRecord, Column } from '../types';
import { IconX } from './Icons';

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: ContactRecord[], newColumns: Column[]) => void;
  existingColumns: Column[];
}

type CsvData = {
    headers: string[];
    records: { [key: string]: string }[];
};

const ImportContactsModal: React.FC<ImportContactsModalProps> = ({ isOpen, onClose, onImport, existingColumns }) => {
    const [step, setStep] = useState(1);
    const [csvData, setCsvData] = useState<CsvData | null>(null);
    const [mappings, setMappings] = useState<{ [key: string]: string }>({});
    const [fileName, setFileName] = useState('');

    const resetState = useCallback(() => {
        setStep(1);
        setCsvData(null);
        setMappings({});
        setFileName('');
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                parseCSV(text);
                setStep(2);
            };
            reader.readAsText(file);
        }
    };
    
    const parseCSV = (csvText: string) => {
        const lines = csvText.trim().split(/\r\n|\n/);
        const headers = lines[0].split(',').map(h => h.trim());
        const records = lines.slice(1).map(line => {
            // This is a simple parser, doesn't handle commas in quotes
            const values = line.split(',').map(v => v.trim());
            const record: { [key: string]: string } = {};
            headers.forEach((header, i) => {
                record[header] = values[i];
            });
            return record;
        });
        setCsvData({ headers, records });
        
        // Auto-map based on header name
        const initialMappings: { [key: string]: string } = {};
        headers.forEach(header => {
            const foundColumn = existingColumns.find(col => col.label.toLowerCase() === header.toLowerCase() || col.key.toLowerCase() === header.toLowerCase());
            if (foundColumn) {
                initialMappings[header] = foundColumn.key;
            } else {
                initialMappings[header] = 'ignore';
            }
        });
        setMappings(initialMappings);
    };

    const handleMappingChange = (csvHeader: string, crmField: string) => {
        setMappings(prev => ({ ...prev, [csvHeader]: crmField }));
    };

    const handleFinishImport = () => {
        if (!csvData) return;

        const newColumns: Column[] = [];
        const newContacts: ContactRecord[] = [];

        Object.entries(mappings).forEach(([csvHeader, crmField]) => {
            if (crmField.startsWith('new_')) {
                const newLabel = crmField.substring(4);
                newColumns.push({ key: newLabel.toLowerCase().replace(/\s+/g, '_'), label: newLabel });
            }
        });

        csvData.records.forEach((record, index) => {
            const newContact: ContactRecord = { id: `imported-${Date.now()}-${index}` };
            Object.entries(record).forEach(([csvHeader, value]) => {
                const crmFieldKey = mappings[csvHeader];
                if (crmFieldKey && crmFieldKey !== 'ignore') {
                    let finalKey = crmFieldKey;
                    if(crmFieldKey.startsWith('new_')) {
                        const newLabel = crmFieldKey.substring(4);
                        finalKey = newLabel.toLowerCase().replace(/\s+/g, '_');
                    }
                    newContact[finalKey] = value;
                }
            });
            newContacts.push(newContact);
        });

        onImport(newContacts, newColumns);
        handleClose();
    };

    const renderStep1 = () => (
        <div className="text-center">
            <h3 className="text-lg font-medium mb-4">Upload CSV File</h3>
            <p className="text-sm text-gray-400 mb-6">Select a comma-separated values file to import your contacts.</p>
            <label className="px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 transition-colors">
                <span>Select File</span>
                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
        </div>
    );

    const renderStep2 = () => (
        <div>
            <h3 className="text-lg font-medium mb-1">Map Columns</h3>
            <p className="text-sm text-gray-400 mb-4">Match columns from <span className="font-semibold text-indigo-400">{fileName}</span> to CRM fields.</p>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {csvData?.headers.map(header => (
                    <div key={header} className="grid grid-cols-2 gap-4 items-center">
                        <span className="text-sm font-medium text-gray-300 truncate">{header}</span>
                        <select
                            value={mappings[header] || 'ignore'}
                            onChange={e => handleMappingChange(header, e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="ignore">-- Ignore this column --</option>
                            <optgroup label="Existing Fields">
                                {existingColumns.map(col => (
                                    <option key={col.key} value={col.key}>{col.label}</option>
                                ))}
                            </optgroup>
                             <optgroup label="New Field">
                                 <option value={`new_${header}`}>Create new field "{header}"</option>
                            </optgroup>
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderPreview = () => {
        const previewRecords = csvData?.records.slice(0, 3) || [];
        const mappedHeaders = csvData?.headers.filter(h => mappings[h] && mappings[h] !== 'ignore') || [];

        return (
             <div>
                <h3 className="text-lg font-medium mb-1">Preview & Confirm</h3>
                <p className="text-sm text-gray-400 mb-4">Here's a preview of how your contacts will be imported.</p>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-700/50">
                            <tr>
                                {mappedHeaders.map(header => {
                                    const mapped = mappings[header];
                                    let label = mapped;
                                    if(mapped.startsWith('new_')) {
                                        label = mapped.substring(4);
                                    } else {
                                        label = existingColumns.find(c => c.key === mapped)?.label || mapped;
                                    }
                                    return <th key={header} className="p-2 text-left font-medium">{label}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800/50 divide-y divide-gray-700/50">
                             {previewRecords.map((record, index) => (
                                <tr key={index}>
                                    {mappedHeaders.map(header => (
                                        <td key={header} className="p-2 whitespace-nowrap truncate max-w-xs">{record[header]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        )
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Import Contacts</h2>
                    <button type="button" onClick={handleClose} className="p-2 rounded-full hover:bg-gray-700">
                        <IconX />
                    </button>
                </header>

                <main className="p-6">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderPreview()}
                </main>

                <footer className="flex justify-between items-center p-4 border-t border-gray-700">
                    <button 
                        onClick={() => {
                            if (step > 1) setStep(step - 1);
                            else handleClose();
                        }}
                        className="px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {step === 2 && (
                         <button onClick={() => setStep(3)} className="px-4 py-2 ml-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                            Next: Preview
                        </button>
                    )}
                    {step === 3 && (
                        <button onClick={handleFinishImport} className="px-4 py-2 ml-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                            Finish Import
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ImportContactsModal;