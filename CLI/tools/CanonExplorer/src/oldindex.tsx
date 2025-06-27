import React, { useState, useEffect, useMemo } from 'react';
import { render, Box, Text, useInput, Newline } from 'ink';
import TextInput from 'ink-text-input';
import fs from 'fs';
import path from 'path';

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

const CanonExplorer = () => {
  const [pathStack, setPathStack] = useState([
    path.resolve(process.cwd(), 'canon/universes/ashara/index.json')
  ]);
  const [canon, setCanon] = useState<CanonNode | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [exit, setExit] = useState(false);
  const [fracturing, setFracturing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const selected = useMemo(() => canon?.subCanon?.[selectedIndex], [canon, selectedIndex]);
  const canFracture = useMemo(() => selected?.type === 'event', [selected]);

  const currentPath = pathStack[pathStack.length - 1];

  useEffect(() => {
    if (!currentPath) return;
    try {
      const data = fs.readFileSync(currentPath, 'utf8');
      setCanon(JSON.parse(data));
    } catch (err) {
      console.error('Failed to load canon:', err);
      setCanon(null);
    }
  }, [currentPath]);

  const slugify = (name: string) =>
    name.trim().toLowerCase().replace(/[^a-z0-9\-_]+/g, '-');

  const finalizeFracture = () => {
    if (!canon || !newName.trim()) return;

    const slug = slugify(newName);
    const newId = `universe-${Date.now()}`;
    const newEntry: CanonSubEntry = {
      type: "universe",
      name: newName.trim(),
      ref: slug
    };

    const updatedCanon = {
      ...canon,
      subCanon: [...(canon.subCanon || []), newEntry]
    };

    try {
      fs.writeFileSync(currentPath, JSON.stringify(updatedCanon, null, 2));
      setCanon(updatedCanon);

      // Place new universe in the same directory as current canon, not nested under selected?.ref
      const newDir = path.resolve(path.dirname(currentPath), slug);
      if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });

      const newCanonPath = path.join(newDir, "index.json");
      const newCanonData = {
        id: newId,
        name: newName.trim(),
        genre: canon.genre,
        fracturedFrom: canon.id,
        inheritsCanonFrom: canon.id,
        description: newDesc.trim(),
        regions: [],
        factions: [],
        timelines: [],
        subCanon: []
      };

      fs.writeFileSync(newCanonPath, JSON.stringify(newCanonData, null, 2));
      setFracturing(false);
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 2500);
      setNewName('');
      setNewDesc('');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fracture canon:', err);
    }
  };

  useInput((input, key) => {
    if (!canon || exit || confirmed) return;
    const subCount = canon.subCanon?.length || 0;

    if (fracturing) {
      // Let TextInput handle input during fracturing
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(prev + 1, subCount - 1));
    } else if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (key.return) {
      const ref = canon.subCanon?.[selectedIndex]?.ref;
      if (ref) {
        const nextPath = path.resolve(path.dirname(currentPath), ref, "index.json");
        if (fs.existsSync(nextPath)) {
          setPathStack([...pathStack, nextPath]);
          setSelectedIndex(0);
        }
      }
    } else if (input === 'f' || input === 'F') {
      if (canFracture) setFracturing(true);
    } else if (input === 'q' || input === 'Q') {
      setExit(true);
    } else if (input === 'b' || input === 'B') {
      if (pathStack.length > 1) {
        const newStack = [...pathStack];
        newStack.pop();
        setPathStack(newStack);
        setSelectedIndex(0);
      }
    }
  });

  if (exit) {
    // Use setTimeout to allow Ink to clean up before exit
    setTimeout(() => process.exit(0), 100);
    return <Text>Exiting...</Text>;
  }

  if (!canon) return <Text>Loading canon data...</Text>;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
      <Text>📂 {canon.name}</Text>
      <Text dimColor>{canon.description}</Text>
      <Newline />
      {canon.subCanon?.length ? <Text>📚 Sub-Canon Branches:</Text> : <Text dimColor>No subcanon entries</Text>}
      {canon.subCanon?.map((entry, index) => (
        <Text color={index === selectedIndex ? "green" : undefined}>
          {index === selectedIndex ? "👉 " : "   "}
          {entry.type}: {entry.name}
        </Text>
      ))}
      {expanded && selected && (
        <Box marginTop={1}>
          <Text dimColor>Selected: {selected.ref}</Text>
        </Box>
      )}
      {fracturing && (
        <Box flexDirection="column" marginTop={1}>
          <Text>🧬 Fracturing Canon... Enter new universe name:</Text>
          <TextInput value={newName} onChange={setNewName} onSubmit={() => {}} />
          <Text>📝 Description (press Enter to save):</Text>
          <TextInput value={newDesc} onChange={setNewDesc} onSubmit={finalizeFracture} />
        </Box>
      )}
      {confirmed && (
        <Box marginTop={1}>
          <Text color="cyan">✅ Fractured new universe: {newName}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text dimColor>
          [↑ ↓] Navigate   [Enter] Enter   {canFracture ? "[F] Fracture Canon   " : ""}[B] Back   [Q] Quit
        </Text>
      </Box>
    </Box>
  );
};

render(<CanonExplorer />);
