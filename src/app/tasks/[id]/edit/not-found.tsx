import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-state">
      <p>Task not found.</p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 12 }}>
        Back to list
      </Link>
    </div>
  );
}
