"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiLogOut, FiSave, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { MAX_UPLOAD_BYTES } from "@/lib/uploadLimits";

// Force dynamic rendering
export const dynamic = "force-dynamic";

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "projects",
  );

  useEffect(() => {
    checkAuth();
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const checkAuth = async () => {
    try {
      console.log("Checking auth...");
      const res = await fetch("/api/auth/session", {
        credentials: "include",
      });
      const data = await res.json();
      console.log("Auth response:", data);

      if (!data.isLoggedIn) {
        console.log("Not logged in, redirecting to home");
        router.push("/");
        return;
      }

      console.log("Auth successful");
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Portfolio Admin
              </h1>
              <span className="px-3 py-1 bg-accent-cyan/10 text-accent-cyan text-sm rounded-full border border-accent-cyan/30">
                Dev Mode
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent-cyan transition-colors"
              >
                View Site
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-light-elevated dark:bg-dark-elevated text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
              >
                <FiLogOut size={16} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {["projects", "experience", "skills", "content", "settings"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    router.push(`/admin?tab=${tab}`);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-accent-cyan text-dark-bg"
                      : "text-gray-600 dark:text-gray-400 hover:bg-light-elevated dark:hover:bg-dark-elevated"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "projects" && <ProjectsTab />}
        {activeTab === "experience" && <ExperienceTab />}
        {activeTab === "skills" && <SkillsTab />}
        {activeTab === "content" && <ContentTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

// Projects Tab Component
function ProjectsTab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchProjects();
    const editId = searchParams.get("edit");
    if (editId) {
      fetchProjectForEdit(parseInt(editId));
      setShowForm(true);
    }
  }, [searchParams]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
  };

  const fetchProjectForEdit = async (id: number) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      setEditingProject(project);
    } else {
      const res = await fetch("/api/projects");
      const data = await res.json();
      const found = data.find((p: any) => p.id === id);
      if (found) setEditingProject(found);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const url = editingProject
        ? `/api/projects/${editingProject.id}`
        : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchProjects();
        setShowForm(false);
        setEditingProject(null);
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Projects ({projects.length})
        </h2>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors"
        >
          <FiPlus size={18} />
          Add Project
        </button>
      </div>

      {showForm && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      <div className="grid gap-4 mt-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech: string) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-accent-cyan/10 text-accent-cyan text-xs rounded border border-accent-cyan/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingProject(project);
                    setShowForm(true);
                  }}
                  className="px-3 py-2 bg-light-elevated dark:bg-dark-elevated text-gray-900 dark:text-white rounded hover:bg-accent-cyan/20 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="px-3 py-2 bg-light-elevated dark:bg-dark-elevated text-red-500 rounded hover:bg-red-500/20 transition-colors text-sm"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Project Form Component
function ProjectForm({ project, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: project?.title || "",
    subtitle: project?.subtitle || "",
    description: project?.description || "",
    techStack: project?.techStack?.join(", ") || "",
    githubUrl: project?.githubUrl || "",
    liveUrl: project?.liveUrl || "",
    featured: project?.featured || false,
    order: project?.order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      techStack: formData.techStack
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {project ? "Edit Project" : "Add New Project"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subtitle (optional)
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) =>
              setFormData({ ...formData, subtitle: e.target.value })
            }
            className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tech Stack (comma-separated) *
          </label>
          <input
            type="text"
            value={formData.techStack}
            onChange={(e) =>
              setFormData({ ...formData, techStack: e.target.value })
            }
            placeholder="React, TypeScript, Node.js"
            className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GitHub URL
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) =>
                setFormData({ ...formData, githubUrl: e.target.value })
              }
              className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Live Demo URL
            </label>
            <input
              type="url"
              value={formData.liveUrl}
              onChange={(e) =>
                setFormData({ ...formData, liveUrl: e.target.value })
              }
              className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="rounded border-gray-300 text-accent-cyan focus:ring-accent-cyan"
            />
            Featured Project
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Order:
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) })
              }
              className="w-20 px-2 py-1 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors"
        >
          <FiSave size={16} />
          Save Project
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-light-elevated dark:bg-dark-elevated text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Experience Tab - Similar structure
function ExperienceTab() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [editingExp, setEditingExp] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchExperiences();
    const editId = searchParams.get("edit");
    if (editId) {
      fetchExpForEdit(parseInt(editId));
      setShowForm(true);
    }
  }, [searchParams]);

  const fetchExperiences = async () => {
    const res = await fetch("/api/experiences");
    const data = await res.json();
    setExperiences(data);
  };

  const fetchExpForEdit = async (id: number) => {
    const exp = experiences.find((e) => e.id === id);
    if (exp) {
      setEditingExp(exp);
    } else {
      const res = await fetch("/api/experiences");
      const data = await res.json();
      const found = data.find((e: any) => e.id === id);
      if (found) setEditingExp(found);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const url = editingExp
        ? `/api/experiences/${editingExp.id}`
        : "/api/experiences";
      const method = editingExp ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchExperiences();
        setShowForm(false);
        setEditingExp(null);
      }
    } catch (error) {
      console.error("Error saving experience:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;

    try {
      const res = await fetch(`/api/experiences/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchExperiences();
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Experience ({experiences.length})
        </h2>
        <button
          onClick={() => {
            setEditingExp(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors"
        >
          <FiPlus size={18} />
          Add Experience
        </button>
      </div>

      {showForm && (
        <ExperienceForm
          experience={editingExp}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingExp(null);
          }}
        />
      )}

      <div className="grid gap-4 mt-6">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {exp.role}
                </h3>
                <p className="text-accent-cyan font-medium">{exp.company}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {exp.location} • {formatDate(exp.startDate)} -{" "}
                  {exp.endDate ? formatDate(exp.endDate) : "Present"}
                </p>
                <ul className="mt-3 space-y-1">
                  {exp.bullets.map((bullet: string, i: number) => (
                    <li
                      key={i}
                      className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                    >
                      <span className="text-accent-cyan">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingExp(exp);
                    setShowForm(true);
                  }}
                  className="px-3 py-2 bg-light-elevated dark:bg-dark-elevated text-gray-900 dark:text-white rounded hover:bg-accent-cyan/20 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="px-3 py-2 bg-light-elevated dark:bg-dark-elevated text-red-500 rounded hover:bg-red-500/20 transition-colors text-sm"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Experience Form Component
function ExperienceForm({ experience, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    role: experience?.role || "",
    company: experience?.company || "",
    location: experience?.location || "",
    startDate: experience?.startDate?.split("T")[0] || "",
    endDate: experience?.endDate?.split("T")[0] || "",
    bullets: experience?.bullets?.join("\n") || "",
    order: experience?.order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      bullets: formData.bullets
        .split("\n")
        .map((b: string) => b.trim())
        .filter(Boolean),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {experience ? "Edit Experience" : "Add New Experience"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date (leave empty for current)
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bullet Points (one per line) *
          </label>
          <textarea
            value={formData.bullets}
            onChange={(e) =>
              setFormData({ ...formData, bullets: e.target.value })
            }
            rows={6}
            placeholder="Each line will become a bullet point"
            className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan font-mono text-sm"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Order:
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: parseInt(e.target.value) })
            }
            className="ml-2 w-20 px-2 py-1 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors"
        >
          <FiSave size={16} />
          Save Experience
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-light-elevated dark:bg-dark-elevated text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Skills Tab - Similar structure
function SkillsTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/skills/categories");
    const data = await res.json();
    setCategories(data);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Delete this category and all its skills?")) return;
    try {
      const res = await fetch(`/api/skills/categories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchCategories();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!confirm("Delete this skill?")) return;
    try {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Skill Categories
        </h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowCategoryForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors"
        >
          <FiPlus size={18} />
          Add Category
        </button>
      </div>

      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onSubmit={async (data: any) => {
            const url = editingCategory
              ? `/api/skills/categories/${editingCategory.id}`
              : "/api/skills/categories";
            const method = editingCategory ? "PUT" : "POST";
            const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (res.ok) {
              fetchCategories();
              setShowCategoryForm(false);
              setEditingCategory(null);
            }
          }}
          onCancel={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {showSkillForm && (
        <SkillForm
          skill={editingSkill}
          categoryId={selectedCategoryId}
          categories={categories}
          onSubmit={async (data: any) => {
            const url = editingSkill
              ? `/api/skills/${editingSkill.id}`
              : "/api/skills";
            const method = editingSkill ? "PUT" : "POST";
            const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (res.ok) {
              fetchCategories();
              setShowSkillForm(false);
              setEditingSkill(null);
              setSelectedCategoryId(null);
            }
          }}
          onCancel={() => {
            setShowSkillForm(false);
            setEditingSkill(null);
            setSelectedCategoryId(null);
          }}
        />
      )}

      <div className="grid gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-accent-cyan">
                {category.name}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setEditingSkill(null);
                    setShowSkillForm(true);
                  }}
                  className="px-3 py-1 bg-light-elevated dark:bg-dark-elevated text-gray-900 dark:text-white rounded text-sm hover:bg-accent-cyan/20 transition-colors"
                >
                  Add Skill
                </button>
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setShowCategoryForm(true);
                  }}
                  className="px-3 py-1 bg-light-elevated dark:bg-dark-elevated text-gray-900 dark:text-white rounded text-sm hover:bg-accent-cyan/20 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="px-3 py-1 bg-light-elevated dark:bg-dark-elevated text-red-500 rounded text-sm hover:bg-red-500/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill: any) => (
                <div
                  key={skill.id}
                  className="group relative px-3 py-1.5 bg-light-elevated dark:bg-dark-elevated text-gray-700 dark:text-gray-300 text-sm rounded-lg border border-light-border dark:border-dark-border"
                >
                  {skill.name}
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryForm({ category, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    order: category?.order || 0,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {category ? "Edit Category" : "Add Category"}
        </h3>
        <button type="button" onClick={onCancel}>
          <FiX size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Order:
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: parseInt(e.target.value) })
            }
            className="ml-2 w-20 px-2 py-1 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors"
        >
          <FiSave size={16} />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-light-elevated dark:bg-dark-elevated text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function SkillForm({ skill, categoryId, categories, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: skill?.name || "",
    categoryId: skill?.categoryId || categoryId || categories[0]?.id || 0,
    order: skill?.order || 0,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {skill ? "Edit Skill" : "Add Skill"}
        </h3>
        <button type="button" onClick={onCancel}>
          <FiX size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Skill Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            required
          >
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Order:
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: parseInt(e.target.value) })
            }
            className="ml-2 w-20 px-2 py-1 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors"
        >
          <FiSave size={16} />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-light-elevated dark:bg-dark-elevated text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Content Tab Component
