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
  description?: string;
  subCanon?: CanonSubEntry[];
};

const CanonExplorer = () => {
  const [pathStack, setPathStack] = useState([
    path.resolve(process.cwd(), 'canon/universes/ashara/development/index.json')
  ]);
  const [canon, setCanon] = useState(null as CanonNode | null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [exit, setExit] = useState(false);
  const [fracturing, setFracturing] = useState(false);
  const [newFolder, setNewFolder] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const currentPath = pathStack[pathStack.length - 1];
  const selected = useMemo(() => canon?.subCanon?.[selectedIndex], [canon, selectedIndex]);
  const canFracture = useMemo(() => currentPath.includes("catalyst"), [currentPath]);

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
    const newId = `timeline-${Date.now()}`;
    const newDir = path.resolve(process.cwd(), 'canon', 'universes', slug);

    const newEntry: CanonSubEntry = {
      type: "timeline",
      name: newName.trim(),
      ref: `../../universes/${slug}`
    };

    const updatedCanon = {
      ...canon,
      subCanon: [...(canon.subCanon || []), newEntry]
    };

    try {
      fs.writeFileSync(currentPath, JSON.stringify(updatedCanon, null, 2));
      setCanon(updatedCanon);
      if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });

      const newCanonPath = path.join(newDir, "index.json");
      const newCanonData = {
        id: newId,
        name: newName.trim(),
        fracturedFrom: canon.id,
        inheritsCanonFrom: canon.id,
        description: newDesc.trim(),
        subCanon: []
      };

      fs.writeFileSync(newCanonPath, JSON.stringify(newCanonData, null, 2));
      setFracturing(false);
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 2500);
      setNewName('');
      setNewDesc('');
    } catch (err) {
      console.error('Failed to fracture canon:', err);
    }
  };

  const finalizeNewFolder = () => {
    if (!canon || !newName.trim()) return;

    const slug = slugify(newName);
    const newId = `${slug}-${Date.now()}`;
    const newEntry: CanonSubEntry = {
      type: "stage",
      name: newName.trim(),
      ref: slug
    };

    const updatedCanon = {
      ...canon,
      subCanon: [...(canon.subCanon || []), newEntry]
    };

    const folderPath = path.resolve(path.dirname(currentPath), slug);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    const subIndex = {
      id: newId,
      name: newName.trim(),
      description: newDesc.trim(),
      subCanon: []
    };

    fs.writeFileSync(path.join(folderPath, "index.json"), JSON.stringify(subIndex, null, 2));
    fs.writeFileSync(currentPath, JSON.stringify(updatedCanon, null, 2));
    setCanon(updatedCanon);
    setNewFolder(false);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2500);
    setNewName('');
    setNewDesc('');
  };

  useInput((input, key) => {
    if (!canon || exit || confirmed) return;
    if (fracturing || newFolder) return;

    const subCount = canon.subCanon?.length || 0;

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
    } else if (input === 'n' || input === 'N') {
      setNewFolder(true);
    } else if (input === 'b' || input === 'B') {
      if (pathStack.length > 1) {
        const newStack = [...pathStack];
        newStack.pop();
        setPathStack(newStack);
        setSelectedIndex(0);
      }
    } else if (input === 'q' || input === 'Q') {
      setExit(true);
    }
  });

  if (exit) {
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
      {(fracturing || newFolder) && (
        <Box flexDirection="column" marginTop={1}>
          <Text>{fracturing ? "🧬 New Timeline Name:" : "📁 New Folder Name:"}</Text>
          <TextInput value={newName} onChange={setNewName} onSubmit={() => {}} />
          <Text>📝 Description:</Text>
          <TextInput value={newDesc} onChange={setNewDesc} onSubmit={fracturing ? finalizeFracture : finalizeNewFolder} />
        </Box>
      )}
      {confirmed && (
        <Box marginTop={1}>
          <Text color="cyan">✅ Created: {newName}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text dimColor>[↑ ↓] Navigate   [Enter] Enter   [N] New Folder   {canFracture ? "[F] Fracture Canon   " : ""}[B] Back   [Q] Quit</Text>
      </Box>
    </Box>
  );
};

render(<CanonExplorer />);
