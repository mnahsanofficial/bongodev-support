import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserById,
  getPostsByUserId,
  followUser,
  unfollowUser,
  likePost,
  unlikePost,
  deletePost,
  getIsFollowing,
} from '../services/api';
import PostList from '../components/PostList';
import { Post } from '../components/PostCard';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'; // For delete confirmation
import { Toast } from 'primereact/toast'; // For notifications
import { useRef } from 'react';


const ITEMS_PER_PAGE = 10;

interface ProfileUser {
  id: number;
  name: string;
  followCount: number;
  followedCount: number;
}

const UserProfilePage: React.FC = () => {
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const auth = useAuth();
  const loggedInUser = auth.user;
  const toast = useRef<Toast>(null);

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);

  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [postsFirst, setPostsFirst] = useState(0);
  const [postsCurrentPage, setPostsCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  
  const targetUserId = routeUserId ? parseInt(routeUserId, 10) : loggedInUser?.id;
  const isOwnProfile = loggedInUser?.id === targetUserId;

  const fetchProfileData = useCallback(async (id: number) => {
    setIsLoadingProfile(true);
    setErrorProfile(null);
    try {
      const response = await getUserById(id);
      setProfileUser(response.data);
      if (loggedInUser && loggedInUser.id !== id) {
        try {
          const followStatusResponse = await getIsFollowing(id);
          setIsFollowing(followStatusResponse.data.isFollowing);
        } catch (followErr) {
          console.error("Failed to fetch follow status:", followErr);
          setIsFollowing(false);
        }
      } else {
        setIsFollowing(false);
      }
    } catch (err: any) {
      setErrorProfile(err.response?.data?.message || 'Failed to fetch user profile.');
      setProfileUser(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  const fetchPosts = useCallback(async (id: number, page: number) => {
    setIsLoadingPosts(true);
    setErrorPosts(null);
    try {
      const response = await getPostsByUserId(id, page, ITEMS_PER_PAGE);
      setPosts(response.data.posts || []);
      setTotalPosts(response.data.total || 0);
    } catch (err: any) {
      setErrorPosts(err.response?.data?.message || 'Failed to fetch posts.');
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (targetUserId) {
      fetchProfileData(targetUserId);
      fetchPosts(targetUserId, postsCurrentPage);
    } else if (!routeUserId && !loggedInUser) {
      setErrorProfile("User not found or not logged in.");
      setIsLoadingProfile(false);
      setIsLoadingPosts(false);
    }
  }, [targetUserId, fetchProfileData, fetchPosts, postsCurrentPage, routeUserId, loggedInUser]);

  const handleFollowToggle = async () => {
    if (!targetUserId || !loggedInUser || isOwnProfile) return;

    setIsFollowingLoading(true);
    const action = isFollowing ? unfollowUser : followUser;
    const newFollowStatus = !isFollowing;

    try {
      await action(targetUserId);
      setIsFollowing(newFollowStatus); // Keep optimistic update for responsiveness
      toast.current?.show({severity: 'success', summary: 'Success', detail: `Successfully ${newFollowStatus ? 'followed' : 'unfollowed'} user.`, life: 3000});
      
      // Refetch profile data to get updated follow counts from the server
      // This also ensures the followedCount for the profile user and followCount for the loggedInUser (if applicable) are accurate.
      fetchProfileData(targetUserId); 

      // If the logged-in user's profile is being viewed by someone else,
      // and this logged-in user is the one performing the follow/unfollow action on another profile,
      // their own followCount might need an update if their profile is re-visited.
      // This is better handled by a global state update or refetching their own data when their profile is viewed.
      // For now, focusing on the accuracy of the current profile page.
      if (loggedInUser && loggedInUser.id !== targetUserId) {
        // Potentially refetch loggedInUser's data if it's stored/managed globally
        // e.g., auth.refreshProfile(); 
        // For now, we rely on the server to correctly update counts, and refetching the *viewed* profile.
      }

    } catch (err: any) {
      console.error(`Failed to ${newFollowStatus ? 'follow' : 'unfollow'} user:`, err);
      toast.current?.show({severity: 'error', summary: 'Error', detail: err.response?.data?.message || `Failed to ${newFollowStatus ? 'follow' : 'unfollow'} user.`, life: 3000});
      // Revert UI changes if API call fails
      setIsFollowing(!newFollowStatus); 
      // Optionally, could refetch profile data here as well to ensure consistency after an error
      fetchProfileData(targetUserId);
    } finally {
      setIsFollowingLoading(false);
    }
  };
  
  const handleLikePostOnProfile = async (postId: number) => {
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
      console.error('Failed to like/unlike post:', err);
      setPosts(originalPosts);
      toast.current?.show({severity: 'error', summary: 'Error', detail: 'Failed to update like status.', life: 3000});
    }
  };

  const confirmDeletePost = (postId: number) => {
    confirmDialog({
      message: 'Are you sure you want to delete this post?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => handleDeletePost(postId),
    });
  };

  const handleDeletePost = async (postId: number) => {
    if (!targetUserId) return;
    const originalPosts = [...posts];
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    try {
      await deletePost(postId);
      toast.current?.show({severity: 'success', summary: 'Deleted', detail: 'Post deleted successfully.', life: 3000});
      fetchPosts(targetUserId, postsCurrentPage);
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      setPosts(originalPosts);
      toast.current?.show({severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to delete post.', life: 3000});
    }
  };

  const onPostsPageChange = (event: PaginatorPageChangeEvent) => {
    setPostsFirst(event.first);
    setPostsCurrentPage(event.page + 1);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (errorProfile) return <Message severity="error" text={errorProfile} className="m-4" />;
  if (!profileUser) return <Message severity="warn" text="User not found." className="m-4" />;

  return (
    <div className="p-m-2 p-lg-4">
      <Toast ref={toast} />
      <ConfirmDialog /> 
      <Card title={`${profileUser.name}'s Profile`} className="mb-4 shadow-md">
        <div className="grid">
          <div className="col-12 md:col-6">
            <Tag className="mr-2" icon="pi pi-users" value={`Following: ${profileUser.followedCount}`} />
            <Tag icon="pi pi-user-plus" value={`Followers: ${profileUser.followCount}`} />
          </div>
          {!isOwnProfile && loggedInUser && (
            <div className="col-12 md:col-6 md:text-right">
              <Button
                label={isFollowing ? 'Unfollow' : 'Follow'}
                icon={isFollowing ? 'pi pi-user-minus' : 'pi pi-user-plus'}
                className={`p-button-sm ${isFollowing ? 'p-button-outlined p-button-danger' : ''}`}
                onClick={handleFollowToggle}
                loading={isFollowingLoading}
              />
            </div>
          )}
        </div>
      </Card>

      <Divider align="left" type="dashed" className="my-4">
        <b>Posts by {profileUser.name}</b>
      </Divider>

      {isLoadingPosts && !posts.length ? (
         <div className="flex justify-content-center p-4"><ProgressSpinner style={{width: '40px', height: '40px'}} /></div>
      ) : errorPosts ? (
        <Message severity="error" text={errorPosts} className="w-full" />
      ) : (
        <>
          <PostList
            posts={posts}
            onLikePost={handleLikePostOnProfile}
            onDelete={isOwnProfile ? confirmDeletePost : undefined}
            loggedInUserId={loggedInUser?.id}
          />
          {totalPosts > ITEMS_PER_PAGE && (
            <Paginator
              first={postsFirst}
              rows={ITEMS_PER_PAGE}
              totalRecords={totalPosts}
              onPageChange={onPostsPageChange}
              className="mt-4"
            />
          )}
           {!isLoadingPosts && !errorPosts && posts.length === 0 && (
             <Message severity="info" text={`${profileUser.name} hasn't posted any posts yet.`} className="mt-4"/>
          )}
        </>
      )}
    </div>
  );
};

export default UserProfilePage;
