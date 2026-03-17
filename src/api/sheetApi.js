/**
 * API Utility for interacting with Google Apps Script Backend
 * Uses a single GAS URL serving multiple sheets via the ?sheetName= parameter
 */

// The single URL provided by the user that contains all the tabs
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzPKN3S7QRy6zBV3U6PxJ6i4nJEPwXwu9CRMAlmiJdmeImd6Iat-Tl12peIeh5ve0Fy/exec';

export const sheetApi = {
  /**
   * Fetch data from a specific sheet
   * @param {string} sheetName - Target sheet tab name (e.g. 'Members', 'Resources')
   * @returns {Promise<Array>} - Array of row objects
   */
  read: async (sheetName) => {
    try {
      // Add a cache-busting timestamp to prevent the browser from returning stale GET responses
      const timestamp = new Date().getTime();
      const response = await fetch(`${GAS_URL}?sheetName=${encodeURIComponent(sheetName)}&t=${timestamp}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        return result.data || [];
      } else {
        throw new Error(result.message || `Failed to fetch ${sheetName}`);
      }
    } catch (error) {
      console.error(`Error reading ${sheetName}:`, error);
      throw error;
    }
  },

  /**
   * Add a new row to a specific sheet
   * @param {string} sheetName - Target sheet tab name
   * @param {Object} data - Key-value pair matching the columns expected by GAS
   */
  add: async (sheetName, data) => {
    const payload = {
      action: 'add',
      sheetName: sheetName,
      ...data
    };

    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Prevent CORS preflight issues
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.status !== 'success') {
        throw new Error(result.message || `Failed to add to ${sheetName}`);
      }
      return result;
    } catch (error) {
      console.error(`Error adding to ${sheetName}:`, error);
      throw error;
    }
  },

  /**
   * Delete a row from a specific sheet
   */
  delete: async (sheetName, rowNumber) => {
    const payload = {
      action: 'delete',
      sheetName: sheetName,
      rowNumber: rowNumber
    };

    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.status !== 'success') {
        throw new Error(result.message || `Failed to delete from ${sheetName}`);
      }
      return result;
    } catch (error) {
      console.error(`Error deleting from ${sheetName}:`, error);
      throw error;
    }
  }
};
