import type { Message } from '@prisma/client';

export function toMessageDto(row: Message) {
  return row;
}

export function toMessageDtos(rows: Message[]) {
  return rows.map(toMessageDto);
}
