import { User } from './user.entity';
import { Post } from './post.entity';
export declare class Like {
    id: number;
    userId: number;
    postId: number;
    createdAt: Date;
    user: User;
    post: Post;
}
