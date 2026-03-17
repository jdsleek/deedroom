'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Building2, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toKobo } from '@/types';
import type { DealType } from '@/types';

interface CreateDealInput {
  deal_type: DealType;
  title: string;
  property_address: string;
  property_type?: string;
  description?: string;
  rent_amount?: number;
  rent_period?: string;
  rent_start_date?: string;
  rent_end_date?: string;
  caution_fee?: number;
  agency_fee?: number;
  legal_fee?: number;
  sale_price?: number;
}

const RENT_PERIODS = ['monthly', '6-monthly', 'yearly'];

export function CreateDealWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CreateDealInput>({
    deal_type: 'rent',
    title: '',
    property_address: '',
    property_type: '',
    description: '',
    rent_amount: undefined,
    rent_period: 'monthly',
    caution_fee: undefined,
    agency_fee: undefined,
    legal_fee: undefined,
    sale_price: undefined,
  });

  const update = (updates: Partial<CreateDealInput>) =>
    setData((prev) => ({ ...prev, ...updates }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        deal_type: data.deal_type,
        title: data.title.trim(),
        property_address: data.property_address.trim(),
        property_type: data.property_type || null,
        description: data.description || null,
      };

      if (data.deal_type === 'rent') {
        body.rent_amount = data.rent_amount != null ? toKobo(Number(data.rent_amount)) : null;
        body.rent_period = data.rent_period || null;
        body.rent_start_date = data.rent_start_date || null;
        body.rent_end_date = data.rent_end_date || null;
        body.caution_fee = data.caution_fee != null ? toKobo(Number(data.caution_fee)) : null;
        body.agency_fee = data.agency_fee != null ? toKobo(Number(data.agency_fee)) : null;
        body.legal_fee = data.legal_fee != null ? toKobo(Number(data.legal_fee)) : null;
      } else {
        body.sale_price = data.sale_price != null ? toKobo(Number(data.sale_price)) : null;
      }

      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to create deal');
      router.push(`/deals/${json.data.id}?welcome=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create deal');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = true;
  const canProceedStep2 =
    data.title.trim().length > 0 && data.property_address.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex items-center gap-2 ${
              step >= s ? 'text-gold-600' : 'text-navy-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > s ? 'bg-gold-500 text-white' : step === s ? 'bg-gold-100' : 'bg-cream-200'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 3 && <div className="w-8 h-px bg-cream-300" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-2 gap-4">
          <Card
            className={`p-6 cursor-pointer border-2 transition-colors ${
              data.deal_type === 'rent'
                ? 'border-gold-500 bg-gold-50'
                : 'border-cream-200 hover:border-cream-300'
            }`}
            onClick={() => update({ deal_type: 'rent' })}
          >
            <Home className="h-12 w-12 text-gold-600 mb-3" />
            <h3 className="font-display font-semibold text-navy-600">Rent</h3>
            <p className="text-sm text-navy-400 mt-1">
              Tenancy agreements, leases, and rental transactions
            </p>
          </Card>
          <Card
            className={`p-6 cursor-pointer border-2 transition-colors ${
              data.deal_type === 'sale'
                ? 'border-gold-500 bg-gold-50'
                : 'border-cream-200 hover:border-cream-300'
            }`}
            onClick={() => update({ deal_type: 'sale' })}
          >
            <Building2 className="h-12 w-12 text-gold-600 mb-3" />
            <h3 className="font-display font-semibold text-navy-600">Sale</h3>
            <p className="text-sm text-navy-400 mt-1">
              Property purchase, offer letters, and sales agreements
            </p>
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Input
            label="Deal title"
            placeholder="e.g. 3-Bed Apartment, Lekki Phase 1"
            value={data.title}
            onChange={(e) => update({ title: e.target.value })}
            required
          />
          <Input
            label="Property address"
            placeholder="Full address"
            value={data.property_address}
            onChange={(e) => update({ property_address: e.target.value })}
            required
          />
          <Input
            label="Property type"
            placeholder="e.g. Apartment, Duplex, Land"
            value={data.property_type}
            onChange={(e) => update({ property_type: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">
              Description (optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              placeholder="Additional details..."
              rows={3}
              value={data.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>

          {data.deal_type === 'rent' && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cream-200">
              <Input
                label="Rent amount (₦)"
                type="number"
                placeholder="0"
                value={data.rent_amount ?? ''}
                onChange={(e) =>
                  update({ rent_amount: e.target.value ? Number(e.target.value) : undefined })
                }
              />
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">
                  Rent period
                </label>
                <select
                  className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                  value={data.rent_period ?? 'monthly'}
                  onChange={(e) => update({ rent_period: e.target.value })}
                >
                  {RENT_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Caution fee (₦)"
                type="number"
                placeholder="0"
                value={data.caution_fee ?? ''}
                onChange={(e) =>
                  update({
                    caution_fee: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <Input
                label="Agency fee (₦)"
                type="number"
                placeholder="0"
                value={data.agency_fee ?? ''}
                onChange={(e) =>
                  update({
                    agency_fee: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <Input
                label="Legal fee (₦)"
                type="number"
                placeholder="0"
                value={data.legal_fee ?? ''}
                onChange={(e) =>
                  update({
                    legal_fee: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <Input
                label="Rent start date"
                type="date"
                value={data.rent_start_date ?? ''}
                onChange={(e) => update({ rent_start_date: e.target.value })}
              />
              <Input
                label="Rent end date"
                type="date"
                className="col-span-2"
                value={data.rent_end_date ?? ''}
                onChange={(e) => update({ rent_end_date: e.target.value })}
              />
            </div>
          )}

          {data.deal_type === 'sale' && (
            <div className="pt-4 border-t border-cream-200">
              <Input
                label="Sale price (₦)"
                type="number"
                placeholder="0"
                value={data.sale_price ?? ''}
                onChange={(e) =>
                  update({
                    sale_price: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <Card className="p-6">
          <FileCheck className="h-12 w-12 text-gold-600 mb-4" />
          <h3 className="font-display font-semibold text-navy-600">Summary</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-navy-400">Deal type</dt>
              <dd className="font-medium text-navy-600 capitalize">{data.deal_type}</dd>
            </div>
            <div>
              <dt className="text-navy-400">Title</dt>
              <dd className="font-medium text-navy-600">{data.title}</dd>
            </div>
            <div>
              <dt className="text-navy-400">Property address</dt>
              <dd className="font-medium text-navy-600">{data.property_address}</dd>
            </div>
            {data.deal_type === 'rent' && data.rent_amount != null && data.rent_amount > 0 && (
              <div>
                <dt className="text-navy-400">Rent</dt>
                <dd className="font-medium text-navy-600">
                  ₦{Number(data.rent_amount).toLocaleString()}/{data.rent_period}
                </dd>
              </div>
            )}
            {data.deal_type === 'sale' && data.sale_price != null && data.sale_price > 0 && (
              <div>
                <dt className="text-navy-400">Sale price</dt>
                <dd className="font-medium text-navy-600">
                  ₦{Number(data.sale_price).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          Back
        </Button>
        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Deal'}
          </Button>
        )}
      </div>
    </div>
  );
}
