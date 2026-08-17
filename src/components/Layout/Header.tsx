import HeaderActions from './HeaderActions';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-4 px-4 md:px-8 flex-shrink-0">
      <HeaderActions variant="light" onMenuClick={onMenuClick} />
    </header>
  );
}
