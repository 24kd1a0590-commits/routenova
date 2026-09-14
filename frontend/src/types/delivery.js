/**
 * RouteNova Data Models & Types (JSDoc Interface Definitions)
 */

/**
 * @typedef {'LOW' | 'MEDIUM' | 'HIGH'} RiskLevel
 */

/**
 * @typedef {'PRE_DISPATCH_EVALUATION' | 'POOL_MATCHED' | 'DISPATCHED' | 'DELIVERED' | 'FAILURE_REATTEMPT'} DeliveryStatus
 */

/**
 * @typedef {'Motorcycle' | 'Electric 3-Wheeler' | 'Standard Van' | 'Mini Truck' | '4x4 Pickup'} VehicleTypeCategory
 */

/**
 * @typedef {Object} GeoCoordinates
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} SixFactorsEvaluation
 * @property {{ score: number, status: string, detail: string }} roadAccessibility
 * @property {{ score: number, status: string, detail: string }} vehicleRoadCompatibility
 * @property {{ score: number, status: string, detail: string }} addressConfidence
 * @property {{ score: number, status: string, detail: string }} connectivityReliability
 * @property {{ score: number, status: string, detail: string }} historicalEvidence
 * @property {{ score: number, status: string, detail: string }} distanceConditions
 */

/**
 * @typedef {Object} PlanComparison
 * @property {string} planName
 * @property {string} vehicle
 * @property {string} failureProbability
 * @property {number} expectedLoss
 * @property {number} [vehicleCost]
 * @property {number} [delayCost]
 * @property {number} [reattemptCost]
 * @property {boolean} [isRecommended]
 * @property {string[]} [failureModes]
 * @property {string} [pooledWithCustomer]
 */

/**
 * @typedef {Object} Delivery
 * @property {string} id
 * @property {string} customer
 * @property {string} destination
 * @property {string} region
 * @property {string} cargo
 * @property {number} weightKg
 * @property {number} volumeM3
 * @property {string} priority
 * @property {DeliveryStatus} status
 * @property {RiskLevel} riskLevel
 * @property {number} failureProbability
 * @property {string} conventionalVehicle
 * @property {string} recommendedVehicle
 * @property {GeoCoordinates} coordinates
 * @property {string} dispatchWindow
 * @property {string} [addressDescription]
 * @property {SixFactorsEvaluation} [sixFactors]
 * @property {{ baseline: PlanComparison, alternative?: PlanComparison, pooled?: PlanComparison }} [lossComparison]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} PresetDestination
 * @property {string} id
 * @property {string} name
 * @property {string} district
 * @property {GeoCoordinates} coordinates
 * @property {string} defaultCustomer
 * @property {string} defaultCargo
 * @property {number} defaultWeight
 * @property {number} defaultVolume
 * @property {string} defaultWindow
 * @property {string} addressDescription
 * @property {RiskLevel} prototypeRiskLevel
 */
