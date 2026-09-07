import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
export default function NotFound() { return <main id="main-content" className="container loading-main"><div className="loading-shield"><ShieldCheck size={38}/></div><h1>Let’s find our way back.</h1><p>This page isn’t part of your practice journey.</p><Link href="/" className="button button-primary">Back to home <ArrowRight size={20}/></Link></main>; }
