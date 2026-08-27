import { Entity } from '@backstage/catalog-model';
import {
  isStructkitAvailable,
  getStructureName,
  getStructFile,
  getSourceReference,
  getStructureDisplayName,
} from './helpers';

describe('helpers', () => {
  describe('isStructkitAvailable', () => {
    it('returns true when structure annotation is present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'structkit.io/structure': 'project/python',
          },
        },
      };

      expect(isStructkitAvailable(entity)).toBe(true);
    });

    it('returns true when struct-file annotation is present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'structkit.io/struct-file': './my-structure.yaml',
          },
        },
      };

      expect(isStructkitAvailable(entity)).toBe(true);
    });

    it('returns false when no structkit annotations are present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
        },
      };

      expect(isStructkitAvailable(entity)).toBe(false);
    });

    it('returns false when entity has no annotations', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
        },
      };

      expect(isStructkitAvailable(entity)).toBe(false);
    });
  });

  describe('getStructureName', () => {
    it('returns structure name when present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'structkit.io/structure': 'project/python',
          },
        },
      };

      expect(getStructureName(entity)).toBe('project/python');
    });

    it('returns undefined when not present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
        },
      };

      expect(getStructureName(entity)).toBeUndefined();
    });
  });

  describe('getStructFile', () => {
    it('returns struct file when present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'structkit.io/struct-file': './my-structure.yaml',
          },
        },
      };

      expect(getStructFile(entity)).toBe('./my-structure.yaml');
    });

    it('returns undefined when not present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
        },
      };

      expect(getStructFile(entity)).toBeUndefined();
    });
  });

  describe('getSourceReference', () => {
    it('returns source reference when present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'structkit.io/source': 'Generated from template',
          },
        },
      };

      expect(getSourceReference(entity)).toBe('Generated from template');
    });

    it('returns undefined when not present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
        },
      };

      expect(getSourceReference(entity)).toBeUndefined();
    });
  });

  describe('getStructureDisplayName', () => {
    it('returns structure name when present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'structkit.io/structure': 'project/python',
          },
        },
      };

      expect(getStructureDisplayName(entity)).toBe('project/python');
    });

    it('returns basename of struct file when only struct-file is present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'structkit.io/struct-file': './path/to/my-structure.yaml',
          },
        },
      };

      expect(getStructureDisplayName(entity)).toBe('my-structure.yaml');
    });

    it('prefers structure name over struct file', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'structkit.io/structure': 'project/python',
            'structkit.io/struct-file': './my-structure.yaml',
          },
        },
      };

      expect(getStructureDisplayName(entity)).toBe('project/python');
    });

    it('returns "Unknown" when no annotations are present', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
        },
      };

      expect(getStructureDisplayName(entity)).toBe('Unknown');
    });
  });
});
