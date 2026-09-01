import { ArrayMaxSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export type AiMessageRole = 'user' | 'assistant';

export class AiHistoryMessageDto {
  @IsIn(['user', 'assistant'])
  role!: AiMessageRole;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: '对话内容不能全为空白字符' })
  @MaxLength(500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  content!: string;
}

export class AiChatDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: '问题不能全为空白字符' })
  @MaxLength(500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  message!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => AiHistoryMessageDto)
  history?: AiHistoryMessageDto[];

  @IsOptional()
  @IsIn(['zh', 'en'])
  locale?: 'zh' | 'en';
}
