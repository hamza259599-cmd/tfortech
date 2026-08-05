import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { 
  Download, Upload, ArrowLeft, Database, 
  CheckCircle, AlertCircle, FileJson, RefreshCw 
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DataTransfer() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [importResult, setImportResult] = useState(null);

  // Export all data
  const handleExport = async () => {
    setExporting(true);
    setExportData(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/admin/export-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setExportData(response.data);
      
      // Create and download JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tfortech_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  // Import data from file
  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    setImportResult(null);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API}/admin/import-data`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      setImportResult(response.data);
      toast.success("Data imported successfully!");
    } catch (error) {
      console.error("Import error:", error);
      if (error.message?.includes("JSON")) {
        toast.error("Invalid JSON file");
      } else {
        toast.error("Failed to import data");
      }
    } finally {
      setImporting(false);
      event.target.value = ""; // Reset file input
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Database className="w-6 h-6 text-[#FF8FAB]" />
                Data Export for Deployment
              </h1>
              <p className="text-sm text-gray-500">Export data - it will auto-sync on deployment!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
          <h3 className="font-semibold text-green-800 mb-2">✅ Auto-Sync on Deployment</h3>
          <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
            <li>Click <strong>"Export Data"</strong> - data save ho jayega</li>
            <li><strong>"Save to Github"</strong> click karein</li>
            <li>Deploy hone pe data <strong>automatically</strong> live site pe aa jayega!</li>
          </ol>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Export Data</h2>
                <p className="text-sm text-gray-500">Save data for deployment</p>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Exports all products, categories, custom attributes, and settings as a JSON file.
            </p>
            
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="export-btn"
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
            
            {exportData && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">Export Complete!</span>
                </div>
                <div className="text-xs text-green-600 space-y-1">
                  <p>• {exportData.products?.length || 0} Products</p>
                  <p>• {exportData.categories?.length || 0} Categories</p>
                  <p>• {exportData.custom_attributes?.length || 0} Custom Attributes</p>
                </div>
              </div>
            )}
          </div>

          {/* Import Section */}
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Import Data</h2>
                <p className="text-sm text-gray-500">Upload data from backup</p>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Import products, categories, and settings from a previously exported JSON file.
            </p>
            
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
                data-testid="import-input"
              />
              <Button
                as="span"
                disabled={importing}
                className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
                onClick={() => document.querySelector('[data-testid="import-input"]').click()}
                data-testid="import-btn"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </label>
            
            {importResult && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">Import Complete!</span>
                </div>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>• {importResult.imported?.products || 0} Products imported</p>
                  <p>• {importResult.imported?.categories || 0} Categories imported</p>
                  <p>• {importResult.imported?.custom_attributes || 0} Custom Attributes imported</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Important Notes</h3>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• Import will update existing items with same ID</li>
                <li>• User accounts and orders are NOT included in export</li>
                <li>• Always keep a backup before importing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
