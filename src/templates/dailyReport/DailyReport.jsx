import { useContext, useRef } from "react";
import classes from "./dailyReport.module.scss";
import logo from "../../assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar/TopBar";
import ReactToPrint from "react-to-print";
import Card from "../../UI/card/Card";
import { PrintRegular } from "@fluentui/react-icons";
// import { getRemittancesByDueId } from "../../api/serverApi";
import TemplateTable from "./../../UI/templateTable/TemplateTable";
// import { useQuery } from "react-query";
import { Button } from "@fluentui/react-components";
import { useQuery } from "react-query";

import { AuthContext } from "../../store/auth-context";

const columns = [
	{ field: "m", headerName: "م", width: "45px" },
	{ field: "id", headerName: "رقم المستحق", width: "90px" },
	{ field: "name", headerName: "الاسم", width: "285px" },
	{
		field: "amountText",
		headerName: "المبلغ",
		width: "110px",
		headerAlign: "left",
		align: "left",
	},
	{ field: "التوقيع", headerName: "التوقيع", width: "100px" },
];

const DailyReport = () => {
	const componentRef = useRef();
	const navigate = useNavigate();
	const info = useLocation().state.item;
	const authCtx = useContext(AuthContext);
	const currDate = new Date().toLocaleString().split(",")[1];
	const currTime = new Date().toISOString().split("T")[0];

	// const [total, setTotal] = useState(0);

	// queries
	// const { data: dues } = useQuery({
	// 	queryKey: ["dues", info.id],
	// 	queryFn: getDuesByDuesListId,
	// 	select: (res) => {
	// 		return res.data.dues.map((el, i) => {
	// 			return {
	// 				...el,
	// 				m: i + 1,
	// 				amountText: el.amount.toLocaleString("US-en"),
	// 			};
	// 		});
	// 	},
	// });

	return (
		<>
			<TopBar
				right={
					<>
						<Button appearance="secondary" onClick={() => navigate("./..")}>
							رجوع
						</Button>
						<ReactToPrint
							trigger={() => (
								<Button appearance="primary" icon={<PrintRegular />}>
									طباعة
								</Button>
							)}
							content={() => componentRef.current}
						/>
					</>
				}
			/>
			{dues && dues.length > 0 ? (
				<div
					style={{
						padding: "0 5px",
						marginTop: "10px",

						display: "flex",
						flexDirection: "column",
						gap: "15px",
					}}
				>
					<Card>
						<div className={classes["view"]}>
							<div className={classes.header}>
								<div className={classes.right}>
									<span>الجمهورية اليمنية</span>
									<span>شركة النفط اليمنية</span>
									<span>فرع محافظة المهرة</span>
									<span>الإدارة المالية</span>
								</div>
								<div className={classes.center}>
									<img alt="" src={logo} />
								</div>
								<div className={classes.left}>
									<div>
										<span>رقم السند: </span>
										<span> {` ${info.id} `}</span>
									</div>
									<div>
										<span>التاريخ: </span>
										<span>{` ${info.date} `}</span>
									</div>
								</div>
							</div>
							<div className={classes.line0}>
								<div></div>
								<div className={classes.title}>{dues[0].title}</div>
								<div className={classes.type}>{info.clauseText}</div>
							</div>
							<TemplateTable columns={columns} rows={dues} />
							<TemplateTable
								columns={[
									{ field: "total", headerName: "الاجمالي", width: "420px" },
									{
										field: "value",
										headerName: info.total.toLocaleString("US-en"),
										width: "110px",
									},
									{
										field: "التوقيع",
										headerName: "",
										width: "100px",
									},
								]}
								rows={[]}
							/>
						</div>
						{/* print element  */}

						<table className={classes["print"]} ref={componentRef}>
							<thead>
								<div className={classes.header}>
									<div className={classes.right}>
										<span>الجمهورية اليمنية</span>
										<span>شركة النفط اليمنية</span>
										<span>فرع محافظة المهرة</span>
										<span>الإدارة المالية</span>
									</div>
									<div className={classes.center}>
										<img alt="" src={logo} />
									</div>
									<div className={classes.left}>
										<div>
											<span>رقم السند: </span>
											<span> {` ${info.id} `}</span>
										</div>
										<div>
											<span>التاريخ: </span>
											<span>{` ${info.date} `}</span>
										</div>
									</div>
								</div>
								<div className={classes.line0}>
									<div></div>
									<div className={classes.title}>{dues[0].title}</div>
									<div className={classes.type}>{info.clauseText}</div>
								</div>
							</thead>

							<tbody className={classes.body}>
								<TemplateTable columns={columns} rows={dues} />
								<TemplateTable
									columns={[
										{ field: "total", headerName: "الاجمالي", width: "420px" },
										{
											field: "value",
											headerName: info.total.toLocaleString("US-en"),
											width: "110px",
										},
										{
											field: "التوقيع",
											headerName: "",
											width: "100px",
										},
									]}
									rows={[]}
								/>
								<div className={classes.signatures}>
									<div>المختص</div>
									<div>المراجعة</div>
									<div>رئيس قسم الحسابات</div>
									<div>المدير المالي</div>
									<div>يعتمد</div>
								</div>
							</tbody>
							<tfoot className={classes.footer}>
								<tr>
									<td>
										<div className={classes.printData}>
											{`تاريخ الطباعة  ${currTime} ${currDate} `}
											<div>طبع بواسطة :{authCtx.currUser.username}</div>
										</div>
									</td>
								</tr>
							</tfoot>
						</table>
					</Card>
				</div>
			) : (
				""
			)}
		</>
	);
};

export default DailyReport;
