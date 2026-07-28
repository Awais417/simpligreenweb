'use client';

import { mediaUrl } from '../../lib/api';
import type { TaskMedia } from '../../lib/types';

export function MediaGallery({
  media,
  onDelete,
}: {
  media: TaskMedia[];
  onDelete?: (media: TaskMedia) => void;
}) {
  if (media.length === 0) {
    return <p className="text-xs text-gray-400 italic">No files uploaded yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {media.map((m) => {
        const url = mediaUrl(m.filePath);
        const isImage = m.fileType === 'image';
        return (
          <div key={m.id} className="relative group w-24">
            <a href={url} target="_blank" rel="noopener noreferrer" className="block">
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt="Task upload"
                  className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-[10px] text-gray-500 font-medium">Certificate</span>
                </div>
              )}
            </a>
            {onDelete && (
              <button
                onClick={() => onDelete(m)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200
                  shadow-sm flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200
                  cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete file"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
