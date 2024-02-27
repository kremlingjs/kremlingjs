export let defaultNamespace = "kremling";

export function setGlobalNamespace(namespace: string) {
  defaultNamespace = namespace;
}
