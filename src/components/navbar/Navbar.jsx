import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../store/auth-context";

import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from "@/components/ui/menubar";
import {
	Home,
	ArrowUpDown,
	Dollar,
	FileText,
	Cog,
	Logout,
} from "@mynaui/icons-react";

const Navbar = () => {
	const authCtx = useContext(AuthContext);

	const logoutHandler = async () => {
		try {
			authCtx.logout();
		} catch (err) {
			console.log(`err`, err);
		}
	};
	return (
		<div className="flex items-center pl-5">
			<Menubar className="text-right flex-1">
				<MenubarMenu onClick={logoutHandler}>
					<Link to="/home">
						<MenubarTrigger>
							<Home />
							الرئيسية
						</MenubarTrigger>
					</Link>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>
						<ArrowUpDown />
						الحركة اليومية
					</MenubarTrigger>
					<MenubarContent>
						<Link to="/dailyMovment">
							<MenubarItem className="justify-end">حركة المبيعات</MenubarItem>
						</Link>
						<Link to="/income">
							<MenubarItem className="justify-end">الواردات</MenubarItem>
						</Link>
						<Link to="/surplus">
							<MenubarItem className="justify-end">الفائض</MenubarItem>
						</Link>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>
						<Dollar />
						النقدية
					</MenubarTrigger>
					<MenubarContent>
						<Link to="/receives">
							<MenubarItem className="justify-end">الاستلامات</MenubarItem>
						</Link>
						<Link to="/deposits">
							<MenubarItem className="justify-end">الايداعات</MenubarItem>
						</Link>
						<Link to="/creditSales">
							<MenubarItem className="justify-end">
								سداد المبيعات الآجلة
							</MenubarItem>
						</Link>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>
						<FileText />
						التقارير
					</MenubarTrigger>
					<MenubarContent>
						<MenubarSub>
							<MenubarSubTrigger className="flex-row-reverse  justify-between">
								حركة المخازن
							</MenubarSubTrigger>
							<MenubarSubContent>
								<Link to="/storesMovmentSummaryReport">
									<MenubarItem className="justify-end">
										خلاصة حركة المخازن
									</MenubarItem>
								</Link>
								<Link to="/storesMovmentReport">
									<MenubarItem className="justify-end">
										حركة المخازن تفصيلي
									</MenubarItem>
								</Link>
							</MenubarSubContent>
						</MenubarSub>
						<Link to="/incomesReport">
							<MenubarItem className="justify-end">حركة الواردات</MenubarItem>
						</Link>
						<Link to="/dispensersMovmentReport">
							<MenubarItem className="justify-end">حركة العدادات</MenubarItem>
						</Link>
						<Link to="/depositsReport">
							<MenubarItem className="justify-end">حركة الايداعات</MenubarItem>
						</Link>

						<Link to="/accountStatements">
							<MenubarItem className="justify-end">
								التقارير المالية
							</MenubarItem>
						</Link>
						<Link to="/creditSalesReport">
							<MenubarItem className="justify-end">مبيعات آجلة</MenubarItem>
						</Link>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>
						<Cog />
						الاعدادات
					</MenubarTrigger>
					<MenubarContent>
						<Link to="/changePassword">
							<MenubarItem className="justify-end">
								تغيير كلمة المرور
							</MenubarItem>
						</Link>
						{authCtx.permissions.admin && (
							<>
								<Link to="/users">
									<MenubarItem className="justify-end">المستخدمين</MenubarItem>
								</Link>
								<Link to="/stations">
									<MenubarItem className="justify-end">المحطات</MenubarItem>
								</Link>
								<Link to="/substances">
									<MenubarItem className="justify-end">المواد</MenubarItem>
								</Link>
								<Link to="/dispensers">
									<MenubarItem className="justify-end">الطرمبات</MenubarItem>
								</Link>
								<Link to="/banks">
									<MenubarItem className="justify-end">الصرافات</MenubarItem>
								</Link>
								<Link to="/employees">
									<MenubarItem className="justify-end">الموظفين</MenubarItem>
								</Link>
							</>
						)}
						{authCtx.permissions.stocktaking && (
							<Link to="/Stocktaking">
								<MenubarItem className="justify-end">الجرد</MenubarItem>
							</Link>
						)}
						{authCtx.permissions.calibration && (
							<Link to="/calibrations">
								<MenubarItem className="justify-end">معايرة</MenubarItem>
							</Link>
						)}
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
			<button
				onClick={logoutHandler}
				className="flex mr-auto pr-auto font-bold my-1 gap-1 bg-danger-700 p-1 px-3 rounded-sm text-white"
			>
				<Logout />
				تسجيل خروج
			</button>
		</div>
	);
};

export default Navbar;