function ContentTab() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content", {
        credentials: "include",
      });
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error("Error fetching content:", error);
      setMessage("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(content),
      });

      if (res.ok) {
        setMessage("Content updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update content");
      }
    } catch (error) {
      console.error("Error updating content:", error);
      setMessage("Failed to update content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Site Content
        </h2>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors disabled:opacity-50"
        >
          <FiSave size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.includes("success")
              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Hero Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-light-border dark:border-dark-border pb-2">
            Hero Section
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hero Title (small text above name)
            </label>
            <input
              type="text"
              value={content?.heroTitle || ""}
              onChange={(e) =>
                setContent({ ...content, heroTitle: e.target.value })
              }
              className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              placeholder="e.g., Full-Stack Developer · CS Student"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hero Heading (main name)
            </label>
            <input
              type="text"
              value={content?.heroHeading || ""}
              onChange={(e) =>
                setContent({ ...content, heroHeading: e.target.value })
              }
              className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              placeholder="e.g., Hi, I'm Ishaan."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hero Subheading
            </label>
            <input
              type="text"
              value={content?.heroSubheading || ""}
              onChange={(e) =>
                setContent({ ...content, heroSubheading: e.target.value })
              }
              className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              placeholder="e.g., I build practical, thoughtful experiences."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hero Bio
            </label>
            <textarea
              value={content?.heroBio || ""}
              onChange={(e) =>
                setContent({ ...content, heroBio: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              placeholder="Introduce yourself..."
            />
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-light-border dark:border-dark-border pb-2">
            About Section
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              About Paragraph 1
            </label>
            <textarea
              value={content?.aboutParagraph1 || ""}
              onChange={(e) =>
                setContent({ ...content, aboutParagraph1: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              About Paragraph 2
            </label>
            <textarea
              value={content?.aboutParagraph2 || ""}
              onChange={(e) =>
                setContent({ ...content, aboutParagraph2: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              About Paragraph 3
            </label>
            <textarea
              value={content?.aboutParagraph3 || ""}
              onChange={(e) =>
                setContent({ ...content, aboutParagraph3: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </div>
        </div>

        {/* Quick Facts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-light-border dark:border-dark-border pb-2">
            Quick Facts
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={content?.location || ""}
                onChange={(e) =>
                  setContent({ ...content, location: e.target.value })
                }
                className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                placeholder="e.g., Kelowna, BC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Education
              </label>
              <input
                type="text"
                value={content?.education || ""}
                onChange={(e) =>
                  setContent({ ...content, education: e.target.value })
                }
                className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                placeholder="e.g., BSc Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Favourite Stack
              </label>
              <input
                type="text"
                value={content?.favouriteStack || ""}
                onChange={(e) =>
                  setContent({ ...content, favouriteStack: e.target.value })
                }
                className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                placeholder="e.g., Next.js · TypeScript · PostgreSQL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currently Vibing
              </label>
              <input
                type="text"
                value={content?.currentlyVibing || ""}
                onChange={(e) =>
                  setContent({ ...content, currentlyVibing: e.target.value })
                }
                className="w-full px-4 py-2 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                placeholder="e.g., Full-Stack Apps & AI APIs"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

// Settings Tab Component
// Returns an error message, or null if the upload succeeded.
async function uploadFile(url: string, field: string, file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    return "File is too large. The limit is 4 MB.";
  }

  const formData = new FormData();
  formData.append(field, file);

  try {
    const res = await fetch(url, { method: "POST", body: formData });
    if (res.ok) return null;

    if (res.status === 401) return "Your session has expired. Log in again.";
    if (res.status === 413) return "File is too large. The limit is 4 MB.";

    // Platform error pages aren't JSON, so don't assume a parsable body.
    const data = await res.json().catch(() => null);
    return data?.error || `Upload failed (status ${res.status})`;
  } catch {
    return "Upload failed: couldn't reach the server.";
  }
}

function SettingsTab() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;

    setUploading(true);
    setMessage("");

    const error = await uploadFile("/api/upload/resume", "resume", resumeFile);

    if (error) {
      setMessage("✗ " + error);
    } else {
      setMessage("✓ Resume updated. It's live on the site now.");
      setResumeFile(null);
    }
    setUploading(false);
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;

    setUploading(true);
    setMessage("");

    const error = await uploadFile("/api/upload/image", "image", imageFile);

    if (error) {
      setMessage("✗ " + error);
    } else {
      setMessage("✓ Profile image updated. It's live on the site now.");
      setImageFile(null);
    }
    setUploading(false);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Site Settings
      </h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.startsWith("✓")
              ? "bg-green-500/10 text-green-500 border border-green-500/30"
              : "bg-red-500/10 text-red-500 border border-red-500/30"
          }`}
        >
          {message}
        </div>
      )}

      {/* Resume Upload */}
      <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Update Resume
        </h3>
        <form onSubmit={handleResumeUpload}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload PDF Resume
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-900 dark:text-white border border-light-border dark:border-dark-border rounded-lg cursor-pointer bg-light-elevated dark:bg-dark-elevated focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              PDF files only, up to 4 MB. This replaces your current resume.
            </p>
          </div>
          <button
            type="submit"
            disabled={!resumeFile || uploading}
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave size={16} />
            {uploading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>
      </div>

      {/* Profile Image Upload */}
      <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Update Profile Image
        </h3>
        <form onSubmit={handleImageUpload}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Profile Photo
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-900 dark:text-white border border-light-border dark:border-dark-border rounded-lg cursor-pointer bg-light-elevated dark:bg-dark-elevated focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG, or WebP, up to 4 MB. Square images work best.
            </p>
          </div>
          {imageFile && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Preview:
              </p>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border-2 border-accent-cyan"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={!imageFile || uploading}
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave size={16} />
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white">
          Loading...
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
