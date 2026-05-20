import StaticPageEditor from '../StaticPageEditor';

export default function PrivacyPage() {
  return <StaticPageEditor pageId={3} title="Privacy Policy" endpoint="/api/privacy_policy" />;
}