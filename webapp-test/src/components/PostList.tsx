import React from 'react';
import PostCard, { Post } from './PostCard'; // Import Post type

interface PostListProps {
  posts: Post[];
  onLikePost: (postId: number) => void;
  onDelete?: (postId: number) => void;
  loggedInUserId?: number | null;
}

const PostList: React.FC<PostListProps> = ({
  posts,
  onLikePost,
  onDelete,
  loggedInUserId,
}) => {
  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLikePost}
          isLiked={post.isLiked} // Use isLiked from the post object itself
          onDelete={onDelete}
          showDeleteButton={loggedInUserId === post.userId && !!onDelete}
        />
      ))}
    </div>
  );
};

export default PostList;
