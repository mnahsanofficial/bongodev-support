import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getMyTimeline, createPost, likePost, unlikePost, deletePost } from '../services/api';
import PostList from '../components/PostList';
import CreatePostForm from '../components/CreatePostForm';
import { Post } from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const ITEMS_PER_PAGE = 10;

const TimelinePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  
  const [first, setFirst] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const { isAuthenticated, user: loggedInUser } = useAuth(); 
  const toast = useRef<Toast>(null);

  const fetchTimeline = useCallback(async (pageToFetch: number) => {
    if (!isAuthenticated || !loggedInUser) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyTimeline(pageToFetch, ITEMS_PER_PAGE);
      const fetchedPosts = response.data.posts || [];
      const totalItems = response.data.total || 0;
      
      setPosts(fetchedPosts);
      setTotalRecords(totalItems);
      if ((pageToFetch - 1) * ITEMS_PER_PAGE >= totalItems && totalItems > 0) {
        const newLastPage = Math.ceil(totalItems / ITEMS_PER_PAGE);
        setCurrentPage(newLastPage);
        setFirst((newLastPage - 1) * ITEMS_PER_PAGE);
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch timeline.');
      setPosts([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, loggedInUser]);

  useEffect(() => {
    fetchTimeline(currentPage);
  }, [fetchTimeline, currentPage]);

  const confirmDeletePostFromTimeline = (postId: number) => {
    confirmDialog({
      message: 'Are you sure you want to delete this post?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => handleDeletePostFromTimeline(postId),
    });
  };

  const handleDeletePostFromTimeline = async (postId: number) => {
    const originalPosts = [...posts];
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    try {
      await deletePost(postId);
      toast.current?.show({severity: 'success', summary: 'Deleted', detail: 'Post deleted successfully.', life: 3000});
      const currentTotalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
      const newTotalRecords = totalRecords -1;
      const newTotalPages = Math.ceil(newTotalRecords / ITEMS_PER_PAGE);

      if(posts.length === 1 && currentPage > 1 && currentPage === currentTotalPages && newTotalPages < currentTotalPages) {
        setCurrentPage(prev => prev -1);
      } else {
         fetchTimeline(currentPage);
      }

    } catch (err: any) {
      console.error('Failed to delete post from timeline:', err);
      setPosts(originalPosts);
      toast.current?.show({severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to delete post.', life: 3000});
    }
  };

  const handleCreatePost = async (text: string) => {
    setPostError(null);
    setIsPosting(true);
    try {
      await createPost(text);
      if (currentPage === 1) {
        fetchTimeline(1);
      } else {
        setCurrentPage(1);
        setFirst(0);
      }
    } catch (err: any) {
      setPostError(err.response?.data?.message || 'Failed to post.');
      throw err; 
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    const originalPosts = posts.map(p => ({ ...p }));
    let postToUpdate = posts.find(p => p.id === postId);

    if (!postToUpdate) return;

    const currentIsLiked = postToUpdate.isLiked;
    const newIsLiked = !currentIsLiked;
    const newLikeCount = (postToUpdate.likeCount || 0) + (newIsLiked ? 1 : -1);

    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? { ...p, isLiked: newIsLiked, likeCount: newLikeCount }
          : p
      )
    );

    try {
      if (currentIsLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (err) {
      console.error('Failed to like/unlike post from timeline:', err);
      setPosts(originalPosts);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update like status.', life: 3000 });
    }
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFirst(event.first);
    setCurrentPage(event.page + 1);
  };

  if (!isAuthenticated && !isLoading) {
    return <Message severity="warn" text="Please log in to view your timeline." />;
  }
  
  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Card title="What's happening?" className="mb-4 shadow-md">
        <CreatePostForm onSubmit={handleCreatePost} submitError={postError} isLoading={isPosting} />
      </Card>

      {isLoading && !posts.length ? (
        <div className="flex justify-content-center p-4">
          <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" />
        </div>
      ) : error ? (
        <Message severity="error" text={error} className="mb-3 w-full" />
      ) : (
        <>
          <PostList
            posts={posts}
            onLikePost={handleLikePost}
            onDelete={loggedInUser ? confirmDeletePostFromTimeline : undefined}
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
          {!isLoading && !error && posts.length === 0 && (
             <Message severity="info" text="No posts in your timeline yet. Follow some users or post your own!" className="mt-4"/>
          )}
        </>
      )}
    </div>
  );
};

export default TimelinePage;
