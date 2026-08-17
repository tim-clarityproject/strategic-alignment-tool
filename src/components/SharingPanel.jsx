import React, { useState } from 'react';
import { updateDoc, doc, Timestamp, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Trash2, Copy, Check } from 'lucide-react';

export default function SharingPanel({ tool, onToolUpdate, canEdit }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!email.trim() || !canEdit) return;

    setAdding(true);
    try {
      const newPermission = {
        email: email.toLowerCase(),
        role,
        addedAt: Timestamp.now()
      };

      const updatedPermissions = [
        ...(tool.permissions || []),
        newPermission
      ];

      await updateDoc(doc(db, 'tools', tool.id), {
        permissions: updatedPermissions
      });

      onToolUpdate({
        ...tool,
        permissions: updatedPermissions
      });

      setEmail('');
      setRole('editor');
      alert(`User invited with ${role} access`);
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveUser = async (emailToRemove) => {
    if (!canEdit) return;
    if (!window.confirm('Remove this user?')) return;

    try {
      const updatedPermissions = (tool.permissions || []).filter(
        p => p.email !== emailToRemove
      );

      await updateDoc(doc(db, 'tools', tool.id), {
        permissions: updatedPermissions
      });

      onToolUpdate({
        ...tool,
        permissions: updatedPermissions
      });
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Failed to remove user');
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/tool/${tool.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('Failed to copy link');
    }
  };

  return (
    <div className="space-y-8">
      {/* Copy Link */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Share Tool
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Share this link with others to give them access:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={`${window.location.origin}/tool/${tool.id}`}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Add User */}
      {canEdit && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Invite User
          </h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="viewer">Viewer (read-only)</option>
                <option value="editor">Editor (can edit)</option>
              </select>
              <button
                type="submit"
                disabled={adding}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
              >
                {adding ? 'Adding...' : 'Invite'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Permissions List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          People with Access ({tool.permissions?.length || 0})
        </h2>
        <div className="space-y-3">
          {(tool.permissions || []).map((permission) => (
            <div
              key={permission.email}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">{permission.email}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {permission.role}
                  {permission.role === 'owner' && ' (owner)'}
                </p>
              </div>
              {canEdit && permission.role !== 'owner' && (
                <button
                  onClick={() => handleRemoveUser(permission.email)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
