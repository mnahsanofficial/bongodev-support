import React, { useState, useEffect, useCallback } from 'react';
import { getMyTimeline, postMurmur, likeMurmur, unlikeMurmur } from '../services/api';
import MurmurList from '../components/MurmurList';
import PostMurmurForm from '../components/PostMurmurForm';
import { Murmur } from '../components/MurmurCard'; // Assuming Murmur type is exported from MurmurCard
import { useAuth } from '../contexts/AuthContext'; // To ensure user is authenticated

const ITEMS_PER_PAGE = 10;

const TimelinePage: React.FC = () => {
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [likedMurmurs, setLikedMurmurs] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuth();

  const fetchTimeline = useCallback(async (currentPage: number) => {
    if (!isAuthenticated) return; // Don't fetch if not authenticated

    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyTimeline(currentPage, ITEMS_PER_PAGE);
      // Adjust based on actual API response structure for murmurs and total
      // Assuming response.data is { murmurs: Murmur[], total: number } or { items: Murmur[], totalPages: number }
      // For this example, let's assume: response.data = { murmurs: Murmur[], totalPages: number }
      // If your API returns total items and items per page, calculate totalPages: Math.ceil(totalItems / itemsPerPage)
      
      // The backend returns: { murmurs: Murmur[]; total: number }
      // The `total` is total number of murmurs, not total pages.
      const fetchedMurmurs = response.data.murmurs || [];
      const totalItems = response.data.total || 0;
      
      setMurmurs(fetchedMurmurs);
      setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch timeline.');
      setMurmurs([]); // Clear murmurs on error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTimeline(page);
  }, [fetchTimeline, page]);

  const handlePostMurmur = async (text: string) => {
    setPostError(null);
    try {
      await postMurmur(text);
      // Refresh timeline to show the new murmur
      // Ideally, the API would return the new murmur and we could prepend it
      // For simplicity, refetching page 1 or current page if on page 1
      if (page === 1) {
        fetchTimeline(1);
      } else {
        setPage(1); // Go to first page to see new murmur
      }
    } catch (err: any) {
      setPostError(err.response?.data?.message || 'Failed to post murmur.');
      throw err; // Re-throw to let PostMurmurForm handle its own error state if needed
    }
  };

  const handleLikeMurmur = async (murmurId: number) => {
    const isLiked = likedMurmurs.has(murmurId);
    const originalMurmurs = [...murmurs];
    const originalLikedMurmurs = new Set(likedMurmurs);

    // Optimistic UI update
    setLikedMurmurs(prev => {
      const newSet = new Set(prev);
      if (isLiked) newSet.delete(murmurId);
      else newSet.add(murmurId);
      return newSet;
    });
    setMurmurs(prevMurmurs => prevMurmurs.map(m => 
      m.id === murmurId 
        ? { ...m, likeCount: (m.likeCount || 0) + (isLiked ? -1 : 1) } 
        : m
    ));

    try {
      if (isLiked) {
        await unlikeMurmur(murmurId);
      } else {
        await likeMurmur(murmurId);
      }
      // If API call is successful, local state is already updated.
      // Optionally, refetch the specific murmur for updated likeCount from server
      // or trust the optimistic update.
    } catch (err) {
      console.error('Failed to like/unlike murmur:', err);
      // Revert UI on error
      setMurmurs(originalMurmurs);
      setLikedMurmurs(originalLikedMurmurs);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div>
      <h3>My Timeline</h3>
      <PostMurmurForm onSubmit={handlePostMurmur} submitError={postError} />
      <MurmurList
        murmurs={murmurs}
        isLoading={isLoading}
        error={error}
        onLikeMurmur={handleLikeMurmur}
        likedMurmurs={likedMurmurs}
      />
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button onClick={() => setPage(p => p - 1)} disabled={page <= 1 || isLoading}>
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages || isLoading}>
          Next
        </button>
      </div>
    </div>
  );
};

export default TimelinePage;
