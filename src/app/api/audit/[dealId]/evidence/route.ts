import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEvidencePdf } from '@/lib/pdf';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: deal } = await supabase.from('deals').select('*').eq('id', dealId).single();
  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  }

  const { data: parties } = await supabase.from('deal_parties').select('*').eq('deal_id', dealId);
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: true });

  const pdfBytes = await generateEvidencePdf({
    deal,
    parties: parties ?? [],
    auditLogs: auditLogs ?? [],
  });

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="DeedRoom-Evidence-${dealId.slice(0, 8)}.pdf"`,
    },
  });
}
