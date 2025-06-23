import React from 'react';
import { Link } from 'react-router-dom';

// Define a more specific type for the murmur's user object
interface MurmurUser {
  id: number;
  name: string;
  // Add other user properties if available and needed
}

// Define the type for a Murmur object
export interface Murmur {
  id: number;
  text: string;
  createdAt: string; // Assuming ISO string date
  updatedAt: string; // Assuming ISO string date
  userId: number;
  user: MurmurUser; // Use the MurmurUser interface
  likeCount?: number; // Optional as it might not always be present initially
  // Potentially add other fields like 'likes' array if needed for isLiked logic
}

interface MurmurCardProps {
  murmur: Murmur;
  onLike: (murmurId: number) => void;
  isLiked?: boolean; // This will be determined at the page level
  onDelete?: (murmurId: number) => void; // Optional delete handler
  showDeleteButton?: boolean; // Optional flag to show delete button
}

const MurmurCard: React.FC<MurmurCardProps> = ({ murmur, onLike, isLiked, onDelete, showDeleteButton }) => {
  const handleLikeClick = () => {
    onLike(murmur.id);
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      // Optional: Add a confirmation dialog here
      // if (window.confirm('Are you sure you want to delete this murmur?')) {
      onDelete(murmur.id);
      // }
    }
  };

  const formattedTimestamp = new Date(murmur.createdAt).toLocaleString();

  return (
    <div style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ flexGrow: 1, margin: 0 }}>{murmur.text}</p>
        {showDeleteButton && onDelete && (
          <button onClick={handleDeleteClick} style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            Delete
          </button>
        )}
      </div>
      <small>
        Posted by: <Link to={`/users/${murmur.user.id}`}>{murmur.user.name || 'Unknown User'}</Link>
        {' on '}
        {formattedTimestamp}
      </small>
      <div>
        <span>Likes: {murmur.likeCount !== undefined ? murmur.likeCount : 0}</span>
        <button onClick={handleLikeClick} style={{ marginLeft: '10px' }}>
          {isLiked ? 'Unlike' : 'Like'}
        </button>
      </div>
      <small>
        <Link to={`/murmurs/${murmur.id}`}>View Details</Link>
      </small>
    </div>
  );
};

export default MurmurCard;
