import { redirect } from 'next/navigation';

// The learn section is always addressed with an explicit language segment
// so each localized version has its own indexable URL. Bare /learn lands
// on the Russian (default) version.
export default function LearnIndexRedirect() {
  redirect('/learn/ru');
}
