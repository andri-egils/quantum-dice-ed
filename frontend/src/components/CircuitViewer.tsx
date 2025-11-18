import React from "react";

interface CircuitViewerProps {
  svg: string | null;
}

const CircuitViewer: React.FC<CircuitViewerProps> = ({ svg }) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: svg || "<p>No circuit yet</p>" }} />
  );
};

export default CircuitViewer;