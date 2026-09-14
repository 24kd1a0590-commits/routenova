/**
 * ROUTENOVA RELIABILITY ENGINE TEST SUITE
 * Test cases validating the 6 required scenarios:
 * 1. High Risk Scenario (Unpaved mud + 2WD Van + low cell signal)
 * 2. Medium Risk Scenario (Gravel track + standard van)
 * 3. Low Risk Scenario (Paved highway + 4x4 pickup + 5G)
 * 4. Vehicle Mismatch Scenario (Payload overload or ground clearance failure)
 * 5. Poor Road Accessibility Scenario (Unpaved track)
 * 6. Low Address Confidence Scenario (Uncertain geocode)
 */

import { evaluateDeliveryPlan } from './reliabilityEngine';

export const ENGINE_TEST_CASES = [
  {
    name: "1. High Risk Scenario (Unpaved mud, 2WD Van, Cell dead zone)",
    input: {
      destination: {
        id: "TEST-HIGH",
        name: "Rampuram Sector 4",
        roadAccessScore: 30,
        addressConfidenceScore: 50,
        connectivityScore: 25,
        historicalSuccessRate: 40,
        roadSurface: "unpaved_mud",
        roadWidthCategory: "narrow",
      },
      vehicle: {
        id: "VEH-VAN-01",
        name: "Standard Delivery Van 2WD",
        type: "van",
        capacityKg: 850,
        groundClearanceMm: 140,
        roadCompatibility: { unpaved_mud: 28, paved_asphalt: 98 },
      },
      shipment: { weightKg: 240 },
    },
    expectedRiskLevel: "HIGH",
  },
  {
    name: "2. Medium Risk Scenario (Gravel track, standard van)",
    input: {
      destination: {
        id: "TEST-MED",
        name: "Pathapatnam Valley",
        roadAccessScore: 60,
        addressConfidenceScore: 75,
        connectivityScore: 55,
        historicalSuccessRate: 70,
        roadSurface: "gravel_track",
        roadWidthCategory: "standard",
      },
      vehicle: {
        id: "VEH-VAN-02",
        name: "Maruti Eeco Cargo Van",
        type: "van",
        capacityKg: 600,
        groundClearanceMm: 155,
        roadCompatibility: { gravel_track: 60, paved_asphalt: 96 },
      },
      shipment: { weightKg: 180 },
    },
    expectedRiskLevel: "MEDIUM",
  },
  {
    name: "3. Low Risk Scenario (Paved highway, 4x4 pickup, full 5G)",
    input: {
      destination: {
        id: "TEST-LOW",
        name: "Garividi Substation Gate 2",
        roadAccessScore: 95,
        addressConfidenceScore: 98,
        connectivityScore: 95,
        historicalSuccessRate: 98,
        roadSurface: "paved_asphalt",
        roadWidthCategory: "wide",
      },
      vehicle: {
        id: "VEH-PKP-01",
        name: "Mahindra Bolero Camper 4x4",
        type: "pickup",
        capacityKg: 1500,
        groundClearanceMm: 240,
        roadCompatibility: { paved_asphalt: 90, unpaved_mud: 96 },
      },
      shipment: { weightKg: 120 },
    },
    expectedRiskLevel: "LOW",
  },
  {
    name: "4. Vehicle Mismatch Scenario (Payload Overload: 900kg on 800kg van)",
    input: {
      destination: {
        id: "TEST-MISMATCH",
        name: "Central Depot",
        roadAccessScore: 90,
        addressConfidenceScore: 90,
        connectivityScore: 90,
        historicalSuccessRate: 90,
        roadSurface: "paved_asphalt",
        roadWidthCategory: "standard",
      },
      vehicle: {
        id: "VEH-VAN-OVERLOAD",
        name: "Light Delivery Van",
        type: "van",
        capacityKg: 800,
        roadCompatibility: { paved_asphalt: 95 },
      },
      shipment: { weightKg: 950 }, // Overweight!
    },
    expectedRiskLevel: "HIGH", // Reduced score due to 0 compatibility
  },
  {
    name: "5. Poor Road Accessibility Scenario (Unpaved track, score = 20)",
    input: {
      destination: {
        id: "TEST-POOR-ROAD",
        name: "Veepangandla Forest Post",
        roadAccessScore: 20,
        addressConfidenceScore: 70,
        connectivityScore: 30,
        historicalSuccessRate: 50,
        roadSurface: "unpaved_mud",
        roadWidthCategory: "narrow",
      },
      vehicle: {
        id: "VEH-MOTO-01",
        name: "Cargo Moto 150",
        type: "motorcycle",
        capacityKg: 80,
        groundClearanceMm: 165,
        roadCompatibility: { unpaved_mud: 40 },
      },
      shipment: { weightKg: 35 },
    },
    expectedRiskLevel: "HIGH",
  },
  {
    name: "6. Low Address Confidence Scenario (Uncertain Geocode = 35)",
    input: {
      destination: {
        id: "TEST-LOW-ADDR",
        name: "Unmapped Village Settlement",
        roadAccessScore: 70,
        addressConfidenceScore: 35,
        connectivityScore: 50,
        historicalSuccessRate: 60,
        roadSurface: "mixed",
        roadWidthCategory: "standard",
      },
      vehicle: {
        id: "VEH-MINI-01",
        name: "Tata Ace Gold 4x4 Mini Truck",
        type: "mini_truck",
        capacityKg: 1200,
        groundClearanceMm: 220,
        roadCompatibility: { mixed: 95 },
      },
      shipment: { weightKg: 200 },
    },
    expectedRiskLevel: "MEDIUM",
  },
];

/**
 * Runner function to execute test suite in browser console or Node environment
 */
export function runEngineTests() {
  console.log("=== ROUTENOVA RELIABILITY ENGINE TEST SUITE ===");
  let passedCount = 0;

  ENGINE_TEST_CASES.forEach((testCase) => {
    const result = evaluateDeliveryPlan(testCase.input);
    const passed = result.riskLevel === testCase.expectedRiskLevel;
    if (passed) passedCount++;

    console.log(`\n[${passed ? 'PASS' : 'FAIL'}] ${testCase.name}`);
    console.log(` - Reliability Score: ${result.reliabilityScore}/100`);
    console.log(` - Risk Level: ${result.riskLevel} (Expected: ${testCase.expectedRiskLevel})`);
    console.log(` - Primary Risk: ${result.primaryRisk}`);
    console.log(` - Explanation: ${result.explanation}`);
  });

  console.log(`\n=== RESULTS: ${passedCount}/${ENGINE_TEST_CASES.length} TEST CASES PASSED ===`);
  return { passedCount, total: ENGINE_TEST_CASES.length };
}
