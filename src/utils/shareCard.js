import { BALANCE_DIMENSIONS } from './numerology';

const CARD_W = 1080;
const CARD_H = 1350;

function drawHexEmblem(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = ((i * 60 - 90) * Math.PI) / 180;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#181818';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#FFC000';
  ctx.stroke();

  // Inner sharp 4-point star
  const sr = r * 0.55;
  ctx.beginPath();
  ctx.moveTo(cx, cy - sr);
  ctx.lineTo(cx + sr * 0.25, cy - sr * 0.25);
  ctx.lineTo(cx + sr, cy);
  ctx.lineTo(cx + sr * 0.25, cy + sr * 0.25);
  ctx.lineTo(cx, cy + sr);
  ctx.lineTo(cx - sr * 0.25, cy + sr * 0.25);
  ctx.lineTo(cx - sr, cy);
  ctx.lineTo(cx - sr * 0.25, cy - sr * 0.25);
  ctx.closePath();
  ctx.fillStyle = '#FFC000';
  ctx.fill();
  ctx.restore();
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = String(text || '').split(/\s+/);
  let line = '';
  let currentY = y;
  let linesDrawn = 0;

  // Handle Thai continuous strings without spaces by falling back to character wrapping
  const tokens = words.length <= 2 && String(text || '').length > 26 ? String(text).split('') : words;
  const joiner = tokens === words ? ' ' : '';

  for (let i = 0; i < tokens.length; i++) {
    const testLine = line ? `${line}${joiner}${tokens[i]}` : tokens[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      linesDrawn++;
      if (linesDrawn >= maxLines) {
        ctx.fillText(`${line.slice(0, -1)}...`, x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line, x, currentY);
      line = tokens[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

async function createBaseCanvas(subtitleEn, titleTh) {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  // Absolute Black Canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Top Lamborghini Gold Bar
  ctx.fillStyle = '#FFC000';
  ctx.fillRect(0, 0, CARD_W, 12);

  // Header Brand
  drawHexEmblem(ctx, 100, 96, 36);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 28px Inter, sans-serif';
  ctx.fillText('ASTRO & NUMEROLOGY ADVISOR', 158, 90);

  ctx.fillStyle = '#7D7D7D';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText('ที่ปรึกษาโหราศาสตร์ไทย–สากล และเลขศาสตร์เชิงจิตวิทยา', 158, 122);

  // Divider
  ctx.fillStyle = '#262626';
  ctx.fillRect(64, 158, CARD_W - 128, 2);

  // Section Kicker & Title
  ctx.fillStyle = '#FFC000';
  ctx.font = '500 20px Inter, sans-serif';
  ctx.fillText(subtitleEn, 64, 212);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 44px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText(titleTh, 64, 268);

  return { canvas, ctx };
}

function drawFooter(ctx) {
  ctx.fillStyle = '#262626';
  ctx.fillRect(64, CARD_H - 108, CARD_W - 128, 2);

  ctx.fillStyle = '#7D7D7D';
  ctx.font = '400 20px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText('ออกแบบเพื่อการรับรู้ตนเองและการวางแผนชีวิตอย่างมีเหตุผล', 64, CARD_H - 60);

  ctx.fillStyle = '#FFC000';
  ctx.font = '500 18px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('ASTRO ADVISOR PWA', CARD_W - 64, CARD_H - 60);
  ctx.textAlign = 'left';
}

export async function renderZodiacCardPng(result) {
  const { canvas, ctx } = await createBaseCanvas(
    'ZODIAC COMPARISON REPORT',
    result.formattedDateTH
  );

  // Meta strip
  ctx.fillStyle = '#181818';
  ctx.fillRect(64, 298, CARD_W - 128, 72);
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 298, CARD_W - 128, 72);

  ctx.fillStyle = '#FFC000';
  ctx.font = '600 24px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText(`${result.dayOfWeek.name}`, 92, 343);

  ctx.fillStyle = '#a6a6a6';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`เลขรหัสชีวิต (Life Path): ${result.lifePathNumber}`, CARD_W - 92, 343);
  ctx.textAlign = 'left';

  // Two side-by-side panels
  const panelY = 402;
  const panelW = 462;
  const panelH = 440;

  // Thai Sidereal Panel
  ctx.fillStyle = '#202020';
  ctx.fillRect(64, panelY, panelW, panelH);
  ctx.fillStyle = '#FFC000';
  ctx.fillRect(64, panelY, panelW, 6);

  ctx.fillStyle = '#FFCE3E';
  ctx.font = '500 18px Inter, sans-serif';
  ctx.fillText('THAI SIDEREAL', 92, panelY + 46);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 40px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText(result.thaiSign.thName, 92, panelY + 102);

  ctx.fillStyle = '#a6a6a6';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText(`${result.thaiSign.element}  |  ${result.thaiSign.thaiRuler}`, 92, panelY + 144);

  ctx.fillStyle = '#333333';
  ctx.fillRect(92, panelY + 168, panelW - 56, 2);

  ctx.fillStyle = '#F5F5F5';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  drawWrappedText(ctx, result.thaiSign.psychology, 92, panelY + 214, panelW - 56, 36, 6);

  // Western Tropical Panel
  const rightX = 64 + panelW + 28;
  ctx.fillStyle = '#202020';
  ctx.fillRect(rightX, panelY, panelW, panelH);
  ctx.fillStyle = '#29ABE2';
  ctx.fillRect(rightX, panelY, panelW, 6);

  ctx.fillStyle = '#29ABE2';
  ctx.font = '500 18px Inter, sans-serif';
  ctx.fillText('WESTERN TROPICAL', rightX + 28, panelY + 46);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 36px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText(`${result.westernSign.thName} (${result.westernSign.enName})`, rightX + 28, panelY + 102);

  ctx.fillStyle = '#a6a6a6';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText(`${result.westernSign.element}  |  ${result.westernSign.westernRuler}`, rightX + 28, panelY + 144);

  ctx.fillStyle = '#333333';
  ctx.fillRect(rightX + 28, panelY + 168, panelW - 56, 2);

  ctx.fillStyle = '#F5F5F5';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  drawWrappedText(ctx, result.westernSign.psychology, rightX + 28, panelY + 214, panelW - 56, 36, 6);

  // Psychological Insight Panel
  const noteY = 876;
  ctx.fillStyle = '#181818';
  ctx.fillRect(64, noteY, CARD_W - 128, 326);
  ctx.strokeStyle = '#333333';
  ctx.strokeRect(64, noteY, CARD_W - 128, 326);

  ctx.fillStyle = '#FFC000';
  ctx.font = '600 24px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText('มุมมองเชิงจิตวิทยาและแนวทางพัฒนาตนเอง', 96, noteY + 52);

  ctx.fillStyle = '#F5F5F5';
  ctx.font = '400 23px Anuphan, "Noto Sans Thai", sans-serif';
  const nextY = drawWrappedText(ctx, result.comparisonNote, 96, noteY + 100, CARD_W - 192, 38, 3);

  ctx.fillStyle = '#a6a6a6';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  drawWrappedText(ctx, `คำแนะนำ: ${result.thaiSign.growthTip}`, 96, nextY + 14, CARD_W - 192, 36, 3);

  drawFooter(ctx);
  return canvas.toDataURL('image/png');
}

export async function renderNumerologyCardPng(result, balance) {
  const title =
    result.type === 'phone' ? `เบอร์โทร ${result.formatted}` : `ทะเบียนรถ ${result.formatted}`;
  const { canvas, ctx } = await createBaseCanvas('NUMEROLOGY ANALYSIS REPORT', title);

  // Top KPI Row
  ctx.fillStyle = '#202020';
  ctx.fillRect(64, 304, 462, 160);
  ctx.fillStyle = '#FFC000';
  ctx.fillRect(64, 304, 462, 6);

  ctx.fillStyle = '#a6a6a6';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText(result.type === 'phone' ? 'ผลรวมทั้งหมด (10 หลัก)' : 'ผลรวมอักษรและตัวเลข', 92, 356);

  ctx.fillStyle = '#FFC000';
  ctx.font = '600 62px Inter, sans-serif';
  ctx.fillText(String(result.totalSumAll), 92, 434);

  const rightX = 554;
  ctx.fillStyle = '#202020';
  ctx.fillRect(rightX, 304, 462, 160);
  ctx.fillStyle = '#29ABE2';
  ctx.fillRect(rightX, 304, 462, 6);

  ctx.fillStyle = '#a6a6a6';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText('คะแนนสมดุลเฉลี่ย 5 ด้าน', rightX + 28, 356);

  ctx.fillStyle = '#29ABE2';
  ctx.font = '600 62px Inter, sans-serif';
  ctx.fillText(`${balance.overall}/100`, rightX + 28, 434);

  // Pairs Strip
  ctx.fillStyle = '#181818';
  ctx.fillRect(64, 496, CARD_W - 128, 128);
  ctx.strokeStyle = '#333333';
  ctx.strokeRect(64, 496, CARD_W - 128, 128);

  ctx.fillStyle = '#FFC000';
  ctx.font = '500 20px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText('คู่เลขเด่นในโครงสร้าง', 92, 538);

  const pairList = result.pairs.map((p) => p.pair).join('   •   ') || '-';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 32px Inter, sans-serif';
  ctx.fillText(pairList, 92, 592);

  // 5-Dimension Balance Bars
  const barPanelY = 656;
  ctx.fillStyle = '#181818';
  ctx.fillRect(64, barPanelY, CARD_W - 128, 420);
  ctx.strokeStyle = '#333333';
  ctx.strokeRect(64, barPanelY, CARD_W - 128, 420);

  ctx.fillStyle = '#FFC000';
  ctx.font = '500 18px Inter, sans-serif';
  ctx.fillText('5-DIMENSION ENERGY BALANCE', 96, barPanelY + 46);

  let rowY = barPanelY + 96;
  const barMaxW = CARD_W - 192;
  for (const dim of BALANCE_DIMENSIONS) {
    const score = balance.scores[dim.key];
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '400 24px Anuphan, "Noto Sans Thai", sans-serif';
    ctx.fillText(dim.label, 96, rowY);

    ctx.fillStyle = '#FFC000';
    ctx.font = '600 24px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${score}/100`, CARD_W - 96, rowY);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#000000';
    ctx.fillRect(96, rowY + 14, barMaxW, 14);
    ctx.fillStyle = '#FFC000';
    ctx.fillRect(96, rowY + 14, Math.round((barMaxW * score) / 100), 14);

    rowY += 62;
  }

  // Summary Description
  ctx.fillStyle = '#F5F5F5';
  ctx.font = '400 23px Anuphan, "Noto Sans Thai", sans-serif';
  drawWrappedText(ctx, result.sumSummary.description, 64, 1126, CARD_W - 128, 36, 3);

  drawFooter(ctx);
  return canvas.toDataURL('image/png');
}

export async function renderCompareCardPng(resultA, resultB, balA, balB) {
  const typeLabel = resultA.type === 'phone' ? 'เปรียบเทียบเบอร์โทร A vs B' : 'เปรียบเทียบทะเบียนรถ A vs B';
  const { canvas, ctx } = await createBaseCanvas('NUMEROLOGY COMPARISON', typeLabel);

  // Two headers A vs B
  ctx.fillStyle = '#202020';
  ctx.fillRect(64, 304, 462, 180);
  ctx.fillStyle = '#FFC000';
  ctx.fillRect(64, 304, 462, 6);
  ctx.fillStyle = '#FFC000';
  ctx.font = '500 18px Inter, sans-serif';
  ctx.fillText('OPTION A', 92, 348);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 34px Inter, Anuphan, sans-serif';
  ctx.fillText(resultA.formatted, 92, 400);
  ctx.fillStyle = '#a6a6a6';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText(`ผลรวม ${resultA.totalSumAll}  |  สมดุล ${balA.overall}/100`, 92, 450);

  const rightX = 554;
  ctx.fillStyle = '#202020';
  ctx.fillRect(rightX, 304, 462, 180);
  ctx.fillStyle = '#29ABE2';
  ctx.fillRect(rightX, 304, 462, 6);
  ctx.fillStyle = '#29ABE2';
  ctx.font = '500 18px Inter, sans-serif';
  ctx.fillText('OPTION B', rightX + 28, 348);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 34px Inter, Anuphan, sans-serif';
  ctx.fillText(resultB.formatted, rightX + 28, 400);
  ctx.fillStyle = '#a6a6a6';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText(`ผลรวม ${resultB.totalSumAll}  |  สมดุล ${balB.overall}/100`, rightX + 28, 450);

  // 5-Dimension Dual Bars
  const barPanelY = 520;
  ctx.fillStyle = '#181818';
  ctx.fillRect(64, barPanelY, CARD_W - 128, 570);
  ctx.strokeStyle = '#333333';
  ctx.strokeRect(64, barPanelY, CARD_W - 128, 570);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 22px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText('เปรียบเทียบสมดุลพลังงาน 5 ด้าน (ทอง = A  |  ฟ้า = B)', 96, barPanelY + 52);

  let rowY = barPanelY + 112;
  const barMaxW = CARD_W - 192;
  for (const dim of BALANCE_DIMENSIONS) {
    const sA = balA.scores[dim.key];
    const sB = balB.scores[dim.key];
    ctx.fillStyle = '#F5F5F5';
    ctx.font = '400 24px Anuphan, "Noto Sans Thai", sans-serif';
    ctx.fillText(dim.label, 96, rowY);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFC000';
    ctx.font = '600 22px Inter, sans-serif';
    ctx.fillText(`A: ${sA}   /   B: ${sB}`, CARD_W - 96, rowY);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#000000';
    ctx.fillRect(96, rowY + 14, barMaxW, 12);
    ctx.fillStyle = '#FFC000';
    ctx.fillRect(96, rowY + 14, Math.round((barMaxW * sA) / 100), 12);

    ctx.fillStyle = '#000000';
    ctx.fillRect(96, rowY + 32, barMaxW, 12);
    ctx.fillStyle = '#29ABE2';
    ctx.fillRect(96, rowY + 32, Math.round((barMaxW * sB) / 100), 12);

    rowY += 88;
  }

  ctx.fillStyle = '#a6a6a6';
  ctx.font = '400 22px Anuphan, "Noto Sans Thai", sans-serif';
  ctx.fillText(
    `จุดเด่น A: ${balA.topDimension.label}   |   จุดเด่น B: ${balB.topDimension.label}`,
    64,
    1156
  );

  drawFooter(ctx);
  return canvas.toDataURL('image/png');
}
