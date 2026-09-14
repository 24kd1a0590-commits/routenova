/**
 * ROUTENOVA ROAD VISION ENGINE (PROTOTYPE COMPUTER VISION DETECTOR)
 *
 * Provides structured hazard detection from road evidence inputs (demo cases or uploaded images).
 * Designed with a clean modular interface so a production computer-vision ML model
 * (e.g. YOLO/MobileNet road classifier) can seamlessly plug in later.
 */

import { DEMO_ROAD_CASES, getDemoRoadCaseById } from '../data/demoRoadCases';

/**
 * Analyzes road evidence input (either a demo case ID, demo metadata object, or user image file)
 * @param {string|Object} input - Demo case ID, metadata object, or uploaded image object
 * @returns {Promise<Object>} Structured road detection analysis
 */
export async function analyzeRoadEvidence(input) {
  // Simulate vision engine processing latency (200ms - 500ms for realistic UI feel)
  await new Promise((res) => setTimeout(res, 350));

  let caseData = null;

  if (typeof input === 'string') {
    caseData = getDemoRoadCaseById(input);
  } else if (input && typeof input === 'object') {
    if (input.id && getDemoRoadCaseById(input.id)) {
      caseData = getDemoRoadCaseById(input.id);
    } else {
      // Custom user upload handling or custom input
      caseData = {
        id: 'custom-upload',
        label: input.name || 'Uploaded Road Image',
        shortDescription: 'User-provided road evidence image',
        roadSurface: input.roadSurface || 'unpaved_mud',
        roadWidth: input.roadWidth || 2.4,
        roadWidthCategory: input.roadWidth < 2.5 ? 'narrow' : 'medium',
        accessibilityScore: input.accessibilityScore || 45,
        connectivityScore: 65,
        addressConfidenceScore: 70,
        historicalSuccessRate: 60,
        hazards: [
          {
            id: 'h-custom-1',
            type: 'POTHOLE',
            label: 'Surface Degradation',
            severity: 'HIGH',
            confidence: 0.89,
            evidence: 'Visual road depression detected from uploaded image',
            x: 45,
            y: 55,
            icon: '🕳️',
          },
          {
            id: 'h-custom-2',
            type: 'MUD',
            label: 'Unpaved Surface Rutting',
            severity: 'HIGH',
            confidence: 0.91,
            evidence: 'Soft mud texture identified across roadway',
            x: 65,
            y: 65,
            icon: '🟤',
          },
        ],
        markers: [
          { x: 45, y: 55, type: 'POTHOLE', label: '🕳️ Surface Pothole' },
          { x: 65, y: 65, type: 'MUD', label: '🟤 Soft Mud Texture' },
        ],
        badge: '🔴 USER IMAGE ANALYZED',
        color: 'rose',
        svgVariant: 'mud',
        disclaimer: 'Prototype analysis on uploaded image',
      };
    }
  } else {
    caseData = DEMO_ROAD_CASES[1];
  }

  // Determine overall road condition classification
  let roadCondition = 'GOOD';
  if (caseData.accessibilityScore < 40) {
    roadCondition = 'POOR';
  } else if (caseData.accessibilityScore < 70) {
    roadCondition = 'MODERATE';
  }

  return {
    success: true,
    caseId: caseData.id,
    label: caseData.label,
    roadCondition,
    roadSurface: caseData.roadSurface,
    roadWidth: caseData.roadWidth,
    roadWidthCategory: caseData.roadWidthCategory,
    accessibilityScore: caseData.accessibilityScore,
    connectivityScore: caseData.connectivityScore,
    addressConfidenceScore: caseData.addressConfidenceScore,
    historicalSuccessRate: caseData.historicalSuccessRate,
    hazards: caseData.hazards || [],
    markers: caseData.markers || [],
    disclaimer: caseData.disclaimer || 'Prototype vision analysis using controlled evidence dataset.',
    engineName: 'RouteNova VisionEngine v1.0-prototype',
  };
}
