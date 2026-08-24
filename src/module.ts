import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createStructKitGenerateAction } from './actions/structkitGenerate';
import { createStructKitListAction } from './actions/structkitList';
import { createStructKitInfoAction } from './actions/structkitInfo';
import { createStructKitVarsAction } from './actions/structkitVars';
import { createStructKitValidateAction } from './actions/structkitValidate';

/**
 * Backstage backend module that registers the StructKit scaffolder actions.
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
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        const configOptions = { config };
        scaffolder.addActions(
          createStructKitGenerateAction(configOptions),
          createStructKitListAction(configOptions),
          createStructKitInfoAction(configOptions),
          createStructKitVarsAction(configOptions),
          createStructKitValidateAction(configOptions),
        );
      },
    });
  },
});
