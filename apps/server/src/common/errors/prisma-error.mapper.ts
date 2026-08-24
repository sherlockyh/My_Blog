import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

interface PrismaErrorMessages {
  notFound?: string;
  unique?: string;
}

export function rethrowPrismaError(error: unknown, messages: PrismaErrorMessages = {}): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw new NotFoundException(messages.notFound ?? 'Resource not found');
    }
    if (error.code === 'P2002') {
      throw new ConflictException(messages.unique ?? 'Resource already exists');
    }
  }
  throw error;
}
