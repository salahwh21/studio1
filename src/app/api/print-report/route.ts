import { NextRequest, NextResponse } from 'next/server'
import { fillReportTemplate } from '../../../../lib/templates/report-template'

export async function POST(req: NextRequest) {
  try {
    const { controls, orders } = await req.json()
    
    const html = fillReportTemplate(controls, orders)
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'فشل إنشاء التقرير', details: error.message },
      { status: 500 }
    )
  }
}