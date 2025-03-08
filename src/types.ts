// src/components/thumbnail-canvas/types.ts
export interface Position {
    x: number;
    y: number;
  }
  
  export interface Size {
    width: number;
    height: number;
  }
  
  export interface Asset {
    id: string;
    type: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    isBackground?: boolean;
  }
  
  export interface TextSettings {
    headline: string;
    subtitle: string;
    headlineSize: number;
    subtitleSize: number;
    headlineAlignment: "left" | "center" | "right";
    subtitleAlignment: "left" | "center" | "right";
    headlinePosition: "top" | "middle" | "bottom";
    headlineCustomPosition: Position | null;
    subtitleCustomPosition: Position | null;
  }
  
  export interface StyleSettings {
    backgroundColor: string;
    fontFamily: string;
    assets: Asset[];
    badgeStyle?: "pill" | "rectangle" | "code" | "floating" | "none";
    backgroundGradient?: {
      enabled: boolean;
      type: "linear" | "radial";
      colors: string[];
    };
  }
  
  export interface Guide {
    position: number;
    isHorizontal: boolean;
    diff: number;
  }
  
  export type ToastSeverity = "success" | "info" | "warning" | "error";
  
  export interface ElementData {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }