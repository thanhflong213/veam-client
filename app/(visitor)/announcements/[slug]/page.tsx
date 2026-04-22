import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAnnouncement } from "../../../lib/api";
import VisitorSidebar from "../../components/VisitorSidebar";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const ann = await getAnnouncement(slug);
    return { title: ann.title + " – VEAM", description: ann.excerpt };
  } catch {
    return {};
  }
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { slug } = await params;
  let ann;
  try {
    ann = await getAnnouncement(slug);
  } catch {
    notFound();
  }

  const publishedDate = ann.publishedAt
    ? new Date(ann.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  return (
    <div className="page-body">
      <article>
        <Link href="/announcements" className="back-btn">
          <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} />
          Back to Announcements
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {ann.coverImage && (
          <img
            src={ann.coverImage}
            alt={ann.title}
            style={{
              width: "100%",
              borderRadius: 8,
              margin: "16px 0 24px",
              maxHeight: 400,
              objectFit: "cover",
            }}
          />
        )}
        <h1 className="ev-det-title">{ann.title}</h1>
        <div className="ev-det-meta">
          {publishedDate && (
            <span>
              <i
                className="fa-regular fa-calendar"
                style={{ marginRight: 5 }}
              />
              {publishedDate}
            </span>
          )}
        </div>
        <div
          className="rc"
          dangerouslySetInnerHTML={{ __html: ann.contentHtml ?? "" }}
        />
      </article>
      <VisitorSidebar />
    </div>
  );
}
