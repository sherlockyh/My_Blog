import { Type } from 'class-transformer';
import { ArrayMaxSize, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleZh!: string;

  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(500) descZh?: string;
  @IsOptional() @IsString() @MaxLength(500) descEn?: string;
  @IsOptional() @IsString() @MaxLength(500) cover?: string;
  @IsOptional() @ArrayMaxSize(12) @IsString({ each: true }) @MaxLength(30, { each: true }) tags?: string[];
  @IsOptional() @IsString() @MaxLength(500) link?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() sort?: number;
}

export class UpdateProjectDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120) titleZh?: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(500) descZh?: string;
  @IsOptional() @IsString() @MaxLength(500) descEn?: string;
  @IsOptional() @IsString() @MaxLength(500) cover?: string;
  @IsOptional() @ArrayMaxSize(12) @IsString({ each: true }) @MaxLength(30, { each: true }) tags?: string[];
  @IsOptional() @IsString() @MaxLength(500) link?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() sort?: number;
}
