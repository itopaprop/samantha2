import React, { useState } from 'react';
import { seniorBoardNode, fieldWorkforceData } from '../../data/organogramData';
import { OrganogramNode, WorkforceNode } from '../../types/organogram';
import { OrganizationCard } from './OrganizationCard';
import { BottomWorkforce } from './BottomWorkforce';
import { VerticalConnector, BranchConnector } from './Connector';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Printer, 
  Download, 
  Plus, 
  X, 
  SlidersHorizontal, 
  Users, 
  Sparkles, 
  Edit3, 
  CheckCircle2, 
  Building2, 
  Mail, 
  Phone,
  RotateCcw,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export const OrganizationChart: React.FC = () => {
  const { showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedNode, setSelectedNode] = useState<OrganogramNode | null>(null);
  const [selectedWorkforce, setSelectedWorkforce] = useState<WorkforceNode | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<OrganogramNode | null>(null);

  // Local state for hierarchy to support interactive updates
  const [hierarchyData, setHierarchyData] = useState<OrganogramNode>(seniorBoardNode);
  const [workforceData, setWorkforceData] = useState<WorkforceNode[]>(fieldWorkforceData);

  // Helper to extract flat list of nodes
  const flattenNodes = (node: OrganogramNode): OrganogramNode[] => {
    let result: OrganogramNode[] = [node];
    if (node.children) {
      node.children.forEach(child => {
        result = result.concat(flattenNodes(child));
      });
    }
    return result;
  };

  const allNodes = flattenNodes(hierarchyData);

  // Nodes extraction by hierarchy levels
  const boardNode = hierarchyData;
  const ceoNode = hierarchyData.children?.[0];
  const gcmNode = ceoNode?.children?.[0];
  
  const finNode = gcmNode?.children?.find(n => n.id === 'fin-01');
  const audNode = gcmNode?.children?.find(n => n.id === 'aud-01');
  
  const amNode = gcmNode?.children?.find(n => n.id === 'am-01');
  const hsNode = gcmNode?.children?.find(n => n.id === 'hs-01');

  const supervisorNodes = gcmNode?.children?.filter(n => n.id.startsWith('sup-')) || [];

  // Filter & Search Logic
  const matchesSearch = (node: OrganogramNode) => {
    if (!searchTerm && selectedDept === 'all') return true;
    const term = searchTerm.toLowerCase();
    const matchText = 
      node.title.toLowerCase().includes(term) ||
      node.employeeName.toLowerCase().includes(term) ||
      node.department.toLowerCase().includes(term) ||
      node.description.toLowerCase().includes(term);

    const matchDept = selectedDept === 'all' || node.department === selectedDept;

    return matchText && matchDept;
  };

  const isAnyFilterActive = searchTerm.length > 0 || selectedDept !== 'all';

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(hierarchyData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'samanthasappy_organogram_hierarchy.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Organogram hierarchy structure exported as JSON report!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;

    // Recursive update node in state
    const updateRecursive = (node: OrganogramNode): OrganogramNode => {
      if (node.id === editingNode.id) {
        return { ...editingNode };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateRecursive)
        };
      }
      return node;
    };

    setHierarchyData(updateRecursive(hierarchyData));
    setIsEditModalOpen(false);
    setSelectedNode(editingNode);
    showToast(`Updated position details for ${editingNode.title}`);
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-50 rounded-3xl p-4 sm:p-8 md:p-12 border border-slate-200/80 shadow-2xl space-y-10 font-sans print:p-0 print:border-none print:shadow-none">
      
      {/* Organogram Header & Interactive Controls Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 print:hidden">
        
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Governance & Management Map</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Organizational Command Hierarchy
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            Fortune 500 standard caregiving management organogram & operational leadership structure.
          </p>
        </div>

        {/* Action Buttons & Export Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search employee or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 shadow-xs w-48 sm:w-60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Print Organogram Chart"
          >
            <Printer className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Print Organogram</span>
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            title="Export JSON Structure"
          >
            <Download className="w-3.5 h-3.5 text-purple-200" />
            <span>Export Data</span>
          </button>
        </div>

      </div>

      {/* Main Hierarchy Canvas Tree */}
      <div className="space-y-8 flex flex-col items-center justify-center overflow-x-auto py-4">
        
        {/* LEVEL 0: Senior Management Board */}
        <div className="flex flex-col items-center w-full">
          <OrganizationCard
            node={boardNode}
            isHighlighted={isAnyFilterActive && matchesSearch(boardNode)}
            isFilteredOut={isAnyFilterActive && !matchesSearch(boardNode)}
            onSelect={(n) => setSelectedNode(n)}
          />
          <VerticalConnector height={40} label="Appoints Executive Management" />
        </div>

        {/* LEVEL 1: Chief Executive Officer (CEO) */}
        {ceoNode && (
          <div className="flex flex-col items-center w-full">
            <OrganizationCard
              node={ceoNode}
              isHighlighted={isAnyFilterActive && matchesSearch(ceoNode)}
              isFilteredOut={isAnyFilterActive && !matchesSearch(ceoNode)}
              onSelect={(n) => setSelectedNode(n)}
            />
            <VerticalConnector height={40} label="Directs Operational Command" />
          </div>
        )}

        {/* LEVEL 2: General Care Manager */}
        {gcmNode && (
          <div className="flex flex-col items-center w-full">
            <OrganizationCard
              node={gcmNode}
              isHighlighted={isAnyFilterActive && matchesSearch(gcmNode)}
              isFilteredOut={isAnyFilterActive && !matchesSearch(gcmNode)}
              onSelect={(n) => setSelectedNode(n)}
            />
            <BranchConnector cols={2} />
          </div>
        )}

        {/* LEVEL 3 - Row 1: Finance Accountant & Internal Auditor */}
        {(finNode || audNode) && (
          <div className="flex flex-col items-center w-full space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 max-w-3xl w-full justify-items-center">
              {finNode && (
                <OrganizationCard
                  node={finNode}
                  isHighlighted={isAnyFilterActive && matchesSearch(finNode)}
                  isFilteredOut={isAnyFilterActive && !matchesSearch(finNode)}
                  onSelect={(n) => setSelectedNode(n)}
                />
              )}
              {audNode && (
                <OrganizationCard
                  node={audNode}
                  isHighlighted={isAnyFilterActive && matchesSearch(audNode)}
                  isFilteredOut={isAnyFilterActive && !matchesSearch(audNode)}
                  onSelect={(n) => setSelectedNode(n)}
                />
              )}
            </div>
            <BranchConnector cols={2} />
          </div>
        )}

        {/* LEVEL 3 - Row 2: Assistant Manager & Head Supervisor */}
        {(amNode || hsNode) && (
          <div className="flex flex-col items-center w-full space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 max-w-3xl w-full justify-items-center">
              {amNode && (
                <OrganizationCard
                  node={amNode}
                  isHighlighted={isAnyFilterActive && matchesSearch(amNode)}
                  isFilteredOut={isAnyFilterActive && !matchesSearch(amNode)}
                  onSelect={(n) => setSelectedNode(n)}
                />
              )}
              {hsNode && (
                <OrganizationCard
                  node={hsNode}
                  isHighlighted={isAnyFilterActive && matchesSearch(hsNode)}
                  isFilteredOut={isAnyFilterActive && !matchesSearch(hsNode)}
                  onSelect={(n) => setSelectedNode(n)}
                />
              )}
            </div>
            <BranchConnector cols={4} />
          </div>
        )}

        {/* LEVEL 4: Supervisor Level (4 Horizontal Cards) */}
        {supervisorNodes.length > 0 && (
          <div className="flex flex-col items-center w-full space-y-2">
            <div className="text-center mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Departmental Supervisory Command Level
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-6xl justify-items-center">
              {supervisorNodes.map((sup) => (
                <OrganizationCard
                  key={sup.id}
                  node={sup}
                  isHighlighted={isAnyFilterActive && matchesSearch(sup)}
                  isFilteredOut={isAnyFilterActive && !matchesSearch(sup)}
                  onSelect={(n) => setSelectedNode(n)}
                />
              ))}
            </div>

            <VerticalConnector height={48} label="Directs Field Operations & Staff" />
          </div>
        )}

        {/* BOTTOM SECTION: Field Workforce Container */}
        <div className="w-full max-w-7xl pt-4">
          <BottomWorkforce
            workforce={workforceData}
            onSelectWorkforce={(item) => setSelectedWorkforce(item)}
          />
        </div>

      </div>

      {/* Node Profile Detail Drawer/Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{selectedNode.department}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {selectedNode.title}
              </h3>
              {selectedNode.employeeName ? (
                <div className="text-base font-extrabold text-purple-700">
                  {selectedNode.employeeName}
                </div>
              ) : null}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-700 leading-relaxed">
              <div className="font-bold text-slate-900">Role & Responsibility Summary:</div>
              <p>{selectedNode.description}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Contact & Reporting Desk</div>
              {selectedNode.contactEmail && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{selectedNode.contactEmail}</span>
                </div>
              )}
              {selectedNode.phone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{selectedNode.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setEditingNode({ ...selectedNode });
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-700" />
                <span>Edit Position Info</span>
              </button>

              <button
                onClick={() => setSelectedNode(null)}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Workforce Roster Modal */}
      {selectedWorkforce && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            
            <button
              onClick={() => setSelectedWorkforce(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                {selectedWorkforce.department}
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
                {selectedWorkforce.title} Team
              </h3>
              <div className="text-xs font-bold text-slate-500">
                Active Staff Count: <span className="text-sky-700 font-extrabold">{selectedWorkforce.count} Employees</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {selectedWorkforce.description}
            </p>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[10px]">Sample Shift Allocation</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800">Day Shift (08:00 - 18:00)</div>
                  <div className="text-[11px] text-slate-500">{Math.ceil(selectedWorkforce.count * 0.6)} On Duty</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800">Night Shift (18:00 - 08:00)</div>
                  <div className="text-[11px] text-slate-500">{Math.floor(selectedWorkforce.count * 0.4)} On Duty</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedWorkforce(null)}
                className="bg-sky-700 hover:bg-sky-800 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md cursor-pointer"
              >
                Close Roster
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Position Modal */}
      {isEditModalOpen && editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Edit Organogram Position
              </h3>
              <p className="text-xs text-slate-500">Update employee name or position title dynamically.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Position Title
                </label>
                <input
                  type="text"
                  required
                  value={editingNode.title}
                  onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Employee / Officer Name
                </label>
                <input
                  type="text"
                  required
                  value={editingNode.employeeName}
                  onChange={(e) => setEditingNode({ ...editingNode, employeeName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role Description
                </label>
                <textarea
                  rows={3}
                  value={editingNode.description}
                  onChange={(e) => setEditingNode({ ...editingNode, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
