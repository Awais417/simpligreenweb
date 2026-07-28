import type { QaReview } from '../../lib/types';
import { formatDateTime } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function QaReviewsList({ reviews }: { reviews: QaReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">QA Review History</h3>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-4 border border-gray-100 rounded-xl px-4 py-3">
            <div>
              <Badge tone={r.decision === 'approved' ? 'green' : 'red'}>
                {r.decision === 'approved' ? 'Approved' : 'Rejected'}
              </Badge>
              {r.comments && <p className="text-sm text-gray-600 mt-2">{r.comments}</p>}
            </div>
            <p className="text-xs text-gray-400 whitespace-nowrap">{formatDateTime(r.createdAt)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
