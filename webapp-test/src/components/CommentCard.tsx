import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import CreateCommentForm from './CreateCommentForm';
import { addCommentReaction, removeCommentReaction } from '../services/api';

export interface Reaction {
  id: number;
  reactionType: string;
  user: {
    id: number;
    name: string;
  };
}
export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
  replies: Comment[];
  reactions: Reaction[];
}

interface CommentCardProps {
  comment: Comment;
  onReplySubmit: (text: string, parentId: number) => Promise<void>;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, onReplySubmit }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || []);

  const handleReplySubmit = async (text: string) => {
    await onReplySubmit(text, comment.id);
    setShowReplyForm(false);
  };

  const handleReaction = async (reactionType: string) => {
    const existingReaction = reactions.find(r => r.reactionType === reactionType);
    if (existingReaction) {
      setReactions(reactions.filter(r => r.reactionType !== reactionType));
      await removeCommentReaction(comment.id, reactionType);
    } else {
      const newReaction = { id: Date.now(), reactionType, user: { id: 0, name: 'You' } };
      setReactions([...reactions, newReaction]);
      await addCommentReaction(comment.id, reactionType);
    }
  };

  const reactionTypes = ['👍', '❤️', '😂', '😯', '😢', '😡'];

  const footer = (
    <div className="flex justify-content-between align-items-center">
      <div>
        {Object.entries(reactions.reduce((acc, r) => ({ ...acc, [r.reactionType]: (acc[r.reactionType] || 0) + 1 }), {} as Record<string, number>)).map(([type, count]) => (
          <span key={type} className="mr-2">{type} {count}</span>
        ))}
      </div>
      <div className="flex">
        <Tooltip target=".reaction-button" />
        <Button
          icon="pi pi-thumbs-up"
          className="p-button-sm p-button-text reaction-button"
          data-pr-tooltip="React"
          data-pr-position="top"
          onClick={() => {
            const reactionPanel = document.getElementById(`reaction-panel-${comment.id}`);
            if (reactionPanel) {
              reactionPanel.classList.toggle('hidden');
            }
          }}
        />
        <div id={`reaction-panel-${comment.id}`} className="hidden">
          {reactionTypes.map(type => (
            <Button key={type} label={type} className="p-button-sm p-button-text" onClick={() => handleReaction(type)} />
          ))}
        </div>
        <Button
          label="Reply"
          icon="pi pi-reply"
          className="p-button-sm p-button-text"
          onClick={() => setShowReplyForm(!showReplyForm)}
        />
      </div>
    </div>
  );

  return (
    <Card
      title={comment.user.name}
      subTitle={new Date(comment.createdAt).toLocaleString()}
      footer={footer}
      className="mt-3"
    >
      <p>{comment.text}</p>
      {showReplyForm && <CreateCommentForm onSubmit={handleReplySubmit} />}
      <div className="pl-5">
        {comment.replies && comment.replies.map(reply => (
          <CommentCard key={reply.id} comment={reply} onReplySubmit={onReplySubmit} />
        ))}
      </div>
    </Card>
  );
};

export default CommentCard;
