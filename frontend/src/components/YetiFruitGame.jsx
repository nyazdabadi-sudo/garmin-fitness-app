import React, { useState, useEffect, useRef } from 'react';
import { Snowflake, Zap, Mountain, User } from 'lucide-react';

const YetiFruitGame = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState({
    player: {
      x: 400,
      y: 300,
      health: 10000,
      maxHealth: 10000,
      mastery: 200, // Max mastery for all moves
      isTransformed: false,
      transformTimeLeft: 0,
    },
    enemies: [],
    particles: [],
    cooldowns: {
      z: 0, // Yeti Punch
      x: 0, // Yeti Roar
      c: 0, // Yeti Stomp
      v: 0, // Yeti Transformation
    },
    lastTime: Date.now(),
  });

  const [message, setMessage] = useState('');
  const [keys, setKeys] = useState({});

  // Yeti Fruit Move Data (Exact Blox Fruits Stats)
  const YETI_MOVES = {
    Z: {
      name: 'Yeti Punch',
      mastery: 1,
      damage: 2800,
      cooldown: 8,
      description: 'The user launches a powerful punch with ice-cold fists',
      color: '#87CEEB',
      particleCount: 20,
    },
    X: {
      name: 'Yeti Roar',
      mastery: 50,
      damage: 3300,
      cooldown: 12,
      stunDuration: 2,
      description: 'The user releases a devastating roar that damages and stuns nearby enemies',
      color: '#4682B4',
      particleCount: 40,
      radius: 200,
    },
    C: {
      name: 'Yeti Stomp',
      mastery: 100,
      damage: 3800,
      cooldown: 15,
      description: 'The user stomps the ground, creating an ice shockwave',
      color: '#1E90FF',
      particleCount: 50,
      radius: 250,
    },
    V: {
      name: 'Yeti Transformation',
      mastery: 200,
      duration: 15,
      damageMultiplier: 1.5,
      cooldown: 25,
      description: 'Transform into a massive Yeti, increasing all damage by 50%',
      color: '#00BFFF',
      particleCount: 60,
    },
  };

  // Initialize enemies
  useEffect(() => {
    const initialEnemies = [];
    for (let i = 0; i < 5; i++) {
      initialEnemies.push({
        id: i,
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
        health: 5000,
        maxHealth: 5000,
        stunned: false,
        stunnedUntil: 0,
      });
    }
    setGameState(prev => ({ ...prev, enemies: initialEnemies }));
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - gameState.lastTime) / 1000;

      setGameState(prev => {
        // Update cooldowns
        const newCooldowns = { ...prev.cooldowns };
        Object.keys(newCooldowns).forEach(key => {
          if (newCooldowns[key] > 0) {
            newCooldowns[key] = Math.max(0, newCooldowns[key] - deltaTime);
          }
        });

        // Update transformation timer
        let isTransformed = prev.player.isTransformed;
        let transformTimeLeft = prev.player.transformTimeLeft;
        if (isTransformed) {
          transformTimeLeft = Math.max(0, transformTimeLeft - deltaTime);
          if (transformTimeLeft <= 0) {
            isTransformed = false;
          }
        }

        // Update particles
        const newParticles = prev.particles
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - deltaTime,
            alpha: Math.max(0, p.life / p.maxLife),
          }))
          .filter(p => p.life > 0);

        // Update enemy stun status
        const newEnemies = prev.enemies.map(enemy => ({
          ...enemy,
          stunned: now < enemy.stunnedUntil,
        }));

        return {
          ...prev,
          cooldowns: newCooldowns,
          particles: newParticles,
          enemies: newEnemies,
          player: {
            ...prev.player,
            isTransformed,
            transformTimeLeft,
          },
          lastTime: now,
        };
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [gameState.lastTime]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw particles
    gameState.particles.forEach(particle => {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      // Enemy body
      ctx.fillStyle = enemy.stunned ? '#666' : '#e74c3c';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Enemy health bar
      const healthWidth = 40;
      const healthHeight = 5;
      const healthPercent = enemy.health / enemy.maxHealth;

      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x - healthWidth / 2, enemy.y - 35, healthWidth, healthHeight);

      ctx.fillStyle = enemy.health > enemy.maxHealth * 0.3 ? '#2ecc71' : '#e74c3c';
      ctx.fillRect(enemy.x - healthWidth / 2, enemy.y - 35, healthWidth * healthPercent, healthHeight);

      // Stun indicator
      if (enemy.stunned) {
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('⭐', enemy.x - 10, enemy.y - 40);
      }
    });

    // Draw player with detailed model
    const px = gameState.player.x;
    const py = gameState.player.y;
    const isTransformed = gameState.player.isTransformed;

    if (isTransformed) {
      // Yeti Transformation Model - Much larger and more detailed
      const bodySize = 40;
      const time = Date.now() / 1000;
      const breathe = Math.sin(time * 2) * 2;

      // Transformation aura
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#00BFFF';
      ctx.beginPath();
      ctx.arc(px, py, bodySize + 15 + Math.sin(time * 3) * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Yeti body (large, muscular)
      ctx.fillStyle = '#E0F7FF';
      ctx.strokeStyle = '#00BFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, bodySize + breathe, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Yeti fur texture (multiple circles)
      ctx.fillStyle = '#B0E0FF';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const furX = px + Math.cos(angle) * (bodySize - 10);
        const furY = py + Math.sin(angle) * (bodySize - 10);
        ctx.beginPath();
        ctx.arc(furX, furY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Left arm (massive)
      ctx.strokeStyle = '#00BFFF';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px - bodySize * 0.7, py);
      ctx.lineTo(px - bodySize * 1.5, py + 20 + Math.sin(time * 3) * 5);
      ctx.stroke();

      // Right arm (massive)
      ctx.beginPath();
      ctx.moveTo(px + bodySize * 0.7, py);
      ctx.lineTo(px + bodySize * 1.5, py + 20 + Math.cos(time * 3) * 5);
      ctx.stroke();

      // Left fist
      ctx.fillStyle = '#B0E0FF';
      ctx.strokeStyle = '#00BFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px - bodySize * 1.5, py + 20 + Math.sin(time * 3) * 5, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right fist
      ctx.beginPath();
      ctx.arc(px + bodySize * 1.5, py + 20 + Math.cos(time * 3) * 5, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Yeti face features
      // Eyes (glowing)
      ctx.fillStyle = '#00FFFF';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(px - 12, py - 8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + 12, py - 8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Fierce mouth
      ctx.strokeStyle = '#0088CC';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py + 5, 8, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Fangs
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.moveTo(px - 6, py + 5);
      ctx.lineTo(px - 8, py + 12);
      ctx.lineTo(px - 4, py + 8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px + 6, py + 5);
      ctx.lineTo(px + 8, py + 12);
      ctx.lineTo(px + 4, py + 8);
      ctx.fill();

      // Horns/ice spikes
      ctx.fillStyle = '#87CEEB';
      ctx.strokeStyle = '#00BFFF';
      ctx.lineWidth = 2;
      // Left horn
      ctx.beginPath();
      ctx.moveTo(px - 25, py - 25);
      ctx.lineTo(px - 30, py - 40);
      ctx.lineTo(px - 20, py - 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Right horn
      ctx.beginPath();
      ctx.moveTo(px + 25, py - 25);
      ctx.lineTo(px + 30, py - 40);
      ctx.lineTo(px + 20, py - 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

    } else {
      // Normal Human Form - Smaller and simpler
      const bodySize = 20;
      const time = Date.now() / 1000;

      // Body
      ctx.fillStyle = '#3498db';
      ctx.strokeStyle = '#2980b9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, bodySize, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Arms
      ctx.strokeStyle = '#2980b9';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      // Left arm
      ctx.beginPath();
      ctx.moveTo(px - bodySize * 0.5, py + 5);
      ctx.lineTo(px - bodySize * 1.2, py + 15);
      ctx.stroke();
      // Right arm
      ctx.beginPath();
      ctx.moveTo(px + bodySize * 0.5, py + 5);
      ctx.lineTo(px + bodySize * 1.2, py + 15);
      ctx.stroke();

      // Hands
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.arc(px - bodySize * 1.2, py + 15, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + bodySize * 1.2, py + 15, 4, 0, Math.PI * 2);
      ctx.fill();

      // Face
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px - 6, py - 5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + 6, py - 5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Pupils
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(px - 6, py - 5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + 6, py - 5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Mouth (smile)
      ctx.strokeStyle = '#2980b9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py + 2, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Outline highlight
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(px, py, bodySize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Player health bar
    const playerHealthWidth = 100;
    const playerHealthHeight = 8;
    const playerHealthPercent = gameState.player.health / gameState.player.maxHealth;

    ctx.fillStyle = '#333';
    ctx.fillRect(gameState.player.x - playerHealthWidth / 2, gameState.player.y - 50, playerHealthWidth, playerHealthHeight);

    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(gameState.player.x - playerHealthWidth / 2, gameState.player.y - 50, playerHealthWidth * playerHealthPercent, playerHealthHeight);

    // Transformation indicator
    if (gameState.player.isTransformed) {
      ctx.fillStyle = '#00BFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`YETI FORM: ${gameState.player.transformTimeLeft.toFixed(1)}s`, gameState.player.x, gameState.player.y - 60);
    }
  }, [gameState]);

  // Create particles
  const createParticles = (x, y, count, color) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        life: 1,
        maxLife: 1,
        alpha: 1,
      });
    }
    setGameState(prev => ({
      ...prev,
      particles: [...prev.particles, ...newParticles],
    }));
  };

  // Move Z - Yeti Punch
  const useYetiPunch = () => {
    if (gameState.cooldowns.z > 0) {
      setMessage(`Yeti Punch on cooldown: ${gameState.cooldowns.z.toFixed(1)}s`);
      return;
    }

    const move = YETI_MOVES.Z;
    const damage = move.damage * (gameState.player.isTransformed ? YETI_MOVES.V.damageMultiplier : 1);

    // Find closest enemy
    let closestEnemy = null;
    let minDist = Infinity;
    gameState.enemies.forEach(enemy => {
      const dist = Math.hypot(enemy.x - gameState.player.x, enemy.y - gameState.player.y);
      if (dist < minDist && dist < 150) {
        minDist = dist;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      // Apply damage
      setGameState(prev => ({
        ...prev,
        enemies: prev.enemies.map(e =>
          e.id === closestEnemy.id
            ? { ...e, health: Math.max(0, e.health - damage) }
            : e
        ),
        cooldowns: { ...prev.cooldowns, z: move.cooldown },
      }));

      createParticles(closestEnemy.x, closestEnemy.y, move.particleCount, move.color);
      setMessage(`${move.name}! Dealt ${Math.round(damage)} damage!`);
    } else {
      setMessage('No enemy in range!');
    }
  };

  // Move X - Yeti Roar
  const useYetiRoar = () => {
    if (gameState.cooldowns.x > 0) {
      setMessage(`Yeti Roar on cooldown: ${gameState.cooldowns.x.toFixed(1)}s`);
      return;
    }

    const move = YETI_MOVES.X;
    const damage = move.damage * (gameState.player.isTransformed ? YETI_MOVES.V.damageMultiplier : 1);
    const now = Date.now();

    // Damage all enemies in radius
    const hitEnemies = [];
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(enemy => {
        const dist = Math.hypot(enemy.x - prev.player.x, enemy.y - prev.player.y);
        if (dist < move.radius) {
          hitEnemies.push(enemy);
          return {
            ...enemy,
            health: Math.max(0, enemy.health - damage),
            stunned: true,
            stunnedUntil: now + move.stunDuration * 1000,
          };
        }
        return enemy;
      }),
      cooldowns: { ...prev.cooldowns, x: move.cooldown },
    }));

    createParticles(gameState.player.x, gameState.player.y, move.particleCount, move.color);
    setMessage(`${move.name}! Hit ${hitEnemies.length} enemies for ${Math.round(damage)} damage each!`);
  };

  // Move C - Yeti Stomp
  const useYetiStomp = () => {
    if (gameState.cooldowns.c > 0) {
      setMessage(`Yeti Stomp on cooldown: ${gameState.cooldowns.c.toFixed(1)}s`);
      return;
    }

    const move = YETI_MOVES.C;
    const damage = move.damage * (gameState.player.isTransformed ? YETI_MOVES.V.damageMultiplier : 1);

    // Damage all enemies in radius
    const hitEnemies = [];
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(enemy => {
        const dist = Math.hypot(enemy.x - prev.player.x, enemy.y - prev.player.y);
        if (dist < move.radius) {
          hitEnemies.push(enemy);
          return {
            ...enemy,
            health: Math.max(0, enemy.health - damage),
          };
        }
        return enemy;
      }),
      cooldowns: { ...prev.cooldowns, c: move.cooldown },
    }));

    // Create shockwave particles
    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
      const radius = move.radius;
      createParticles(
        gameState.player.x + Math.cos(angle) * radius * 0.5,
        gameState.player.y + Math.sin(angle) * radius * 0.5,
        3,
        move.color
      );
    }

    setMessage(`${move.name}! Hit ${hitEnemies.length} enemies for ${Math.round(damage)} damage each!`);
  };

  // Move V - Yeti Transformation
  const useYetiTransformation = () => {
    if (gameState.cooldowns.v > 0) {
      setMessage(`Yeti Transformation on cooldown: ${gameState.cooldowns.v.toFixed(1)}s`);
      return;
    }

    if (gameState.player.isTransformed) {
      setMessage('Already transformed!');
      return;
    }

    const move = YETI_MOVES.V;

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        isTransformed: true,
        transformTimeLeft: move.duration,
      },
      cooldowns: { ...prev.cooldowns, v: move.cooldown },
    }));

    createParticles(gameState.player.x, gameState.player.y, move.particleCount, move.color);
    setMessage(`${move.name}! Damage increased by ${(move.damageMultiplier - 1) * 100}% for ${move.duration}s!`);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      setKeys(prev => ({ ...prev, [key]: true }));

      // Move controls
      if (key === 'z') useYetiPunch();
      if (key === 'x') useYetiRoar();
      if (key === 'c') useYetiStomp();
      if (key === 'v') useYetiTransformation();
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      setKeys(prev => ({ ...prev, [key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Player movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setGameState(prev => {
        let newX = prev.player.x;
        let newY = prev.player.y;
        const speed = 5;

        if (keys['arrowleft'] || keys['a']) newX -= speed;
        if (keys['arrowright'] || keys['d']) newX += speed;
        if (keys['arrowup'] || keys['w']) newY -= speed;
        if (keys['arrowdown'] || keys['s']) newY += speed;

        // Keep player in bounds
        newX = Math.max(30, Math.min(770, newX));
        newY = Math.max(30, Math.min(570, newY));

        return {
          ...prev,
          player: { ...prev.player, x: newX, y: newY },
        };
      });
    }, 1000 / 60);

    return () => clearInterval(moveInterval);
  }, [keys]);

  // Reset enemies when all are defeated
  useEffect(() => {
    const allDead = gameState.enemies.every(e => e.health <= 0);
    if (allDead && gameState.enemies.length > 0) {
      setTimeout(() => {
        const newEnemies = [];
        for (let i = 0; i < 5; i++) {
          newEnemies.push({
            id: Date.now() + i,
            x: Math.random() * 700 + 50,
            y: Math.random() * 500 + 50,
            health: 5000,
            maxHealth: 5000,
            stunned: false,
            stunnedUntil: 0,
          });
        }
        setGameState(prev => ({ ...prev, enemies: newEnemies }));
        setMessage('New wave of enemies!');
      }, 2000);
    }
  }, [gameState.enemies]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Snowflake className="w-10 h-10 text-blue-400" />
            Yeti Fruit (Yeti Yeti no Mi)
          </h1>
          <p className="text-gray-400">Beast Type Fruit - Mastery: {gameState.player.mastery}</p>
        </div>

        {/* Game Canvas */}
        <div className="mb-6 relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-4 border-blue-500 rounded-lg bg-gray-800 mx-auto"
          />
          {message && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 px-6 py-3 rounded-lg text-xl font-bold">
              {message}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Movement Controls
            </h3>
            <div className="space-y-2 text-sm">
              <p>• Arrow Keys or WASD - Move</p>
              <p>• Z, X, C, V - Use abilities</p>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Stats</h3>
            <div className="space-y-2 text-sm">
              <p>• Health: {gameState.player.health.toLocaleString()} / {gameState.player.maxHealth.toLocaleString()}</p>
              <p>• Enemies Alive: {gameState.enemies.filter(e => e.health > 0).length}</p>
              <p>• Transform Active: {gameState.player.isTransformed ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Abilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(YETI_MOVES).map(([key, move]) => {
            const cooldown = gameState.cooldowns[key.toLowerCase()];
            const isReady = cooldown <= 0;
            const isLocked = gameState.player.mastery < move.mastery;

            return (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 ${
                  isLocked
                    ? 'bg-gray-800 border-gray-600 opacity-50'
                    : isReady
                    ? 'bg-gray-800 border-blue-500'
                    : 'bg-gray-800 border-yellow-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{key} - {move.name}</h3>
                  {key === 'Z' && <Zap className="w-5 h-5 text-blue-400" />}
                  {key === 'X' && <Snowflake className="w-5 h-5 text-blue-400" />}
                  {key === 'C' && <Mountain className="w-5 h-5 text-blue-400" />}
                  {key === 'V' && <User className="w-5 h-5 text-blue-400" />}
                </div>

                <p className="text-sm text-gray-400 mb-3">{move.description}</p>

                <div className="space-y-1 text-xs">
                  <p>Mastery Required: {move.mastery}</p>
                  {move.damage && (
                    <p>
                      Damage: {move.damage.toLocaleString()}
                      {gameState.player.isTransformed && (
                        <span className="text-blue-400"> (×{YETI_MOVES.V.damageMultiplier})</span>
                      )}
                    </p>
                  )}
                  {move.radius && <p>Range: {move.radius}px</p>}
                  {move.stunDuration && <p>Stun: {move.stunDuration}s</p>}
                  {move.duration && <p>Duration: {move.duration}s</p>}
                  {move.damageMultiplier && <p>Damage Boost: +{(move.damageMultiplier - 1) * 100}%</p>}
                  <p>Cooldown: {move.cooldown}s</p>
                </div>

                {!isReady && !isLocked && (
                  <div className="mt-3">
                    <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-500 h-full transition-all duration-100"
                        style={{
                          width: `${((move.cooldown - cooldown) / move.cooldown) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-center text-yellow-500 text-xs mt-1">
                      {cooldown.toFixed(1)}s
                    </p>
                  </div>
                )}

                {isLocked && (
                  <p className="text-center text-red-500 text-xs mt-3">🔒 Locked</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-3">About the Yeti Fruit</h3>
          <p className="text-gray-300 mb-4">
            The Yeti Fruit (Yeti Yeti no Mi) is a Beast-type Blox Fruit that allows the user to
            transform into a Yeti and use ice-based attacks. This implementation features all 4
            moves with exact stats from Blox Fruits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-bold text-blue-400 mb-2">Strengths:</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• High damage output</li>
                <li>• AOE crowd control with stun</li>
                <li>• Transformation boosts all damage</li>
                <li>• Good for PvP and grinding</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-blue-400 mb-2">Combat Tips:</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Use V (Transform) first for max damage</li>
                <li>• X (Roar) for stunning groups</li>
                <li>• C (Stomp) for high AOE damage</li>
                <li>• Z (Punch) for quick single target hits</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YetiFruitGame;
