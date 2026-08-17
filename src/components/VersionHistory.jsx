import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function VersionHistory({ tool, onRestore }) {
  const versions = tool.versions || [];

  if (versions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600">No version history yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Version History ({versions.length})
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Click "Restore" to revert to a previous version
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {versions.map((version, idx) => {
          const timestamp = version.timestamp?.toDate
            ? version.timestamp.toDate()
            : new Date(version.timestamp);

          return (
            <div key={idx} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">
                      {version.userName}
                    </p>
                    <span className="text-sm text-gray-600">
                      {timestamp.toLocaleString()}
                    </span>
                  </div>

                  {/* Version Preview */}
                  <div className="mt-3 text-sm text-gray-600 space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">
                        Objective:
                      </span>{' '}
                      {version.data?.objective?.substring(0, 100) ||
                        '(not set)'}
                      {version.data?.objective?.length > 100 ? '...' : ''}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Projects:
                      </span>{' '}
                      {version.data?.projects?.length || 0} projects
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRestore(version.data)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2 flex-shrink-0"
                >
                  <RotateCcw size={16} />
                  Restore
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
