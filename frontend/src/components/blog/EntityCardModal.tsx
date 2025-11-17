'use client';

import { useEffect, useState } from 'react';
import { X, Trophy, TrendingUp, Calendar, Star, AlertCircle } from 'lucide-react';

interface EntityCardModalProps {
  entity: {
    name: string;
    type: 'horse' | 'jockey' | 'trainer';
  };
  onClose: () => void;
}

export default function EntityCardModal({ entity, onClose }: EntityCardModalProps) {
  const [entityData, setEntityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch entity data from API
    const fetchEntityData = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // const response = await api.getEntity(entity.type, entity.name);

        // Mock data for now
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockData = {
          horse: {
            name: entity.name,
            age: 4,
            sex: 'Gelding',
            trainer: 'Chris Waller',
            jockey: 'James McDonald',
            form: '1-2-1-3-1',
            careerWins: 8,
            careerStarts: 15,
            prizemoney: '$450,000',
            upcomingRaces: [
              {
                date: 'Nov 25, 2025',
                location: 'Flemington',
                raceNumber: 7,
                odds: 3.5,
              },
            ],
          },
          jockey: {
            name: entity.name,
            wins: 1250,
            placings: 3800,
            strikeRate: '22%',
            prizemoney: '$85,000,000',
            recentForm: '1-2-1-1-3',
            upcomingRides: [
              {
                horse: 'Thunder Bolt',
                date: 'Nov 25, 2025',
                location: 'Flemington',
                raceNumber: 7,
              },
            ],
          },
          trainer: {
            name: entity.name,
            wins: 850,
            runners: 4200,
            strikeRate: '20%',
            prizemoney: '$120,000,000',
            activeLicense: true,
            stable: 'Rosehill',
            upcomingRunners: [
              {
                horse: 'Thunder Bolt',
                date: 'Nov 25, 2025',
                location: 'Flemington',
                raceNumber: 7,
              },
            ],
          },
        };

        setEntityData(mockData[entity.type]);
      } catch (error) {
        console.error('Failed to fetch entity data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntityData();
  }, [entity]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-brand-primary text-white p-6 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
              {entity.type}
            </div>
            <h2 className="text-3xl font-serif font-bold">{entity.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 w-3/4"></div>
              <div className="h-4 bg-gray-200 w-1/2"></div>
              <div className="h-4 bg-gray-200 w-5/6"></div>
            </div>
          ) : entityData ? (
            <>
              {/* Horse Details */}
              {entity.type === 'horse' && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Age / Sex
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {entityData.age}yo {entityData.sex}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Form
                      </div>
                      <div className="text-lg font-semibold text-gray-900">{entityData.form}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Trainer
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {entityData.trainer}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Jockey
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {entityData.jockey}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50">
                    <div className="text-center">
                      <Trophy className="w-5 h-5 text-brand-primary mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">{entityData.careerWins}</div>
                      <div className="text-xs text-gray-600">Wins</div>
                    </div>
                    <div className="text-center">
                      <Star className="w-5 h-5 text-brand-primary mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">
                        {entityData.careerStarts}
                      </div>
                      <div className="text-xs text-gray-600">Starts</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-5 h-5 text-brand-primary mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">
                        {entityData.prizemoney}
                      </div>
                      <div className="text-xs text-gray-600">Prize Money</div>
                    </div>
                  </div>

                  {entityData.upcomingRaces && entityData.upcomingRaces.length > 0 && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-2">Upcoming Race</div>
                          {entityData.upcomingRaces.map((race: any, index: number) => (
                            <div key={index} className="text-sm text-gray-700">
                              <div className="font-medium">
                                {race.location} - Race {race.raceNumber}
                              </div>
                              <div className="text-gray-600">{race.date}</div>
                              <div className="mt-1 inline-block bg-green-600 text-white px-2 py-1 text-xs font-bold">
                                Current Odds: ${race.odds.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Jockey Details */}
              {entity.type === 'jockey' && (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50">
                    <div className="text-center">
                      <Trophy className="w-5 h-5 text-brand-primary mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">{entityData.wins}</div>
                      <div className="text-xs text-gray-600">Career Wins</div>
                    </div>
                    <div className="text-center">
                      <Star className="w-5 h-5 text-brand-primary mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">{entityData.strikeRate}</div>
                      <div className="text-xs text-gray-600">Strike Rate</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-5 h-5 text-brand-primary mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">
                        {entityData.prizemoney}
                      </div>
                      <div className="text-xs text-gray-600">Prize Money</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Recent Form
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{entityData.recentForm}</div>
                  </div>

                  {entityData.upcomingRides && entityData.upcomingRides.length > 0 && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-2">Upcoming Ride</div>
                          {entityData.upcomingRides.map((ride: any, index: number) => (
                            <div key={index} className="text-sm text-gray-700">
                              <div className="font-medium">{ride.horse}</div>
                              <div className="text-gray-600">
                                {ride.location} - Race {ride.raceNumber} on {ride.date}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Trainer Details */}
              {entity.type === 'trainer' && (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50">
                    <div className="text-center">
                      <Trophy className="w-5 h-5 text-brand-primary mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">{entityData.wins}</div>
                      <div className="text-xs text-gray-600">Career Wins</div>
                    </div>
                    <div className="text-center">
                      <Star className="w-5 h-5 text-brand-primary mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">{entityData.strikeRate}</div>
                      <div className="text-xs text-gray-600">Strike Rate</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-5 h-5 text-brand-primary mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">
                        {entityData.prizemoney}
                      </div>
                      <div className="text-xs text-gray-600">Prize Money</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Stable Location
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{entityData.stable}</div>
                  </div>

                  {entityData.upcomingRunners && entityData.upcomingRunners.length > 0 && (
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-2">Upcoming Runner</div>
                          {entityData.upcomingRunners.map((runner: any, index: number) => (
                            <div key={index} className="text-sm text-gray-700">
                              <div className="font-medium">{runner.horse}</div>
                              <div className="text-gray-600">
                                {runner.location} - Race {runner.raceNumber} on {runner.date}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No data available for this {entity.type}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
