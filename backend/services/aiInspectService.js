// AI 이미지 검수 서비스
// Anthropic Claude Vision API를 사용하여 인쇄 위험 요소를 진단한다.
// 참조: CLAUDE.md ## 6 코드 컨벤션 (Backend)
const fs = require('fs');
const sharp = require('sharp');
const Anthropic = require('@anthropic-ai/sdk');

// 싱글톤 클라이언트 (lazy init - 첫 호출 시 1회 초기화)
let client = null;

function getClient() {
  if (client === null) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const MODEL = 'claude-sonnet-4-6';
const MAX_LONG_SIDE = 1280;
const JPEG_QUALITY = 80;

// 이미지 → 리사이즈 + JPEG 재인코딩 → base64
async function loadImageAsBase64(filePath) {
  const buffer = await sharp(filePath)
    .rotate() // EXIF 회전 보정
    .resize({
      width: MAX_LONG_SIDE,
      height: MAX_LONG_SIDE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();
  return buffer.toString('base64');
}

// 프롬프트 구성
function buildPrompt(bookSpec, pageNo) {
  const specLine = bookSpec
    ? `판형: ${bookSpec.name ?? '미지정'} (내지 ${bookSpec.innerTrimWidthMm ?? '?'}mm × ${bookSpec.innerTrimHeightMm ?? '?'}mm)`
    : '판형 정보 없음';
  const pageLine = pageNo != null ? `페이지 번호: ${pageNo}` : '';

  return `당신은 인쇄 품질 검수 전문가입니다. 아래 이미지가 포토북 인쇄에 사용되었을 때 발생할 수 있는 위험 요소를 진단하세요.

${specLine}
${pageLine}

진단 항목:
1. 재단선(Trim) 침범 — 중요한 요소가 가장자리에 너무 가까운가?
2. 안전 영역(Safe Zone) 이탈 — 텍스트/얼굴이 잘릴 위험이 있는가?
3. DPI 부족 — 해상도가 낮아 보이는가? (픽셀화, 흐림)
4. 회전/방향 문제 — 이미지가 잘못된 방향인가?
5. 빈 페이지 / 거의 빈 콘텐츠
6. 텍스트 가독성 — 텍스트가 있다면 읽을 수 있는가?

반드시 아래 JSON 스키마로만 응답하세요. 마크다운 코드 펜스, 설명 문구 금지.
{
  "level": "ok" | "warn" | "danger",
  "issues": ["문제1", "문제2"],
  "recommendation": "개선 권장 사항 한 줄"
}

level 기준:
- ok: 인쇄에 문제 없음
- warn: 경미한 위험, 검토 권장
- danger: 인쇄 시 명백한 품질 저하 예상`;
}

// 응답 텍스트에서 JSON 파싱 (markdown fence 제거)
function parseJsonResponse(text) {
  let cleaned = String(text || '').trim();
  // ```json ... ``` 또는 ``` ... ``` 제거
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  // 첫 { 부터 마지막 } 까지
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return JSON.parse(cleaned);
}

// 단일 이미지 검수
async function inspectOne(file, bookSpec) {
  const { fileName, filePath, pageNo } = file;
  try {
    if (!fs.existsSync(filePath)) {
      return {
        fileName,
        pageNo: pageNo ?? null,
        level: 'warn',
        issues: ['파일이 존재하지 않음'],
        recommendation: '파일 경로를 확인하세요.',
      };
    }

    const base64 = await loadImageAsBase64(filePath);
    const prompt = buildPrompt(bookSpec, pageNo);

    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64,
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const textBlock = (response.content || []).find((b) => b.type === 'text');
    const rawText = textBlock ? textBlock.text : '';

    let parsed;
    try {
      parsed = parseJsonResponse(rawText);
    } catch (e) {
      return {
        fileName,
        pageNo: pageNo ?? null,
        level: 'warn',
        issues: ['AI 응답 파싱 실패'],
        recommendation: String(rawText).slice(0, 200),
      };
    }

    const level = ['ok', 'warn', 'danger'].includes(parsed.level) ? parsed.level : 'warn';
    return {
      fileName,
      pageNo: pageNo ?? null,
      level,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      recommendation: typeof parsed.recommendation === 'string' ? parsed.recommendation : '',
    };
  } catch (err) {
    // 라우트 레벨에서 일괄 처리되도록 throw
    err.message = `[aiInspect] ${fileName} 검수 실패: ${err.message}`;
    throw err;
  }
}

// 여러 이미지 병렬 검수
async function inspectImages(files, bookSpec) {
  if (!Array.isArray(files) || files.length === 0) {
    return { summary: { ok: 0, warn: 0, danger: 0 }, pages: [] };
  }

  const pages = await Promise.all(files.map((f) => inspectOne(f, bookSpec)));

  const summary = pages.reduce(
    (acc, p) => {
      if (p.level === 'ok') acc.ok += 1;
      else if (p.level === 'danger') acc.danger += 1;
      else acc.warn += 1;
      return acc;
    },
    { ok: 0, warn: 0, danger: 0 }
  );

  return { summary, pages };
}

module.exports = { inspectImages };
