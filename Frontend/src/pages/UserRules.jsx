import {
  LOAN_DAYS,
  MAX_ACTIVE_BORROWS,
  MAX_EXTENSIONS_PER_MONTH,
  PICKUP_DAYS,
} from 'constants/libraryRules';

const ruleSections = [
  {
    title: 'Borrowing',
    items: [
      `You may have up to ${MAX_ACTIVE_BORROWS} active books at a time.`,
      'If a book is available, visit the library in person to borrow it — online waitlists are only for unavailable titles.',
      `Each loan lasts ${LOAN_DAYS} days from the issue date.`,
      'You cannot join a waitlist for a book you already have borrowed.',
    ],
  },
  {
    title: 'Waitlists',
    items: [
      'Join the waitlist from the Books page when a title is unavailable.',
      'Only one waitlist entry per book is allowed at a time.',
      `When a copy is returned, the next person in queue is notified and has ${PICKUP_DAYS} days to collect the book.`,
      'If you cancel a waitlist entry, you may join again later for the same book.',
      'Track waitlist status under My Requests.',
    ],
  },
  {
    title: 'Extensions',
    items: [
      `You may request up to ${MAX_EXTENSIONS_PER_MONTH} extension per calendar month.`,
      `An approved extension adds another ${LOAN_DAYS} days to the due date.`,
      'Submit extension requests from My Borrows before the due date.',
      'Overdue books must have fines settled before return.',
    ],
  },
  {
    title: 'Fines & returns',
    items: [
      'Overdue fines accrue daily until the book is returned or the fine is paid.',
      'Return books on or before the due date to avoid fines.',
      'You will receive notifications for waitlist updates, due dates, and other library alerts.',
    ],
  },
];

export default function UserRules() {
  return (
    <div className="page rules-page">
      <div className="rules-intro">
        <p>
          Please read these library rules before borrowing books or joining waitlists.
          Following them helps everyone get fair access to our collection.
        </p>
      </div>

      <div className="rules-sections">
        {ruleSections.map((section) => (
          <section key={section.title} className="rules-section">
            <h3 className="rules-section-title">{section.title}</h3>
            <ul className="rules-list">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
