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
  getIsFollowing, // Import the new function
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
  const [isFollowing, setIsFollowing] = useState(false);

  const [murmursFirst, setMurmursFirst] = useState(0);
  const [murmursCurrentPage, setMurmursCurrentPage] = useState(1);
  const [totalMurmurs, setTotalMurmurs] = useState(0);
  
  // const [likedMurmurs, setLikedMurmurs] = useState<Set<number>>(new Set()); // Removed

  const targetUserId = routeUserId ? parseInt(routeUserId, 10) : loggedInUser?.id;
  const isOwnProfile = loggedInUser?.id === targetUserId;

  const fetchProfileData = useCallback(async (id: number) => {
    setIsLoadingProfile(true);
    setErrorProfile(null);
    try {
      const response = await getUserById(id);
      setProfileUser(response.data);
      // If logged in and not own profile, fetch follow status
      if (loggedInUser && loggedInUser.id !== id) {
        try {
          const followStatusResponse = await getIsFollowing(id);
          setIsFollowing(followStatusResponse.data.isFollowing);
        } catch (followErr) {
          console.error("Failed to fetch follow status:", followErr);
          // Decide how to handle this error, maybe a state for follow status error
          setIsFollowing(false); // Default to not following on error
        }
      } else {
        setIsFollowing(false); // Not applicable for own profile or if not logged in
      }
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
  
  const handleLikeMurmurOnProfile = async (murmurId: number) => {
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
      // Optional: refetch murmurs for this user to ensure data consistency,
      // or trust the optimistic update if the API call is successful.
      // fetchMurmurs(targetUserId, murmursCurrentPage); 
    } catch (err) {
      console.error('Failed to like/unlike murmur:', err);
      // Revert optimistic update on error
      setMurmurs(originalMurmurs);
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
            // likedMurmurs={likedMurmurs} // Removed, isLiked comes from murmur object
            onDelete={isOwnProfile ? confirmDeleteMurmur : undefined}
            loggedInUserId={loggedInUser?.id} // For delete button logic in MurmurList
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
