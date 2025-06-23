import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMurmurById, likeMurmur, unlikeMurmur, deleteMurmur } from '../services/api'; // Added deleteMurmur
import { Murmur } from '../components/MurmurCard';
import { useAuth } from '../contexts/AuthContext'; // Added useAuth
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast'; // Already added, but ensure it's here
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'; // For delete confirmation

const MurmurDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();
  const toast = useRef<Toast>(null); 
  const [murmur, setMurmur] = useState<Murmur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // isLiked state is now derived from murmur.isLiked after fetch
  // const [isLiked, setIsLiked] = useState(false); // This local state might not be needed if murmur object has isLiked

  const fetchMurmur = useCallback(async (murmurId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Pass loggedInUser.id to getMurmurById so backend can populate 'isLiked'
      const response = await getMurmurById(murmurId, loggedInUser?.id); 
      setMurmur(response.data);
      // setIsLiked(response.data.isLiked || false); // Set local isLiked from fetched murmur data
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to fetch murmur with ID ${murmurId}.`);
      setMurmur(null);
    } finally {
      setIsLoading(false);
    }
  }, [loggedInUser]); // Add loggedInUser as dependency

  useEffect(() => {
    if (id) {
      fetchMurmur(parseInt(id, 10));
    } else {
      setError("No murmur ID provided.");
      setIsLoading(false);
    }
  }, [id, fetchMurmur]);

  const handleLikeMurmur = async () => {
    if (!murmur || !loggedInUser) { // Ensure user is logged in to like
      toast.current?.show({ severity: 'warn', summary: 'Authentication Required', detail: 'Please log in to like murmurs.', life: 3000 });
      return;
    }

    const originalMurmurData = { ...murmur }; // Shallow copy is fine as we replace the whole object in state
    
    const newIsLiked = !murmur.isLiked;
    const newLikeCount = (murmur.likeCount || 0) + (newIsLiked ? 1 : -1);

    // Optimistic UI update
    setMurmur(prevMurmur => 
      prevMurmur 
        ? { ...prevMurmur, isLiked: newIsLiked, likeCount: newLikeCount } 
        : null
    );

    try {
      if (originalMurmurData.isLiked) { 
        await unlikeMurmur(murmur.id);
      } else {
        await likeMurmur(murmur.id);
      }
      // Optionally, refetch the murmur to ensure full consistency, though optimistic update is often enough.
      // fetchMurmur(murmur.id); 
    } catch (err) {
      console.error('Failed to like/unlike murmur:', err);
      setMurmur(originalMurmurData); // Revert optimistic update
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update like status. Please try again.', life: 3000 });
    }
  };

  const confirmDeleteDetailedMurmur = () => {
    if (!murmur) return;
    confirmDialog({
      message: 'Are you sure you want to delete this murmur?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => handleDeleteDetailedMurmur(murmur.id),
    });
  };

  const handleDeleteDetailedMurmur = async (murmurId: number) => {
    try {
      await deleteMurmur(murmurId);
      toast.current?.show({severity: 'success', summary: 'Deleted', detail: 'Murmur deleted successfully.', life: 3000});
      navigate('/'); // Navigate to timeline after deletion
    } catch (err: any) {
      console.error('Failed to delete murmur:', err);
      toast.current?.show({severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to delete murmur.', life: 3000});
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

  const isOwnMurmur = loggedInUser?.id === murmur.userId;
  const formattedTimestamp = new Date(murmur.createdAt).toLocaleString();

  const cardFooter = (
    <div className="flex justify-content-between align-items-center pt-3">
      <Button 
        label={murmur?.isLiked ? 'Unlike' : 'Like'} 
        icon={murmur?.isLiked ? 'pi pi-thumbs-down' : 'pi pi-thumbs-up'} 
        className={`p-button-sm ${murmur?.isLiked ? 'p-button-outlined p-button-danger' : 'p-button-outlined'}`}
        onClick={handleLikeMurmur}
        disabled={!loggedInUser} // Disable like button if not logged in
      />
      <Tag value={`Likes: ${murmur.likeCount !== undefined ? murmur.likeCount : 0}`} severity="info"></Tag>
    </div>
  );
  
  const cardHeaderActions = (
    <div className="flex gap-2">
      {isOwnMurmur && (
        <Button 
          icon="pi pi-trash" 
          className="p-button-text p-button-danger p-button-sm" 
          onClick={confirmDeleteDetailedMurmur} 
          tooltip="Delete Murmur" 
          tooltipOptions={{ position: 'top' }}
        />
      )}
      <Button icon="pi pi-arrow-left" label="Back" onClick={() => navigate(-1)} className="p-button-text p-button-sm" />
    </div>
  );

  const cardTitle = (
    <div className="flex justify-content-between align-items-center">
      <span>Murmur Details</span>
      {cardHeaderActions}
    </div>
  );


  return (
    <div className="p-m-2 p-lg-4">
      <Toast ref={toast} />
      <ConfirmDialog />
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
