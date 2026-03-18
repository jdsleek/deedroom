export interface TemplateField {
  key: string
  label: string
  type: 'text' | 'date' | 'number' | 'currency'
  required: boolean
  placeholder?: string
}

export interface DocumentTemplate {
  id: string
  name: string
  category: string
  description: string
  dealType: 'rent' | 'sale' | 'both'
  fields: TemplateField[]
  content: (values: Record<string, string>) => string
}

export const TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tenancy-agreement',
    name: 'Tenancy Agreement',
    category: 'agreement',
    description: 'Standard residential tenancy agreement between landlord and tenant',
    dealType: 'rent',
    fields: [
      { key: 'landlord_name', label: 'Landlord Name', type: 'text', required: true },
      { key: 'tenant_name', label: 'Tenant Name', type: 'text', required: true },
      { key: 'property_address', label: 'Property Address', type: 'text', required: true },
      { key: 'rent_amount', label: 'Monthly Rent (₦)', type: 'currency', required: true },
      { key: 'caution_fee', label: 'Caution/Security Deposit (₦)', type: 'currency', required: false },
      { key: 'agency_fee', label: 'Agency Fee (₦)', type: 'currency', required: false },
      { key: 'legal_fee', label: 'Legal Fee (₦)', type: 'currency', required: false },
      { key: 'start_date', label: 'Start Date', type: 'date', required: true },
      { key: 'end_date', label: 'End Date', type: 'date', required: true },
      { key: 'payment_period', label: 'Payment Period', type: 'text', required: true, placeholder: 'e.g. Annually, Monthly' },
    ],
    content: (v) => `TENANCY AGREEMENT

This Tenancy Agreement is made on ${new Date().toLocaleDateString('en-NG')}.

BETWEEN:

${v.landlord_name} (hereinafter called "the Landlord")

AND

${v.tenant_name} (hereinafter called "the Tenant")

PROPERTY: ${v.property_address}

1. TERM: The tenancy shall commence on ${v.start_date} and end on ${v.end_date}.

2. RENT: The Tenant shall pay rent of ₦${v.rent_amount} ${v.payment_period}.

3. SECURITY DEPOSIT: ${v.caution_fee ? `The Tenant shall pay a security deposit of ₦${v.caution_fee}.` : 'No security deposit required.'}

4. AGENCY FEE: ${v.agency_fee ? `An agency fee of ₦${v.agency_fee} is payable.` : 'No agency fee.'}

5. LEGAL FEE: ${v.legal_fee ? `A legal fee of ₦${v.legal_fee} is payable.` : 'No legal fee.'}

6. USE: The property shall be used solely as a residential dwelling.

7. MAINTENANCE: The Tenant shall maintain the property in good condition.

8. TERMINATION: Either party may terminate this agreement with 30 days written notice.

9. GOVERNING LAW: This agreement shall be governed by the laws of the Federal Republic of Nigeria.

SIGNED BY:

Landlord: _________________________

Tenant: _________________________

Witness: _________________________

Date: _________________________`,
  },
  {
    id: 'offer-to-lease',
    name: 'Offer to Lease',
    category: 'agreement',
    description: 'Formal offer to lease a property',
    dealType: 'rent',
    fields: [
      { key: 'offeror_name', label: 'Offeror (Tenant) Name', type: 'text', required: true },
      { key: 'landlord_name', label: 'Landlord Name', type: 'text', required: true },
      { key: 'property_address', label: 'Property Address', type: 'text', required: true },
      { key: 'rent_amount', label: 'Proposed Rent (₦)', type: 'currency', required: true },
      { key: 'duration', label: 'Proposed Duration', type: 'text', required: true, placeholder: 'e.g. 1 year' },
      { key: 'start_date', label: 'Proposed Start Date', type: 'date', required: true },
    ],
    content: (v) => `OFFER TO LEASE

Date: ${new Date().toLocaleDateString('en-NG')}

To: ${v.landlord_name}

Re: Offer to Lease — ${v.property_address}

Dear ${v.landlord_name},

I, ${v.offeror_name}, hereby make a formal offer to lease the property at ${v.property_address} on the following terms:

1. RENT: ₦${v.rent_amount}
2. DURATION: ${v.duration}
3. COMMENCEMENT: ${v.start_date}

This offer is valid for 14 days from the date above.

Yours sincerely,

${v.offeror_name}
_________________________
Signature`,
  },
  {
    id: 'inspection-checklist',
    name: 'Inspection Checklist',
    category: 'checklist',
    description: 'Property inspection checklist for move-in/move-out',
    dealType: 'both',
    fields: [
      { key: 'inspector_name', label: 'Inspector Name', type: 'text', required: true },
      { key: 'property_address', label: 'Property Address', type: 'text', required: true },
      { key: 'inspection_date', label: 'Inspection Date', type: 'date', required: true },
      { key: 'inspection_type', label: 'Inspection Type', type: 'text', required: true, placeholder: 'Move-in / Move-out / Routine' },
    ],
    content: (v) => `PROPERTY INSPECTION CHECKLIST

Property: ${v.property_address}
Inspector: ${v.inspector_name}
Date: ${v.inspection_date}
Type: ${v.inspection_type}

--- LIVING ROOM ---
[ ] Walls — Condition: ___
[ ] Ceiling — Condition: ___
[ ] Floor — Condition: ___
[ ] Windows — Condition: ___
[ ] Doors — Condition: ___
[ ] Light fixtures — Working: ___
[ ] Electrical outlets — Working: ___

--- KITCHEN ---
[ ] Cabinets — Condition: ___
[ ] Sink — Working: ___
[ ] Countertops — Condition: ___
[ ] Appliances — Working: ___

--- BEDROOM(S) ---
[ ] Walls — Condition: ___
[ ] Floor — Condition: ___
[ ] Windows — Condition: ___
[ ] Wardrobe — Condition: ___

--- BATHROOM(S) ---
[ ] Toilet — Working: ___
[ ] Shower — Working: ___
[ ] Sink — Working: ___
[ ] Tiles — Condition: ___

--- EXTERIOR ---
[ ] Parking — Available: ___
[ ] Gate — Condition: ___
[ ] Fence — Condition: ___

NOTES:
___________________________

Inspector Signature: _________________________
Date: _________________________`,
  },
  {
    id: 'payment-schedule',
    name: 'Payment Schedule',
    category: 'receipt',
    description: 'Payment breakdown and schedule for the deal',
    dealType: 'both',
    fields: [
      { key: 'payer_name', label: 'Payer Name', type: 'text', required: true },
      { key: 'payee_name', label: 'Payee Name', type: 'text', required: true },
      { key: 'property_address', label: 'Property Address', type: 'text', required: true },
      { key: 'total_amount', label: 'Total Amount (₦)', type: 'currency', required: true },
      { key: 'payment_date', label: 'Payment Due Date', type: 'date', required: true },
      { key: 'breakdown', label: 'Payment Breakdown', type: 'text', required: false, placeholder: 'e.g. Rent: 500000, Agency: 50000' },
    ],
    content: (v) => `PAYMENT SCHEDULE

Date: ${new Date().toLocaleDateString('en-NG')}

Property: ${v.property_address}

From: ${v.payer_name}
To: ${v.payee_name}

TOTAL AMOUNT: ₦${v.total_amount}
DUE DATE: ${v.payment_date}

BREAKDOWN:
${v.breakdown || '(See deal financial details)'}

Payment Methods:
- Bank Transfer
- Cash

Payer Signature: _________________________
Payee Signature: _________________________
Date: _________________________`,
  },
  {
    id: 'sales-offer',
    name: 'Sales Offer Letter',
    category: 'agreement',
    description: 'Formal offer to purchase a property',
    dealType: 'sale',
    fields: [
      { key: 'buyer_name', label: 'Buyer Name', type: 'text', required: true },
      { key: 'seller_name', label: 'Seller Name', type: 'text', required: true },
      { key: 'property_address', label: 'Property Address', type: 'text', required: true },
      { key: 'offer_price', label: 'Offer Price (₦)', type: 'currency', required: true },
      { key: 'closing_date', label: 'Proposed Closing Date', type: 'date', required: true },
    ],
    content: (v) => `SALES OFFER LETTER

Date: ${new Date().toLocaleDateString('en-NG')}

To: ${v.seller_name}

Re: Offer to Purchase — ${v.property_address}

Dear ${v.seller_name},

I, ${v.buyer_name}, hereby submit a formal offer to purchase the property located at ${v.property_address} for the sum of ₦${v.offer_price}.

Proposed closing date: ${v.closing_date}

This offer is subject to:
1. Satisfactory title verification
2. Property inspection
3. Legal review

This offer is valid for 21 days from the date above.

Yours sincerely,

${v.buyer_name}
_________________________
Signature`,
  },
]
