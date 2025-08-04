import React from 'react';
import CommentCard, { Comment } from './CommentCard';

interface CommentListProps {
  comments: Comment[];
  onReplySubmit: (text: string, parentId: number) => Promise<void>;
}

const CommentList: React.FC<CommentListProps> = ({ comments, onReplySubmit }) => {
  const topLevelComments = comments.filter(comment => !comment.parentId);

  return (
    <div>
      {topLevelComments.map(comment => (
        <CommentCard key={comment.id} comment={comment} onReplySubmit={onReplySubmit} />
      ))}
    </div>
  );
};

export default CommentList;
