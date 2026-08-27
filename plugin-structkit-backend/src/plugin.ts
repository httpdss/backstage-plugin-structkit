import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

export const structkitPlugin = createBackendPlugin({
  pluginId: 'structkit',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, config, httpRouter }) {
        const router = await createRouter({ logger, config });
        httpRouter.use(router);
      },
    });
  },
});
