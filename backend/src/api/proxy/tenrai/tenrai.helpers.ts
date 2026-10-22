export const fromPrefix = (localPrefix: string, tenraiPrefix: string) => (path: string) =>
  tenraiPrefix + path.slice(localPrefix.length);

export const toTenraiPath = (tenraiRoot: string) => (path: string) =>
  tenraiRoot + path.replace(/^\/(?=\?|$)/, "");
