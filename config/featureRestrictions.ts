/**
 * Feature Restriction Configuration System
 * 
 * This module provides a centralized way to manage feature access restrictions
 * based on customer names and subscription levels.
 * 
 * @example
 * // Check if a feature is restricted for a customer
 * const isRestricted = isFeatureRestricted('Prevailing Wage', 'CustomerA');
 * 
 * // Get upgrade message for a feature
 * const message = getFeatureUpgradeMessage('GHG');
 */

/**
 * Represents a feature restriction configuration
 * @interface FeatureRestriction
 * @property {string} featureId - Unique identifier for the feature (must match sidebar menu label)
 * @property {string[]} restrictedCustomers - Array of customer names for whom this feature is restricted
 * @property {string} [upgradeMessage] - Custom message to show when feature is locked
 * @property {'Basic' | 'Premium' | 'Enterprise'} [subscriptionLevel] - Required subscription level to access feature
 * @property {string} [contactEmail] - Specific email for upgrade inquiries
 * @property {string} [upgradeUrl] - URL to upgrade subscription page
 */
export interface FeatureRestriction {
  featureId: string;
  restrictedCustomers: string[];
  upgradeMessage?: string;
  subscriptionLevel?: 'Basic' | 'Premium' | 'Enterprise';
  contactEmail?: string;
  upgradeUrl?: string;
  restrictionStartDate?: string;
  restrictionEndDate?: string;
}

/**
 * Configuration for feature restrictions
 * 
 * @example
 * // Adding a new restricted feature
 * {
 *   featureId: 'New Feature',
 *   restrictedCustomers: ['CustomerA', 'CustomerB'],
 *   upgradeMessage: 'Upgrade to Premium to access this feature',
 *   subscriptionLevel: 'Premium',
 *   contactEmail: 'sales@rimba.ai'
 * }
 */
export const RESTRICTED_FEATURES: FeatureRestriction[] = [
  {
    featureId: 'Prevailing Wage',
    restrictedCustomers: ['Brightmark'],
    upgradeMessage: 'Prevailing Wage module requires Premium subscription',
    subscriptionLevel: 'Premium',
    contactEmail: 'start@rimba.ai',
  },
  {
    featureId: 'GHG',
    restrictedCustomers: [],
    upgradeMessage: 'GHG module requires Premium subscription',
    subscriptionLevel: 'Premium',
    contactEmail: 'start@rimba.ai',
  },
  // Add more feature restrictions as needed
];

/**
 * Checks if a feature is restricted for a given customer
 * 
 * @param {string} featureId - The ID of the feature to check
 * @param {string | undefined} customerName - The name of the customer
 * @returns {boolean} True if the feature is restricted for the customer
 * 
 * @example
 * // In sidebar component
 * const isRestricted = isFeatureRestricted(item.label, customerData?.name);
 * if (isRestricted) {
 *   // Show locked state
 * }
 */
export function isFeatureRestricted(featureId: string, customerName: string | undefined): boolean {
  if (!customerName) return false;
  
  const restriction = RESTRICTED_FEATURES.find(r => r.featureId === featureId);
  return restriction ? restriction.restrictedCustomers.includes(customerName) : false;
}

/**
 * Gets the upgrade message for a restricted feature
 * 
 * @param {string} featureId - The ID of the feature
 * @returns {string} The upgrade message or default message if not specified
 * 
 * @example
 * // In UnlockFeatureModal component
 * const message = getFeatureUpgradeMessage('Prevailing Wage');
 * // Display message in modal
 */
export function getFeatureUpgradeMessage(featureId: string): string {
  const restriction = RESTRICTED_FEATURES.find(r => r.featureId === featureId);
  return restriction?.upgradeMessage || 'This feature requires a plan upgrade';
}

/**
 * Usage Guide:
 * 
 * 1. Adding a New Restricted Feature:
 *    - Add a new entry to RESTRICTED_FEATURES array
 *    - Make sure featureId matches exactly with the sidebar menu label
 *    - Add restricted customer names to restrictedCustomers array
 * 
 * 2. In Sidebar Component:
 *    ```typescript
 *    import { isFeatureRestricted } from '@/config/featureRestrictions';
 *    
 *    // Replace direct checks with config-based check
 *    const isRestricted = isFeatureRestricted(item.label, customerData?.name);
 *    ```
 * 
 * 3. In UnlockFeatureModal:
 *    ```typescript
 *    import { getFeatureUpgradeMessage } from '@/config/featureRestrictions';
 *    
 *    const upgradeMessage = getFeatureUpgradeMessage(featureName);
 *    // Use upgradeMessage in modal
 *    ```
 * 
 * 4. Extending Functionality:
 *    - Add new properties to FeatureRestriction interface
 *    - Create new helper functions as needed
 *    - Update existing functions to handle new properties
 */ 