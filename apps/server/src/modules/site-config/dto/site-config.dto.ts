import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class HeroDto {
  @IsOptional() @IsString() @MaxLength(80) greeting?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120) titleZh?: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(500) descZh?: string;
  @IsOptional() @IsString() @MaxLength(500) descEn?: string;
}

export class FeatureDto {
  @IsOptional() @IsString() @MaxLength(30) icon?: string;
  @IsOptional() @IsString() @MaxLength(80) titleZh?: string;
  @IsOptional() @IsString() @MaxLength(80) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(200) descZh?: string;
  @IsOptional() @IsString() @MaxLength(200) descEn?: string;
}

export class UpdateSiteConfigDto {
  @IsOptional() @ValidateNested() @Type(() => HeroDto) hero?: HeroDto;
  @IsOptional() @IsArray() @ArrayMaxSize(6) @ValidateNested({ each: true }) @Type(() => FeatureDto) features?: FeatureDto[];
  @IsOptional() @IsString() @MaxLength(80) weatherCity?: string;
  @IsOptional() @IsString() @MaxLength(300) announcement?: string;
}

export class SocialDto {
  @IsString() @MaxLength(40) label!: string;
  @IsString() @MaxLength(500) url!: string;
}

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(80) name?: string;
  @IsOptional() @IsString() @MaxLength(500) avatar?: string;
  @IsOptional() @IsString() @MaxLength(500) bioZh?: string;
  @IsOptional() @IsString() @MaxLength(500) bioEn?: string;
  @IsOptional() @IsString() @MaxLength(80) location?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(8) @ValidateNested({ each: true }) @Type(() => SocialDto) socials?: SocialDto[];
}
