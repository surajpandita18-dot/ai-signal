import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect(
    'upi://pay?pa=suraj.pandita132@ybl&pn=AI%20Signal&cu=INR',
    { status: 302 }
  )
}
