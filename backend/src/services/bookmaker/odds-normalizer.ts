import {
  RaceEvent,
  BookmakerOdds,
  Outcome,
  NormalizedOdds,
} from '../../types/bookmaker.types';

/**
 * Odds Normalizer Service
 * Normalizes odds data from different sources into a consistent format
 */
export class OddsNormalizer {
  /**
   * Normalize odds from The Odds API format
   */
  normalizeOddsApiEvent(
    event: RaceEvent,
    raceId: string
  ): NormalizedOdds[] {
    const normalizedOdds: NormalizedOdds[] = [];

    for (const bookmaker of event.bookmakers) {
      const bookmakerOdds = this.normalizeBookmakerOdds(
        bookmaker,
        raceId,
        event.commenceTime
      );
      normalizedOdds.push(...bookmakerOdds);
    }

    return normalizedOdds;
  }

  /**
   * Normalize bookmaker odds
   */
  private normalizeBookmakerOdds(
    bookmaker: BookmakerOdds,
    raceId: string,
    timestamp: Date
  ): NormalizedOdds[] {
    const normalizedOdds: NormalizedOdds[] = [];

    for (const market of bookmaker.markets) {
      if (market.key === 'h2h') {
        // Win odds
        for (const outcome of market.outcomes) {
          normalizedOdds.push({
            raceId,
            horseId: '', // Will be matched later
            horseName: outcome.name,
            bookmaker: bookmaker.key,
            winOdds: outcome.price,
            market: 'AU',
            timestamp,
            sourceType: 'api',
          });
        }
      }
    }

    return normalizedOdds;
  }

  /**
   * Extract best odds for each horse across all bookmakers
   */
  extractBestOdds(normalizedOdds: NormalizedOdds[]): Map<string, {
    bestWinOdds: number;
    bestBookmaker: string;
    allOdds: Array<{ bookmaker: string; odds: number }>;
  }> {
    const bestOddsMap = new Map<string, {
      bestWinOdds: number;
      bestBookmaker: string;
      allOdds: Array<{ bookmaker: string; odds: number }>;
    }>();

    for (const odds of normalizedOdds) {
      const existing = bestOddsMap.get(odds.horseName);

      if (!existing) {
        bestOddsMap.set(odds.horseName, {
          bestWinOdds: odds.winOdds,
          bestBookmaker: odds.bookmaker,
          allOdds: [{ bookmaker: odds.bookmaker, odds: odds.winOdds }],
        });
      } else {
        existing.allOdds.push({ bookmaker: odds.bookmaker, odds: odds.winOdds });
        
        // Update best odds if current is better
        if (odds.winOdds > existing.bestWinOdds) {
          existing.bestWinOdds = odds.winOdds;
          existing.bestBookmaker = odds.bookmaker;
        }
      }
    }

    return bestOddsMap;
  }

  /**
   * Calculate odds movement
   */
  calculateOddsMovement(
    currentOdds: number,
    previousOdds: number
  ): {
    change: number;
    percentageChange: number;
    direction: 'up' | 'down' | 'stable';
  } {
    const change = currentOdds - previousOdds;
    const percentageChange = ((change / previousOdds) * 100);

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (change > 0.01) direction = 'up';
    else if (change < -0.01) direction = 'down';

    return {
      change,
      percentageChange,
      direction,
    };
  }

  /**
   * Validate odds value
   */
  validateOdds(odds: number): boolean {
    return odds >= 1.01 && odds <= 1000;
  }

  /**
   * Calculate implied probability from decimal odds
   */
  calculateImpliedProbability(odds: number): number {
    return (1 / odds) * 100;
  }

  /**
   * Calculate bookmaker margin (overround)
   */
  calculateBookmakerMargin(outcomes: Outcome[]): number {
    const totalProbability = outcomes.reduce((sum, outcome) => {
      return sum + this.calculateImpliedProbability(outcome.price);
    }, 0);

    return totalProbability - 100;
  }

