import { ArticleStatus } from '@my-blog/shared';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  titleZh!: string;

  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() summaryZh?: string;
  @IsOptional() @IsString() summaryEn?: string;
  @IsOptional() @IsString() contentZh?: string;
  @IsOptional() @IsString() contentEn?: string;
  @IsOptional() @IsString() cover?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsEnum(ArticleStatus) status?: ArticleStatus;
}

export class UpdateArticleDto {
  @IsOptional() @IsString() @IsNotEmpty() titleZh?: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() summaryZh?: string;
  @IsOptional() @IsString() summaryEn?: string;
  @IsOptional() @IsString() contentZh?: string;
  @IsOptional() @IsString() contentEn?: string;
  @IsOptional() @IsString() cover?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsEnum(ArticleStatus) status?: ArticleStatus;
}

export class ArticleQueryDto {
  @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() pageSize?: number;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsString() keyword?: string;
}
