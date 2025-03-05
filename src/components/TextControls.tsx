// src/components/TextControls.tsx
import React, { useState } from "react";
import useThumbnailStore from "../store/thumbnailStore";
import PillButton from "./PillButton";

interface TextControlsProps {
  /**
   * Layout will automatically become vertical on smaller screens,
   * but you can force vertical layout with this prop.
   */
  forceVertical?: boolean;
}

/**
 * A responsive text controls component that adapts to screen size.
 * Automatically switches to vertical layout on smaller screens.
 * 
 * Example usage in App.tsx:
 *   <TextControls />
 */
const TextControls: React.FC<TextControlsProps> = ({ forceVertical = false }) => {
  const { text, updateText } = useThumbnailStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  /**
   * Helper: round to nearest multiple of 4, then clamp in [min, max].
   */
  const processSize = (raw: number, min: number, max: number) => {
    const rounded = Math.round(raw / 4) * 4;
    return Math.max(min, Math.min(rounded, max));
  };

  /**
   * Adjust the numeric/slider size for "headline" or "subtitle".
   */
  const handleSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "headline" | "subtitle"
  ) => {
    const raw = parseInt(e.target.value, 10);
    if (!isNaN(raw)) {
      const min = type === "headline" ? 16 : 12;
      const max = type === "headline" ? 240 : 160;
      const size = processSize(raw, min, max);
      updateText({
        [type === "headline" ? "headlineSize" : "subtitleSize"]: size,
      });
    }
  };

  /**
   * Get the current size (headline or subtitle).
   */
  const getSize = (type: "headline" | "subtitle") =>
    type === "headline" ? text.headlineSize : text.subtitleSize;

  /**
   * Toggle a boolean text style prop (e.g., bold, shadow, outline, highlight).
   */
  const toggleTextStyle = (
    style: "textBold" | "textShadow" | "textOutline" | "textHighlight"
  ) => {
    updateText({ [style]: !text[style] });
  };

  /**
   * Toggle expandable section for smaller screens
   */
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  /**
   * Responsive field for controlling a single text field (H / S).
   */
  const renderTextField = (type: "headline" | "subtitle") => {
    const isHeadline = type === "headline";
    const labelShort = isHeadline ? "H" : "S"; // For the small icon/label
    const placeholder = isHeadline ? "Headline..." : "Subtitle...";
    const min = isHeadline ? 16 : 12;
    const max = isHeadline ? 240 : 160;
    const value = isHeadline ? text.headline : text.subtitle;

    return (
      <div className="flex flex-nowrap items-center gap-1 sm:gap-2 w-full">
        {/* Minimal label or icon, e.g. 'H' or 'S' */}
        <span className="font-bold text-sm px-2 py-1 bg-surface-dark rounded flex-shrink-0">
          {labelShort}
        </span>

        {/* Text input */}
        <input
          type="text"
          value={value}
          onChange={(e) =>
            updateText(
              isHeadline
                ? { headline: e.target.value }
                : { subtitle: e.target.value }
            )
          }
          placeholder={placeholder}
          className="min-w-0 flex-grow rounded-md border border-surface-light bg-surface-dark text-xs text-white px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none"
        />

        {/* Range slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={4}
          value={getSize(type)}
          onChange={(e) => handleSizeChange(e, type)}
          className="h-1.5 cursor-pointer w-16 sm:w-20 md:w-24 lg:w-28 flex-shrink-0"
        />

        {/* Numeric size */}
        <input
          type="number"
          min={min}
          max={max}
          step={4}
          value={getSize(type)}
          onChange={(e) => handleSizeChange(e, type)}
          className="w-12 text-center rounded-md bg-surface-dark text-xs text-white py-1 border border-surface-light focus:ring-1 focus:ring-primary focus:outline-none flex-shrink-0"
        />
      </div>
    );
  };

  /**
   * Row of text style toggles (case, bold, shadow, outline, highlight).
   * On medium screens and larger, this appears to the right of the text fields.
   */
  const renderStyleToggles = () => (
    <div className="flex flex-wrap items-center justify-end gap-1 w-full">
      {/* Uppercase / Normal */}
      <PillButton
        title="Uppercase"
        active={text.textCase === "uppercase"}
        onClick={() => updateText({ textCase: "uppercase" })}
        className="flex-shrink-0"
      >
        <span className="uppercase text-xs font-semibold">Aa</span>
      </PillButton>
      <PillButton
        title="Normal Case"
        active={text.textCase !== "uppercase"}
        onClick={() => updateText({ textCase: "normal" })}
        className="flex-shrink-0"
      >
        <span className="normal-case text-xs font-semibold">Aa</span>
      </PillButton>

      {/* Bold */}
      <PillButton
        title="Bold"
        active={text.textBold}
        onClick={() => toggleTextStyle("textBold")}
        className="flex-shrink-0"
      >
        <span className="font-bold">B</span>
      </PillButton>

      {/* Shadow */}
      <PillButton
        title="Shadow"
        active={text.textShadow}
        onClick={() => toggleTextStyle("textShadow")}
        className="flex-shrink-0"
      >
        S
      </PillButton>

      {/* Outline */}
      <PillButton
        title="Outline"
        active={text.textOutline}
        onClick={() => toggleTextStyle("textOutline")}
        className="flex-shrink-0"
      >
        O
      </PillButton>

      {/* Highlight */}
      <PillButton
        title="Highlight"
        active={text.textHighlight}
        onClick={() => toggleTextStyle("textHighlight")}
        className="flex-shrink-0"
      >
        H
      </PillButton>
    </div>
  );

  // Collapsible section header for small screens
  const renderCollapsibleSection = (title: string, sectionId: string, content: React.ReactNode) => (
    <div className="w-full">
      <button
        onClick={() => toggleSection(sectionId)}
        className="w-full flex items-center justify-between p-1 bg-surface-dark rounded text-sm font-medium md:hidden"
      >
        {title}
        <span>{expandedSection === sectionId ? '▲' : '▼'}</span>
      </button>
      <div className={`${expandedSection === sectionId || expandedSection === 'all' ? 'block' : 'hidden'} md:block mt-1 md:mt-0`}>
        {content}
      </div>
    </div>
  );

  // Adaptive layout based on screen size and forceVertical prop
  return (
    <div className={`w-full px-2 py-2 bg-surface border border-surface-light rounded transition-all`}>
      
      {/* Controls for small screens - collapsible sections */}
      <div className="w-full sm:hidden">
        <button
          onClick={() => toggleSection('all')}
          className="w-full flex items-center justify-between p-1 mb-1 bg-surface-dark rounded text-sm font-medium"
        >
          Text Controls
          <span>{expandedSection === 'all' ? '▲' : '▼'}</span>
        </button>

        {expandedSection === 'all' && (
          <div className="space-y-2 mt-1">
            {renderCollapsibleSection("Headline", "headline", renderTextField("headline"))}
            {renderCollapsibleSection("Subtitle", "subtitle", renderTextField("subtitle"))}
            {renderCollapsibleSection("Style Options", "styles", renderStyleToggles())}
          </div>
        )}
      </div>
      
      {/* Controls for medium and larger screens */}
      <div className="hidden sm:flex sm:flex-wrap sm:items-start items-center">
        {/* Left side: text fields in a column */}
        <div className={`${forceVertical ? 'w-full' : 'sm:w-full md:w-auto md:flex-1'} space-y-2`}>
          <div className="w-full">
            {renderTextField("headline")}
          </div>
          <div className="w-full">
            {renderTextField("subtitle")}
          </div>
        </div>
        
        {/* Right side: style toggles */}
        <div className={`${forceVertical ? 'w-full mt-2' : 'sm:w-full md:w-auto md:ml-auto md:pl-4 md:self-center'} ${forceVertical ? 'mt-2' : 'sm:mt-2 md:mt-0'}`}>
          {renderStyleToggles()}
        </div>
      </div>
    </div>
  );
};

export default TextControls;