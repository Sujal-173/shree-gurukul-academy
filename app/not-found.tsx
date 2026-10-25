import Link from "next/link";
import { Icon } from "@/components/icon";
export default function NotFound() { return <main className="not-found-page"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>This page isn’t here.</h1><p>The link may be outdated or the page may have moved.</p><Link className="button button-primary" href="/">Return to homepage <Icon name="arrow-up-right" size={16}/></Link></main>; }
