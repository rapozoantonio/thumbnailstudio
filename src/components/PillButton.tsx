// src/components/PillButton.tsx
import React from "react";

interface PillButtonProps {
  title: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const PillButton: React.FC<PillButtonProps> = ({
  title,
  active,
  onClick,
  children,
}) => {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded-full transition-colors border border-transparent focus:outline-none ${
        active ? "bg-primary text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"
      }`}
    >
      {children}
    </button>
  );
};

export default PillButton;
