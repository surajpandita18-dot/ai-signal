import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { FeedbackForm } from '@/components/FeedbackForm'

export const metadata = {
  title: 'Feedback — AI Signal',
  description: 'Tell us how AI Signal can be better for you.',
}

export default function FeedbackPage() {
  return (
    <>
      <SiteNav />
      <main className="feedback-page">
        <div className="feedback-page-inner">
          <p className="feedback-page-eyebrow">Feedback</p>
          <h1 className="feedback-page-title">How's AI Signal working for you?</h1>
          <p className="feedback-page-sub">
            Takes 30 seconds. Suraj reads every response personally.
          </p>
          <FeedbackForm />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
