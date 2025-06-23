import React, { useState, useEffect, useCallback } from 'react';
import { getMyTimeline, postMurmur, likeMurmur, unlikeMurmur } from '../services/api';
import MurmurList from '../components/MurmurList';
import PostMurmurForm from '../components/PostMurmurForm';
import { Murmur } from '../components/MurmurCard';
import { useAuth } from '../contexts/AuthContext';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Card } from 'primereact/card';

const ITEMS_PER_PAGE = 10;

const TimelinePage: React.FC = () => {
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  
  // Paginator state: first is the index of the first item
  const [first, setFirst] = useState(0);
  // Current page (1-indexed) for data fetching
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [likedMurmurs, setLikedMurmurs] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuth();

  const fetchTimeline = useCallback(async (pageToFetch: number) => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTimeline(currentPage);
  }, [fetchTimeline, currentPage]);

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
    // ... (optimistic update logic remains the same)
    const isLiked = likedMurmurs.has(murmurId);
    const originalMurmurs = [...murmurs];
    const originalLikedMurmurs = new Set(likedMurmurs);

    setLikedMurmurs(prev => {
      const newSet = new Set(prev);
      if (isLiked) newSet.delete(murmurId); else newSet.add(murmurId);
      return newSet;
    });
    setMurmurs(prevMurmurs => prevMurmurs.map(m => 
      m.id === murmurId 
        ? { ...m, likeCount: (m.likeCount || 0) + (isLiked ? -1 : 1) } 
        : m
    ));

    try {
      if (isLiked) await unlikeMurmur(murmurId); else await likeMurmur(murmurId);
    } catch (err) {
      console.error('Failed to like/unlike murmur:', err);
      setMurmurs(originalMurmurs);
      setLikedMurmurs(originalLikedMurmurs);
      // Consider showing a toast message for like/unlike errors
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
      <Card title="My Timeline" className="mb-4">
        <PostMurmurForm onSubmit={handlePostMurmur} submitError={postError} isLoading={isPosting} />
      </Card>

      {isLoading && !murmurs.length ? ( // Show spinner only if no murmurs are displayed yet
        <div className="flex justify-content-center p-4">
          <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" />
        </div>
      ) : error ? (
        <Message severity="error" text={error} className="mb-3 w-full" />
      ) : (
        <>
          <MurmurList
            murmurs={murmurs}
            // isLoading prop for MurmurList might be redundant if page handles main loading state
            // error prop for MurmurList might also be redundant
            onLikeMurmur={handleLikeMurmur}
            likedMurmurs={likedMurmurs}
          />
          {totalRecords > ITEMS_PER_PAGE && (
            <Paginator
              first={first}
              rows={ITEMS_PER_PAGE}
              totalRecords={totalRecords}
              onPageChange={onPageChange}
              className="mt-4"
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              rowsPerPageOptions={[10, 20, 30]} // Optional: if you want to allow changing items per page
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
