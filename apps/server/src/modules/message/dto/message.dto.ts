import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: '昵称不能全为空白字符' })
  @MaxLength(20)
  nickname!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: '留言内容不能全为空白字符' })
  @MaxLength(500)
  content!: string;
}
