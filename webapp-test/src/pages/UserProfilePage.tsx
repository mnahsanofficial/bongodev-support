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

const ITEMS_PER_PAGE = 10;

interface ProfileUser {
  id: number;
  name: string;
  followCount: number;
  followedCount: number;
  // Add other fields if needed
}

const UserProfilePage: React.FC = () => {
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const auth = useAuth();
  const loggedInUser = auth.user;

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingMurmurs, setIsLoadingMurmurs] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorMurmurs, setErrorMurmurs] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false); // Manage locally for now
  const [likedMurmurs, setLikedMurmurs] = useState<Set<number>>(new Set());
  const [murmursPage, setMurmursPage] = useState(1);
  const [totalMurmursPages, setTotalMurmursPages] = useState(1);

  const targetUserId = routeUserId ? parseInt(routeUserId, 10) : loggedInUser?.id;
  const isOwnProfile = loggedInUser?.id === targetUserId;

  // Fetch Profile User Data
  const fetchProfileData = useCallback(async (id: number) => {
    setIsLoadingProfile(true);
    setErrorProfile(null);
    try {
      const response = await getUserById(id);
      setProfileUser(response.data);
      // Placeholder for fetching actual follow status. For now, set to false.
      setIsFollowing(false); 
    } catch (err: any) {
      setErrorProfile(err.response?.data?.message || 'Failed to fetch user profile.');
      setProfileUser(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  // Fetch Murmurs for the Profile User
  const fetchMurmurs = useCallback(async (id: number, page: number) => {
    setIsLoadingMurmurs(true);
    setErrorMurmurs(null);
    try {
      const response = await getMurmursByUserId(id, page, ITEMS_PER_PAGE);
      setMurmurs(response.data.murmurs || []);
      setTotalMurmursPages(Math.ceil((response.data.total || 0) / ITEMS_PER_PAGE));
    } catch (err: any) {
      setErrorMurmurs(err.response?.data?.message || 'Failed to fetch murmurs.');
      setMurmurs([]);
    } finally {
      setIsLoadingMurmurs(false);
    }
  }, []);

  useEffect(() => {
    if (targetUserId) {
      fetchProfileData(targetUserId);
      fetchMurmurs(targetUserId, murmursPage);
    } else if (!routeUserId && !loggedInUser) {
      setErrorProfile("User not found."); // Should be redirected by ProtectedRoute if not logged in
      setIsLoadingProfile(false);
    }
  }, [targetUserId, fetchProfileData, fetchMurmurs, murmursPage, routeUserId, loggedInUser]);


  const handleFollow = async () => {
    if (!targetUserId) return;
    // Optimistic update for isFollowing and follower count
    const originalIsFollowing = isFollowing;
    const originalProfileUser = profileUser ? {...profileUser} : null;

    setIsFollowing(true);
    if (profileUser) {
      setProfileUser({ ...profileUser, followedCount: profileUser.followedCount + 1 });
    }
    // Also update loggedInUser's followCount if available and if we manage it in AuthContext
    // For now, this part is simplified.

    try {
      await followUser(targetUserId);
    } catch (err) {
      console.error('Failed to follow user:', err);
      setIsFollowing(originalIsFollowing); // Revert
      setProfileUser(originalProfileUser); // Revert
      // Show error message
    }
  };

  const handleUnfollow = async () => {
    if (!targetUserId) return;
    // Optimistic update
    const originalIsFollowing = isFollowing;
    const originalProfileUser = profileUser ? {...profileUser} : null;

    setIsFollowing(false);
    if (profileUser) {
      setProfileUser({ ...profileUser, followedCount: profileUser.followedCount - 1 });
    }

    try {
      await unfollowUser(targetUserId);
    } catch (err) {
      console.error('Failed to unfollow user:', err);
      setIsFollowing(originalIsFollowing); // Revert
      setProfileUser(originalProfileUser); // Revert
      // Show error message
    }
  };

  const handleLikeMurmurOnProfile = async (murmurId: number) => {
    const isLiked = likedMurmurs.has(murmurId);
    const originalMurmurs = [...murmurs];
    const originalLikedMurmurs = new Set(likedMurmurs);

    setLikedMurmurs(prev => { const newSet = new Set(prev); if (isLiked) newSet.delete(murmurId); else newSet.add(murmurId); return newSet; });
    setMurmurs(prevMurmurs => prevMurmurs.map(m => m.id === murmurId ? { ...m, likeCount: (m.likeCount || 0) + (isLiked ? -1 : 1) } : m));

    try {
      if (isLiked) await unlikeMurmur(murmurId); else await likeMurmur(murmurId);
    } catch (err) {
      console.error('Failed to like/unlike murmur:', err);
      setMurmurs(originalMurmurs);
      setLikedMurmurs(originalLikedMurmurs);
    }
  };

  const handleDeleteMurmur = async (murmurId: number) => {
    if (!targetUserId) return;
    // Optimistic removal or refetch
    const originalMurmurs = [...murmurs];
    setMurmurs(prevMurmurs => prevMurmurs.filter(m => m.id !== murmurId));
    try {
      await deleteMurmur(murmurId);
      // Optionally, show a success message
      // If pagination is complex, might be better to refetch current page of murmurs
      fetchMurmurs(targetUserId, murmursPage); 
    } catch (err) {
      console.error('Failed to delete murmur:', err);
      setMurmurs(originalMurmurs); // Revert
      // Show error message
    }
  };

  if (isLoadingProfile) return <p>Loading profile...</p>;
  if (errorProfile) return <p style={{ color: 'red' }}>{errorProfile}</p>;
  if (!profileUser) return <p>User not found.</p>;

  return (
    <div>
      <h2>{profileUser.name}'s Profile</h2>
      <p>Followers: {profileUser.followedCount} | Following: {profileUser.followCount}</p>
      {!isOwnProfile && loggedInUser && (
        <button onClick={isFollowing ? handleUnfollow : handleFollow}>
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      )}

      <h3 style={{marginTop: '30px'}}>Murmurs by {profileUser.name}</h3>
      <MurmurList
        murmurs={murmurs}
        isLoading={isLoadingMurmurs}
        error={errorMurmurs}
        onLikeMurmur={handleLikeMurmurOnProfile}
        likedMurmurs={likedMurmurs}
        // Pass delete handlers only for own profile's murmurs
        onDelete={isOwnProfile ? handleDeleteMurmur : undefined} 
        showDeleteButton={isOwnProfile}
      />
      {/* Pagination for Murmurs */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button onClick={() => setMurmursPage(p => p - 1)} disabled={murmursPage <= 1 || isLoadingMurmurs}>
          Previous Murmurs
        </button>
        <span style={{ margin: '0 10px' }}>Page {murmursPage} of {totalMurmursPages}</span>
        <button onClick={() => setMurmursPage(p => p + 1)} disabled={murmursPage >= totalMurmursPages || isLoadingMurmurs}>
          Next Murmurs
        </button>
      </div>
    </div>
  );
};

export default UserProfilePage;
