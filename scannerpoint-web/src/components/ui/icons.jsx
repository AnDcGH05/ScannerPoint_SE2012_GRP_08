// Small in-repo icon set (24px stroke icons), so the app needs no icon dependency.
const CIRCLE = 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z';
const CALENDAR = 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 2v4M8 2v4M3 10h18';
const CLIPBOARD = 'M9 2h6v4H9zM15 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2';
const EYE = 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z';

const icon = (d) => function Icon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d={d} />
        </svg>
    );
};

export const ArrowRight = icon('M5 12h14M12 5l7 7-7 7');
export const Check = icon('M20 6 9 17l-5-5');
export const Menu = icon('M4 6h16M4 12h16M4 18h16');
export const Trash = icon('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14');
export const Plus = icon('M12 5v14M5 12h14');
export const AlertCircle = icon(`${CIRCLE}M12 8v4M12 16h.01`);
export const CheckCircle2 = icon(`${CIRCLE}M9 12l2 2 4-4`);
export const Info = icon(`${CIRCLE}M12 16v-4M12 8h.01`);
export const Eye = icon(EYE);
export const EyeOff = icon(`${EYE}M3 3l18 18`);
export const Lock = icon('M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4');
export const Mail = icon('M3 5h18v14H3zM3 7l9 6 9-6');
export const User = icon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z');
export const UserRound = User;
export const Users = icon('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75');
export const LogOut = icon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9');
export const CalendarDays = icon(CALENDAR);
export const Car = icon('M4 17v3M20 17v3M3 17v-5l2-6h14l2 6v5zM3 12h18M7 14.5h.01M17 14.5h.01');
export const CarFront = Car;
export const LayoutDashboard = icon('M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z');
export const RefreshCw = icon('M21 2v6h-6M3 22v-6h6M3.5 9a9 9 0 0 1 14.85-3.36L21 8M3 16l2.65 2.36A9 9 0 0 0 20.5 15');
export const ClipboardCheck = icon(`${CLIPBOARD}M9 14l2 2 4-4`);
export const ClipboardList = icon(`${CLIPBOARD}M9 12h6M9 16h6`);
export const Package = icon('M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8');
export const Wrench = icon('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z');
export const Search = icon('M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35');
export const FileText = icon('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8');
export const Receipt = icon('M4 2v20l3-2 3 2 3-2 3 2 3-2V2l-3 2-3-2-3 2-3-2zM8 8h8M8 12h8');
