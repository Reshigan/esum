"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  project_name: string;
  project_type: string;
  province: string;
  capacity_mw: number;
  status: string;
  financial_close_readiness?: number;
  created_at: string;
}

export default function IPPProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const token = localStorage.getItem("access_token");
      const orgId = localStorage.getItem("organisation_id");
      
      const response = await fetch(`/api/ipp/projects?org_id=${orgId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'financial_close':
        return 'bg-green-100 text-green-800';
      case 'development':
        return 'bg-blue-100 text-blue-800';
      case 'feasibility':
        return 'bg-amber-100 text-amber-800';
      case 'concept':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'solar_pv':
        return '☀️';
      case 'wind':
        return '💨';
      case 'hydro':
        return '💧';
      case 'biomass':
        return '🌱';
      case 'battery_storage':
        return '🔋';
      case 'hybrid':
        return '⚡';
      default:
        return '⚡';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IPP Projects</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your power generation projects</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
            >
              + New Project
            </button>
          </div>
        </header>

        {/* Projects Grid */}
        <main className="px-8 py-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-48">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Create your first IPP project to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/ipp/projects/${project.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getTypeIcon(project.project_type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.project_name}</h3>
                        <p className="text-sm text-gray-500">{project.project_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Capacity</span>
                      <span className="font-medium text-gray-900">{project.capacity_mw} MW</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Province</span>
                      <span className="font-medium text-gray-900">{project.province.replace('_', ' ')}</span>
                    </div>
                    
                    {project.financial_close_readiness !== undefined && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-500">Financial Close Readiness</span>
                          <span className="font-medium text-gray-900">{project.financial_close_readiness}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${project.financial_close_readiness}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                    <span className="text-green-600 font-medium">View Details →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

function CreateProjectModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    project_name: '',
    project_type: 'solar_pv',
    province: 'northern_cape',
    location: '',
    capacity_mw: '',
    estimated_annual_generation_gwh: '',
    total_investment_zar: '',
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      const orgId = localStorage.getItem("organisation_id");

      const response = await fetch('/api/ipp/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ipp_org_id: orgId,
          project_name: formData.project_name,
          project_type: formData.project_type,
          province: formData.province,
          location: formData.location,
          capacity_mw: parseFloat(formData.capacity_mw),
          estimated_annual_generation_gwh: formData.estimated_annual_generation_gwh ? parseFloat(formData.estimated_annual_generation_gwh) : undefined,
          total_investment_zar: formData.total_investment_zar ? parseFloat(formData.total_investment_zar) : undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Failed to create project: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to create project: ' + error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create New IPP Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              required
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Northern Cape Solar Farm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
              <select
                value={formData.project_type}
                onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="solar_pv">Solar PV</option>
                <option value="wind">Wind</option>
                <option value="hydro">Hydro</option>
                <option value="biomass">Biomass</option>
                <option value="battery_storage">Battery Storage</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="northern_cape">Northern Cape</option>
                <option value="western_cape">Western Cape</option>
                <option value="eastern_cape">Eastern Cape</option>
                <option value="kwazulu_natal">KwaZulu-Natal</option>
                <option value="gauteng">Gauteng</option>
                <option value="mpumalanga">Mpumalanga</option>
                <option value="free_state">Free State</option>
                <option value="limpopo">Limpopo</option>
                <option value="north_west">North West</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="GPS coordinates or address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (MW)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.capacity_mw}
                onChange={(e) => setFormData({ ...formData, capacity_mw: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Est. Annual Generation (GWh)</label>
              <input
                type="number"
                step="0.1"
                value={formData.estimated_annual_generation_gwh}
                onChange={(e) => setFormData({ ...formData, estimated_annual_generation_gwh: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Investment (ZAR)</label>
            <input
              type="number"
              value={formData.total_investment_zar}
              onChange={(e) => setFormData({ ...formData, total_investment_zar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 1000000000"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
