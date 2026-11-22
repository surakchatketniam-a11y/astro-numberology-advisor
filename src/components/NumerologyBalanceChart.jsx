import React from 'react';
import { BALANCE_DIMENSIONS } from '../utils/numerology';

function getPolygonPoints(scores, cx, cy, radius) {
  return BALANCE_DIMENSIONS.map((dim, idx) => {
    const angle = (-90 + idx * 72) * (Math.PI / 180);
    const ratio = (scores[dim.key] || 0) / 100;
    const x = cx + Math.cos(angle) * radius * ratio;
    const y = cy + Math.sin(angle) * radius * ratio;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function getRingPoints(levelRatio, cx, cy, radius) {
  return BALANCE_DIMENSIONS.map((_, idx) => {
    const angle = (-90 + idx * 72) * (Math.PI / 180);
    const x = cx + Math.cos(angle) * radius * levelRatio;
    const y = cy + Math.sin(angle) * radius * levelRatio;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export default function NumerologyBalanceChart({
  primary,
  secondary = null,
  primaryLabel = 'ตัวเลือก A',
  secondaryLabel = 'ตัวเลือก B',
}) {
  if (!primary) return null;

  const size = 280;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const radius = 92;

  return (
    <div className="lambo-panel p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#333333] pb-4">
        <div>
          <p className="font-display-latin text-[11px] text-[#FFC000] tracking-[0.225px]">
            5-DIMENSION ENERGY BALANCE
          </p>
          <h3 className="text-base sm:text-lg font-medium text-white mt-0.5">
            {secondary ? 'กราฟเปรียบเทียบสมดุลพลังงาน 5 ด้าน (A vs B)' : 'กราฟสมดุลพลังงาน 5 ด้าน'}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-[#FFC000] inline-block" />
            <span className="text-white font-medium">
              {secondary ? `${primaryLabel} (${primary.overall}/100)` : `สมดุลเฉลี่ย ${primary.overall}/100`}
            </span>
          </div>
          {secondary && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-[#29ABE2] inline-block" />
              <span className="text-[#29ABE2] font-medium">
                {secondaryLabel} ({secondary.overall}/100)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Sharp Pentagon Radar SVG */}
        <div className="md:col-span-5 flex justify-center bg-black border border-[#262626] p-3">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[270px] h-auto"
            role="img"
            aria-label="กราฟสมดุลพลังงาน 5 ด้าน"
          >
            {/* Grid Rings */}
            {[0.25, 0.5, 0.75, 1].map((lvl) => (
              <polygon
                key={lvl}
                points={getRingPoints(lvl, cx, cy, radius)}
                fill="none"
                stroke={lvl === 1 ? '#494949' : '#262626'}
                strokeWidth="1"
              />
            ))}

            {/* Axis Lines */}
            {BALANCE_DIMENSIONS.map((dim, idx) => {
              const angle = (-90 + idx * 72) * (Math.PI / 180);
              const x2 = cx + Math.cos(angle) * radius;
              const y2 = cy + Math.sin(angle) * radius;
              return (
                <line
                  key={dim.key}
                  x1={cx}
                  y1={cy}
                  x2={x2}
                  y2={y2}
                  stroke="#262626"
                  strokeWidth="1"
                />
              );
            })}

            {/* Secondary Polygon (B) */}
            {secondary && (
              <polygon
                points={getPolygonPoints(secondary.scores, cx, cy, radius)}
                fill="rgba(41, 171, 226, 0.18)"
                stroke="#29ABE2"
                strokeWidth="2"
              />
            )}

            {/* Primary Polygon (A) */}
            <polygon
              points={getPolygonPoints(primary.scores, cx, cy, radius)}
              fill="rgba(255, 192, 0, 0.2)"
              stroke="#FFC000"
              strokeWidth="2"
            />

            {/* Primary Vertices */}
            {BALANCE_DIMENSIONS.map((dim, idx) => {
              const angle = (-90 + idx * 72) * (Math.PI / 180);
              const r = radius * ((primary.scores[dim.key] || 0) / 100);
              const x = cx + Math.cos(angle) * r;
              const y = cy + Math.sin(angle) * r;
              return <rect key={dim.key} x={x - 3} y={y - 3} width="6" height="6" fill="#FFC000" />;
            })}

            {/* Axis Labels */}
            {BALANCE_DIMENSIONS.map((dim, idx) => {
              const angle = (-90 + idx * 72) * (Math.PI / 180);
              const labelR = radius + 24;
              const x = cx + Math.cos(angle) * labelR;
              const y = cy + Math.sin(angle) * labelR;
              return (
                <text
                  key={dim.key}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#a6a6a6"
                  fontSize="11"
                  fontFamily="Anuphan, Noto Sans Thai, sans-serif"
                >
                  {dim.shortLabel}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Crisp Horizontal Progress Bars */}
        <div className="md:col-span-7 space-y-4">
          {BALANCE_DIMENSIONS.map((dim) => {
            const valA = primary.scores[dim.key];
            const valB = secondary ? secondary.scores[dim.key] : null;
            return (
              <div key={dim.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#F5F5F5]">{dim.label}</span>
                  <div className="flex items-center gap-3 font-medium">
                    <span className="text-[#FFC000]">{valA}</span>
                    {valB !== null && (
                      <>
                        <span className="text-[#494949]">/</span>
                        <span className="text-[#29ABE2]">{valB}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Bar */}
                <div className="h-2 bg-black border border-[#262626] overflow-hidden">
                  <div
                    className="h-full bg-[#FFC000]"
                    style={{ width: `${valA}%` }}
                  />
                </div>

                {/* Secondary Bar (Compare Mode) */}
                {valB !== null && (
                  <div className="h-2 bg-black border border-[#262626] overflow-hidden">
                    <div
                      className="h-full bg-[#29ABE2]"
                      style={{ width: `${valB}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
