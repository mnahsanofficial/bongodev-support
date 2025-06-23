import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMurmurById, likeMurmur, unlikeMurmur } from '../services/api';
import { Murmur } from '../components/MurmurCard'; // Assuming Murmur type is exported

const MurmurDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [murmur, setMurmur] = useState<Murmur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // isLiked will be managed locally, not pre-filled accurately on load for now
  const [isLiked, setIsLiked] = useState(false); 

  const fetchMurmur = useCallback(async (murmurId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMurmurById(murmurId);
      setMurmur(response.data);
      // Reset isLiked to false on new murmur load, as we don't have prior like status
      setIsLiked(false); 
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to fetch murmur with ID ${murmurId}.`);
      setMurmur(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchMurmur(parseInt(id, 10));
    } else {
      setError("No murmur ID provided.");
      setIsLoading(false);
    }
  }, [id, fetchMurmur]);

  const handleLikeMurmur = async () => {
    if (!murmur) return;

    const originalMurmur = { ...murmur };
    const originalIsLiked = isLiked;

    // Optimistic UI update
    setIsLiked(!isLiked);
    setMurmur(prevMurmur => prevMurmur ? { ...prevMurmur, likeCount: (prevMurmur.likeCount || 0) + (isLiked ? -1 : 1) } : null);

    try {
      if (isLiked) {
        await unlikeMurmur(murmur.id);
      } else {
        await likeMurmur(murmur.id);
      }
      // API call successful, local state is already updated.
    } catch (err) {
      console.error('Failed to like/unlike murmur:', err);
      // Revert UI on error
      setMurmur(originalMurmur);
      setIsLiked(originalIsLiked);
      // Optionally, show an error message
    }
  };

  if (isLoading) {
    return <p>Loading murmur details...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!murmur) {
    return <p>Murmur not found.</p>;
  }

  const formattedTimestamp = new Date(murmur.createdAt).toLocaleString();

  return (
    <div>
      <Link to="/">Back to Timeline</Link>
      <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '20px', borderRadius: '5px' }}>
        <h2>Murmur Details</h2>
        <p style={{ fontSize: '1.2em', margin: '10px 0' }}>{murmur.text}</p>
        <small>
          Posted by: {murmur.user ? <Link to={`/users/${murmur.user.id}`}>{murmur.user.name}</Link> : 'Unknown User'}
          {' on '}
          {formattedTimestamp}
        </small>
        <div style={{ marginTop: '15px' }}>
          <span>Likes: {murmur.likeCount !== undefined ? murmur.likeCount : 0}</span>
          <button onClick={handleLikeMurmur} style={{ marginLeft: '10px' }}>
            {isLiked ? 'Unlike' : 'Like'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MurmurDetailPage;
