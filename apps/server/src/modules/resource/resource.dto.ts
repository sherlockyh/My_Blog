import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  titleZh!: string;

  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() descZh?: string;
  @IsOptional() @IsString() descEn?: string;
  @IsOptional() @IsString() link?: string;
  @IsOptional() @IsString() category?: string;
}

export class UpdateResourceDto {
  @IsOptional() @IsString() @IsNotEmpty() titleZh?: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() descZh?: string;
  @IsOptional() @IsString() descEn?: string;
  @IsOptional() @IsString() link?: string;
  @IsOptional() @IsString() category?: string;
}
