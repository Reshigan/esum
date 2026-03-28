"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { apiClient } from "@/lib/api-client";

interface Project {
  id: string;
  name: string;
  type: string;
  capacity_mw: number;
  status: string;
  location: string;
  commissioning_date: string;
  progress_percent: number;
}

interface Milestone {
  id: string;
  name: string;
  due_date: string;
  status: string;
  completed_date?: string;
}

const statusColors: Record<string, string> = {
  "planning": "bg-blue-50 text-blue-600",
  "permitting": "bg-amber-50 text-amber-600",
  "construction": "bg-orange-50 text-orange-600",
  "commissioning": "bg-violet-50 text-violet-600",
  "operational": "bg-green-50 text-green-600",
  "on_hold": "bg-gray-50 text-gray-600",
};

export default function IPPDashboardPage() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await apiClient.getIPPProjects({ limit: 50 });
        setProjects(response.data);
      } catch (error: any) {
        showError("Failed to load IPP projects");
        console.error("IPP projects fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [showError]);

  const loadMilestones = async (project: Project) => {
    setIsLoadingMilestones(true);
    setSelectedProject(project);
    try {
      const response = await apiClient.getProjectMilestones(project.id);
      setMilestones(response.data);
    } catch (error: any) {
      showError("Failed to load project milestones");
      console.error("Milestones fetch error:", error);
    } finally {
      setIsLoadingMilestones(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const stats = {
    total_projects: projects.length,
    operational: projects.filter((p) => p.status === "operational").length,
    under_construction: projects.filter((p) => p.status === "construction").length,
    total_capacity_mw: projects.reduce((sum, p) => sum + p.capacity_mw, 0),
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        <header className="sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur-md px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IPP Projects</h1>
            <p className="text-sm text-gray-400 mt-0.5">Independent Power Producer project dashboard</p>
          </div>
          <button className="bg-[#1A1D23] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition inline-flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            New Project
          </button>
        </header>

        <main className="px-8 pb-8">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-2xl p-5 border border-lime-100">
              <span className="text-xs font-medium text-gray-400">Total Projects</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">{stats.total_projects}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Operational</span>
              <div className="text-2xl font-bold text-green-600 mt-2">{stats.operational}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Under Construction</span>
              <div className="text-2xl font-bold text-orange-600 mt-2">{stats.under_construction}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Total Capacity</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">{stats.total_capacity_mw} <span className="text-sm font-normal text-gray-400">MW</span></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Project Portfolio</h2>
              </div>
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Capacity</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length > 0 ? (
                      projects.map((p) => (
                        <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${selectedProject?.id === p.id ? 'bg-lime-50' : ''}`}>
                          <td className="py-3.5 px-4">
                            <div className="text-sm font-medium text-gray-700">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.id}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-medium text-gray-600">{p.type}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-700">{p.capacity_mw} MW</td>
                          <td className="py-3.5 px-4 text-sm text-gray-500">{p.location}</td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-lime-400 rounded-full" style={{ width: `${p.progress_percent}%` }} />
                              </div>
                              <span className="text-xs text-gray-500">{p.progress_percent}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => loadMilestones(p)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1A1D23] text-white hover:bg-gray-800 transition"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                          No IPP projects available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Milestone Tracking</h3>
                {selectedProject && (
                  <span className="text-xs text-gray-400 truncate max-w-[150px]">{selectedProject.name}</span>
                )}
              </div>

              {isLoadingMilestones ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : milestones.length > 0 ? (
                <div className="space-y-3">
                  {milestones.map((m) => (
                    <div key={m.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{m.name}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          m.status === "completed" ? "bg-green-50 text-green-600" :
                          m.status === "in_progress" ? "bg-blue-50 text-blue-600" :
                          m.status === "at_risk" ? "bg-amber-50 text-amber-600" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {m.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Due: {formatDate(m.due_date)}</span>
                        {m.completed_date && (
                          <span className="text-green-600">Completed: {formatDate(m.completed_date)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedProject ? (
                <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                  No milestones found
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                  Select a project to view milestones
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
