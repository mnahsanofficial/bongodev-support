import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostById, likePost, unlikePost, deletePost, getCommentsByPostId, createComment } from '../services/api';
import { Post } from '../components/PostCard';
import { Comment } from '../components/CommentCard';
import CommentList from '../components/CommentList';
import CreateCommentForm from '../components/CreateCommentForm';
import { useAuth } from '../contexts/AuthContext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import DOMPurify from 'dompurify';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();
  const toast = useRef<Toast>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const fetchPostAndComments = useCallback(async (postId: number) => {
    setIsLoading(true);
    setIsLoadingComments(true);
    setError(null);
    setCommentError(null);
    try {
      const postResponse = await getPostById(postId, loggedInUser?.id);
      setPost(postResponse.data);
      const commentsResponse = await getCommentsByPostId(postId);
      setComments(commentsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to fetch post with ID ${postId}.`);
      setPost(null);
    } finally {
      setIsLoading(false);
      setIsLoadingComments(false);
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (id) {
      fetchPostAndComments(parseInt(id, 10));
    } else {
      setError("No post ID provided.");
      setIsLoading(false);
    }
  }, [id, fetchPostAndComments]);

  const handleCommentSubmit = async (text: string, parentId?: number) => {
    if (!id) return;
    try {
      await createComment({ text, postId: parseInt(id, 10), parentId });
      fetchPostAndComments(parseInt(id, 10)); // Refetch to show the new comment
    } catch (err: any) {
      setCommentError(err.response?.data?.message || 'Failed to post comment.');
      throw err;
    }
  };

  const handleLikePost = async () => {
    if (!post || !loggedInUser) {
      toast.current?.show({ severity: 'warn', summary: 'Authentication Required', detail: 'Please log in to like posts.', life: 3000 });
      return;
    }

    const originalPostData = { ...post };

    const newIsLiked = !post.isLiked;
    const newLikeCount = (post.likeCount || 0) + (newIsLiked ? 1 : -1);

    setPost(prevPost =>
      prevPost
        ? { ...prevPost, isLiked: newIsLiked, likeCount: newLikeCount }
        : null
    );

    try {
      if (originalPostData.isLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (err) {
      console.error('Failed to like/unlike post:', err);
      setPost(originalPostData);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update like status. Please try again.', life: 3000 });
    }
  };

  const confirmDeleteDetailedPost = () => {
    if (!post) return;
    confirmDialog({
      message: 'Are you sure you want to delete this post?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => handleDeleteDetailedPost(post.id),
    });
  };

  const handleDeleteDetailedPost = async (postId: number) => {
    try {
      await deletePost(postId);
      toast.current?.show({severity: 'success', summary: 'Deleted', detail: 'Post deleted successfully.', life: 3000});
      navigate('/');
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      toast.current?.show({severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to delete post.', life: 3000});
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

  if (!post) {
    return <Message severity="warn" text="Post not found." className="m-4" />;
  }

  const isOwnPost = loggedInUser?.id === post.userId;
  const formattedTimestamp = new Date(post.createdAt).toLocaleString();

  const cardFooter = (
    <div className="flex justify-content-between align-items-center pt-3">
      <Button
        label={post?.isLiked ? 'Unlike' : 'Like'}
        icon={post?.isLiked ? 'pi pi-thumbs-down' : 'pi pi-thumbs-up'}
        className={`p-button-sm ${post?.isLiked ? 'p-button-outlined p-button-danger' : 'p-button-outlined'}`}
        onClick={handleLikePost}
        disabled={!loggedInUser}
      />
      <Tag value={`Likes: ${post.likeCount !== undefined ? post.likeCount : 0}`} severity="info"></Tag>
    </div>
  );

  const cardHeaderActions = (
    <div className="flex gap-2">
      {isOwnPost && (
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-danger p-button-sm"
          onClick={confirmDeleteDetailedPost}
          tooltip="Delete Post"
          tooltipOptions={{ position: 'top' }}
        />
      )}
      <Button icon="pi pi-arrow-left" label="Back" onClick={() => navigate(-1)} className="p-button-text p-button-sm" />
    </div>
  );

  const cardTitle = (
    <div className="flex justify-content-between align-items-center">
      <span>Post Details</span>
      {cardHeaderActions}
    </div>
  );
  const sanitizedText = DOMPurify.sanitize(post.text);


  return (
    <div className="p-m-2 p-lg-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Card title={cardTitle} footer={cardFooter} className="shadow-md">
        <p className="text-xl m-0 mb-3"><div
                className="m-0 p-3"
                dangerouslySetInnerHTML={{ __html: sanitizedText }}
              ></div></p>
        <div className="text-sm text-gray-600">
          Posted by: {post.user ? (
            <Link to={`/users/${post.user.id}`} className="font-semibold text-primary hover:underline">
              {post.user.name}
            </Link>
          ) : (
            'Unknown User'
          )}
          {' on '}
          {formattedTimestamp}
        </div>
      </Card>

      <div className="mt-4">
        <h3 className="mb-3">Comments</h3>
        <CreateCommentForm
          onSubmit={(text) => handleCommentSubmit(text)}
          submitError={commentError}
        />
        {isLoadingComments ? (
          <div className="flex justify-content-center p-4">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
          </div>
        ) : (
          <CommentList comments={comments} onReplySubmit={handleCommentSubmit} />
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
