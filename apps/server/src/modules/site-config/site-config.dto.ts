import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class HeroDto {
  @IsOptional() @IsString() greeting?: string;
  @IsOptional() @IsString() @IsNotEmpty() titleZh?: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() descZh?: string;
  @IsOptional() @IsString() descEn?: string;
}

export class FeatureDto {
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() titleZh?: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() descZh?: string;
  @IsOptional() @IsString() descEn?: string;
}

export class UpdateSiteConfigDto {
  @IsOptional() @ValidateNested() @Type(() => HeroDto) hero?: HeroDto;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => FeatureDto) features?: FeatureDto[];
  @IsOptional() @IsString() weatherCity?: string;
  @IsOptional() @IsString() announcement?: string;
}

export class SocialDto {
  @IsString() label!: string;
  @IsString() url!: string;
}

export class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() avatar?: string;
  @IsOptional() @IsString() bioZh?: string;
  @IsOptional() @IsString() bioEn?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SocialDto) socials?: SocialDto[];
}
