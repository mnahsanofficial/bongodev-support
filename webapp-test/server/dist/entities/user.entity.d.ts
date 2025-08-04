import { Follow } from './follow.entity';
import { Comment } from './comment.entity';
import { CommentReaction } from './comment-reaction.entity';
export declare class User {
    id: number;
    name: string;
    password: string;
    followCount: number;
    followedCount: number;
    createdAt: Date;
    updatedAt: Date;
    followers: Follow[];
    following: Follow[];
    comments: Comment[];
    commentReactions: CommentReaction[];
}
