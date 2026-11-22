import React, { useState } from 'react';
import { ZODIAC_DATA } from '../utils/zodiac';
import { ZODIAC_ORDER } from '../utils/ascendant';

const SHORT_SIGN_TH = {
  aries: 'เมษ',
  taurus: 'พฤษภ',
  gemini: 'เมถุน',
  cancer: 'กรกฎ',
  leo: 'สิงห์',
  virgo: 'กันย์',
  libra: 'ตุลย์',
  scorpio: 'พิจิก',
  sagittarius: 'ธนู',
  capricorn: 'มังกร',
  aquarius: 'กุมภ์',
  pisces: 'มีน',
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function createWedgePath(cx, cy, rInner, rOuter, startAngle, endAngle) {
  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p3 = polarToCartesian(cx, cy, rInner, endAngle);
  const p4 = polarToCartesian(cx, cy, rInner, startAngle);
  return [
    `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`,
    `A ${rOuter} ${rOuter} 0 0 0 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`,
    `L ${p3.x.toFixed(1)} ${p3.y.toFixed(1)}`,
    `A ${rInner} ${rInner} 0 0 1 ${p4.x.toFixed(1)} ${p4.y.toFixed(1)}`,
    'Z',
  ].join(' ');
}

export default function ThaiZodiacWheel({ ascendant, sunSignId }) {
  const [selectedSignIdx, setSelectedSignIdx] = useState(ascendant ? ascendant.signIndex : 0);

  if (!ascendant) return null;

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 156;
  const rInner = 64;

  const houseBySignIndex = {};
  for (const h of ascendant.houses) {
    houseBySignIndex[h.signIndex] = h;
  }

  const activeHouse = houseBySignIndex[selectedSignIdx] || ascendant.houses[0];

  return (
    <div className="lambo-panel border-t-2 border-t-[#FFC000] p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#333333] pb-4">
        <div>
          <p className="font-display-latin text-[11px] text-[#FFC000] tracking-[0.225px]">
            THAI SIDEREAL ASCENDANT &amp; 12-HOUSE CHART
          </p>
          <h3 className="text-lg sm:text-xl font-medium text-white mt-0.5">
            ลัคนา{ascendant.ascSign.thName} ({ascendant.degreeInSign}°{String(ascendant.minuteInSign).padStart(2, '0')}&apos;)
          </h3>
          <p className="text-sm text-[#7D7D7D] mt-0.5">
            พิกัดอ้างอิง: {ascendant.location.name} • แตะแต่ละช่องราศีเพื่อดูความหมายเรือนชะตา
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-[#FFC000]">
            <span className="h-3 w-3 bg-[#FFC000] inline-block" /> ลัคนา (ล)
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#29ABE2]">
            <span className="h-3 w-3 bg-[#29ABE2] inline-block" /> อาทิตย์ (๑)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG 12-House Thai Zodiac Wheel */}
        <div className="lg:col-span-6 flex justify-center bg-black border border-[#262626] p-3">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[330px] h-auto"
            role="img"
            aria-label="ผังจักรราศี 12 เรือน"
          >
            {ZODIAC_ORDER.map((zId, idx) => {
              // เมษ (idx 0) อยู่ที่ 12 นาฬิกา (-90 deg) และเดินทวนเข็มนาฬิกา (ลบ 30 องศาต่อราศี)
              const centerAngle = -90 - idx * 30;
              const startAngle = centerAngle + 15;
              const endAngle = centerAngle - 15;
              const path = createWedgePath(cx, cy, rInner, rOuter, startAngle, endAngle);

              const house = houseBySignIndex[idx];
              const isAsc = idx === ascendant.signIndex;
              const isSun = zId === sunSignId;
              const isSelected = idx === selectedSignIdx;

              const signPos = polarToCartesian(cx, cy, 128, centerAngle);
              const housePos = polarToCartesian(cx, cy, 94, centerAngle);

              let fill = '#121212';
              if (isSelected) fill = '#202020';
              if (isAsc) fill = 'rgba(255, 192, 0, 0.22)';

              return (
                <g
                  key={zId}
                  onClick={() => setSelectedSignIdx(idx)}
                  className="cursor-pointer"
                >
                  <path
                    d={path}
                    fill={fill}
                    stroke={isSelected ? '#FFC000' : '#333333'}
                    strokeWidth={isSelected ? '2' : '1'}
                  />
                  <text
                    x={signPos.x}
                    y={signPos.y - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isAsc ? '#FFC000' : '#FFFFFF'}
                    fontSize="11"
                    fontWeight={isAsc ? '700' : '500'}
                    fontFamily="Anuphan, Noto Sans Thai, sans-serif"
                  >
                    {SHORT_SIGN_TH[zId]}
                  </text>
                  <text
                    x={housePos.x}
                    y={housePos.y + 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isAsc ? '#FFCE3E' : '#7D7D7D'}
                    fontSize="9.5"
                    fontFamily="Anuphan, Noto Sans Thai, sans-serif"
                  >
                    {house?.name}
                  </text>

                  {/* Markers for Lagna (ล) & Sun (๑) */}
                  {isAsc && (
                    <text
                      x={polarToCartesian(cx, cy, 74, centerAngle).x}
                      y={polarToCartesian(cx, cy, 74, centerAngle).y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#FFC000"
                      fontSize="11"
                      fontWeight="700"
                    >
                      ล
                    </text>
                  )}
                  {isSun && (
                    <text
                      x={polarToCartesian(cx, cy, isAsc ? 144 : 74, centerAngle).x}
                      y={polarToCartesian(cx, cy, isAsc ? 144 : 74, centerAngle).y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#29ABE2"
                      fontSize="11"
                      fontWeight="700"
                    >
                      ๑
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center Core */}
            <circle cx={cx} cy={cy} r={rInner} fill="#000000" stroke="#494949" strokeWidth="1.5" />
            <text
              x={cx}
              y={cy - 10}
              textAnchor="middle"
              fill="#FFC000"
              fontSize="10"
              fontFamily="Inter, sans-serif"
            >
              LAGNA
            </text>
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="14"
              fontWeight="600"
              fontFamily="Anuphan, Noto Sans Thai, sans-serif"
            >
              {SHORT_SIGN_TH[ascendant.ascSign.id]}
            </text>
          </svg>
        </div>

        {/* Selected House Detail + Key Life Pillars */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#202020] border border-[#333333] border-l-2 border-l-[#FFC000] p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display-latin text-[11px] text-[#FFC000] tracking-[0.225px]">
                HOUSE {String(activeHouse.num).padStart(2, '0')} / {activeHouse.en}
              </span>
              <span className="lambo-badge bg-black border border-[#494949] text-[#F5F5F5]">
                {activeHouse.sign.thName} ({activeHouse.sign.element})
              </span>
            </div>
            <h4 className="text-lg font-medium text-white">
              เรือน{activeHouse.name} — {activeHouse.sign.thName}
            </h4>
            <p className="text-sm sm:text-base text-[#F5F5F5] leading-[1.7]">{activeHouse.desc}</p>
            <p className="text-sm text-[#a6a6a6] pt-2 border-t border-[#333333]">
              ดาวเจ้าเรือน: <strong className="text-white">{activeHouse.sign.thaiRuler}</strong>
            </p>
          </div>

          {/* 3 Key Pillars: Wealth (กดุมพะ), Career (กัมมะ), Partner (ปัตนิ) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { label: 'เรือนการเงิน (กดุมพะ)', house: ascendant.wealthHouse },
              { label: 'เรือนการงาน (กัมมะ)', house: ascendant.careerHouse },
              { label: 'เรือนคู่ครอง (ปัตนิ)', house: ascendant.partnerHouse },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setSelectedSignIdx(item.house.signIndex)}
                className="text-left bg-black border border-[#333333] hover:border-[#FFC000] p-3 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-[#7D7D7D] block">{item.label}</span>
                <span className="text-sm font-medium text-white mt-0.5 block">
                  {item.house.sign.thName}
                </span>
                <span className="text-xs text-[#FFC000] mt-0.5 block">
                  {item.house.sign.thaiRuler}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
