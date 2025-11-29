'use client'

import { useState } from 'react';
import { Card } from '@/components/UI';
import { Button } from '@/components/UI';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportPage() {
  const [contactsFile, setContactsFile] = useState<File | null>(null);
  const [agenciesFile, setAgenciesFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!contactsFile && !agenciesFile) {
      alert('Please select at least one CSV file to import');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (contactsFile) formData.append('contacts', contactsFile);
      if (agenciesFile) formData.append('agencies', agenciesFile);

      const response = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Import error:', error);
      setResult({ error: 'Failed to import files' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Data</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Upload CSV files to import contacts and agencies
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contacts Import */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold">Contacts CSV</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expected columns: name, email, phone, agency, position, notes
            </p>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setContactsFile(e.target.files?.[0] || null)}
                className="hidden"
                id="contacts-file"
              />
              <label
                htmlFor="contacts-file"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload size={32} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {contactsFile ? contactsFile.name : 'Click to select contacts CSV'}
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Agencies Import */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold">Agencies CSV</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expected columns: name, description, website, industry, size, location
            </p>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setAgenciesFile(e.target.files?.[0] || null)}
                className="hidden"
                id="agencies-file"
              />
              <label
                htmlFor="agencies-file"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload size={32} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {agenciesFile ? agenciesFile.name : 'Click to select agencies CSV'}
                </span>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* Import Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleImport}
          disabled={importing || (!contactsFile && !agenciesFile)}
          className="px-8 py-2"
        >
          {importing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Importing...
            </>
          ) : (
            <>
              <Upload size={16} className="mr-2" />
              Import CSV Files
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Import Results</h3>
          
          {result.error ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={20} />
              <span>{result.error}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span>Import completed successfully!</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Contacts:</strong> {result.contactsImported} imported
                </div>
                <div>
                  <strong>Agencies:</strong> {result.agenciesImported} imported
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <strong className="text-orange-600">Warnings:</strong>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                    {result.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Format Help */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-300">CSV Format Guidelines</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Contacts CSV Headers:</h4>
            <ul className="space-y-1 text-blue-600 dark:text-blue-300">
              <li>• name (required)</li>
              <li>• email</li>
              <li>• phone</li>
              <li>• agency</li>
              <li>• position</li>
              <li>• notes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Agencies CSV Headers:</h4>
            <ul className="space-y-1 text-blue-600 dark:text-blue-300">
              <li>• name (required)</li>
              <li>• description</li>
              <li>• website</li>
              <li>• industry</li>
              <li>• size</li>
              <li>• location</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}