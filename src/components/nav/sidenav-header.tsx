import { Link } from "react-router-dom";
import { ThemeToggle } from "../theme-toggler";

export function SideNavHeader() {
  return (
    <div className="flex items-center justify-between gap-6 border-b p-5 md:gap-10">
      <Link to="/" className="flex items-center space-x-2">
        <i className="bi bi-plugin" />
        <span className="inline-block font-bold">Connector</span>
      </Link>
      <ThemeToggle />
    </div>
  );
}
