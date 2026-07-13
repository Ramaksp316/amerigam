'use client';

export default function ShareButton({ url }: { url: string }) {
  const handleShare = async () => {
    try {
      const fullUrl = window.location.origin + url;
      await navigator.clipboard.writeText(fullUrl);
      alert('Media link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link.');
    }
  };

  return (
    <button type="button" onClick={handleShare} className="btn-text">
      Copy Media Link
    </button>
  );
}
