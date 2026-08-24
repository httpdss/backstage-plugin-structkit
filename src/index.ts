/**
 * Backstage scaffolder backend module for StructKit
 *
 * @packageDocumentation
 */

export { scaffolderModuleStructKit as default } from './module';
export { createStructKitGenerateAction } from './actions/structkitGenerate';
export { createStructKitListAction } from './actions/structkitList';
export { createStructKitInfoAction } from './actions/structkitInfo';
export { createStructKitVarsAction } from './actions/structkitVars';
export { createStructKitValidateAction } from './actions/structkitValidate';
