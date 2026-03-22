export default function Footer() {
  return (
    <footer className="border-t py-8 text-center text-xs text-muted-foreground space-y-1">
      <p>© {new Date().getFullYear()} Creatron. All rights reserved.</p>
      <p>Designed by Frank Bazuaye · Powered By LiveGig Ltd</p>
    </footer>
  );
}
