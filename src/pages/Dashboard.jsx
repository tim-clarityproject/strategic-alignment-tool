import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Plus, LogOut, Trash2, Share2, Eye } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewToolForm, setShowNewToolForm] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTools();
  }, [user]);

  const fetchTools = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get tools owned by user
      const q = query(
        collection(db, 'tools'),
        where('ownerId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const toolsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTools(toolsList.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTool = async (e) => {
    e.preventDefault();
    if (!newToolName.trim()) return;

    setCreating(true);
    try {
      const toolData = {
        name: newToolName,
        ownerId: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName || 'Unknown',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        objective: '',
        criticalSuccessFactors: [
          { id: 1, text: '' },
          { id: 2, text: '' },
          { id: 3, text: '' },
          { id: 4, text: '' },
          { id: 5, text: '' },
          { id: 6, text: '' }
        ],
        projects: [],
        permissions: [
          {
            userId: user.uid,
            email: user.email,
            role: 'owner',
            addedAt: Timestamp.now()
          }
        ],
        versions: []
      };

      const docRef = await addDoc(collection(db, 'tools'), toolData);
      setTools([{ id: docRef.id, ...toolData }, ...tools]);
      setNewToolName('');
      setShowNewToolForm(false);
      navigate(`/tool/${docRef.id}`);
    } catch (error) {
      console.error('Error creating tool:', error);
      alert('Failed to create tool');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTool = async (toolId) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) return;

    try {
      await deleteDoc(doc(db, 'tools', toolId));
      setTools(tools.filter(t => t.id !== toolId));
    } catch (error) {
      console.error('Error deleting tool:', error);
      alert('Failed to delete tool');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Strategic Alignment Tool
            </h1>
            <p className="text-gray-600 text-sm">
              Welcome, {user?.displayName || user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create New Tool Section */}
        {!showNewToolForm ? (
          <button
            onClick={() => setShowNewToolForm(true)}
            className="mb-8 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <Plus size={20} />
            Create New Tool
          </button>
        ) : (
          <form
            onSubmit={handleCreateTool}
            className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Create New Tool
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                placeholder="Tool name (e.g., Q4 Strategy)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                required
              />
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewToolForm(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Tools List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Your Tools
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">
                You haven't created any tools yet
              </p>
              <button
                onClick={() => setShowNewToolForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                <Plus size={18} />
                Create First Tool
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/tool/${tool.id}`)}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Created{' '}
                    {tool.createdAt?.toDate?.().toLocaleDateString() ||
                      'recently'}
                  </p>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                    <Eye size={16} />
                    <span>
                      {tool.permissions?.length || 1} people have access
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tool/${tool.id}?tab=sharing`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded text-sm transition"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTool(tool.id);
                      }}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded text-sm transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
