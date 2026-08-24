import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createStructKitGenerateAction } from './actions/structkitGenerate';

/**
 * Backstage backend module that registers the StructKit scaffolder action.
 *
 * @public
 */
export const scaffolderModuleStructKit = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'structkit',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(createStructKitGenerateAction());
      },
    });
  },
});
