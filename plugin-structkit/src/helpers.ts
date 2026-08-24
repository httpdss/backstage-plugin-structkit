import { Entity } from '@backstage/catalog-model';
import {
  STRUCTKIT_ANNOTATION_STRUCTURE,
  STRUCTKIT_ANNOTATION_STRUCT_FILE,
  STRUCTKIT_ANNOTATION_SOURCE,
} from './constants';

/**
 * Check if an entity has StructKit annotations
 */
export function isStructkitAvailable(entity: Entity): boolean {
  return !!(
    entity.metadata.annotations?.[STRUCTKIT_ANNOTATION_STRUCTURE] ||
    entity.metadata.annotations?.[STRUCTKIT_ANNOTATION_STRUCT_FILE]
  );
}

/**
 * Get the structure name from entity annotations
 */
export function getStructureName(entity: Entity): string | undefined {
  return entity.metadata.annotations?.[STRUCTKIT_ANNOTATION_STRUCTURE];
}

/**
 * Get the struct file path from entity annotations
 */
export function getStructFile(entity: Entity): string | undefined {
  return entity.metadata.annotations?.[STRUCTKIT_ANNOTATION_STRUCT_FILE];
}

/**
 * Get the source reference from entity annotations
 */
export function getSourceReference(entity: Entity): string | undefined {
  return entity.metadata.annotations?.[STRUCTKIT_ANNOTATION_SOURCE];
}

/**
 * Get a display name for the structure (either structure name or struct file basename)
 */
export function getStructureDisplayName(entity: Entity): string {
  const structure = getStructureName(entity);
  if (structure) {
    return structure;
  }

  const structFile = getStructFile(entity);
  if (structFile) {
    const basename = structFile.split('/').pop() || structFile;
    return basename;
  }

  return 'Unknown';
}
