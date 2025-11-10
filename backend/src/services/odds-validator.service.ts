import { ProcessedOdds } from './odds-processor.service';
import { db as knex } from '../db/knex';

/**
 * Odds Validator Service
 * Validates odds values, checks implied probabilities, and flags anomalies
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  value?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  value?: any;
}

export interface AnomalyDetectionResult {
  isAnomalous: boolean;
  anomalyType?: 'sudden_spike' | 'sudden_drop' | 'impossible_odds' | 'margin_anomaly';
  severity: 'low' | 'medium' | 'high';
  details: string;
  previousOdds?: number;
  currentOdds: number;
  changePercentage?: number;
}

export class OddsValidatorService {
  private readonly MIN_ODDS = 1.01;
  private readonly MAX_ODDS = 1000;
  private readonly MIN_BOOKMAKER_MARGIN = 100;
  private readonly MAX_BOOKMAKER_MARGIN = 150;
  private readonly ANOMALY_THRESHOLD_PERCENT = 20;

  /**
   * Validate a single odds entry
   */
  validateOdds(odds: ProcessedOdds): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate win odds
    if (!this.isValidOddsValue(odds.winOdds)) {
      errors.push({
        code: 'INVALID_WIN_ODDS',
        message: `Win odds must be between ${this.MIN_ODDS} and ${this.MAX_ODDS}`,
        field: 'winOdds',
        value: odds.winOdds,
      });
    }

    // Validate place odds if present
    if (odds.placeOdds !== undefined && odds.placeOdds !== null) {
      if (!this.isValidOddsValue(odds.placeOdds)) {
        errors.push({
          code: 'INVALID_PLACE_ODDS',
          message: `Place odds must be between ${this.MIN_ODDS} and ${this.MAX_ODDS}`,
          field: 'placeOdds',
          value: odds.placeOdds,
        });
      }

      // Place odds should be lower than win odds
      if (odds.placeOdds >= odds.winOdds) {
        warnings.push({
          code: 'PLACE_ODDS_TOO_HIGH',
          message: 'Place odds should be lower than win odds',
          field: 'placeOdds',
          value: odds.placeOdds,
        });
      }
    }

    // Validate timestamp
    if (!odds.timestamp || isNaN(odds.timestamp.getTime())) {
      errors.push({
        code: 'INVALID_TIMESTAMP',
        message: 'Invalid timestamp',
        field: 'timestamp',
        value: odds.timestamp,
      });
    }

    // Check if timestamp is in the future (with 5 minute tolerance)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (odds.timestamp > fiveMinutesFromNow) {
      warnings.push({
        code: 'FUTURE_TIMESTAMP',
        message: 'Timestamp is in the future',
        field: 'timestamp',
        value: odds.timestamp,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate odds value is within acceptable range
   */
  isValidOddsValue(odds: number): boolean {
    return (
      typeof odds === 'number' &&
      !isNaN(odds) &&
      odds >= this.MIN_ODDS &&
      odds <= this.MAX_ODDS
    );
  }

  /**
   * Validate implied probability sum for a race
   */
  async validateImpliedProbabilities(
    raceId: string,
    bookmakerId: string,
    oddsEntries: ProcessedOdds[]
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Filter odds for this race and bookmaker
    const relevantOdds = oddsEntries.filter(
      (o) => o.raceId === raceId && o.bookmakerId === bookmakerId
    );

    if (relevantOdds.length === 0) {
      return { valid: true, errors, warnings };
    }

    // Calculate total implied probability
    const totalProbability = relevantOdds.reduce((sum, odds) => {
      return sum + this.calculateImpliedProbability(odds.winOdds);
    }, 0);

    // Check if total probability is reasonable (should be > 100% due to bookmaker margin)
    if (totalProbability < this.MIN_BOOKMAKER_MARGIN) {
      warnings.push({
        code: 'LOW_IMPLIED_PROBABILITY',
        message: `Total implied probability (${totalProbability.toFixed(2)}%) is below expected minimum (${this.MIN_BOOKMAKER_MARGIN}%)`,
        value: totalProbability,
      });
    }

    if (totalProbability > this.MAX_BOOKMAKER_MARGIN) {
      warnings.push({
        code: 'HIGH_IMPLIED_PROBABILITY',
        message: `Total implied probability (${totalProbability.toFixed(2)}%) exceeds expected maximum (${this.MAX_BOOKMAKER_MARGIN}%)`,
        value: totalProbability,
      });
    }

    // Calculate bookmaker margin
    const margin = totalProbability - 100;
    if (margin < 0) {
      errors.push({
        code: 'NEGATIVE_MARGIN',
        message: `Bookmaker margin is negative (${margin.toFixed(2)}%), indicating arbitrage opportunity or data error`,
        value: margin,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate implied probability from decimal odds
   */
  calculateImpliedProbability(odds: number): number {
    return (1 / odds) * 100;
  }

  /**
   * Detect anomalous odds changes
   */
  async detectAnomalousChanges(
    odds: ProcessedOdds,
    thresholdPercent: number = this.ANOMALY_THRESHOLD_PERCENT
  ): Promise<AnomalyDetectionResult> {
    // Get most recent odds for this horse/bookmaker combination
    const previousOdds = await this.getPreviousOdds(
      odds.raceId,
      odds.horseId,
      odds.bookmakerId
    );

    if (!previousOdds) {
      // No previous odds to compare
      return {
        isAnomalous: false,
        severity: 'low',
        details: 'No previous odds available for comparison',
        currentOdds: odds.winOdds,
      };
    }

    const changePercent = this.calculateChangePercentage(
      previousOdds.win_odds,
      odds.winOdds
    );

    // Check for sudden spike (odds increased significantly)
    if (changePercent > thresholdPercent) {
      return {
        isAnomalous: true,
        anomalyType: 'sudden_spike',
        severity: this.calculateSeverity(changePercent),
        details: `Odds increased by ${changePercent.toFixed(2)}% from ${previousOdds.win_odds} to ${odds.winOdds}`,
        previousOdds: previousOdds.win_odds,
        currentOdds: odds.winOdds,
        changePercentage: changePercent,
      };
    }

    // Check for sudden drop (odds decreased significantly)
    if (changePercent < -thresholdPercent) {
      return {
        isAnomalous: true,
        anomalyType: 'sudden_drop',
        severity: this.calculateSeverity(Math.abs(changePercent)),
        details: `Odds decreased by ${Math.abs(changePercent).toFixed(2)}% from ${previousOdds.win_odds} to ${odds.winOdds}`,
        previousOdds: previousOdds.win_odds,
        currentOdds: odds.winOdds,
        changePercentage: changePercent,
      };
    }

    return {
      isAnomalous: false,
      severity: 'low',
      details: 'Odds change within normal range',
      previousOdds: previousOdds.win_odds,
      currentOdds: odds.winOdds,
      changePercentage: changePercent,
    };
  }

  /**
   * Get previous odds for comparison
   */
  private async getPreviousOdds(
    raceId: string,
    horseId: string,
    bookmakerId: string
  ): Promise<{ win_odds: number; timestamp: Date } | null> {
    const result = await knex('odds_snapshots')
      .where('race_id', raceId)
      .where('horse_id', horseId)
      .where('bookmaker_id', bookmakerId)
      .orderBy('timestamp', 'desc')
      .first('win_odds', 'timestamp');

    return result || null;
  }

  /**
   * Calculate percentage change between two odds values
   */
  private calculateChangePercentage(oldOdds: number, newOdds: number): number {
    return ((newOdds - oldOdds) / oldOdds) * 100;
  }

  /**
   * Calculate severity based on change percentage
   */
  private calculateSeverity(changePercent: number): 'low' | 'medium' | 'high' {
    const absChange = Math.abs(changePercent);

    if (absChange >= 50) {
      return 'high';
    } else if (absChange >= 30) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Batch validate multiple odds entries
   */
  async batchValidate(
    oddsEntries: ProcessedOdds[]
  ): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    for (const odds of oddsEntries) {
      const key = `${odds.raceId}-${odds.horseId}-${odds.bookmakerId}`;
      const validation = this.validateOdds(odds);
      results.set(key, validation);
    }

    return results;
  }

  /**
   * Batch detect anomalies for multiple odds entries
   */
  async batchDetectAnomalies(
    oddsEntries: ProcessedOdds[],
    thresholdPercent?: number
  ): Promise<Map<string, AnomalyDetectionResult>> {
    const results = new Map<string, AnomalyDetectionResult>();

    for (const odds of oddsEntries) {
      const key = `${odds.raceId}-${odds.horseId}-${odds.bookmakerId}`;
      const anomaly = await this.detectAnomalousChanges(odds, thresholdPercent);
      
      // Only store if anomalous
      if (anomaly.isAnomalous) {
        results.set(key, anomaly);
      }
    }

    return results;
  }

  /**
   * Get validation summary statistics
   */
  getValidationSummary(
    validationResults: Map<string, ValidationResult>
  ): {
    total: number;
    valid: number;
    invalid: number;
    withWarnings: number;
    validationRate: number;
  } {
    const total = validationResults.size;
    let valid = 0;
    let invalid = 0;
    let withWarnings = 0;

    validationResults.forEach((result) => {
      if (result.valid) {
        valid++;
      } else {
        invalid++;
      }

      if (result.warnings.length > 0) {
        withWarnings++;
      }
    });

    return {
      total,
      valid,
      invalid,
      withWarnings,
      validationRate: total > 0 ? (valid / total) * 100 : 0,
    };
  }

  /**
   * Filter out invalid odds entries
   */
  filterValidOdds(
    oddsEntries: ProcessedOdds[],
    validationResults: Map<string, ValidationResult>
  ): ProcessedOdds[] {
    return oddsEntries.filter((odds) => {
      const key = `${odds.raceId}-${odds.horseId}-${odds.bookmakerId}`;
      const result = validationResults.get(key);
      return result?.valid !== false;
    });
  }
}

export const oddsValidatorService = new OddsValidatorService();
