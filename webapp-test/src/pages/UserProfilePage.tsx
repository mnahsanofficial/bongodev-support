import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserById,
  getMurmursByUserId,
  followUser,
  unfollowUser,
  likeMurmur,
  unlikeMurmur,
  deleteMurmur,
} from '../services/api';
import MurmurList from '../components/MurmurList';
import { Murmur } from '../components/MurmurCard';
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
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingMurmurs, setIsLoadingMurmurs] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorMurmurs, setErrorMurmurs] = useState<string | null>(null);
  
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // TODO: This should be fetched from an API
  
  const [murmursFirst, setMurmursFirst] = useState(0);
  const [murmursCurrentPage, setMurmursCurrentPage] = useState(1);
  const [totalMurmurs, setTotalMurmurs] = useState(0);
  
  const [likedMurmurs, setLikedMurmurs] = useState<Set<number>>(new Set());

  const targetUserId = routeUserId ? parseInt(routeUserId, 10) : loggedInUser?.id;
  const isOwnProfile = loggedInUser?.id === targetUserId;

  const fetchProfileData = useCallback(async (id: number) => {
    setIsLoadingProfile(true);
    setErrorProfile(null);
    try {
      const response = await getUserById(id);
      setProfileUser(response.data);
      // TODO: Fetch actual follow status if user is logged in and it's not their own profile
      // For example, by having an endpoint like /api/users/:userId/is-following
      // This is a placeholder:
      setIsFollowing(false); 
    } catch (err: any) {
      setErrorProfile(err.response?.data?.message || 'Failed to fetch user profile.');
      setProfileUser(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  const fetchMurmurs = useCallback(async (id: number, page: number) => {
    setIsLoadingMurmurs(true);
    setErrorMurmurs(null);
    try {
      const response = await getMurmursByUserId(id, page, ITEMS_PER_PAGE);
      setMurmurs(response.data.murmurs || []);
      setTotalMurmurs(response.data.total || 0);
    } catch (err: any) {
      setErrorMurmurs(err.response?.data?.message || 'Failed to fetch murmurs.');
      setMurmurs([]);
      setTotalMurmurs(0);
    } finally {
      setIsLoadingMurmurs(false);
    }
  }, []);

  useEffect(() => {
    if (targetUserId) {
      fetchProfileData(targetUserId);
      fetchMurmurs(targetUserId, murmursCurrentPage);
    } else if (!routeUserId && !loggedInUser) {
      setErrorProfile("User not found or not logged in.");
      setIsLoadingProfile(false);
      setIsLoadingMurmurs(false);
    }
  }, [targetUserId, fetchProfileData, fetchMurmurs, murmursCurrentPage, routeUserId, loggedInUser]);

  const handleFollowToggle = async () => {
    if (!targetUserId || !loggedInUser || isOwnProfile) return;

    setIsFollowingLoading(true);
    const action = isFollowing ? unfollowUser : followUser;
    const newFollowStatus = !isFollowing;

    try {
      await action(targetUserId);
      setIsFollowing(newFollowStatus);
      // Optimistically update counts, or refetch profile for accuracy
      setProfileUser(prev => prev ? {
        ...prev,
        followedCount: prev.followedCount + (newFollowStatus ? 1 : -1)
      } : null);
       // Update logged-in user's followingCount (this would ideally be in global state/AuthContext)
      if (auth.user) {
         // This is a local simulation; AuthContext should ideally handle this update
        const updatedLoggedInUser = {
            ...auth.user,
            followCount: (auth.user.followCount || 0) + (newFollowStatus ? 1 : -1)
        };
        // auth.updateUser(updatedLoggedInUser); // Assuming AuthContext has an updateUser method
      }
      toast.current?.show({severity: 'success', summary: 'Success', detail: `Successfully ${newFollowStatus ? 'followed' : 'unfollowed'} user.`, life: 3000});
    } catch (err: any) {
      console.error(`Failed to ${newFollowStatus ? 'follow' : 'unfollow'} user:`, err);
      toast.current?.show({severity: 'error', summary: 'Error', detail: err.response?.data?.message || `Failed to ${newFollowStatus ? 'follow' : 'unfollow'} user.`, life: 3000});
      // Revert optimistic update if necessary, though ideally API gives source of truth
    } finally {
      setIsFollowingLoading(false);
    }
  };
  
  const handleLikeMurmurOnProfile = async (murmurId: number) => {
    // ... (optimistic update logic remains the same)
    const currentIsLiked = likedMurmurs.has(murmurId);
    const originalMurmurs = [...murmurs];
    const originalLikedMurmurs = new Set(likedMurmurs);

    setLikedMurmurs(prev => { const newSet = new Set(prev); if (currentIsLiked) newSet.delete(murmurId); else newSet.add(murmurId); return newSet; });
    setMurmurs(prevMurmurs => prevMurmurs.map(m => m.id === murmurId ? { ...m, likeCount: (m.likeCount || 0) + (currentIsLiked ? -1 : 1) } : m));

    try {
      if (currentIsLiked) await unlikeMurmur(murmurId); else await likeMurmur(murmurId);
    } catch (err) {
      console.error('Failed to like/unlike murmur:', err);
      setMurmurs(originalMurmurs);
      setLikedMurmurs(originalLikedMurmurs);
      toast.current?.show({severity: 'error', summary: 'Error', detail: 'Failed to update like status.', life: 3000});
    }
  };

  const confirmDeleteMurmur = (murmurId: number) => {
    confirmDialog({
      message: 'Are you sure you want to delete this murmur?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => handleDeleteMurmur(murmurId),
    });
  };

  const handleDeleteMurmur = async (murmurId: number) => {
    if (!targetUserId) return;
    const originalMurmurs = [...murmurs];
    setMurmurs(prevMurmurs => prevMurmurs.filter(m => m.id !== murmurId)); // Optimistic delete
    try {
      await deleteMurmur(murmurId);
      toast.current?.show({severity: 'success', summary: 'Deleted', detail: 'Murmur deleted successfully.', life: 3000});
      // Refetch to ensure data consistency, especially if total items change
      fetchMurmurs(targetUserId, murmursCurrentPage); 
    } catch (err: any) {
      console.error('Failed to delete murmur:', err);
      setMurmurs(originalMurmurs); // Revert
      toast.current?.show({severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to delete murmur.', life: 3000});
    }
  };

  const onMurmursPageChange = (event: PaginatorPageChangeEvent) => {
    setMurmursFirst(event.first);
    setMurmursCurrentPage(event.page + 1);
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
            <Tag className="mr-2" icon="pi pi-users" value={`Followers: ${profileUser.followedCount}`} />
            <Tag icon="pi pi-user-plus" value={`Following: ${profileUser.followCount}`} />
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
        <b>Murmurs by {profileUser.name}</b>
      </Divider>

      {isLoadingMurmurs && !murmurs.length ? (
         <div className="flex justify-content-center p-4"><ProgressSpinner style={{width: '40px', height: '40px'}} /></div>
      ) : errorMurmurs ? (
        <Message severity="error" text={errorMurmurs} className="w-full" />
      ) : (
        <>
          <MurmurList
            murmurs={murmurs}
            onLikeMurmur={handleLikeMurmurOnProfile}
            likedMurmurs={likedMurmurs}
            onDelete={isOwnProfile ? confirmDeleteMurmur : undefined}
            showDeleteButton={isOwnProfile}
          />
          {totalMurmurs > ITEMS_PER_PAGE && (
            <Paginator
              first={murmursFirst}
              rows={ITEMS_PER_PAGE}
              totalRecords={totalMurmurs}
              onPageChange={onMurmursPageChange}
              className="mt-4"
            />
          )}
           {!isLoadingMurmurs && !errorMurmurs && murmurs.length === 0 && (
             <Message severity="info" text={`${profileUser.name} hasn't posted any murmurs yet.`} className="mt-4"/>
          )}
        </>
      )}
    </div>
  );
};

export default UserProfilePage;
