import type { Project } from '@prisma/client';

export function toProjectDto(row: Project) {
  return row;
}

export function toProjectDtos(rows: Project[]) {
  return rows.map(toProjectDto);
}
