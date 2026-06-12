import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="issue">
      <div className="grid">
        <div className="hero">
          <div className="eyebrow">404</div>
          <h1>This issue isn&apos;t here.</h1>
          <p className="sub">
            It may have been renamed or never published.
          </p>
          <p className="sub">
            <Link href="/">Back to home &rarr;</Link>
          </p>
          <p className="sub">
            <Link href="/archive">Or browse the archive &rarr;</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
