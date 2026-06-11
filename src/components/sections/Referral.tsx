import InviteCopyButton from '@/components/interactive/InviteCopyButton'

type ReferralProps = {
  count?: number
}

export default function Referral({ count }: ReferralProps = {}) {
  return (
    <div className="referral">
      <div className="grid">
        <div className="ref-head">Like this? Pass it on.</div>
        <p className="ref-sub">
          This newsletter grows by word of mouth, not ads. Share your link — when friends
          subscribe, you unlock more.
        </p>
        <div className="ref-ladder">
          <div className="ref-rung">
            <span className="ref-n">1</span>
            <div>
              <b>Refer 1</b> — unlock the full back-archive (every past issue, searchable)
            </div>
          </div>
          <div className="ref-rung">
            <span className="ref-n">3</span>
            <div>
              <b>Refer 3</b> — the &quot;Prompt Pack&quot;: my actual reusable prompts for the
              weekly Rep, as a copy-paste doc
            </div>
          </div>
          <div className="ref-rung">
            <span className="ref-n">5</span>
            <div>
              <b>Refer 5</b> — a subscriber-only deep dive (one evergreen long-read on
              building with AI in India)
            </div>
          </div>
        </div>
        <div className="ref-actions">
          <InviteCopyButton />
          <span className="ref-count">
            You&apos;ve referred <b>{count ?? 0}</b> so far
          </span>
        </div>
      </div>
    </div>
  )
}
