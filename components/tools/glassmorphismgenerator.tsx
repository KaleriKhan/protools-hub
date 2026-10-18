"use client";

import React, { useState } from "react";
import { 
  Sparkles, Copy, Check, Sliders, Code, Zap, ShieldCheck, 
  Layers, ChevronRight, Box, Type, Palette, Grid, Cpu, Compass, Layout 
} from "lucide-react";

export default function GlassmorphismGenerator() {
  const [activeTool, setActiveTool] = useState("glassmorphism");
  const [copiedCss, setCopiedCss] = useState(false);

  // 1. Glassmorphism States
  const [opacity, setOpacity] = useState(25);
  const [blur, setBlur] = useState(12);
  const [borderRadius, setBorderRadius] = useState(16);
  const [saturation, setSaturation] = useState(180);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [borderOpacity, setBorderOpacity] = useState(30);
  const [isDarkCard, setIsDarkCard] = useState(false);

  // 2. Box Shadow States
  const [boxX, setBoxX] = useState(0);
  const [boxY, setBoxY] = useState(20);
  const [boxBlur, setBoxBlur] = useState(25);
  const [boxSpread, setBoxSpread] = useState(-5);
  const [boxRadius, setBoxRadius] = useState(16);

  // 3. Gradient Generator States
  const [gradColor1, setGradColor1] = useState("#3b82f6");
  const [gradColor2, setGradColor2] = useState("#9333ea");
  const [gradAngle, setGradAngle] = useState(135);

  // 4. Glitch Text States
  const [glitchText, setGlitchText] = useState("Glitch Text");
  const [glitchSize, setGlitchSize] = useState(50);
  const [glitchColor, setGlitchColor] = useState("#ffffff");
  const [glitchC1, setGlitchC1] = useState("#00ffff");
  const [glitchC2, setGlitchC2] = useState("#ff00ff");

  // 5. Border Radius States
  const [brTL, setBrTL] = useState(20);
  const [brTR, setBrTR] = useState(20);
  const [brBR, setBrBR] = useState(20);
  const [brBL, setBrBL] = useState(20);

  // 6. Button Generator States
  const [btnText, setBtnText] = useState("Click Me");
  const [btnBg, setBtnBg] = useState("#3b82f6");
  const [btnTextColor, setBtnTextColor] = useState("#ffffff");
  const [btnRadius, setBtnRadius] = useState(12);
  const [btnPaddingX, setBtnPaddingX] = useState(24);
  const [btnPaddingY, setBtnPaddingY] = useState(12);

  // 7. Accordion States
  const [accBorder, setAccBorder] = useState(1);
  const [accRadius, setAccRadius] = useState(8);
  const [accBg, setAccBg] = useState("#ffffff");

  // 8. Animated Text States
  const [animText, setAnimText] = useState("Awesome Animation");
  const [animSpeed, setAnimSpeed] = useState(2);

  // 9. Keyframes States
  const [kfName, setKfName] = useState("bounce");
  const [kfDuration, setKfDuration] = useState(1);

  // 10. Border Image States
  const [borderImgWidth, setBorderImgWidth] = useState(10);

  // 11. Checkbox States
  const [chkColor, setChkColor] = useState("#3b82f6");
  const [chkSize, setChkSize] = useState(20);

  // 12. Clip Path States
  const [clipShape, setClipShape] = useState("polygon(50% 0%, 100% 100%, 0% 100%)");

  // 13. Color Variable States
  const [cssVarName, setCssVarName] = useState("primary-color");
  const [cssVarVal, setCssVarVal] = useState("#3b82f6");

  // 14. Column States
  const [colCount, setColCount] = useState(3);
  const [colGap, setColGap] = useState(20);

  // 15. Cubic Bezier States
  const [cubicVal, setCubicVal] = useState("cubic-bezier(0.25, 0.1, 0.25, 1)");

  // 16. Dark Mode States
  const [darkBg, setDarkBg] = useState("#0f172a");
  const [darkText, setDarkText] = useState("#f8fafc");

  // 17. Flexbox States
  const [flexJustify, setFlexJustify] = useState("center");
  const [flexAlign, setFlexAlign] = useState("center");

  // 18. Google Fonts CSS States
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontWeight, setFontWeight] = useState(600);

  // 19. Gradient Border States
  const [gbWidth, setGbWidth] = useState(4);
  const [gbColor1, setGbColor1] = useState("#3b82f6");
  const [gbColor2, setGbColor2] = useState("#ec4899");

  // All 19 Tools List
  const cssPortalCategories = [
    {
      category: "CSS GENERATORS",
      tools: [
        { id: "accordion", name: "Accordion Generator", icon: Layout },
        { id: "animatedtext", name: "Animated Text Generator", icon: Type },
        { id: "keyframes", name: "Animation / Keyframe Generator", icon: Cpu },
        { id: "borderimage", name: "Border Image Generator", icon: Grid },
        { id: "borderradius", name: "Border Radius Generator", icon: Grid },
        { id: "boxshadow", name: "Box Shadow Generator", icon: Box },
        { id: "button", name: "Button Generator", icon: Compass },
        { id: "checkbox", name: "Checkbox / Radio Generator", icon: Layers },
        { id: "clippath", name: "Clip Path Generator", icon: Grid },
        { id: "colorvariable", name: "Color Variable Generator", icon: Palette },
        { id: "column", name: "Column Generator", icon: Layout },
        { id: "cubicbezier", name: "Cubic Bezier Generator", icon: Sliders },
        { id: "darkmode", name: "Dark Mode Generator", icon: Sparkles },
        { id: "flexbox", name: "Flexbox Generator", icon: Layout },
        { id: "glassmorphism", name: "Glassmorphism Generator", icon: Layers },
        { id: "glitch", name: "Glitch Text Effect", icon: Type },
        { id: "googlefonts", name: "Google Fonts CSS", icon: Type },
        { id: "gradient", name: "Gradient Generator", icon: Palette },
        { id: "gradientborder", name: "Gradient Border Generator", icon: Palette },
      ],
    },
  ];

  const hexToRgba = (hex: string) => {
    let c = hex.replace("#", "");
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    const num = parseInt(c, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  };

  const cardBg = isDarkCard
    ? `rgba(15, 23, 42, ${opacity / 100})`
    : `rgba(255, 255, 255, ${opacity / 100})`;

  const borderRgba = `rgba(${hexToRgba(borderColor)}, ${borderOpacity / 100})`;

  // Dynamic Code Generation for ALL tools
  const getGeneratedCss = () => {
    switch (activeTool) {
      case "glassmorphism":
        return `background: ${cardBg};\nbackdrop-filter: blur(${blur}px) saturate(${saturation}%);\n-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);\nborder-radius: ${borderRadius}px;\nborder: 1px solid ${borderRgba};`;
      case "boxshadow":
        return `box-shadow: ${boxX}px ${boxY}px ${boxBlur}px ${boxSpread}px rgba(0, 0, 0, 0.3);\nborder-radius: ${boxRadius}px;\nbackground: #ffffff;`;
      case "gradient":
        return `background: linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2});`;
      case "glitch":
        return `font-size: ${glitchSize}px;\nfont-weight: 900;\ncolor: ${glitchColor};\ntext-shadow: 2px 0 ${glitchC1}, -2px 0 ${glitchC2};`;
      case "borderradius":
        return `border-radius: ${brTL}px ${brTR}px ${brBR}px ${brBL}px;`;
      case "button":
        return `background-color: ${btnBg};\ncolor: ${btnTextColor};\nborder-radius: ${btnRadius}px;\npadding: ${btnPaddingY}px ${btnPaddingX}px;\nfont-weight: 600;\nborder: none;\ncursor: pointer;`;
      case "accordion":
        return `border-width: ${accBorder}px;\nborder-style: solid;\nborder-color: #e2e8f0;\nborder-radius: ${accRadius}px;\nbackground-color: ${accBg};\npadding: 16px;\nbox-shadow: 0 2px 4px rgba(0,0,0,0.05);`;
      case "animatedtext":
        return `animation: fadeInOut ${animSpeed}s ease-in-out infinite;\nfont-size: 24px;\nfont-weight: bold;`;
      case "keyframes":
        return `@keyframes ${kfName} {\n  0% { transform: scale(1); }\n  50% { transform: scale(1.1); }\n  100% { transform: scale(1); }\n}\nanimation: ${kfName} ${kfDuration}s infinite;`;
      case "borderimage":
        return `border-width: ${borderImgWidth}px;\nborder-style: solid;\nborder-color: transparent;\nborder-image: linear-gradient(to right, #3b82f6, #9333ea) 1;`;
      case "checkbox":
        return `accent-color: ${chkColor};\nwidth: ${chkSize}px;\nheight: ${chkSize}px;\ncursor: pointer;`;
      case "clippath":
        return `clip-path: ${clipShape};\nbackground: #3b82f6;\nwidth: 150px;\nheight: 150px;`;
      case "colorvariable":
        return `:root {\n  --${cssVarName}: ${cssVarVal};\n}\n.element {\n  background-color: var(--${cssVarName});\n}`;
      case "column":
        return `column-count: ${colCount};\ncolumn-gap: ${colGap}px;`;
      case "cubicbezier":
        return `transition: all 0.3s ${cubicVal};`;
      case "darkmode":
        return `background-color: ${darkBg};\ncolor: ${darkText};\ntransition: background-color 0.3s ease;`;
      case "flexbox":
        return `display: flex;\njustify-content: ${flexJustify};\nalign-items: ${flexAlign};\ngap: 16px;`;
      case "googlefonts":
        return `@import url('https://fonts.googleapis.com/css2?family=${fontFamily.replace(" ", "+")}:wght@${fontWeight}&display=swap');\n\nbody {\n  font-family: '${fontFamily}', sans-serif;\n  font-weight: ${fontWeight};\n}`;
      case "gradientborder":
        return `border-width: ${gbWidth}px;\nborder-style: solid;\nborder-color: transparent;\nborder-radius: 16px;\nbackground: linear-gradient(#fff, #fff) padding-box,\n            linear-gradient(135deg, ${gbColor1}, ${gbColor2}) border-box;`;
      default:
        return `/* CSS Code for ${activeTool} */`;
    }
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(getGeneratedCss());
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const currentToolObj = cssPortalCategories[0].tools.find((t) => t.id === activeTool);

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar (CSS Portal Style Long Navigation) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 sticky top-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 rounded-2xl">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>Categories</span>
            </div>

            <div className="space-y-6">
              {cssPortalCategories.map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                    {group.category}
                  </h3>
                  <div className="space-y-1">
                    {group.tools.map((tool) => {
                      const IconComponent = tool.icon;
                      const isActive = activeTool === tool.id;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => setActiveTool(tool.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span className="truncate">{tool.name}</span>
                          </div>
                          <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-300"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Functional Area */}
        <div className="lg:col-span-9 space-y-8">
          
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{currentToolObj?.name}</h1>
                <p className="text-xs text-slate-500">Configure parameters with live preview and instant CSS code generation.</p>
              </div>
            </div>

            {/* 1. GLASSMORPHISM */}
            {activeTool === "glassmorphism" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 relative overflow-hidden min-h-[380px]">
                  <div
                    className="w-full max-w-xs p-6 shadow-2xl transition-all duration-200 relative z-10 flex flex-col gap-3"
                    style={{
                      background: cardBg,
                      backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                      WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                      borderRadius: `${borderRadius}px`,
                      border: `1px solid ${borderRgba}`,
                    }}
                  >
                    <h4 className={`font-bold text-sm ${isDarkCard ? 'text-white' : 'text-slate-900'}`}>Frosted Effect</h4>
                    <p className={`text-xs ${isDarkCard ? 'text-slate-300' : 'text-slate-600'}`}>Modern CSS glassmorphism UI element.</p>
                  </div>
                  <button onClick={() => setIsDarkCard(!isDarkCard)} className="mt-6 rounded-xl bg-white/25 backdrop-blur-md px-4 py-2 text-xs font-bold text-white relative z-10 shadow-lg">
                    {isDarkCard ? "Light Preview" : "Dark Preview"}
                  </button>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Opacity</span><span className="text-indigo-600 font-bold">{opacity}%</span></div><input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Blur</span><span className="text-indigo-600 font-bold">{blur}px</span></div><input type="range" min="0" max="40" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Radius</span><span className="text-indigo-600 font-bold">{borderRadius}px</span></div><input type="range" min="0" max="40" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 2. BOX SHADOW */}
            {activeTool === "boxshadow" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-12 min-h-[380px]">
                  <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center text-xs font-bold text-slate-700 shadow-xl" style={{ boxShadow: `${boxX}px ${boxY}px ${boxBlur}px ${boxSpread}px rgba(0,0,0,0.3)`, borderRadius: `${boxRadius}px` }}>Shadow Box</div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>X Offset</span><span className="text-indigo-600 font-bold">{boxX}px</span></div><input type="range" min="-50" max="50" value={boxX} onChange={(e) => setBoxX(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Y Offset</span><span className="text-indigo-600 font-bold">{boxY}px</span></div><input type="range" min="-50" max="50" value={boxY} onChange={(e) => setBoxY(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Blur</span><span className="text-indigo-600 font-bold">{boxBlur}px</span></div><input type="range" min="0" max="100" value={boxBlur} onChange={(e) => setBoxBlur(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 3. GRADIENT */}
            {activeTool === "gradient" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-12 min-h-[380px]">
                  <div className="w-56 h-56 rounded-3xl shadow-2xl" style={{ background: `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})` }} />
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Angle</span><span className="text-indigo-600 font-bold">{gradAngle}°</span></div><input type="range" min="0" max="360" value={gradAngle} onChange={(e) => setGradAngle(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div><span className="text-xs font-semibold text-slate-600">Color 1</span><input type="color" value={gradColor1} onChange={(e) => setGradColor1(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-transparent mt-1" /></div>
                    <div><span className="text-xs font-semibold text-slate-600">Color 2</span><input type="color" value={gradColor2} onChange={(e) => setGradColor2(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-transparent mt-1" /></div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. GLITCH TEXT */}
            {activeTool === "glitch" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-8 min-h-[380px]">
                  <div style={{ fontSize: `${glitchSize}px`, color: glitchColor, textShadow: `2px 0 ${glitchC1}, -2px 0 ${glitchC2}` }} className="font-black tracking-wider text-center select-none">{glitchText}</div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Text</label><input type="text" value={glitchText} onChange={(e) => setGlitchText(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Size</span><span className="text-indigo-600 font-bold">{glitchSize}px</span></div><input type="range" min="20" max="80" value={glitchSize} onChange={(e) => setGlitchSize(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 5. BORDER RADIUS */}
            {activeTool === "borderradius" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-12 min-h-[380px]">
                  <div className="w-48 h-48 bg-indigo-600 shadow-xl flex items-center justify-center text-white text-xs font-bold" style={{ borderRadius: `${brTL}px ${brTR}px ${brBR}px ${brBL}px` }}>Radius Box</div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Top-Left</span><span className="text-indigo-600 font-bold">{brTL}px</span></div><input type="range" min="0" max="100" value={brTL} onChange={(e) => setBrTL(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Top-Right</span><span className="text-indigo-600 font-bold">{brTR}px</span></div><input type="range" min="0" max="100" value={brTR} onChange={(e) => setBrTR(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 6. BUTTON GENERATOR */}
            {activeTool === "button" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-12 min-h-[380px]">
                  <button style={{ backgroundColor: btnBg, color: btnTextColor, borderRadius: `${btnRadius}px`, padding: `${btnPaddingY}px ${btnPaddingX}px` }} className="font-bold text-sm shadow-xl">{btnText}</button>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Button Text</label><input type="text" value={btnText} onChange={(e) => setBtnText(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Radius</span><span className="text-indigo-600 font-bold">{btnRadius}px</span></div><input type="range" min="0" max="40" value={btnRadius} onChange={(e) => setBtnRadius(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 7. ACCORDION */}
            {activeTool === "accordion" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-8 min-h-[380px]">
                  <div className="w-full max-w-xs p-4 shadow-md transition-all" style={{ borderWidth: `${accBorder}px`, borderStyle: 'solid', borderColor: '#e2e8f0', borderRadius: `${accRadius}px`, backgroundColor: accBg }}>
                    <div className="font-bold text-sm text-slate-800">Accordion Header ▼</div>
                    <div className="text-xs text-slate-500 mt-1">Accordion collapsible body content preview.</div>
                  </div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Border Radius</span><span className="text-indigo-600 font-bold">{accRadius}px</span></div><input type="range" min="0" max="30" value={accRadius} onChange={(e) => setAccRadius(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Border Width</span><span className="text-indigo-600 font-bold">{accBorder}px</span></div><input type="range" min="0" max="5" value={accBorder} onChange={(e) => setAccBorder(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 8. ANIMATED TEXT */}
            {activeTool === "animatedtext" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-8 min-h-[380px]">
                  <div className="text-white font-black text-xl animate-pulse">{animText}</div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Text</label><input type="text" value={animText} onChange={(e) => setAnimText(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Speed (sec)</span><span className="text-indigo-600 font-bold">{animSpeed}s</span></div><input type="range" min="1" max="5" value={animSpeed} onChange={(e) => setAnimSpeed(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 9. KEYFRAMES */}
            {activeTool === "keyframes" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-8 min-h-[380px]">
                  <div className="w-24 h-24 bg-indigo-500 rounded-2xl animate-bounce flex items-center justify-center text-white text-xs font-bold">Keyframe</div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Duration</span><span className="text-indigo-600 font-bold">{kfDuration}s</span></div><input type="range" min="0.5" max="3" step="0.1" value={kfDuration} onChange={(e) => setKfDuration(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 10. BORDER IMAGE */}
            {activeTool === "borderimage" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-8 min-h-[380px]">
                  <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center text-xs font-bold" style={{ borderWidth: `${borderImgWidth}px`, borderStyle: 'solid', borderColor: 'transparent', borderImage: 'linear-gradient(to right, #3b82f6, #9333ea) 1' }}>Border Image</div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Border Width</span><span className="text-indigo-600 font-bold">{borderImgWidth}px</span></div><input type="range" min="2" max="20" value={borderImgWidth} onChange={(e) => setBorderImgWidth(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 11. CHECKBOX */}
            {activeTool === "checkbox" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-8 min-h-[380px]">
                  <label className="flex items-center gap-3 text-white text-sm font-bold cursor-pointer">
                    <input type="checkbox" defaultChecked style={{ accentColor: chkColor, width: `${chkSize}px`, height: `${chkSize}px` }} /> Custom Checkbox
                  </label>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Size</span><span className="text-indigo-600 font-bold">{chkSize}px</span></div><input type="range" min="15" max="35" value={chkSize} onChange={(e) => setChkSize(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                  <div><span className="text-xs font-semibold text-slate-600">Color</span><input type="color" value={chkColor} onChange={(e) => setChkColor(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-transparent mt-1" /></div>
                </div>
              </div>
            )}

            {/* 12. CLIP PATH */}
            {activeTool === "clippath" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-8 min-h-[380px]">
                  <div className="w-40 h-40 bg-indigo-500 transition-all shadow-xl" style={{ clipPath: clipShape }} />
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Select Shape</label>
                    <select onChange={(e) => setClipShape(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none bg-white">
                      <option value="polygon(50% 0%, 100% 100%, 0% 100%)">Triangle</option>
                      <option value="circle(50% at 50% 50%)">Circle</option>
                      <option value="polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)">Hexagon</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 13. COLOR VARIABLE */}
            {activeTool === "colorvariable" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-8 min-h-[380px]">
                  <div className="w-36 h-36 rounded-2xl shadow-xl flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: cssVarVal }}>Var Box</div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Variable Name</label><input type="text" value={cssVarName} onChange={(e) => setCssVarName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none" /></div>
                  <div><span className="text-xs font-semibold text-slate-600">Value</span><input type="color" value={cssVarVal} onChange={(e) => setCssVarVal(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-transparent mt-1" /></div>
                </div>
              </div>
            )}

            {/* 14. COLUMN */}
            {activeTool === "column" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-6 min-h-[380px]">
                  <div className="w-full text-white text-[11px]" style={{ columnCount: colCount, columnGap: `${colGap}px` }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.
                  </div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Columns</span><span className="text-indigo-600 font-bold">{colCount}</span></div><input type="range" min="1" max="4" value={colCount} onChange={(e) => setColCount(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Gap</span><span className="text-indigo-600 font-bold">{colGap}px</span></div><input type="range" min="10" max="40" value={colGap} onChange={(e) => setColGap(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 15. CUBIC BEZIER */}
            {activeTool === "cubicbezier" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-8 min-h-[380px]">
                  <div className="w-20 h-20 bg-indigo-500 rounded-xl transition-all duration-700 hover:translate-x-20 flex items-center justify-center text-white text-[10px] font-bold">Hover Me</div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Preset</label>
                    <select onChange={(e) => setCubicVal(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none bg-white">
                      <option value="cubic-bezier(0.25, 0.1, 0.25, 1)">Ease</option>
                      <option value="cubic-bezier(0, 0, 1, 1)">Linear</option>
                      <option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Ease In Back (Bounce)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 16. DARK MODE */}
            {activeTool === "darkmode" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl p-8 min-h-[380px] shadow-inner" style={{ backgroundColor: darkBg, color: darkText }}>
                  <div className="text-center space-y-2"><h4 className="font-bold text-sm">Theme Preview</h4><p className="text-xs opacity-80">Dynamic dark/light mode surface.</p></div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div><span className="text-xs font-semibold text-slate-600">Background</span><input type="color" value={darkBg} onChange={(e) => setDarkBg(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-transparent mt-1" /></div>
                  <div><span className="text-xs font-semibold text-slate-600">Text Color</span><input type="color" value={darkText} onChange={(e) => setDarkText(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-transparent mt-1" /></div>
                </div>
              </div>
            )}

            {/* 17. FLEXBOX */}
            {activeTool === "flexbox" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center rounded-3xl bg-slate-950 p-6 min-h-[380px]" style={{ display: 'flex', justifyContent: flexJustify, alignItems: flexAlign }}>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl" />
                  <div className="w-12 h-12 bg-purple-500 rounded-xl" />
                  <div className="w-12 h-12 bg-pink-500 rounded-xl" />
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Justify Content</label>
                    <select value={flexJustify} onChange={(e) => setFlexJustify(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none bg-white">
                      <option value="flex-start">Flex Start</option>
                      <option value="center">Center</option>
                      <option value="flex-end">Flex End</option>
                      <option value="space-between">Space Between</option>
                    </select>
                  </div>
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Align Items</label>
                    <select value={flexAlign} onChange={(e) => setFlexAlign(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none bg-white">
                      <option value="flex-start">Flex Start</option>
                      <option value="center">Center</option>
                      <option value="flex-end">Flex End</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 18. GOOGLE FONTS CSS */}
            {activeTool === "googlefonts" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-8 min-h-[380px]">
                  <div className="text-white text-xl" style={{ fontFamily: fontFamily, fontWeight: fontWeight }}>Sample Typography Preview</div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Font Family</label>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none bg-white">
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Weight</span><span className="text-indigo-600 font-bold">{fontWeight}</span></div><input type="range" min="300" max="900" step="100" value={fontWeight} onChange={(e) => setFontWeight(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                </div>
              </div>
            )}

            {/* 19. GRADIENT BORDER */}
            {activeTool === "gradientborder" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex items-center justify-center rounded-3xl bg-slate-950 p-12 min-h-[380px]">
                  <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center text-xs font-bold text-slate-800 shadow-2xl" style={{ borderWidth: `${gbWidth}px`, borderStyle: 'solid', borderColor: 'transparent', background: `linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, ${gbColor1}, ${gbColor2}) border-box` }}>Gradient Border</div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs font-semibold"><span>Border Width</span><span className="text-indigo-600 font-bold">{gbWidth}px</span></div><input type="range" min="2" max="10" value={gbWidth} onChange={(e) => setGbWidth(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div><span className="text-xs font-semibold text-slate-600">Color 1</span><input type="color" value={gbColor1} onChange={(e) => setGbColor1(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-transparent mt-1" /></div>
                    <div><span className="text-xs font-semibold text-slate-600">Color 2</span><input type="color" value={gbColor2} onChange={(e) => setGbColor2(e.target.value)} className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-transparent mt-1" /></div>
                  </div>
                </div>
              </div>
            )}

            {/* Generated CSS Code Section */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-indigo-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Generated CSS Code</h4>
                </div>
                <button
                  onClick={handleCopyCss}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm"
                >
                  {copiedCss ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedCss ? "Copied CSS!" : "Copy CSS"}
                </button>
              </div>
              <pre className="rounded-2xl bg-slate-900 p-4 text-xs font-mono text-indigo-200 overflow-x-auto shadow-inner">
                {getGeneratedCss()}
              </pre>
            </div>

          </div>

          {/* About Section */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-600">
              <Layers className="h-5 w-5" />
              <h2 className="text-base font-bold text-slate-900">About {currentToolObj?.name}</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create professional CSS effects and generate optimized stylesheets instantly. Fast, secure, and browser-processed utility designed for seamless everyday web development.
            </p>
          </div>

          {/* How to Use & Key Advantages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Zap className="h-5 w-5" />
                <h3 className="text-base font-bold text-slate-900">How to Use</h3>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600 text-[10px]">1</span>
                  <span>Select any tool from the left sidebar navigation menu.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600 text-[10px]">2</span>
                  <span>Adjust sliders and pick colors to see instant live previews.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600 text-[10px]">3</span>
                  <span>Copy code directly into your stylesheet.</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="text-base font-bold text-slate-900">Key Advantages</h3>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>100% Client-Side browser execution.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Zero latency live visual previews.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Fully optimized for mobile and desktop screens.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}