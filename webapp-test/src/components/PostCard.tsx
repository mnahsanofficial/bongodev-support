import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import DOMPurify from 'dompurify';

// Define a more specific type for the post's user object
interface PostUser {
  id: number;
  name: string;
  // Add other user properties if available and needed
}

// Define the type for a Post object
export interface Post {
  id: number;
  text: string;
  createdAt: string; // Assuming ISO string date
  updatedAt: string; // Assuming ISO string date
  userId: number;
  user: PostUser;
  likeCount?: number; 
  isLiked?: boolean; // Added from API
}

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  isLiked?: boolean; // This will be determined at the page level
  onDelete?: (postId: number) => void; // Optional delete handler
  showDeleteButton?: boolean; // Optional flag to show delete button
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, isLiked, onDelete, showDeleteButton }) => {
  const handleLikeClick = () => {
    onLike(post.id);
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const formattedTimestamp = new Date(post.createdAt).toLocaleString();
  const sanitizedText = DOMPurify.sanitize(post.text);
  const header = (
    <div className="p-card-header p-3">
      <div className="flex justify-content-between align-items-start">
        <span className="font-bold">
          {post.user ? (
            <Link to={`/users/${post.user.id}`} className="no-underline hover:underline text-primary">
              {post.user.name || 'Unknown User'}
            </Link>
          ) : (
            'Unknown User'
          )}
        </span>
        {showDeleteButton && onDelete && (
          <Button 
            icon="pi pi-trash" 
            className="p-button-text p-button-danger p-button-sm" 
            onClick={handleDeleteClick} 
            tooltip="Delete Post"
            tooltipOptions={{ position: 'top' }}
          />
        )}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        Posted on: {formattedTimestamp}
      </div>
    </div>
  );

  const footer = (
    <div className="p-card-footer p-3">
      <div className="flex align-items-center justify-content-between">
        <Button 
          label={isLiked ? 'Unlike' : 'Like'} 
          icon={isLiked ? 'pi pi-thumbs-down' : 'pi pi-thumbs-up'} 
          className={`p-button-sm ${isLiked ? 'p-button-outlined p-button-danger' : 'p-button-outlined'}`} 
          onClick={handleLikeClick} 
        />
        <span className="text-sm">
          Likes: {post.likeCount !== undefined ? post.likeCount : 0}
        </span>
        <Link to={`/posts/${post.id}`} className="no-underline hover:underline text-sm text-primary">
          View Details
        </Link>
      </div>
    </div>
  );

  return (
    <Card header={header} footer={footer} className="mb-3 shadow-md">
      <div
        className="m-0 p-3"
        dangerouslySetInnerHTML={{ __html: sanitizedText }}
      ></div>
    </Card>
  );
};

export default PostCard;
