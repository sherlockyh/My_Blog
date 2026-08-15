import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  titleZh!: string;

  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() descZh?: string;
  @IsOptional() @IsString() descEn?: string;
  @IsOptional() @IsString() cover?: string;
  @IsOptional() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsString() link?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() sort?: number;
}

export class UpdateProjectDto {
  @IsOptional() @IsString() @IsNotEmpty() titleZh?: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() descZh?: string;
  @IsOptional() @IsString() descEn?: string;
  @IsOptional() @IsString() cover?: string;
  @IsOptional() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsString() link?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() sort?: number;
}
