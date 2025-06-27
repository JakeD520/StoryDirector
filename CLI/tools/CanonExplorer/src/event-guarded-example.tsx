import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, Newline } from 'ink';

type CanonSubEntry = {
  type: string;
  name: string;
  ref: string;
};

type CanonNode = {
  id: string;
  name: string;
  genre?: string;
  description?: string;
  subCanon?: CanonSubEntry[];
};

const mockCanon: CanonNode = {
  id: "timeline-binding-war",
  name: "The Binding War",
  genre: "Fantasy",
  description: "A clash of oaths, veils, and bloodlines.",
  subCanon: [
    { type: "event", name: "Fall of the Third Veil", ref: "fall-of-third-veil" },
    { type: "location", name: "Moonglass Keep", ref: "moonglass-keep" }
  ]
};

const App = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showFracture, setShowFracture] = useState(false);

  useEffect(() => {
    // Check if current selection is eligible for fracturing
    const node = mockCanon.subCanon?.[selectedIndex];
    setShowFracture(node?.type === "event");
  }, [selectedIndex]);

  useInput((input, key) => {
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(prev + 1, (mockCanon.subCanon?.length || 0) - 1));
    } else if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (key.return) {
      setExpanded((prev) => !prev);
    } else if (input === 'f' && showFracture) {
      console.log("🔧 Fracturing initiated...");
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
      <Text>🕰 Timeline: {mockCanon.name}</Text>
      <Text dimColor>{mockCanon.description}</Text>
      <Newline />
      <Text>📚 Sub-Canon Elements:</Text>
      {mockCanon.subCanon?.map((entry, index) => (
        <Text key={index} color={index === selectedIndex ? "green" : undefined}>
          {index === selectedIndex ? "👉 " : "   "}
          {entry.type}: {entry.name}
        </Text>
      ))}
      {expanded && (
        <Box marginTop={1}>
          <Text dimColor>Selected ref: {mockCanon.subCanon?.[selectedIndex]?.ref}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text dimColor>[↑ ↓] Navigate   [Enter] Toggle Preview   {showFracture ? "[F] Fracture Canon " : ""}[Q] Quit</Text>
      </Box>
    </Box>
  );
};

render(<App />);
