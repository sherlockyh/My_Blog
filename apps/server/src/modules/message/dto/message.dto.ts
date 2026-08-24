import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nickname!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content!: string;
}
