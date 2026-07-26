import React, { useState } from 'react';
import { Plus, Trash2, FolderPlus, Tag, Users, Bus } from 'lucide-react';

export default function AdminPanel({
  categories,
  onSaveCategories,
  projects,
  onSaveProjects,
  staffList,
  onSaveStaffList,
  transportModes,
  onSaveTransportModes
}) {
  const [newCat, setNewCat] = useState('');
  const [newProj, setNewProj] = useState('');
  const [newStaff, setNewStaff] = useState('');
  const [newTransport, setNewTransport] = useState('');

  // Category CRUD
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    if (categories.includes(newCat.trim())) {
      alert('Category already exists.');
      return;
    }
    onSaveCategories([...categories, newCat.trim()]);
    setNewCat('');
  };

  const handleDeleteCategory = (cat) => {
    if (categories.length <= 1) {
      alert('At least one category must remain.');
      return;
    }
    if (confirm(`Delete category "${cat}"?`)) {
      onSaveCategories(categories.filter(c => c !== cat));
    }
  };

  // Project CRUD
  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProj.trim()) return;
    if (projects.includes(newProj.trim())) {
      alert('Project already exists.');
      return;
    }
    onSaveProjects([...projects, newProj.trim()]);
    setNewProj('');
  };

  const handleDeleteProject = (proj) => {
    if (projects.length <= 1) {
      alert('At least one project must remain.');
      return;
    }
    if (confirm(`Delete project "${proj}"?`)) {
      onSaveProjects(projects.filter(p => p !== proj));
    }
  };

  // Staff CRUD
  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.trim()) return;
    if (staffList.includes(newStaff.trim())) {
      alert('Staff name already exists.');
      return;
    }
    onSaveStaffList([...staffList, newStaff.trim()]);
    setNewStaff('');
  };

  const handleDeleteStaff = (staff) => {
    if (confirm(`Delete staff member "${staff}"?`)) {
      onSaveStaffList(staffList.filter(s => s !== staff));
    }
  };

  // Transport CRUD
  const handleAddTransport = (e) => {
    e.preventDefault();
    if (!newTransport.trim()) return;
    if (transportModes.includes(newTransport.trim())) {
      alert('Transport mode already exists.');
      return;
    }
    onSaveTransportModes([...transportModes, newTransport.trim()]);
    setNewTransport('');
  };

  const handleDeleteTransport = (mode) => {
    if (confirm(`Delete transport mode "${mode}"?`)) {
      onSaveTransportModes(transportModes.filter(t => t !== mode));
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
          <Tag className="w-5 h-5 text-amber-400" />
          Admin Control Center - Manage System Items & Projects
        </h2>
        <p className="text-xs text-slate-400">
          Create and delete expense categories, projects, employees, and transport options available in voucher entry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Expense Categories Management */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-400" />
            Manage Expense Categories ({categories.length})
          </h3>

          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input 
              type="text"
              placeholder="Add new category (e.g. Audit Expenses)..."
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="form-control"
            />
            <button type="submit" className="btn btn-primary text-xs whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-sm text-slate-200">{cat}</span>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Projects Management */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-emerald-400" />
            Manage Projects ({projects.length})
          </h3>

          <form onSubmit={handleAddProject} className="flex gap-2">
            <input 
              type="text"
              placeholder="Add new project (e.g. Project X)..."
              value={newProj}
              onChange={(e) => setNewProj(e.target.value)}
              className="form-control"
            />
            <button type="submit" className="btn btn-gold text-xs whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {projects.map((proj) => (
              <div key={proj} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-sm text-slate-200">{proj}</span>
                <button
                  onClick={() => handleDeleteProject(proj)}
                  className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Staff / Employee Management */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Manage Staff / Paid To List ({staffList.length})
          </h3>

          <form onSubmit={handleAddStaff} className="flex gap-2">
            <input 
              type="text"
              placeholder="Add new staff member name..."
              value={newStaff}
              onChange={(e) => setNewStaff(e.target.value)}
              className="form-control"
            />
            <button type="submit" className="btn btn-primary text-xs whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Staff
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {staffList.map((staff) => (
              <div key={staff} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-sm text-slate-200">{staff}</span>
                <button
                  onClick={() => handleDeleteStaff(staff)}
                  className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                  title="Delete Staff"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Transport Modes Management */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
            <Bus className="w-4 h-4 text-purple-400" />
            Manage Transport Modes ({transportModes.length})
          </h3>

          <form onSubmit={handleAddTransport} className="flex gap-2">
            <input 
              type="text"
              placeholder="Add transport mode (e.g. Metro Rail)..."
              value={newTransport}
              onChange={(e) => setNewTransport(e.target.value)}
              className="form-control"
            />
            <button type="submit" className="btn btn-gold text-xs whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Transport
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {transportModes.map((mode) => (
              <div key={mode} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-sm text-slate-200">{mode}</span>
                <button
                  onClick={() => handleDeleteTransport(mode)}
                  className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                  title="Delete Transport Mode"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
