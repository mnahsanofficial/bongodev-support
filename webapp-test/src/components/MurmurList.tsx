import React from 'react';
import MurmurCard, { Murmur } from './MurmurCard'; // Import Murmur type

interface MurmurListProps {
  murmurs: Murmur[];
  onLikeMurmur: (murmurId: number) => void;
  // isLoading: boolean; // Removed
  // error?: string | object | null; // Removed
  // likedMurmurs?: Set<number>; // Removed - isLiked now comes directly from murmur object
  onDelete?: (murmurId: number) => void; 
  loggedInUserId?: number | null; 
}

const MurmurList: React.FC<MurmurListProps> = ({
  murmurs,
  onLikeMurmur,
  // likedMurmurs = new Set(), // Removed
  onDelete,
  loggedInUserId,
}) => {
  // Parent components (TimelinePage, UserProfilePage) are responsible for:
  // 1. Displaying a loading indicator while murmurs are being fetched.
  // 2. Displaying an error message if the fetch fails.
  // 3. Displaying a "no murmurs" message if the array is empty after a successful fetch.
  // MurmurList is now only responsible for rendering the list of MurmurCard components.

  return (
    <div>
      {murmurs.map((murmur) => (
        <MurmurCard
          key={murmur.id}
          murmur={murmur}
          onLike={onLikeMurmur}
          isLiked={murmur.isLiked} // Use isLiked from the murmur object itself
          onDelete={onDelete} 
          showDeleteButton={loggedInUserId === murmur.userId && !!onDelete}
        />
      ))}
    </div>
  );
};

export default MurmurList;
