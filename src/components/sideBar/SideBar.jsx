import classes from "./sideBar.module.scss";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/logo.png";

import {
	Hamburger,
	NavCategory,
	NavCategoryItem,
	NavDrawer,
	NavDrawerBody,
	NavDrawerHeader,
	NavItem,
	NavSubItem,
	NavSubItemGroup,
} from "@fluentui/react-nav-preview";
import {
	SettingsRegular,
	PersonRegular,
	CircleRegular,
} from "@fluentui/react-icons";
import { Tooltip, makeStyles } from "@fluentui/react-components";
const useStyles = makeStyles({
	root: {
		display: "flex",
		background: "#d9dee4",
		zIndex: "3 !important",
	},
	content: {
		display: "grid",
		justifyContent: "flex-start",
		alignItems: "flex-start",
	},
});
const SideBar = () => {
	const styles = useStyles();
	const [isOpen, setIsOpen] = useState(true);
	const [type, setType] = useState("inline");
	const [isMultiple, setIsMultiple] = useState(false);

	const renderHamburgerWithToolTip = () => {
		return (
			<Tooltip content="Navigation" relationship="label">
				<Hamburger onClick={() => setIsOpen(!isOpen)} />
			</Tooltip>
		);
	};

	return (
		<div className={styles.root}>
			<NavDrawer
				defaultSelectedValue="2"
				defaultSelectedCategoryValue=""
				open={isOpen}
				type={type}
				multiple={isMultiple}
			>
				<NavDrawerHeader>{renderHamburgerWithToolTip()}</NavDrawerHeader>
				<NavDrawerBody className={styles.content}>
					<NavDrawerBody>
						<Link to="/">
							<NavItem value="1">
								<div className={classes.logoContainer}>
									<img src={logo} alt="" className={classes.logo} />
								</div>
							</NavItem>
						</Link>
						<NavCategory value="2">
							<NavCategoryItem icon={<SettingsRegular />}>
								الحركة اليومية
							</NavCategoryItem>
							<NavSubItemGroup>
								<Link to="/dailyMovment">
									<NavSubItem value="3">حركة المبيعات</NavSubItem>
								</Link>
								<Link to="/income">
									<NavSubItem value="4">الواردات</NavSubItem>
								</Link>
								<Link to="/surplus">
									<NavSubItem value="5">فائض</NavSubItem>
								</Link>
							</NavSubItemGroup>
						</NavCategory>
						<NavCategory value="6">
							<NavCategoryItem icon={<SettingsRegular />}>
								النقدية
							</NavCategoryItem>
							<NavSubItemGroup>
								<Link to="/receives">
									<NavSubItem value="7">الاستلامات</NavSubItem>
								</Link>
								<Link to="/deposits">
									<NavSubItem value="8">الايداعات</NavSubItem>
								</Link>
							</NavSubItemGroup>
						</NavCategory>
						<NavCategory value="9">
							<NavCategoryItem icon={<SettingsRegular />}>
								التقارير
							</NavCategoryItem>
							<NavSubItemGroup>
								<Link to="/storesMovmentReport">
									<NavSubItem value="10">حركة المخازن</NavSubItem>
								</Link>
								<Link to="/storesMovmentSummaryReport">
									<NavSubItem value="11">خلاصة حركة المخازن</NavSubItem>
								</Link>
								<Link to="/incomesReport">
									<NavSubItem value="12">حركة الواردات</NavSubItem>
								</Link>
								<Link to="/storesMovmentReport">
									<NavSubItem value="13">المبيعات النقدية</NavSubItem>
								</Link>
								<Link to="/dispensersMovmentReport">
									<NavSubItem value="14">حركة العدادات</NavSubItem>
								</Link>
								<Link to="/accountStatements">
									<NavSubItem value="15">كشف حساب</NavSubItem>
								</Link>
							</NavSubItemGroup>
						</NavCategory>
						<Link to="/Stocktaking">
							<NavItem value="16" icon={<PersonRegular />}>
								الجرد
							</NavItem>
						</Link>
						<NavCategory value="17">
							<NavCategoryItem icon={<SettingsRegular />}>
								الاعدادات
							</NavCategoryItem>
							<NavSubItemGroup>
								<Link to="/users">
									<NavSubItem value="18">المستخدمين</NavSubItem>
								</Link>
								<Link to="/employees">
									<NavSubItem value="19">الموظفين</NavSubItem>
								</Link>
								<Link to="/stations">
									<NavSubItem value="20">المحطات</NavSubItem>
								</Link>
								<Link to="/substances">
									<NavSubItem value="21">المواد</NavSubItem>
								</Link>
								<Link to="/dispensers">
									<NavSubItem value="22">الطرمبات</NavSubItem>
								</Link>
								<Link to="/calibrations">
									<NavSubItem value="23">معايرة</NavSubItem>
								</Link>
								<Link to="/banks">
									<NavSubItem value="24">الصرافات</NavSubItem>
								</Link>
								{/* <Link to="/stores">
									<NavSubItem value="16">المخازن</NavSubItem>
								</Link> */}
							</NavSubItemGroup>
						</NavCategory>
					</NavDrawerBody>
				</NavDrawerBody>
			</NavDrawer>
			{!isOpen && (
				<div className={styles.content}>{renderHamburgerWithToolTip()}</div>
			)}
		</div>
	);
};

export default SideBar;
