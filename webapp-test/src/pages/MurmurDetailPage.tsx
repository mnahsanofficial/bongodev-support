import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMurmurById, likeMurmur, unlikeMurmur } from '../services/api';
import { Murmur } from '../components/MurmurCard';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';

const MurmurDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [murmur, setMurmur] = useState<Murmur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false); // Local like state for this detail view

  const fetchMurmur = useCallback(async (murmurId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMurmurById(murmurId);
      setMurmur(response.data);
      // Note: We don't have global liked state here, so `isLiked` might not reflect actual global state.
      // This page's like button will work independently based on its local `isLiked` state.
      // For a more robust solution, liked state should be managed globally or passed down.
      setIsLiked(false); // Default to not liked when loading, or fetch user's like status for this murmur
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

    const originalMurmurData = { ...murmur };
    const originalIsLiked = isLiked;

    setIsLiked(!isLiked);
    setMurmur(prevMurmur => prevMurmur ? { ...prevMurmur, likeCount: (prevMurmur.likeCount || 0) + (isLiked ? -1 : 1) } : null);

    try {
      if (originalIsLiked) { // Use originalIsLiked for API call decision
        await unlikeMurmur(murmur.id);
      } else {
        await likeMurmur(murmur.id);
      }
    } catch (err) {
      console.error('Failed to like/unlike murmur:', err);
      setMurmur(originalMurmurData);
      setIsLiked(originalIsLiked);
      // Show toast or message for error
      setError('Failed to update like status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return <Message severity="error" text={error} className="m-4" />;
  }

  if (!murmur) {
    return <Message severity="warn" text="Murmur not found." className="m-4" />;
  }

  const formattedTimestamp = new Date(murmur.createdAt).toLocaleString();

  const cardFooter = (
    <div className="flex justify-content-between align-items-center pt-3">
      <Button 
        label={isLiked ? 'Unlike' : 'Like'} 
        icon={isLiked ? 'pi pi-thumbs-down' : 'pi pi-thumbs-up'} 
        className={`p-button-sm ${isLiked ? 'p-button-outlined p-button-danger' : 'p-button-outlined'}`}
        onClick={handleLikeMurmur} 
      />
      <Tag value={`Likes: ${murmur.likeCount !== undefined ? murmur.likeCount : 0}`} severity="info"></Tag>
    </div>
  );
  
  const cardTitle = (
    <div className="flex justify-content-between align-items-center">
      <span>Murmur Details</span>
      <Button icon="pi pi-arrow-left" label="Back to Timeline" onClick={() => navigate('/')} className="p-button-text p-button-sm" />
    </div>
  );

  return (
    <div className="p-m-2 p-lg-4">
      <Card title={cardTitle} footer={cardFooter} className="shadow-md">
        <p className="text-xl m-0 mb-3">{murmur.text}</p>
        <div className="text-sm text-gray-600">
          Posted by: {murmur.user ? (
            <Link to={`/users/${murmur.user.id}`} className="font-semibold text-primary hover:underline">
              {murmur.user.name}
            </Link>
          ) : (
            'Unknown User'
          )}
          {' on '}
          {formattedTimestamp}
        </div>
      </Card>
    </div>
  );
};

export default MurmurDetailPage;
