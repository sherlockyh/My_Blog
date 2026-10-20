import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleZh!: string;

  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(500) descZh?: string;
  @IsOptional() @IsString() @MaxLength(500) descEn?: string;
  /** 详情使用 Markdown，正文不随列表返回。 */
  @IsOptional() @IsString() @MaxLength(50000) contentZh?: string;
  @IsOptional() @IsString() @MaxLength(50000) contentEn?: string;
  @IsOptional() @IsString() @MaxLength(500) cover?: string;
  @IsOptional()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_object, value) => value !== '')
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
  @MaxLength(500)
  link?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() sort?: number;
}

export class UpdateProjectDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120) titleZh?: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(500) descZh?: string;
  @IsOptional() @IsString() @MaxLength(500) descEn?: string;
  @IsOptional() @IsString() @MaxLength(50000) contentZh?: string;
  @IsOptional() @IsString() @MaxLength(50000) contentEn?: string;
  @IsOptional() @IsString() @MaxLength(500) cover?: string;
  @IsOptional()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_object, value) => value !== '')
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
  @MaxLength(500)
  link?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() sort?: number;
}
