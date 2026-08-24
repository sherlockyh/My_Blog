import type { Resource } from '@prisma/client';

export function toResourceDto(row: Resource) {
  return row;
}

export function toResourceDtos(rows: Resource[]) {
  return rows.map(toResourceDto);
}
