import React, { useState } from 'react';
import { RideHistoryItem } from '../types/ride';
import { Star, X, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
  trip: RideHistoryItem | null;
  onClose: () => void;
  onSubmitFeedback: (tripId: string, rating: number, feedback: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  trip,
  onClose,
  onSubmitFeedback,
}) => {
  if (!trip) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual pickup', 'Smooth ride']);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const tags = [
    'Punctual pickup',
    'Smooth ride',
    'Clean vehicle',
    'Accurate fare',
    'Friendly driver',
    'Great route chosen',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalComment = [
      selectedTags.join(', '),
      comment.trim(),
    ]
      .filter(Boolean)
      .join(' — ');

    onSubmitFeedback(trip.id, rating, finalComment);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Rate Your {trip.providerName} Ride</h3>
            <p className="text-xs text-slate-500">Driver: {trip.driverName} · {trip.licensePlate}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-base">Thank you for your feedback!</h4>
            <p className="text-xs text-slate-500">Your review helps keep Singapore ride-hailing transparent and accurate.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 text-xs space-y-4">
            {/* Star Rating */}
            <div className="text-center py-2">
              <p className="text-slate-600 mb-2 font-medium">How was your trip experience?</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tag Pill-Buttons (Interactive Controls) */}
            <div>
              <p className="text-slate-600 mb-2 font-medium">What went well?</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text comments */}
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Additional comments (optional)</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share any details about fare accuracy or driver service..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
