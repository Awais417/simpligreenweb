import { avatarUrl } from '../lib/api';
import { initials } from '../lib/utils';

export function Avatar({
  name,
  avatar,
  size = 36,
}: {
  name: string;
  avatar?: string | null;
  size?: number;
}) {
  const url = avatarUrl(avatar);
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} style={style} className="rounded-full object-cover shrink-0" />;
  }

  return (
    <div
      style={style}
      className="rounded-full bg-brand text-white font-semibold flex items-center justify-center shrink-0"
    >
      {initials(name)}
    </div>
  );
}
