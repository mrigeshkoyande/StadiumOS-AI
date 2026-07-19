import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeroCinematic } from '../components/3d/HeroCinematic';

export const LandingView: React.FC = () => {
  const [showCinematic, setShowCinematic] = useState(() => {
    return !localStorage.getItem('stadiumos_intro_skipped');
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const handleSkipIntro = () => {
    localStorage.setItem('stadiumos_intro_skipped', 'true');
    setShowCinematic(false);
  };

  const handleEnterPlatform = () => {
    const userStr = localStorage.getItem('stadiumos_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Fan') navigate('/ticket');
      else if (user.role === 'Volunteer') navigate('/scanner');
      else navigate('/operations');
    } else {
      window.dispatchEvent(new CustomEvent('open-login-drawer'));
    }
  };

  const handleExploreDigitalTwin = () => {
    navigate('/operations');
  };

  // WebGL Shader for Architectural Stadium Background
  useEffect(() => {
    if (showCinematic || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec2 centeredUv = (uv - 0.5) * 2.0;
    centeredUv.x *= u_resolution.x / u_resolution.y;

    vec3 color = vec3(0.97, 0.98, 0.99);
    float d = length(centeredUv * vec2(0.6, 1.0));
    float bowl = smoothstep(0.8, 0.79, d);
    color = mix(color, vec3(1.0), bowl * 0.5);

    float paths = 0.0;
    for(float i = 0.0; i < 5.0; i++) {
        float speed = 0.2 + i * 0.1;
        float y = fract(uv.y + u_time * speed + i * 0.2);
        float line = smoothstep(0.01, 0.0, abs(uv.x - (0.2 + i * 0.15 + sin(uv.y * 5.0 + u_time) * 0.05)));
        paths += line * smoothstep(0.0, 0.1, y) * smoothstep(1.0, 0.9, y);
    }
    color = mix(color, vec3(0.078, 0.333, 0.85), paths * 0.15);

    float glow = 0.0;
    vec2 p1 = vec2(sin(u_time * 0.5) * 0.5, cos(u_time * 0.3) * 0.3);
    glow += 0.05 / length(centeredUv - p1);
    color += vec3(0.08, 0.33, 0.85) * glow * 0.1;

    gl_FragColor = vec4(color, 1.0);
}`;

    const webgl = gl;
    function compileShader(type: number, src: string) {
      if (!webgl) return null;
      const s = webgl.createShader(type)!;
      webgl.shaderSource(s, src);
      webgl.compileShader(s);
      return s;
    }

    const vsShader = compileShader(webgl.VERTEX_SHADER, vs);
    const fsShader = compileShader(webgl.FRAGMENT_SHADER, fs);
    if (!vsShader || !fsShader) return;

    const prog = webgl.createProgram()!;
    webgl.attachShader(prog, vsShader);
    webgl.attachShader(prog, fsShader);
    webgl.linkProgram(prog);
    webgl.useProgram(prog);

    const buf = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buf);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), webgl.STATIC_DRAW);

    const pos = webgl.getAttribLocation(prog, 'a_position');
    webgl.enableVertexAttribArray(pos);
    webgl.vertexAttribPointer(pos, 2, webgl.FLOAT, false, 0, 0);

    const uTime = webgl.getUniformLocation(prog, 'u_time');
    const uRes = webgl.getUniformLocation(prog, 'u_resolution');

    let animId: number;
    function render(t: number) {
      syncSize();
      if (!webgl) return;
      webgl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) webgl.uniform1f(uTime, t * 0.001);
      if (uRes) webgl.uniform2f(uRes, canvas.width, canvas.height);
      webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }
    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [showCinematic]);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans overflow-x-hidden">
      {/* 1. Cinematic Intro Layer */}
      {showCinematic && (
        <HeroCinematic onComplete={handleSkipIntro} onSkip={handleSkipIntro} />
      )}

      {/* 2. Top Navigation */}
      <nav className="fixed top-0 right-0 left-0 h-16 z-50 flex justify-between items-center px-6 md:px-10 bg-white/60 backdrop-blur-2xl border-b border-white/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#003fad] text-2xl font-bold">stadium</span>
          <span className="font-display text-xl font-bold text-[#003fad]">StadiumOS AI</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <button onClick={() => navigate('/')} className="text-[#003fad] font-bold border-b-2 border-[#003fad] pb-1 text-xs tracking-wider uppercase">Home</button>
          <button aria-label="More Options" className="text-[#4e5f7b] hover:text-[#003fad] transition-all text-xs tracking-wider uppercase" onClick={handleExploreDigitalTwin}>Operations</button>
          <button aria-label="Language Selector" onClick={() => navigate('/fan')} className="text-[#4e5f7b] hover:text-[#003fad] transition-all text-xs tracking-wider uppercase">Crowd Dynamics</button>
          <div className="h-6 w-px bg-slate-300"></div>
          <button 
          onClick={handleSkipIntro}
          aria-label="Skip Intro Animation"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#003fad] hover:text-[#1455d9] rounded-full text-xs font-bold backdrop-blur-md transition-all border border-[#003fad]/20"
        >    SKIP INTRO
          </button>
          <button onClick={handleEnterPlatform} className="px-5 py-2 bg-[#003fad] text-white rounded-xl text-xs font-bold tracking-wider hover:bg-[#1455d9] transition-colors shadow-sm">
            ACCESS PLATFORM
          </button>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <main className="relative min-h-screen pt-16">
        <div className="absolute inset-0 z-0">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10 min-h-[calc(100vh-64px)] flex flex-col justify-center items-start">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-panel rounded-full ai-pulse border border-[#003fad]/30">
              <span className="material-symbols-outlined text-[#003fad] text-sm">auto_awesome</span>
              <span className="text-xs font-bold text-[#003fad] tracking-wider uppercase">AI Cognitive Layer Active</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-[#191c1e] leading-none tracking-tight text-glow">
              THE INTELLIGENCE <br />
              <span className="text-[#003fad]">LAYER</span> OF THE <br />
              STADIUM
            </h1>

            <p className="text-lg text-[#4e5f7b] max-w-xl leading-relaxed">
              StadiumOS AI connects every fan, movement, operation, and decision in real time through a live high-fidelity digital twin environment.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={handleEnterPlatform}
                className="px-8 py-4 bg-[#003fad] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#003fad]/20 hover:scale-105 active:scale-95 transition-all"
              >
                ENTER STADIUMOS
              </button>
              <button 
                onClick={handleExploreDigitalTwin}
                className="px-8 py-4 glass-panel fresnel-edge text-[#003fad] rounded-xl font-bold text-lg hover:bg-white/60 transition-all"
              >
                EXPLORE DIGITAL TWIN
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* 4. Live Telemetry Metric Cards */}
      <section className="relative z-10 py-20 bg-white/60 backdrop-blur-md border-t border-white/40">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl fresnel-edge">
              <span className="text-xs font-bold text-[#4e5f7b] uppercase tracking-wider mb-2 block">Fans Connected</span>
              <div className="flex items-end gap-2">
                <span className="font-display text-3xl font-bold text-[#003fad]">72,840</span>
                <span className="text-xs font-bold text-[#005431] flex items-center">
                  <span className="material-symbols-outlined text-sm">trending_up</span> 94%
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#003fad] w-[94%]" />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl fresnel-edge">
              <span className="text-xs font-bold text-[#4e5f7b] uppercase tracking-wider mb-2 block">Avg Wait Time</span>
              <div className="flex items-end gap-2">
                <span className="font-display text-3xl font-bold text-[#003fad]">4.2 min</span>
                <span className="text-xs font-bold text-[#005431] flex items-center">
                  <span className="material-symbols-outlined text-sm">trending_down</span> -1.5m
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#005431] w-[88%]" />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl fresnel-edge">
              <span className="text-xs font-bold text-[#4e5f7b] uppercase tracking-wider mb-2 block">Active Incidents</span>
              <div className="flex items-end gap-2">
                <span className="font-display text-3xl font-bold text-[#ba1a1a]">0</span>
                <span className="text-xs font-bold text-[#005431]">ALL CLEAR</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#005431] w-[100%]" />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl fresnel-edge">
              <span className="text-xs font-bold text-[#4e5f7b] uppercase tracking-wider mb-2 block">AI Route Optimization</span>
              <div className="flex items-end gap-2">
                <span className="font-display text-3xl font-bold text-[#003fad]">98.2%</span>
                <span className="text-xs font-bold text-[#003fad]">OPTIMAL</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1455d9] w-[98%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white text-center text-xs text-[#4e5f7b]">
        <p>© 2026 FIFA World Cup StadiumOS AI. All rights reserved.</p>
      </footer>
    </div>
  );
};