  /**
   * Detect anomalous odds changes
   */
  detectAnomalousChange(
    currentOdds: number,
    previousOdds: number,
    threshold: number = 20
  ): boolean {
    const movement = this.calculateOddsMovement(currentOdds, previousOdds);
    return Math.abs(movement.percentageChange) > threshold;
  }

  /**
   * Format odds for display
   */
  formatOdds(odds: number, format: 'decimal' | 'fractional' | 'american' = 'decimal'): string {
    switch (format) {
      case 'decimal':
        return odds.toFixed(2);
      
      case 'fractional':
        return this.decimalToFractional(odds);
      
      case 'american':
        return this.decimalToAmerican(odds);
      
      default:
        return odds.toFixed(2);
    }
  }

  /**
   * Convert decimal odds to fractional
   */
  private decimalToFractional(decimal: number): string {
    const fraction = decimal - 1;
    const gcd = this.greatestCommonDivisor(
      Math.round(fraction * 100),
      100
    );
    const numerator = Math.round(fraction * 100) / gcd;
    const denominator = 100 / gcd;
    return `${numerator}/${denominator}`;
  }

  /**
   * Convert decimal odds to American
   */
  private decimalToAmerican(decimal: number): string {
    if (decimal >= 2.0) {
      return `+${Math.round((decimal - 1) * 100)}`;
    } else {
      return `${Math.round(-100 / (decimal - 1))}`;
    }
  }

  /**
   * Calculate greatest common divisor
   */
  private greatestCommonDivisor(a: number, b: number): number {
    return b === 0 ? a : this.greatestCommonDivisor(b, a % b);
  }

  /**
   * Group odds by bookmaker
   */
  groupByBookmaker(normalizedOdds: NormalizedOdds[]): Map<string, NormalizedOdds[]> {
    const grouped = new Map<string, NormalizedOdds[]>();

    for (const odds of normalizedOdds) {
      const existing = grouped.get(odds.bookmaker) || [];
      existing.push(odds);
      grouped.set(odds.bookmaker, existing);
    }

    return grouped;
  }

  /**
   * Group odds by horse
   */
  groupByHorse(normalizedOdds: NormalizedOdds[]): Map<string, NormalizedOdds[]> {
    const grouped = new Map<string, NormalizedOdds[]>();

    for (const odds of normalizedOdds) {
      const existing = grouped.get(odds.horseName) || [];
      existing.push(odds);
      grouped.set(odds.horseName, existing);
    }

    return grouped;
  }

  /**
   * Find arbitrage opportunities
   */
  findArbitrageOpportunities(normalizedOdds: NormalizedOdds[]): Array<{
    horses: string[];
    bookmakers: string[];
    totalProbability: number;
    profit: number;
  }> {
    const opportunities: Array<{
      horses: string[];
      bookmakers: string[];
      totalProbability: number;
      profit: number;
    }> = [];

    const byHorse = this.groupByHorse(normalizedOdds);
    const horses = Array.from(byHorse.keys());

    // Find best odds for each horse
    const bestOdds: Array<{ horse: string; odds: number; bookmaker: string }> = [];
    
    for (const horse of horses) {
      const horseOdds = byHorse.get(horse) || [];
      const best = horseOdds.reduce((max, current) => 
        current.winOdds > max.winOdds ? current : max
      );
      bestOdds.push({
        horse,
        odds: best.winOdds,
        bookmaker: best.bookmaker,
      });
    }

    // Calculate total implied probability
    const totalProbability = bestOdds.reduce((sum, item) => 
      sum + this.calculateImpliedProbability(item.odds), 0
    );

    // If total probability < 100%, there's an arbitrage opportunity
    if (totalProbability < 100) {
      opportunities.push({
        horses: bestOdds.map(b => b.horse),
        bookmakers: bestOdds.map(b => b.bookmaker),
        totalProbability,
        profit: 100 - totalProbability,
      });
    }

    return opportunities;
  }
}

export const oddsNormalizer = new OddsNormalizer();
