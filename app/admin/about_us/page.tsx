import StaticPageEditor from '../StaticPageEditor';

export default function AboutUsPage() {
  return <StaticPageEditor pageId={1} title="About Us" endpoint="/api/about_us" />;
}