import { ArticleStatus } from '@my-blog/shared';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PageQueryDto } from '../../../common/dto/page-query.dto';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleZh!: string;

  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(300) summaryZh?: string;
  @IsOptional() @IsString() @MaxLength(300) summaryEn?: string;
  @IsOptional() @IsString() contentZh?: string;
  @IsOptional() @IsString() contentEn?: string;
  @IsOptional() @IsString() @MaxLength(500) cover?: string;
  @IsOptional() @IsString() @MaxLength(120) slug?: string;
  @IsOptional() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsEnum(ArticleStatus) status?: ArticleStatus;
}

export class UpdateArticleDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120) titleZh?: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(300) summaryZh?: string;
  @IsOptional() @IsString() @MaxLength(300) summaryEn?: string;
  @IsOptional() @IsString() contentZh?: string;
  @IsOptional() @IsString() contentEn?: string;
  @IsOptional() @IsString() @MaxLength(500) cover?: string;
  @IsOptional() @IsString() @MaxLength(120) slug?: string;
  @IsOptional() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsEnum(ArticleStatus) status?: ArticleStatus;
}

export class ArticleQueryDto extends PageQueryDto {
  @IsOptional() @IsString() @MaxLength(120) cursor?: string;
  @IsOptional() @IsString() @MaxLength(50) tag?: string;
  @IsOptional() @IsString() @MaxLength(80) keyword?: string;
}

export class AdminArticleQueryDto extends ArticleQueryDto {
  @IsOptional() @IsEnum(ArticleStatus) status?: ArticleStatus;
}
