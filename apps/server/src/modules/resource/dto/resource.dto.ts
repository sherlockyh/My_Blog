import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleZh!: string;

  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(500) descZh?: string;
  @IsOptional() @IsString() @MaxLength(500) descEn?: string;
  @IsOptional() @IsString() @MaxLength(500) link?: string;
  @IsOptional() @IsString() @MaxLength(50) category?: string;
}

export class UpdateResourceDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120) titleZh?: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(500) descZh?: string;
  @IsOptional() @IsString() @MaxLength(500) descEn?: string;
  @IsOptional() @IsString() @MaxLength(500) link?: string;
  @IsOptional() @IsString() @MaxLength(50) category?: string;
}
