import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { getMyTimeline, postMurmur, likeMurmur, unlikeMurmur, deleteMurmur } from '../services/api'; // Added deleteMurmur
import MurmurList from '../components/MurmurList';
import PostMurmurForm from '../components/PostMurmurForm';
import { Murmur } from '../components/MurmurCard';
import { useAuth } from '../contexts/AuthContext';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast'; // Added Toast
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'; // Added ConfirmDialog

const ITEMS_PER_PAGE = 10;

const TimelinePage: React.FC = () => {
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  
  const [first, setFirst] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // const [likedMurmurs, setLikedMurmurs] = useState<Set<number>>(new Set()); // Removed
  const { isAuthenticated, user: loggedInUser } = useAuth(); 
  const toast = useRef<Toast>(null);

  const fetchTimeline = useCallback(async (pageToFetch: number) => {
    if (!isAuthenticated || !loggedInUser) return; // Ensure loggedInUser is available for potential ID checks

    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyTimeline(pageToFetch, ITEMS_PER_PAGE);
      const fetchedMurmurs = response.data.murmurs || [];
      const totalItems = response.data.total || 0;
      
      setMurmurs(fetchedMurmurs);
      setTotalRecords(totalItems);
      // Ensure 'first' is updated if current page is beyond new totalRecords
      if ((pageToFetch - 1) * ITEMS_PER_PAGE >= totalItems && totalItems > 0) {
        const newLastPage = Math.ceil(totalItems / ITEMS_PER_PAGE);
        setCurrentPage(newLastPage);
        setFirst((newLastPage - 1) * ITEMS_PER_PAGE);
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch timeline.');
      setMurmurs([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, loggedInUser]); // Added loggedInUser dependency

  useEffect(() => {
    fetchTimeline(currentPage);
  }, [fetchTimeline, currentPage]);

  const confirmDeleteMurmurFromTimeline = (murmurId: number) => {
    confirmDialog({
      message: 'Are you sure you want to delete this murmur?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => handleDeleteMurmurFromTimeline(murmurId),
    });
  };

  const handleDeleteMurmurFromTimeline = async (murmurId: number) => {
    const originalMurmurs = [...murmurs];
    setMurmurs(prevMurmurs => prevMurmurs.filter(m => m.id !== murmurId)); // Optimistic delete
    try {
      await deleteMurmur(murmurId);
      toast.current?.show({severity: 'success', summary: 'Deleted', detail: 'Murmur deleted successfully.', life: 3000});
      // Refetch to ensure data consistency, especially if total items change or if on last page and it becomes empty
      const currentTotalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
      const newTotalRecords = totalRecords -1;
      const newTotalPages = Math.ceil(newTotalRecords / ITEMS_PER_PAGE);

      if(murmurs.length === 1 && currentPage > 1 && currentPage === currentTotalPages && newTotalPages < currentTotalPages) {
        // If it was the last item on the last page (and not page 1), go to previous page
        setCurrentPage(prev => prev -1);
      } else {
         fetchTimeline(currentPage); // Refetch current page
      }

    } catch (err: any) {
      console.error('Failed to delete murmur from timeline:', err);
      setMurmurs(originalMurmurs); // Revert
      toast.current?.show({severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to delete murmur.', life: 3000});
    }
  };

  const handlePostMurmur = async (text: string) => {
    setPostError(null);
    setIsPosting(true);
    try {
      await postMurmur(text);
      // Refresh timeline to show the new murmur
      if (currentPage === 1) {
        fetchTimeline(1); // Refetch current page if on page 1
      } else {
        setCurrentPage(1); // Go to first page
        setFirst(0);       // Reset paginator to first page
      }
    } catch (err: any) {
      setPostError(err.response?.data?.message || 'Failed to post murmur.');
      throw err; 
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikeMurmur = async (murmurId: number) => {
    const originalMurmurs = murmurs.map(m => ({ ...m })); // Deep copy for potential revert
    let murmurToUpdate = murmurs.find(m => m.id === murmurId);

    if (!murmurToUpdate) return;

    const currentIsLiked = murmurToUpdate.isLiked;
    const newIsLiked = !currentIsLiked;
    const newLikeCount = (murmurToUpdate.likeCount || 0) + (newIsLiked ? 1 : -1);

    // Optimistic UI update
    setMurmurs(prevMurmurs =>
      prevMurmurs.map(m =>
        m.id === murmurId
          ? { ...m, isLiked: newIsLiked, likeCount: newLikeCount }
          : m
      )
    );

    try {
      if (currentIsLiked) {
        await unlikeMurmur(murmurId);
      } else {
        await likeMurmur(murmurId);
      }
      // Optional: refetch timeline to ensure data consistency, especially if isLiked was critical for sorting/filtering.
      // For now, optimistic update is deemed sufficient.
      // fetchTimeline(currentPage);
    } catch (err) {
      console.error('Failed to like/unlike murmur from timeline:', err);
      // Revert optimistic update on error
      setMurmurs(originalMurmurs);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update like status.', life: 3000 });
    }
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFirst(event.first);
    setCurrentPage(event.page + 1); // event.page is 0-indexed
  };

  if (!isAuthenticated && !isLoading) { // Check isLoading to avoid flash of this message
    return <Message severity="warn" text="Please log in to view your timeline." />;
  }
  
  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Card title="What's happening?" className="mb-4 shadow-md">
        <PostMurmurForm onSubmit={handlePostMurmur} submitError={postError} isLoading={isPosting} />
      </Card>

      {isLoading && !murmurs.length ? ( 
        <div className="flex justify-content-center p-4">
          <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" />
        </div>
      ) : error ? (
        <Message severity="error" text={error} className="mb-3 w-full" />
      ) : (
        <>
          <MurmurList
            murmurs={murmurs}
            onLikeMurmur={handleLikeMurmur}
            // likedMurmurs={likedMurmurs} // Removed, isLiked comes from murmur object
            onDelete={loggedInUser ? confirmDeleteMurmurFromTimeline : undefined}
            loggedInUserId={loggedInUser?.id}
          />
          {totalRecords > ITEMS_PER_PAGE && (
            <Paginator
              first={first}
              rows={ITEMS_PER_PAGE}
              totalRecords={totalRecords}
              onPageChange={onPageChange}
              className="mt-4"
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              rowsPerPageOptions={[10, 20, 30]} 
            />
          )}
          {!isLoading && !error && murmurs.length === 0 && (
             <Message severity="info" text="No murmurs in your timeline yet. Follow some users or post your own!" className="mt-4"/>
          )}
        </>
      )}
    </div>
  );
};

export default TimelinePage;
