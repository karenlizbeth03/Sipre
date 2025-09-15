declare module 'pptx-preview' {
  interface RenderOptions {
    style?: string;
    width?: string;
    height?: string;
    backgroundColor?: string;
  }

  export function renderAsync(arrayBuffer: ArrayBuffer, container: HTMLElement, options?: RenderOptions): Promise<void>;
}
