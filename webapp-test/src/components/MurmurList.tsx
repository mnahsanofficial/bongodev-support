import React from 'react';
import MurmurCard, { Murmur } from './MurmurCard'; // Import Murmur type

interface MurmurListProps {
  murmurs: Murmur[];
  onLikeMurmur: (murmurId: number) => void;
  isLoading: boolean;
  error?: string | object | null; // Allow for object type errors if needed
  // Add isLikedMap or similar prop if like status is managed here
  // For now, isLiked is passed down from a parent that would manage this
  likedMurmurs?: Set<number>; // A set of IDs of murmurs liked by the current user
}

const MurmurList: React.FC<MurmurListProps> = ({
  murmurs,
  onLikeMurmur,
  isLoading,
  error,
  likedMurmurs = new Set(), // Default to an empty set
}) => {
  if (isLoading) {
    return <p>Loading murmurs...</p>;
  }

  if (error) {
    // Basic error display, can be enhanced
    const errorMessage = typeof error === 'string' ? error : 'An unknown error occurred.';
    return <p style={{ color: 'red' }}>Error loading murmurs: {errorMessage}</p>;
  }

  if (murmurs.length === 0) {
    return <p>No murmurs found.</p>;
  }

  return (
    <div>
      {murmurs.map((murmur) => (
        <MurmurCard
          key={murmur.id}
          murmur={murmur}
          onLike={onLikeMurmur}
          isLiked={likedMurmurs.has(murmur.id)} // Determine if this murmur is liked
        />
      ))}
    </div>
  );
};

export default MurmurList;
