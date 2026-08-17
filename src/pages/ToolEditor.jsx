import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowLeft, Share2, History, Save, Loader, AlertCircle } from 'lucide-react';
import SharingPanel from '../components/SharingPanel';
import VersionHistory from '../components/VersionHistory';

export default function ToolEditor() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const activeTab = searchParams.get('tab') || 'editor';

  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTool();
  }, [toolId, user]);

  const fetchTool = async () => {
    if (!toolId || !user) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'tools', toolId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        setError('Tool not found');
        return;
      }

      const toolData = snapshot.data();
      setTool({ id: toolId, ...toolData });

      // Check permissions
      const userPermission = toolData.permissions?.find(
        p => p.userId === user.uid
      );
      setCanEdit(
        userPermission?.role === 'owner' ||
        userPermission?.role === 'editor' ||
        toolData.ownerId === user.uid
      );
    } catch (err) {
      console.error('Error fetching tool:', err);
      setError('Failed to load tool');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tool || !canEdit) return;

    setSaving(true);
    try {
      // Create a version before saving
      const version = {
        timestamp: Timestamp.now(),
        userId: user.uid,
        userName: user.displayName || user.email,
        data: {
          objective: tool.objective,
          criticalSuccessFactors: tool.criticalSuccessFactors,
          projects: tool.projects
        }
      };

      const versions = tool.versions || [];
      const updatedVersions = [version, ...versions].slice(0, 50); // Keep last 50

      await updateDoc(doc(db, 'tools', toolId), {
        objective: tool.objective,
        criticalSuccessFactors: tool.criticalSuccessFactors,
        projects: tool.projects,
        versions: updatedVersions,
        updatedAt: Timestamp.now(),
        lastEditedBy: user.uid,
        lastEditedByName: user.displayName || user.email
      });

      setIsEditing(false);
      alert('Tool saved successfully');
    } catch (err) {
      console.error('Error saving tool:', err);
      alert('Failed to save tool');
    } finally {
      setSaving(false);
    }
  };

  const updateObjective = (value) => {
    if (canEdit) {
      setTool({ ...tool, objective: value });
      setIsEditing(true);
    }
  };

  const updateCSF = (index, value) => {
    if (canEdit) {
      const newCSF = [...tool.criticalSuccessFactors];
      newCSF[index].text = value;
      setTool({ ...tool, criticalSuccessFactors: newCSF });
      setIsEditing(true);
    }
  };

  const addProject = () => {
    if (canEdit) {
      const newProject = {
        id: Date.now(),
        name: 'New Project',
        scores: Array(tool.criticalSuccessFactors.length).fill(0)
      };
      setTool({
        ...tool,
        projects: [...tool.projects, newProject]
      });
      setIsEditing(true);
    }
  };

  const updateProject = (projectId, field, value) => {
    if (canEdit) {
      const projects = tool.projects.map(p =>
        p.id === projectId ? { ...p, [field]: value } : p
      );
      setTool({ ...tool, projects });
      setIsEditing(true);
    }
  };

  const updateProjectScore = (projectId, csfIndex, value) => {
    if (canEdit) {
      const projects = tool.projects.map(p => {
        if (p.id === projectId) {
          const scores = [...p.scores];
          scores[csfIndex] = Math.max(0, Math.min(2, parseInt(value) || 0));
          return { ...p, scores };
        }
        return p;
      });
      setTool({ ...tool, projects });
      setIsEditing(true);
    }
  };

  const deleteProject = (projectId) => {
    if (canEdit) {
      setTool({
        ...tool,
        projects: tool.projects.filter(p => p.id !== projectId)
      });
      setIsEditing(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex gap-2 items-center">
          <Loader className="animate-spin" size={20} />
          <span className="text-gray-600">Loading tool...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{tool.name}</h1>
            <div className="flex gap-2">
              {isEditing && canEdit && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-t border-gray-200">
            <button
              onClick={() => navigate(`/tool/${toolId}`)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === 'editor'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => navigate(`/tool/${toolId}?tab=sharing`)}
              className={`px-4 py-3 font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'sharing'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Share2 size={18} />
              Sharing
            </button>
            <button
              onClick={() => navigate(`/tool/${toolId}?tab=history`)}
              className={`px-4 py-3 font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <History size={18} />
              History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Editor Tab */}
        {activeTab === 'editor' && (
          <ToolEditorContent
            tool={tool}
            canEdit={canEdit}
            onUpdateObjective={updateObjective}
            onUpdateCSF={updateCSF}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onUpdateProjectScore={updateProjectScore}
            onDeleteProject={deleteProject}
          />
        )}

        {/* Sharing Tab */}
        {activeTab === 'sharing' && (
          <SharingPanel tool={tool} onToolUpdate={setTool} canEdit={canEdit} />
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <VersionHistory
            tool={tool}
            onRestore={(version) => {
              setTool({
                ...tool,
                objective: version.objective,
                criticalSuccessFactors: version.criticalSuccessFactors,
                projects: version.projects
              });
              setIsEditing(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ToolEditorContent({
  tool,
  canEdit,
  onUpdateObjective,
  onUpdateCSF,
  onAddProject,
  onUpdateProject,
  onUpdateProjectScore,
  onDeleteProject
}) {
  return (
    <div className="space-y-8">
      {/* Objective */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Objective</h2>
        <textarea
          value={tool.objective}
          onChange={(e) => onUpdateObjective(e.target.value)}
          disabled={!canEdit}
          placeholder="Define your strategic objective..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
          rows="3"
        />
      </div>

      {/* Critical Success Factors */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Critical Success Factors (How Could I Fuck It Up? Do the Opposite)
        </h2>
        <div className="space-y-3">
          {tool.criticalSuccessFactors.map((csf, index) => (
            <input
              key={csf.id}
              type="text"
              value={csf.text}
              onChange={(e) => onUpdateCSF(index, e.target.value)}
              disabled={!canEdit}
              placeholder={`CSF ${index + 1}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Projects / Lines of Effort
          </h2>
          {canEdit && (
            <button
              onClick={onAddProject}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded text-sm transition"
            >
              + Add Project
            </button>
          )}
        </div>

        {tool.projects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No projects added yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Project
                  </th>
                  {tool.criticalSuccessFactors.map((csf, idx) => (
                    <th
                      key={idx}
                      className="text-center py-3 px-2 font-semibold text-gray-700 bg-gray-50 text-xs"
                    >
                      {csf.text.substring(0, 15)}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Strategic Importance
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Progress
                  </th>
                  {canEdit && (
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {tool.projects.map((project) => {
                  const totalScore = project.scores.reduce((a, b) => a + b, 0);
                  const maxScore = project.scores.length * 2;
                  const progressPercent = (totalScore / maxScore) * 100;

                  return (
                    <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={project.name}
                          onChange={(e) =>
                            onUpdateProject(project.id, 'name', e.target.value)
                          }
                          disabled={!canEdit}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-transparent disabled:border-transparent disabled:text-gray-800"
                        />
                      </td>
                      {project.scores.map((score, scoreIdx) => (
                        <td key={scoreIdx} className="text-center py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            max="2"
                            value={score}
                            onChange={(e) =>
                              onUpdateProjectScore(
                                project.id,
                                scoreIdx,
                                e.target.value
                              )
                            }
                            disabled={!canEdit}
                            className="w-12 h-8 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                          />
                        </td>
                      ))}
                      <td className="text-center py-3 px-4 font-semibold text-gray-800">
                        {totalScore}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      {canEdit && (
                        <td className="text-center py-3 px-4">
                          <button
                            onClick={() => onDeleteProject(project.id)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
