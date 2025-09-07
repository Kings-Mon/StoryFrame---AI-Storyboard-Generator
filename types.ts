export type VisualStyle = 'Default' | 'Cartoonish' | 'Realistic' | 'Anime' | 'Vintage';

export interface PanelDescription {
  panel: number;
  visual_description: string;
  caption: string;
}

// Fix: Add the missing 'Panel' interface. This resolves an import error in `Panel.tsx`.
export interface Panel extends PanelDescription {
  imageUrl?: string;
  mimeType?: string;
}
