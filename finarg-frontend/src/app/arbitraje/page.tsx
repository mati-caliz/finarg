'use client';

import { useQuery } from '@tanstack/react-query';
import { arbitrageApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Arbitrage } from '@/types';
import {
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const getRiskColor = (risk: string) => {
  switch (risk?.toUpperCase()) {
    case 'LOW':
    case 'BAJO':
      return 'text-green-500 bg-green-500/10';
    case 'MEDIUM':
    case 'MEDIO':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'HIGH':
    case 'ALTO':
      return 'text-red-500 bg-red-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
};

export default function ArbitragePage() {
  const { translate } = useTranslation();
  
  const {
    data: opportunities,
    isLoading,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['arbitrage'],
    queryFn: async () => {
      const response = await arbitrageApi.getOpportunities();
      return response.data as Arbitrage[];
    },
    refetchInterval: 30000,
  });

  const viable = opportunities?.filter((o) => o.viable) || [];
  const notViable = opportunities?.filter((o) => !o.viable) || [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{translate('arbitrageDetector')}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {translate('arbitrageDesc')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-500">
            Updated:{' '}
            {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('es-AR') : '-'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {translate('refresh')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ArrowRightLeft className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{translate('totalOpportunities')}</p>
              <p className="text-2xl font-bold text-white">{opportunities?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{translate('viable')}</p>
              <p className="text-2xl font-bold text-green-500">{viable.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{translate('notViable')}</p>
              <p className="text-2xl font-bold text-red-500">{notViable.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          {viable.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                {translate('viableOpportunities')}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {viable.map((opportunity, index) => (
                  <Card key={index} className="bg-card border-green-500/20">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="text-gray-400">{opportunity.sourceType}</span>
                          <ArrowRightLeft className="h-4 w-4 text-primary" />
                          <span className="text-white">{opportunity.targetType}</span>
                        </CardTitle>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(
                            opportunity.risk
                          )}`}
                        >
                          Risk {opportunity.risk}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-400">{translate('buy')} ({opportunity.sourceType})</p>
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(opportunity.sourceRate)}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-400">{translate('sell')} ({opportunity.targetType})</p>
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(opportunity.targetRate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div>
                            <p className="text-xs text-gray-400">{translate('spread')}</p>
                            <p className="text-xl font-bold text-green-500">
                              +{opportunity.spreadPercentage.toFixed(2)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">{translate('profitPer1k')}</p>
                            <p className="text-xl font-bold text-green-500">
                              {formatCurrency(opportunity.estimatedProfitPer1000USD)}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-400">{opportunity.description}</p>

                        {opportunity.steps && (
                          <div className="p-3 bg-gray-800/30 rounded-lg">
                            <p className="text-xs text-gray-500 mb-2">{translate('stepsToExecute')}</p>
                            <p className="text-sm text-gray-300">{opportunity.steps}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {notViable.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <XCircle className="h-5 w-5 text-gray-500" />
                {translate('monitoring')}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {notViable.map((opportunity, index) => (
                  <Card key={index} className="bg-card opacity-60">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">{opportunity.sourceType}</span>
                          <ArrowRightLeft className="h-3 w-3 text-gray-600" />
                          <span className="text-gray-400">{opportunity.targetType}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${getRiskColor(
                            opportunity.risk
                          )}`}
                        >
                          {opportunity.risk}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">{translate('spread')}</p>
                          <p
                            className={`text-lg font-semibold ${
                              opportunity.spreadPercentage >= 0 ? 'text-gray-400' : 'text-red-500'
                            }`}
                          >
                            {opportunity.spreadPercentage >= 0 ? '+' : ''}
                            {opportunity.spreadPercentage.toFixed(2)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{translate('profitPer1k')}</p>
                          <p className="text-lg font-semibold text-gray-400">
                            {formatCurrency(opportunity.estimatedProfitPer1000USD)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {opportunities?.length === 0 && (
            <Card className="bg-card">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {translate('noArbitrage')}
                </h3>
                <p className="text-gray-400 text-sm">
                  {translate('arbitrageBalanced')}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-500 font-medium mb-1">{translate('arbitrageDisclaimerTitle')}</p>
              <p className="text-gray-400">
                {translate('arbitrageDisclaimer')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
