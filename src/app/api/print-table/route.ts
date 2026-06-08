import { NextRequest, NextResponse } from 'next/server'
import { fillTableTemplate } from '../../../../lib/templates/table-template'

export async function POST(req: NextRequest) {
  try {
    const { controls, products } = await req.json()
    
    const html = fillTableTemplate(controls, products)
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error: any) {
    console.error('Print table error:', error)
    return NextResponse.json(
      { error: 'فشل إنشاء الجدول', details: error.message },
      { status: 500 }
    )
  }
}