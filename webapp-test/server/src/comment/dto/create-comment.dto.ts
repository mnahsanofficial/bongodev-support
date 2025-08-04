import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsInt()
  postId: number;

  @IsOptional()
  @IsInt()
  parentId?: number;
}
