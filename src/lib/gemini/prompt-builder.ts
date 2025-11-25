import type { CanvasElement, AdGuidelinesJSON } from '@/types';

/**
 * Convert vertical canvas position (0-100) to spatial description
 */
function describeVerticalPosition(y: number): string {
  if (y < 25) return 'top';
  if (y < 45) return 'upper-middle';
  if (y < 55) return 'center';
  if (y < 75) return 'lower-middle';
  return 'bottom';
}

/**
 * Convert horizontal canvas position (0-100) to spatial description
 */
function describeHorizontalPosition(x: number): string {
  if (x < 25) return 'left';
  if (x < 45) return 'left-center';
  if (x < 55) return 'center';
  if (x < 75) return 'right-center';
  return 'right';
}

/**
 * Describe element size based on width and height percentages
 */
function describeSize(width: number, height: number): string {
  const area = width * height;
  if (area > 4000) return 'very large';
  if (area > 2000) return 'large';
  if (area > 800) return 'medium';
  if (area > 300) return 'small';
  return 'very small';
}

/**
 * Generate composition prompt from canvas elements
 */
export function generateCompositionPrompt(
  elements: CanvasElement[],
  aspectRatio: string
): string {
  if (!elements || elements.length === 0) {
    return 'Create a balanced composition suitable for advertising.';
  }

  const compositions: string[] = [];

  elements.forEach((element, index) => {
    const verticalPos = describeVerticalPosition(element.y ?? 50);
    const horizontalPos = describeHorizontalPosition(element.x ?? 50);
    const size = describeSize(element.width ?? 20, element.height ?? 20);

    let description = `Element ${index + 1}: `;

    if (element.type === 'product') {
      description += `Product zone - ${size} size, positioned at ${verticalPos} ${horizontalPos}`;
    } else if (element.type === 'headline') {
      description += `Headline "${element.content || ''}" - ${size} size, positioned at ${verticalPos} ${horizontalPos}`;
    } else if (element.type === 'usp') {
      description += `USP "${element.content || ''}" - ${size} size, positioned at ${verticalPos} ${horizontalPos}`;
    } else if (element.type === 'cta') {
      description += `CTA "${element.content || ''}" - ${size} size, positioned at ${verticalPos} ${horizontalPos}`;
    } else {
      description += `${element.type} element - ${size} size, positioned at ${verticalPos} ${horizontalPos}`;
    }

    compositions.push(description);
  });

  return compositions.join('. ') + '.';
}

/**
 * Build complete prompt from guidelines and canvas layout
 */
export function buildCompletePrompt(
  guidelines: AdGuidelinesJSON,
  canvasElements: CanvasElement[],
  headlines: string[],
  usps: string[],
  cta: string
): string {
  const sections: string[] = [];

  // VISUAL STYLE SECTION
  const styleSection: string[] = ['=== VISUAL STYLE ==='];

  if (guidelines.design?.style) {
    styleSection.push(`Style Preset: ${guidelines.design.style}`);
  }

  if (guidelines.design?.tone) {
    styleSection.push(`Brand Tone: ${guidelines.design.tone}`);
  }

  if (guidelines.design?.brandColors) {
    const colors = Object.values(guidelines.design.brandColors).filter(Boolean);
    if (colors.length > 0) {
      styleSection.push(`Brand Colors: ${colors.join(', ')}`);
    }
  }

  sections.push(styleSection.join('\n'));

  // AD CONTENT SECTION
  const contentSection: string[] = ['=== AD CONTENT ==='];

  if (headlines.length > 0) {
    contentSection.push(`Headlines: ${headlines.join(' | ')}`);
  }

  if (usps.length > 0) {
    contentSection.push(`Key USPs: ${usps.join(', ')}`);
  }

  if (cta) {
    contentSection.push(`Call-to-Action: ${cta}`);
  }

  sections.push(contentSection.join('\n'));

  // COMPOSITION LAYOUT SECTION
  if (canvasElements && canvasElements.length > 0) {
    const layoutSection: string[] = ['=== COMPOSITION LAYOUT ==='];
    const compositionDesc = generateCompositionPrompt(
      canvasElements,
      guidelines.design?.aspectRatio || '1:1'
    );
    layoutSection.push(compositionDesc);
    sections.push(layoutSection.join('\n'));
  }

  // REQUIREMENTS SECTION
  const requirementsSection: string[] = ['=== REQUIREMENTS ==='];

  if (guidelines.design?.aspectRatio) {
    requirementsSection.push(`Aspect Ratio: ${guidelines.design.aspectRatio}`);
  }

  if (guidelines.instructions?.targetAudience) {
    requirementsSection.push(`Target Audience: ${guidelines.instructions.targetAudience}`);
  }

  if (guidelines.instructions?.customInstructions) {
    requirementsSection.push(`Custom Instructions: ${guidelines.instructions.customInstructions}`);
  }

  sections.push(requirementsSection.join('\n'));

  return sections.join('\n\n');
}
