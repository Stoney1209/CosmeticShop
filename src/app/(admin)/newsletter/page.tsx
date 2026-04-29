import { getSubscribers, getSubscriberStats, exportSubscribers } from "@/app/actions/newsletter";
import { NewsletterClient } from "./NewsletterClient";

export default async function NewsletterPage() {
  const subscribers = await getSubscribers();
  const stats = await getSubscriberStats();

  return <NewsletterClient initialSubscribers={subscribers} stats={stats} />;
}
